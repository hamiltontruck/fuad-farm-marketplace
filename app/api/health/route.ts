import { getDb } from "../../../db";
import { listings } from "../../../db/schema";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getMediaBucket, hasAdminConfiguration, isConfiguredAdmin } from "../../runtime-storage";

export async function GET() {
  const checks = {
    api: true,
    database: false,
    photoStorage: false,
    adminConfigured: false,
    signedIn: false,
    adminAccess: false,
  };
  const errors: string[] = [];

  try {
    const db = await getDb();
    await db.select({ id: listings.id }).from(listings).limit(1);
    checks.database = true;
  } catch (error) {
    errors.push(`Database: ${error instanceof Error ? error.message : "unavailable"}`);
  }

  try {
    const bucket = await getMediaBucket();
    await bucket.head("system/health-check");
    checks.photoStorage = true;
  } catch (error) {
    errors.push(`Photo storage: ${error instanceof Error ? error.message : "unavailable"}`);
  }

  try {
    checks.adminConfigured = await hasAdminConfiguration();
    const user = await getChatGPTUser();
    checks.signedIn = Boolean(user);
    checks.adminAccess = user ? await isConfiguredAdmin(user.email) : false;
  } catch (error) {
    errors.push(`Admin configuration: ${error instanceof Error ? error.message : "unavailable"}`);
  }

  const healthy = checks.database && checks.photoStorage;
  return Response.json({ healthy, checks, errors }, { status: healthy ? 200 : 503 });
}
