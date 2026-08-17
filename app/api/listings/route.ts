import { desc, ne } from "drizzle-orm";
import { getDb } from "../../../db";
import { listings } from "../../../db/schema";
import { getChatGPTUser } from "../../chatgpt-auth";
import { parseImageUrls, serializeListing } from "../../listing-data";

const allowedCategories = new Set(["mineral", "electronics", "farm", "construction", "property", "manufactured", "broker", "buyer", "livestock"]);
const allowedTransactions = new Set(["sell", "buy", "broker"]);

export async function GET() {
  try {
    const db = await getDb();
    const rows = await db
      .select()
      .from(listings)
      .where(ne(listings.status, "hidden"))
      .orderBy(desc(listings.id))
      .limit(80);
    return Response.json({ listings: rows.map(serializeListing) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not load listings." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const title = String(payload.title ?? "").trim();
    const category = String(payload.category ?? "").trim();
    const categoryLabel = String(payload.categoryLabel ?? category).trim();
    const transaction = String(payload.transaction ?? "").trim();
    const price = Number(payload.price ?? 0);
    const priceSuffix = String(payload.priceSuffix ?? "total").trim();
    const location = String(payload.location ?? "").trim();
    const seller = String(payload.seller ?? "").trim();
    const phone = String(payload.phone ?? "").trim();
    const role = String(payload.role ?? "").trim();
    const condition = String(payload.condition ?? "").trim();
    const description = String(payload.description ?? "").trim();
    const icon = String(payload.icon ?? "📦").trim();
    const accent = String(payload.accent ?? "blue").trim();
    const images = parseImageUrls(payload.images);

    if (
      title.length < 4 ||
      !allowedCategories.has(category) ||
      !allowedTransactions.has(transaction) ||
      !Number.isFinite(price) ||
      price < 0 ||
      !location ||
      seller.length < 2 ||
      phone.length < 9 ||
      description.length < 12
    ) {
      return Response.json({ error: "Listing information is incomplete or invalid." }, { status: 400 });
    }

    const user = await getChatGPTUser();
    const db = await getDb();
    const [listing] = await db
      .insert(listings)
      .values({
        title,
        category,
        categoryLabel,
        transaction,
        price,
        priceSuffix,
        location,
        seller,
        phone,
        role,
        condition,
        description,
        icon,
        accent,
        ownerEmail: user?.email.toLowerCase() ?? "",
        status: "active",
        images: JSON.stringify(images),
      })
      .returning();

    return Response.json({ listing: serializeListing(listing) }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not publish listing." }, { status: 500 });
  }
}
