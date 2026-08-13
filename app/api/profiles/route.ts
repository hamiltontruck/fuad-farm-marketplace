import { getDb } from "../../../db";
import { profiles } from "../../../db/schema";

const allowedRoles = new Set(["farmer", "manufacturer", "seller", "broker", "electronics", "mineral", "buyer"]);

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const role = String(payload.role ?? "").trim();
    const fullName = String(payload.fullName ?? "").trim();
    const phone = String(payload.phone ?? "").trim();
    const region = String(payload.region ?? "").trim();
    const businessName = String(payload.businessName ?? "").trim();
    const specialty = String(payload.specialty ?? "").trim();
    const experience = String(payload.experience ?? "").trim();

    if (!allowedRoles.has(role) || fullName.length < 2 || phone.length < 9 || !region) {
      return Response.json({ error: "Role, full name, phone and region are required." }, { status: 400 });
    }

    const db = await getDb();
    const [profile] = await db.insert(profiles).values({ role, fullName, phone, region, businessName, specialty, experience }).returning();
    return Response.json({ profile }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not save profile." }, { status: 500 });
  }
}
