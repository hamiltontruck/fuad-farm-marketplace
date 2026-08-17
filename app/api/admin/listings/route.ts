import { desc } from "drizzle-orm";
import { getDb } from "../../../../db";
import { listings } from "../../../../db/schema";
import { getChatGPTUser } from "../../../chatgpt-auth";
import { serializeListing } from "../../../listing-data";
import { hasAdminConfiguration, isConfiguredAdmin } from "../../../runtime-storage";

export async function GET() {
  try {
    const user = await getChatGPTUser();
    if (!user) return Response.json({ error: "Sign in with ChatGPT is required." }, { status: 401 });

    const configured = await hasAdminConfiguration();
    if (!configured) {
      return Response.json({ error: "Admin email is not configured. Add ADMIN_EMAILS in the Site settings." }, { status: 503 });
    }

    if (!(await isConfiguredAdmin(user.email))) {
      return Response.json({ error: "This account is not an administrator." }, { status: 403 });
    }

    const db = await getDb();
    const rows = await db.select().from(listings).orderBy(desc(listings.id)).limit(250);
    return Response.json({ user, listings: rows.map(serializeListing) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not load admin listings." }, { status: 500 });
  }
}
