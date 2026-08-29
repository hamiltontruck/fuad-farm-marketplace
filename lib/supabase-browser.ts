"use client";

import type { DatabaseListing, ListingStatus } from "../components/operations/types";

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://gdckzjtneidkngfjfjlx.supabase.co").replace(/\/$/, "");
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_jw5M6GAGQCFawBYabP8SIw_aawQM49_";
const SESSION_KEY = "fuad-supabase-session-v1";
const IMAGE_BUCKET = "listing-images";

export type SupabaseUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

export type SupabaseSession = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  expires_at?: number;
  token_type?: string;
  user: SupabaseUser;
};

export type Profile = {
  id: string;
  full_name: string;
  phone: string;
  role: string;
  region: string;
  business_name: string;
  specialty: string;
  experience: string;
  avatar_url: string | null;
  is_admin: boolean;
};

export type ListingInput = {
  title: string;
  category: string;
  category_label: string;
  transaction: "sell" | "buy" | "broker";
  price: number;
  price_suffix: string;
  location: string;
  seller_name: string;
  phone: string;
  role_label: string;
  condition: string;
  description: string;
  image_urls: string[];
};

export type ListingUpdateInput = Partial<Pick<
  ListingInput,
  "title" | "price" | "price_suffix" | "location" | "seller_name" | "phone" | "condition" | "description" | "image_urls"
>> & {
  status?: ListingStatus;
};

type ApiError = {
  message?: string;
  msg?: string;
  error?: string;
  error_description?: string;
};

type ListingRow = {
  id: string;
  owner_id: string;
  title: string;
  category: string;
  category_label: string;
  transaction: string;
  price: number | string;
  price_suffix: string;
  location: string;
  seller_name: string;
  phone: string;
  role_label: string;
  condition: string;
  description: string;
  image_urls: string[] | null;
  status: ListingStatus;
  verified: boolean;
  created_at: string;
};

const categoryVisuals: Record<string, { icon: string; accent: string }> = {
  mineral: { icon: "🪨", accent: "violet" },
  electronics: { icon: "💻", accent: "blue" },
  farm: { icon: "🌾", accent: "green" },
  construction: { icon: "🏗️", accent: "orange" },
  property: { icon: "🏠", accent: "rose" },
  manufactured: { icon: "🏭", accent: "slate" },
  broker: { icon: "🤝", accent: "teal" },
  buyer: { icon: "🛒", accent: "gold" },
  livestock: { icon: "🐄", accent: "brown" },
};

function errorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object") {
    const value = payload as ApiError;
    return value.message ?? value.msg ?? value.error_description ?? value.error ?? fallback;
  }
  return fallback;
}

async function apiRequest<T>(path: string, init: RequestInit = {}, accessToken?: string): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("apikey", SUPABASE_PUBLISHABLE_KEY);
  headers.set("Authorization", `Bearer ${accessToken ?? SUPABASE_PUBLISHABLE_KEY}`);
  if (typeof init.body === "string" && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const response = await fetch(`${SUPABASE_URL}${path}`, { ...init, headers, cache: "no-store" });
  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try { payload = JSON.parse(text); } catch { payload = text; }
  }
  if (!response.ok) throw new Error(errorMessage(payload, `Supabase request failed (${response.status}).`));
  return payload as T;
}

function storeSession(session: SupabaseSession | null) {
  if (typeof window === "undefined") return;
  if (!session) {
    window.localStorage.removeItem(SESSION_KEY);
    return;
  }
  const normalized = {
    ...session,
    expires_at: session.expires_at ?? Math.floor(Date.now() / 1000) + (session.expires_in ?? 3600),
  };
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(normalized));
}

function readStoredSession(): SupabaseSession | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SESSION_KEY) ?? "null") as SupabaseSession | null;
    return parsed?.access_token && parsed?.refresh_token && parsed?.user?.id ? parsed : null;
  } catch {
    return null;
  }
}

