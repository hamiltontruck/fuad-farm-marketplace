import { desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { listings } from "../../../db/schema";

const allowedCategories = new Set(["mineral", "electronics", "farm", "construction", "property", "manufactured", "broker", "buyer", "livestock"]);
const allowedTransactions = new Set(["sell", "buy", "broker"]);

export async function GET() {
  try {
    const db = await getDb();
    const rows = await db.select().from(listings).orderBy(desc(listings.id)).limit(80);
    return Response.json({ listings: rows });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not load listings." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const title = String(payload.title ?? "").trim();
    const category = String(payload.category ?? "").trim();
    const categoryLabel = String(payload.categoryLabel ?? "").trim();
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

    if (title.length < 4 || !allowedCategories.has(category) || !allowedTransactions.has(transaction) || !Number.isFinite(price) || price < 0 || !location || seller.length < 2 || phone.length < 9 || description.length < 12) {
      return Response.json({ error: "Listing information is incomplete or invalid." }, { status: 400 });
    }

    const db = await getDb();
    const [listing] = await db.insert(listings).values({ title, category, categoryLabel, transaction, price, priceSuffix, location, seller, phone, role, condition, description, icon, accent }).returning();
    return Response.json({ listing }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not publish listing." }, { status: 500 });
  }
}
