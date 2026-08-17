import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { listings } from "../../../../db/schema";
import { getChatGPTUser } from "../../../chatgpt-auth";
import { isListingStatus, parseImageUrls, serializeListing } from "../../../listing-data";
import { getMediaBucket, isConfiguredAdmin } from "../../../runtime-storage";

type RouteContext = { params: Promise<{ id: string }> };

async function loadAuthorizedListing(id: number) {
  const user = await getChatGPTUser();
  if (!user) return { error: Response.json({ error: "Sign in with ChatGPT is required." }, { status: 401 }) };

  const db = await getDb();
  const [listing] = await db.select().from(listings).where(eq(listings.id, id)).limit(1);
  if (!listing) return { error: Response.json({ error: "Listing not found." }, { status: 404 }) };

  const admin = await isConfiguredAdmin(user.email);
  const owner = Boolean(listing.ownerEmail) && listing.ownerEmail.toLowerCase() === user.email.toLowerCase();
  if (!admin && !owner) return { error: Response.json({ error: "You cannot manage this listing." }, { status: 403 }) };

  return { db, listing, admin };
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const id = Number((await context.params).id);
    if (!Number.isInteger(id) || id < 1) return Response.json({ error: "Invalid listing ID." }, { status: 400 });

    const authorized = await loadAuthorizedListing(id);
    if ("error" in authorized) return authorized.error;

    const payload = (await request.json()) as Record<string, unknown>;
    const updates: Partial<typeof listings.$inferInsert> = {};

    if (payload.status !== undefined) {
      if (!isListingStatus(payload.status)) return Response.json({ error: "Invalid listing status." }, { status: 400 });
      if (!authorized.admin && payload.status === "hidden") return Response.json({ error: "Only an admin can hide a listing." }, { status: 403 });
      updates.status = payload.status;
    }

    if (payload.title !== undefined) {
      const title = String(payload.title).trim();
      if (title.length < 4 || title.length > 80) return Response.json({ error: "Title must be 4–80 characters." }, { status: 400 });
      updates.title = title;
    }

    if (payload.price !== undefined) {
      const price = Number(payload.price);
      if (!Number.isFinite(price) || price < 0) return Response.json({ error: "Price is invalid." }, { status: 400 });
      updates.price = price;
    }

    if (payload.description !== undefined) {
      const description = String(payload.description).trim();
      if (description.length < 12) return Response.json({ error: "Description is too short." }, { status: 400 });
      updates.description = description;
    }

    if (!Object.keys(updates).length) return Response.json({ error: "No supported changes were supplied." }, { status: 400 });

    const [listing] = await authorized.db.update(listings).set(updates).where(eq(listings.id, id)).returning();
    return Response.json({ listing: serializeListing(listing) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not update listing." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const id = Number((await context.params).id);
    if (!Number.isInteger(id) || id < 1) return Response.json({ error: "Invalid listing ID." }, { status: 400 });

    const authorized = await loadAuthorizedListing(id);
    if ("error" in authorized) return authorized.error;

    await authorized.db.delete(listings).where(eq(listings.id, id));

    const keys = parseImageUrls(authorized.listing.images)
      .map((url) => new URL(url, "https://site.local").searchParams.get("key"))
      .filter((key): key is string => Boolean(key));

    if (keys.length) {
      try {
        const bucket = await getMediaBucket();
        await Promise.all(keys.map((key) => bucket.delete(key)));
      } catch {
        // The database deletion remains valid even if storage cleanup is temporarily unavailable.
      }
    }

    return Response.json({ deleted: true, id });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not delete listing." }, { status: 500 });
  }
}