async function refreshSession(session: SupabaseSession): Promise<SupabaseSession | null> {
  try {
    const refreshed = await apiRequest<SupabaseSession>("/auth/v1/token?grant_type=refresh_token", {
      method: "POST",
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    });
    storeSession(refreshed);
    return refreshed;
  } catch {
    storeSession(null);
    return null;
  }
}

export async function getSession(): Promise<SupabaseSession | null> {
  const session = readStoredSession();
  if (!session) return null;
  const expiresAt = session.expires_at ?? 0;
  if (expiresAt > Math.floor(Date.now() / 1000) + 60) return session;
  return refreshSession(session);
}

export async function signIn(email: string, password: string): Promise<SupabaseSession> {
  const session = await apiRequest<SupabaseSession>("/auth/v1/token?grant_type=password", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  storeSession(session);
  return session;
}

export async function signUp(email: string, password: string, fullName: string): Promise<{ session: SupabaseSession | null; user: SupabaseUser | null }> {
  const result = await apiRequest<{ access_token?: string; refresh_token?: string; expires_in?: number; user?: SupabaseUser }>("/auth/v1/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, data: { full_name: fullName } }),
  });
  const session = result.access_token && result.refresh_token && result.user
    ? ({ ...result, access_token: result.access_token, refresh_token: result.refresh_token, user: result.user } as SupabaseSession)
    : null;
  if (session) storeSession(session);
  return { session, user: result.user ?? null };
}

export async function signOut(): Promise<void> {
  const session = readStoredSession();
  try {
    if (session) await apiRequest<unknown>("/auth/v1/logout", { method: "POST" }, session.access_token);
  } finally {
    storeSession(null);
  }
}

export async function getProfile(session: SupabaseSession): Promise<Profile | null> {
  const rows = await apiRequest<Profile[]>(`/rest/v1/profiles?select=*&id=eq.${encodeURIComponent(session.user.id)}&limit=1`, {}, session.access_token);
  return rows[0] ?? null;
}

function mapListing(row: ListingRow): DatabaseListing {
  const visual = categoryVisuals[row.category] ?? { icon: "📦", accent: "blue" };
  return {
    id: row.id,
    ownerId: row.owner_id,
    title: row.title,
    category: row.category,
    categoryLabel: row.category_label,
    transaction: row.transaction,
    price: Number(row.price),
    priceSuffix: row.price_suffix,
    location: row.location,
    seller: row.seller_name,
    phone: row.phone,
    role: row.role_label,
    condition: row.condition,
    description: row.description,
    icon: visual.icon,
    accent: visual.accent,
    status: row.status,
    images: Array.isArray(row.image_urls) ? row.image_urls : [],
    verified: Boolean(row.verified),
    createdAt: row.created_at,
  };
}

export async function fetchPublicListings(): Promise<DatabaseListing[]> {
  const rows = await apiRequest<ListingRow[]>("/rest/v1/listings?select=*&status=neq.hidden&order=created_at.desc&limit=100");
  return rows.map(mapListing);
}

export async function fetchMyListings(session: SupabaseSession): Promise<DatabaseListing[]> {
  const rows = await apiRequest<ListingRow[]>(`/rest/v1/listings?select=*&owner_id=eq.${encodeURIComponent(session.user.id)}&order=created_at.desc`, {}, session.access_token);
  return rows.map(mapListing);
}

export async function fetchAdminListings(session: SupabaseSession): Promise<DatabaseListing[]> {
  const profile = await getProfile(session);
  if (!profile?.is_admin) throw new Error("Account kun admin miti. Supabase profiles keessatti is_admin=true ta'uu qaba.");
  const rows = await apiRequest<ListingRow[]>("/rest/v1/listings?select=*&order=created_at.desc&limit=250", {}, session.access_token);
  return rows.map(mapListing);
}

export async function createListing(session: SupabaseSession, input: ListingInput): Promise<DatabaseListing> {
  const rows = await apiRequest<ListingRow[]>("/rest/v1/listings", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ ...input, owner_id: session.user.id, status: "active" }),
  }, session.access_token);
  if (!rows[0]) throw new Error("Maxxansi database keessatti hin uumamne.");
  return mapListing(rows[0]);
}

