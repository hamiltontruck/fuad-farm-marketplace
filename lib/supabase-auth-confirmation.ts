"use client";

import type { SupabaseSession, SupabaseUser } from "./supabase-browser";

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://gdckzjtneidkngfjfjlx.supabase.co").replace(/\/$/, "");
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_jw5M6GAGQCFawBYabP8SIw_aawQM49_";
const SESSION_KEY = "fuad-supabase-session-v1";
const PRODUCTION_SITE_URL = "https://fuad-farm-marketplace.adilabdu52.chatgpt.site";

type AuthResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  expires_at?: number;
  token_type?: string;
  user?: SupabaseUser;
};

type AuthError = {
  message?: string;
  msg?: string;
  error?: string;
  error_description?: string;
};

function errorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object") {
    const value = payload as AuthError;
    return value.message ?? value.msg ?? value.error_description ?? value.error ?? fallback;
  }
  return fallback;
}

function confirmationRedirectUrl(): string {
  const base = typeof window !== "undefined" ? window.location.origin : PRODUCTION_SITE_URL;
  return `${base.replace(/\/$/, "")}/?auth=confirmed`;
}

async function authRequest<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try { payload = JSON.parse(text); } catch { payload = text; }
  }

  if (!response.ok) throw new Error(errorMessage(payload, `Supabase Auth request failed (${response.status}).`));
  return payload as T;
}

function storeSession(session: SupabaseSession): void {
  if (typeof window === "undefined") return;
  const normalized: SupabaseSession = {
    ...session,
    expires_at: session.expires_at ?? Math.floor(Date.now() / 1000) + (session.expires_in ?? 3600),
  };
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(normalized));
}

export async function signUpWithConfirmationRedirect(
  email: string,
  password: string,
  fullName: string,
): Promise<{ session: SupabaseSession | null; user: SupabaseUser | null }> {
  const redirectTo = confirmationRedirectUrl();
  const result = await authRequest<AuthResponse>(
    `/auth/v1/signup?redirect_to=${encodeURIComponent(redirectTo)}`,
    { email, password, data: { full_name: fullName } },
  );

  const session = result.access_token && result.refresh_token && result.user
    ? ({
        access_token: result.access_token,
        refresh_token: result.refresh_token,
        expires_in: result.expires_in,
        expires_at: result.expires_at,
        token_type: result.token_type,
        user: result.user,
      } satisfies SupabaseSession)
    : null;

  if (session) storeSession(session);
  return { session, user: result.user ?? null };
}

export async function resendSignupConfirmation(email: string): Promise<void> {
  const redirectTo = confirmationRedirectUrl();
  await authRequest<unknown>(
    `/auth/v1/resend?redirect_to=${encodeURIComponent(redirectTo)}`,
    { type: "signup", email },
  );
}
