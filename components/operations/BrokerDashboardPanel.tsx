"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchMyListings,
  getProfile,
  getSession,
  type Profile,
  type SupabaseSession,
} from "../../lib/supabase-browser";
import SupabaseAuthCard from "./SupabaseAuthCard";
import type { DatabaseListing } from "./types";

export default function BrokerDashboardPanel() {
  const [session, setSession] = useState<SupabaseSession | null | undefined>(undefined);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<DatabaseListing[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (currentSession?: SupabaseSession | null) => {
    setLoading(true);
    setError("");
    try {
      const activeSession = currentSession === undefined ? await getSession() : currentSession;
      setSession(activeSession);
      if (!activeSession) {
        setProfile(null);
        setListings([]);
        return;
      }
      const [nextProfile, nextListings] = await Promise.all([
        getProfile(activeSession),
        fetchMyListings(activeSession),
      ]);
      setProfile(nextProfile);
      setListings(nextListings.filter((listing) => listing.transaction === "broker"));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Broker dashboard load failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const authorized = profile?.is_admin || profile?.role?.toLowerCase() === "broker";
  const stats = useMemo(() => ({
    total: listings.length,
    active: listings.filter((listing) => listing.status === "active").length,
    pending: listings.filter((listing) => listing.status === "pending").length,
    sold: listings.filter((listing) => listing.status === "sold").length,
    portfolio: listings.reduce((sum, listing) => sum + Number(listing.price || 0), 0),
  }), [listings]);
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return listings.filter((listing) => !needle || `${listing.title} ${listing.location} ${listing.categoryLabel} ${listing.status}`.toLowerCase().includes(needle));
  }, [listings, query]);

  if (session === undefined) return <section className="ops-card"><p>Broker account ilaalaa jira…</p></section>;
  if (!session) return <SupabaseAuthCard title="Broker dashboard seenuuf FUAD account seeni" onAuthenticated={() => void load()} />;

  if (!loading && profile && !authorized) {
    return (
      <section className="ops-card">
        <div className="ops-alert">Account kana gaheen isaa <strong>{profile.role || "hin ibsamne"}</strong>. Broker dashboard gahee broker ykn admin qofaan banama.</div>
        <div className="ops-actions"><Link className="ops-button secondary" href="/customer-dashboard">Customer dashboard</Link></div>
      </section>
    );
  }

  return (
    <section className="ops-card">
      <div className="ops-dashboard-head">
        <div>
          <span className="ops-eyebrow">BROKER CONTROL</span>
          <h2>{profile?.business_name || profile?.full_name || "Broker dashboard"}</h2>
          <p>Broker listings, pipeline fi portfolio tokko keessatti bulchi.</p>
        </div>
        <div className="ops-actions compact">
          <Link className="ops-button" href="/post">＋ Broker post</Link>
          <Link className="ops-button secondary" href="/customer-dashboard">Post hunda bulchi</Link>
          <button className="ops-button secondary" type="button" onClick={() => void load(session)} disabled={loading}>Refresh</button>
        </div>
      </div>

      <div className="ops-stat-grid">
        <div className="ops-stat"><strong>{stats.total}</strong><span>Broker posts</span></div>
        <div className="ops-stat"><strong>{stats.active}</strong><span>Active</span></div>
        <div className="ops-stat"><strong>{stats.pending}</strong><span>Pending</span></div>
        <div className="ops-stat"><strong>{stats.sold}</strong><span>Closed / sold</span></div>
        <div className="ops-stat"><strong>ETB {stats.portfolio.toLocaleString()}</strong><span>Listed portfolio</span></div>
      </div>

      <label className="ops-field ops-search-field">Broker pipeline search
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Title, location, category ykn status…" />
      </label>

      {loading && <p>Broker data fidaa jira…</p>}
      {error && <p className="ops-alert" role="alert">{error}</p>}
      {!loading && !error && authorized && listings.length === 0 && <div className="ops-note">Broker post hin jiru. Post haaraa keessatti transaction akka Broker filadhu.</div>}

      <div className="ops-list ops-dashboard-list">
        {visible.map((listing) => (
          <article className="ops-listing" key={listing.id}>
            <div>{listing.images[0] ? <img className="ops-listing-image" src={listing.images[0]} alt={listing.title} loading="lazy" decoding="async" /> : <div className="ops-listing-placeholder">🤝</div>}</div>
            <div>
              <div className="ops-listing-title-row"><h3>{listing.title}</h3><span className={`ops-pill ${listing.status}`}>{listing.status}</span></div>
              <p className="ops-price">ETB {Number(listing.price).toLocaleString()} · {listing.priceSuffix}</p>
              <p>{listing.location} · {listing.categoryLabel} · {listing.phone}</p>
              <p>{listing.description}</p>
              <div className="ops-meta"><span className="ops-pill">{listing.id.slice(0, 8)}</span><span className="ops-pill">{listing.images.length} photo</span></div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