export async function updateListing(session: SupabaseSession, id: string, updates: ListingUpdateInput): Promise<DatabaseListing> {
  const rows = await apiRequest<ListingRow[]>(`/rest/v1/listings?id=eq.${encodeURIComponent(id)}&owner_id=eq.${encodeURIComponent(session.user.id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(updates),
  }, session.access_token);
  if (!rows[0]) throw new Error("Maxxansa jijjiiruu hin dandeenye. Owner account fi RLS mirkaneessi.");
  return mapListing(rows[0]);
}

export async function deleteListing(session: SupabaseSession, id: string): Promise<void> {
  await apiRequest<unknown>(`/rest/v1/listings?id=eq.${encodeURIComponent(id)}&owner_id=eq.${encodeURIComponent(session.user.id)}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  }, session.access_token);
}

function safeFileName(name: string): string {
  const cleaned = name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return cleaned || "photo.jpg";
}

function encodeObjectPath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}

export async function uploadListingImage(session: SupabaseSession, file: File): Promise<{ path: string; url: string }> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !["jpg", "jpeg", "png", "webp"].includes(extension)) throw new Error("JPG, PNG ykn WebP qofa upload godhi.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Suuraan tokko 5 MB caaluu hin qabu.");

  const path = `${session.user.id}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
  await apiRequest<unknown>(`/storage/v1/object/${IMAGE_BUCKET}/${encodeObjectPath(path)}`, {
    method: "POST",
    headers: {
      "Content-Type": file.type,
      "cache-control": "3600",
      "x-upsert": "false",
    },
    body: file,
  }, session.access_token);

  return {
    path,
    url: `${SUPABASE_URL}/storage/v1/object/public/${IMAGE_BUCKET}/${encodeObjectPath(path)}`,
  };
}

function objectPathFromPublicUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${IMAGE_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index < 0) return null;
  return decodeURIComponent(url.slice(index + marker.length));
}

function ownedObjectPath(session: SupabaseSession, url: string): string | null {
  const path = objectPathFromPublicUrl(url);
  return path?.startsWith(`${session.user.id}/`) ? path : null;
}

export async function deleteListingImage(session: SupabaseSession, url: string): Promise<void> {
  const path = ownedObjectPath(session, url);
  if (!path) throw new Error("Suuraan kun account kee jalatti hin argamu.");
  await apiRequest<unknown>(`/storage/v1/object/${IMAGE_BUCKET}`, {
    method: "DELETE",
    body: JSON.stringify({ prefixes: [path] }),
  }, session.access_token);
}

export async function deleteListingImages(session: SupabaseSession, urls: string[]): Promise<void> {
  const prefixes = urls.map((url) => ownedObjectPath(session, url)).filter((value): value is string => Boolean(value));
  if (!prefixes.length) return;
  await apiRequest<unknown>(`/storage/v1/object/${IMAGE_BUCKET}`, {
    method: "DELETE",
    body: JSON.stringify({ prefixes }),
  }, session.access_token);
}

export async function checkSupabase(): Promise<{ database: boolean; storage: boolean; signedIn: boolean; admin: boolean; errors: string[] }> {
  const result = { database: false, storage: false, signedIn: false, admin: false, errors: [] as string[] };
  try {
    await apiRequest<ListingRow[]>("/rest/v1/listings?select=id&limit=1");
    result.database = true;
  } catch (error) {
    result.errors.push(`Database: ${error instanceof Error ? error.message : "unavailable"}`);
  }
  try {
    const response = await fetch(`${SUPABASE_URL}/storage/v1/object/public/${IMAGE_BUCKET}/__health_check__.png`, { method: "HEAD", cache: "no-store" });
    result.storage = response.status === 200 || response.status === 400 || response.status === 404;
  } catch (error) {
    result.errors.push(`Storage: ${error instanceof Error ? error.message : "unavailable"}`);
  }
  const session = await getSession();
  result.signedIn = Boolean(session);
  if (session) {
    try { result.admin = Boolean((await getProfile(session))?.is_admin); } catch { result.admin = false; }
  }
  return result;
}
