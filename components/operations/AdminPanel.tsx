"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  adminDeleteListing,
  deleteListingImages,
  fetchAdminListings,
  fetchModerationEvents,
  getSession,
  moderateListing,
  signOut,
  type ModerationEvent,
  type SupabaseSession,
} from "../../lib/supabase-browser";
import SupabaseAuthCard from "./SupabaseAuthCard";
import type { DatabaseListing, ListingStatus } from "./types";

type ModerationStatus = Extract<ListingStatus, "active" | "sold" | "hidden">;

export default function AdminPanel() {
  const [session, setSession] = useState<SupabaseSession | null | undefined>(undefined);
  const [listings, setListings] = useState<DatabaseListing[]>([]);
  const [events, setEvents] = useState<ModerationEvent[]>([]);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async (currentSession?: SupabaseSession | null) => {
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const activeSession = currentSession === undefined ? await getSession() : currentSession;
      setSession(activeSession);
      if (!activeSession) {
        setListings([]);
        setEvents([]);
        return;
      }
      const [nextListings, nextEvents] = await Promise.all([
        fetchAdminListings(activeSession),
        fetchModerationEvents(activeSession),
      ]);
      setListings(nextListings);
      setEvents(nextEvents);
    } catch (caught) {
      setListings([]);
      setEvents([]);
      setError(caught instanceof Error ? caught.message : "Admin listings load failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return listings.filter((listing) => {
      const matchesStatus = statusFilter === "all" || listing.status === statusFilter;
      const haystack = `${listing.title} ${listing.seller} ${listing.phone} ${listing.location} ${listing.categoryLabel}`.toLowerCase();
      return matchesStatus && (!needle || haystack.includes(needle));
    });
  }, [listings, query, statusFilter]);

  const stats = useMemo(() => ({
    total: listings.length,
    active: listings.filter((listing) => listing.status === "active").length,
    pending: listings.filter((listing) => listing.status === "pending").length,
    hidden: listings.filter((listing) => listing.status === "hidden").length,
    sold: listings.filter((listing) => listing.status === "sold").length,
  }), [listings]);

  function reasonFor(id: string) {
    return (reasons[id] ?? "").trim();
  }

  function validateReason(id: string): string | null {
    const reason = reasonFor(id);
    if (reason.length < 3) {
      setError("Moderation reason yoo xiqqaate qubee 3 qabaachuu qaba.");
      return null;
    }
    return reason;
  }

  async function refreshEvents(activeSession: SupabaseSession) {
    try {
      setEvents(await fetchModerationEvents(activeSession));
    } catch {
      // The moderation action already succeeded; audit refresh can be retried.
    }
  }

  async function changeStatus(id: string, status: ModerationStatus) {
    if (!session) return;
    const reason = validateReason(id);
    if (!reason) return;

    setBusyId(id);
    setError("");
    setNotice("");
    try {
      await moderateListing(session, id, status, reason);
      setListings((current) => current.map((item) => item.id === id ? { ...item, status } : item));
      setReasons((current) => ({ ...current, [id]: "" }));
      setNotice(`Post ${status} ta'eera; audit fi owner notification uumameera.`);
      await refreshEvents(session);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Moderation update failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(listing: DatabaseListing) {
    if (!session) return;
    const reason = validateReason(listing.id);
    if (!reason) return;
    if (!window.confirm("Admin delete: maxxansa fi suuraa isaa guutummaatti haquu? Audit fi owner notification ni uumama.")) return;

    setBusyId(listing.id);
    setError("");
    setNotice("");
    try {
      await adminDeleteListing(session, listing.id, reason);
      try { await deleteListingImages(session, listing.images); } catch { /* database delete and audit already succeeded */ }
      setListings((current) => current.filter((item) => item.id !== listing.id));
      setReasons((current) => ({ ...current, [listing.id]: "" }));
      setNotice("Post haqameera; audit fi owner notification uumameera.");
      await refreshEvents(session);
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
      <div className="ops-note">{"Admin authorization Supabase profiles.is_admin irratti RLS serveriin mirkanaa'a. Moderation action hundi reason, audit event fi owner notification qaba."} Account: <strong>{session.user.email}</strong>.</div>

      <div className="ops-stat-grid">
        <div className="ops-stat"><strong>{stats.total}</strong><span>Total</span></div>
        <div className="ops-stat"><strong>{stats.active}</strong><span>Active</span></div>
        <div className="ops-stat"><strong>{stats.pending}</strong><span>Pending</span></div>
        <div className="ops-stat"><strong>{stats.hidden}</strong><span>Hidden</span></div>
        <div className="ops-stat"><strong>{stats.sold}</strong><span>Sold</span></div>
      </div>

      <div className="ops-toolbar">
        <label className="ops-field">Search
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Title, seller, phone, location..." />
        </label>
        <label className="ops-field">Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">Hunda</option><option value="active">Active</option><option value="pending">Pending</option><option value="sold">Sold</option><option value="hidden">Hidden</option></select>
        </label>
      </div>
      <div className="ops-actions">
        <button className="ops-button secondary" type="button" onClick={() => void load(session)} disabled={loading}>Refresh Supabase</button>
        <button className="ops-button secondary" type="button" onClick={() => void signOut().then(() => { setSession(null); setListings([]); setEvents([]); setError(""); })}>Logout</button>
        <span className="ops-pill">{visible.length} shown / {listings.length} total</span>
      </div>
      {loading && <p>Supabase admin database fidaa jira…</p>}
      {notice && <p className="ops-success" role="status">{notice}</p>}
      {error && <p className="ops-alert" role="alert">{error}</p>}

      <div className="ops-list ops-dashboard-list">
        {visible.map((listing) => (
          <article className="ops-listing ops-admin-listing" key={listing.id}>
            <div>{listing.images[0] ? <img className="ops-listing-image" src={listing.images[0]} alt={listing.title} loading="lazy" decoding="async" /> : <div className="ops-listing-placeholder">{listing.icon}</div>}</div>
            <div>
              <div className="ops-listing-title-row"><h3>{listing.title}</h3><span className={`ops-pill ${listing.status}`}>{listing.status}</span></div>
              <p><strong>{listing.seller}</strong> · {listing.phone} · {listing.location}</p>
              <p>ETB {Number(listing.price).toLocaleString()} · {listing.description}</p>
              <div className="ops-meta"><span className="ops-pill">{listing.id.slice(0, 8)}</span><span className="ops-pill">{listing.transaction}</span><span className="ops-pill">owner linked</span></div>
              <label className="ops-field ops-moderation-reason">Moderation reason
                <input value={reasons[listing.id] ?? ""} onChange={(event) => setReasons((current) => ({ ...current, [listing.id]: event.target.value }))} placeholder="Reason required for every action…" maxLength={500} />
              </label>
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

      <section className="ops-audit-section" aria-labelledby="moderation-audit-heading">
        <div className="ops-dashboard-head">
          <div><span className="ops-eyebrow">IMMUTABLE HISTORY</span><h2 id="moderation-audit-heading">Moderation audit</h2></div>
          <span className="ops-pill">Latest {events.length}</span>
        </div>
        {events.length === 0 ? <div className="ops-note">Moderation event hin jiru.</div> : (
          <div className="ops-audit-list">
            {events.slice(0, 20).map((event) => (
              <article className="ops-audit-item" key={event.id}>
                <div><strong>{event.listing_title}</strong><p>{event.reason}</p></div>
                <div className="ops-audit-meta"><span className="ops-pill">{event.action.replace("_", " ")}</span><small>{event.previous_status ?? "—"} → {event.new_status ?? "deleted"}</small><small>{new Date(event.created_at).toLocaleString()}</small></div>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
