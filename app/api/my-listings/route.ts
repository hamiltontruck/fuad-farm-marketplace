import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { listings } from "../../../db/schema";
import { getChatGPTUser } from "../../chatgpt-auth";
import { serializeListing } from "../../listing-data";

export async function GET() {
  try {
    const user = await getChatGPTUser();
    if (!user) return Response.json({ error: "Sign in with ChatGPT is required." }, { status: 401 });

    const db = await getDb();
    const rows = await db
      .select()
      .from(listings)
      .where(eq(listings.ownerEmail, user.email.toLowerCase()))
      .orderBy(desc(listings.id))
      .limit(100);

    return Response.json({ user, listings: rows.map(serializeListing) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not load your listings." }, { status: 500 });
  }
}
