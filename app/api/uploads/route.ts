import { getChatGPTUser } from "../../chatgpt-auth";
import { getMediaBucket } from "../../runtime-storage";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

function validStorageKey(key: string): boolean {
  return key.startsWith("marketplace/") && !key.includes("..") && key.length < 240;
}

export async function POST(request: Request) {
  try {
    const user = await getChatGPTUser();
    if (!user) return Response.json({ error: "Sign in with ChatGPT before uploading photos." }, { status: 401 });

    const form = await request.formData();
    const value = form.get("file");
    if (!(value instanceof File)) return Response.json({ error: "Choose an image file." }, { status: 400 });

    const extension = allowedTypes.get(value.type);
    if (!extension) return Response.json({ error: "Only JPG, PNG, and WebP images are supported." }, { status: 415 });
    if (value.size < 1 || value.size > MAX_FILE_BYTES) return Response.json({ error: "Each image must be 5 MB or smaller." }, { status: 413 });

    const bucket = await getMediaBucket();
    const key = `marketplace/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`;
    await bucket.put(key, await value.arrayBuffer(), {
      httpMetadata: { contentType: value.type },
      customMetadata: { owner: user.email.toLowerCase(), originalName: value.name.slice(0, 120) },
    });

    return Response.json({ key, url: `/api/uploads?key=${encodeURIComponent(key)}` }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Photo upload failed." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const key = new URL(request.url).searchParams.get("key") ?? "";
    if (!validStorageKey(key)) return Response.json({ error: "Invalid image key." }, { status: 400 });

    const bucket = await getMediaBucket();
    const object = await bucket.get(key);
    if (!object) return Response.json({ error: "Image not found." }, { status: 404 });

    const headers = new Headers({
      "Cache-Control": "public, max-age=31536000, immutable",
      ETag: object.etag ?? `\"${key}\"`,
      "Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    });
    return new Response(object.body, { headers });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not load image." }, { status: 500 });
  }
}
