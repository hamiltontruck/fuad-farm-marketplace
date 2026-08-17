type MediaObject = {
  body: ReadableStream<Uint8Array>;
  httpMetadata?: { contentType?: string };
  etag?: string;
};

type MediaBucket = {
  put(
    key: string,
    value: ArrayBuffer,
    options?: { httpMetadata?: { contentType?: string }; customMetadata?: Record<string, string> },
  ): Promise<unknown>;
  get(key: string): Promise<MediaObject | null>;
  delete(key: string): Promise<void>;
  head(key: string): Promise<unknown | null>;
};

type RuntimeEnv = {
  MEDIA?: MediaBucket;
  ADMIN_EMAILS?: string;
  FUAD_ADMIN_EMAIL?: string;
};

async function runtimeEnv(): Promise<RuntimeEnv> {
  const { env } = await import("cloudflare:workers");
  return env as unknown as RuntimeEnv;
}

export async function getMediaBucket(): Promise<MediaBucket> {
  const env = await runtimeEnv();
  if (!env.MEDIA) {
    throw new Error("Cloudflare R2 binding `MEDIA` is unavailable. Add R2 storage to this Site before uploading photos.");
  }
  return env.MEDIA;
}

export async function isConfiguredAdmin(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  const env = await runtimeEnv();
  const configured = `${env.ADMIN_EMAILS ?? ""},${env.FUAD_ADMIN_EMAIL ?? ""}`
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return configured.includes(email.trim().toLowerCase());
}

export async function hasAdminConfiguration(): Promise<boolean> {
  const env = await runtimeEnv();
  return Boolean((env.ADMIN_EMAILS ?? env.FUAD_ADMIN_EMAIL ?? "").trim());
}
