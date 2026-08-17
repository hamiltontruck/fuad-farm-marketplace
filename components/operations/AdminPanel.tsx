"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deleteListing,
  deleteListingImages,
  fetchAdminListings,
  getSession,
  signOut,
  updateListing,
  type SupabaseSession,
} from "../../lib/supabase-browser";
import SupabaseAuthCard from "./SupabaseAuthCard";
import type { DatabaseListing, ListingStatus } from "./types";

type ModerationStatus = Extract<ListingStatus, "active" | "sold" | "hidden">;

export default function AdminPanel() {
  const [session, setSession] = useState<SupabaseSession | null | undefined>(undefined);
  const [listings, setListings] = useState<DatabaseListing[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async (currentSession?: SupabaseSession | null) => {
    setLoading(true);
    setError("");
    try {
      const activeSession = currentSession === undefined ? await getSession() : currentSession;
      setSession(activeSession);
      if (!activeSession) {
        setListings([]);
        return;
      }
      setListings(await fetchAdminListings(activeSession));
    } catch (caught) {
      setListings([]);
      setError(caught instanceof Error ? caught.message : "Admin listings load failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return listings.filter((listing) => {
      const matchesStatus = statusFilter === "all" || listing.status === statusFilter;
      const haystack = `${listing.title} ${listing.seller} ${listing.phone} ${listing.location} ${listing.categoryLabel}`.toLowerCase();
      return matchesStatus && (!needle || haystack.includes(needle));
    });
  }, [listings, query, statusFilter]);

  async function changeStatus(id: string, status: ModerationStatus) {
    if (!session) return;
    setBusyId(id);
    setError("");
    try {
      const listing = await updateListing(session, id, { status });
      setListings((current) => current.map((item) => item.id === id ? listing : item));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Moderation update failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(listing: DatabaseListing) {
    if (!session || !window.confirm("Admin delete: maxxansa fi suuraa isaa guutummaatti haquu?")) return;
    setBusyId(listing.id);
    setError("");
    try {
      await deleteListing(session, listing.id);
      try { await deleteListingImages(session, listing.images); } catch { /* database delete already succeeded */ }
      setListings((current) => current.filter((item) => item.id !== listing.id));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Admin delete failed.");
    } finally {
      setBusyId(null);
    }
  }

  if (session === undefined) return <section className="ops-card"><p>Supabase admin account ilaalaa jira…</p></section>;
  if (!session) return <SupabaseAuthCard title="Admin account seeni" onAuthenticated={() => void load()} />;

  return (
    <section className="ops-card">
      <div className="ops-note">Admin authorization Supabase <strong>profiles.is_admin</strong> irratti RLS serveriin mirkanaa'a. Account: <strong>{session.user.email}</strong>.</div>
      <div className="ops-grid" style={{ marginTop: 18 }}>
        <label className="ops-field">Search
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Title, seller, phone, location..." />
        </label>
        <label className="ops-field">Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">Hunda</option><option value="active">Active</option><option value="pending">Pending</option><option value="sold">Sold</option><option value="hidden">Hidden</option></select>
        </label>
      </div>
      <div className="ops-actions">
        <button className="ops-button secondary" type="button" onClick={() => void load(session)} disabled={loading}>Refresh Supabase</button>
        <button className="ops-button secondary" type="button" onClick={() => void signOut().then(() => { setSession(null); setListings([]); setError(""); })}>Logout</button>
        <span className="ops-pill">{visible.length} shown / {listings.length} total</span>
      </div>
      {loading && <p>Supabase admin database fidaa jira…</p>}
      {error && <p className="ops-alert" role="alert">{error}</p>}
      <div className="ops-list">
        {visible.map((listing) => (
          <article className="ops-listing" key={listing.id}>
            <div>{listing.images[0] ? <img className="ops-listing-image" src={listing.images[0]} alt={listing.title} /> : <div className="ops-listing-placeholder">{listing.icon}</div>}</div>
            <div>
              <h3>{listing.title}</h3>
              <p><strong>{listing.seller}</strong> · {listing.phone} · {listing.location}</p>
              <p>ETB {Number(listing.price).toLocaleString()} · {listing.description}</p>
              <div className="ops-meta"><span className={`ops-pill ${listing.status}`}>{listing.status}</span><span className="ops-pill">{listing.id.slice(0, 8)}</span><span className="ops-pill">{listing.transaction}</span><span className="ops-pill">owner linked</span></div>
              <div className="ops-actions">
                <button className="ops-button" type="button" onClick={() => void changeStatus(listing.id, "active")} disabled={busyId === listing.id || listing.status === "active"}>Active</button>
                <button className="ops-button warning" type="button" onClick={() => void changeStatus(listing.id, "sold")} disabled={busyId === listing.id || listing.status === "sold"}>Sold</button>
                <button className="ops-button secondary" type="button" onClick={() => void changeStatus(listing.id, "hidden")} disabled={busyId === listing.id || listing.status === "hidden"}>Hide</button>
                <button className="ops-button danger" type="button" onClick={() => void remove(listing)} disabled={busyId === listing.id}>Delete</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
