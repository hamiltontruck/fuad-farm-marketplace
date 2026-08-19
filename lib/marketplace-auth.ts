"use client";

import type { RegistrationPayload } from "../components/registration/MultiRoleRegister";
import type { RoleId } from "../components/registration/RoleSelector";
import {
  getProfile,
  signIn,
  type Profile,
  type SupabaseSession,
  type SupabaseUser,
} from "./supabase-browser";

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://gdckzjtneidkngfjfjlx.supabase.co").replace(/\/$/, "");
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_jw5M6GAGQCFawBYabP8SIw_aawQM49_";
const SUPABASE_SESSION_KEY = "fuad-supabase-session-v1";
const LOCAL_PROFILE_KEY = "fuad-marketplace-profile-v1";

const validRoles = new Set<RoleId>([
  "farmer",
  "manufacturer",
  "seller",
  "broker",
  "buyer",
  "electronics",
  "mineral",
]);

type SignUpResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  expires_at?: number;
  token_type?: string;
  user?: SupabaseUser;
  message?: string;
  error?: string;
  error_description?: string;
  msg?: string;
};

function roleFrom(value: string | undefined): RoleId {
  return value && validRoles.has(value as RoleId) ? value as RoleId : "buyer";
}

function errorMessage(payload: SignUpResponse, fallback: string): string {
  return payload.message ?? payload.msg ?? payload.error_description ?? payload.error ?? fallback;
}

function storeSupabaseSession(session: SupabaseSession) {
  const normalized = {
    ...session,
    expires_at: session.expires_at ?? Math.floor(Date.now() / 1000) + (session.expires_in ?? 3600),
  };
  window.localStorage.setItem(SUPABASE_SESSION_KEY, JSON.stringify(normalized));
}

function storeMarketplaceProfile(profile: RegistrationPayload) {
  window.localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));
}

export function profileToRegistrationPayload(
  profile: Profile | null,
  session: SupabaseSession,
  fallback?: Partial<RegistrationPayload>,
): RegistrationPayload {
  const metadata = session.user.user_metadata ?? {};
  const emailName = session.user.email?.split("@")[0] ?? "FUAD User";
  const fullName = profile?.full_name?.trim()
    || String(metadata.full_name ?? metadata.name ?? fallback?.fullName ?? emailName).trim()
    || emailName;

  return {
    role: roleFrom(profile?.role || String(metadata.role ?? fallback?.role ?? "buyer")),
    fullName,
    phone: profile?.phone ?? String(metadata.phone ?? fallback?.phone ?? ""),
    region: profile?.region ?? String(metadata.region ?? fallback?.region ?? ""),
    businessName: profile?.business_name ?? String(metadata.business_name ?? fallback?.businessName ?? ""),
    specialty: profile?.specialty ?? String(metadata.specialty ?? fallback?.specialty ?? ""),
    experience: profile?.experience ?? String(metadata.experience ?? fallback?.experience ?? ""),
  };
}

async function updateProfile(session: SupabaseSession, payload: RegistrationPayload): Promise<void> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(session.user.id)}`, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      full_name: payload.fullName,
      phone: payload.phone,
      role: payload.role,
      region: payload.region,
      business_name: payload.businessName,
      specialty: payload.specialty,
      experience: payload.experience,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({})) as SignUpResponse;
    throw new Error(errorMessage(data, "Profile database keessatti kuusuu hin dandeenye."));
  }
}

export async function loginMarketplaceAccount(email: string, password: string): Promise<RegistrationPayload> {
  const session = await signIn(email.trim(), password);
  const profile = await getProfile(session);
  const payload = profileToRegistrationPayload(profile, session);
  storeMarketplaceProfile(payload);
  return payload;
}

export async function signUpMarketplaceAccount(
  email: string,
  password: string,
  payload: RegistrationPayload,
): Promise<{ confirmationRequired: boolean; profile: RegistrationPayload | null }> {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email.trim(),
      password,
      data: {
        full_name: payload.fullName,
        phone: payload.phone,
        role: payload.role,
        region: payload.region,
        business_name: payload.businessName,
        specialty: payload.specialty,
        experience: payload.experience,
      },
    }),
  });

  const result = await response.json().catch(() => ({})) as SignUpResponse;
  if (!response.ok) throw new Error(errorMessage(result, "Account uumuu hin dandeenye."));

  if (!result.access_token || !result.refresh_token || !result.user) {
    return { confirmationRequired: true, profile: null };
  }

  const session: SupabaseSession = {
    access_token: result.access_token,
    refresh_token: result.refresh_token,
    expires_in: result.expires_in,
    expires_at: result.expires_at,
    token_type: result.token_type,
    user: result.user,
  };
  storeSupabaseSession(session);
  await updateProfile(session, payload);
  const savedProfile = profileToRegistrationPayload(await getProfile(session), session, payload);
  storeMarketplaceProfile(savedProfile);
  return { confirmationRequired: false, profile: savedProfile };
}
