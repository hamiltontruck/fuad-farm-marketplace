"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  fetchSavedListings,
  getSession,
  unsaveListing,
  type SupabaseSession,
} from "../../lib/supabase-browser";
import SupabaseAuthCard from "./SupabaseAuthCard";
import type { DatabaseListing } from "./types";

export default function SavedListingsPanel() {
  const [session, setSession] = useState<SupabaseSession | null | undefined>(undefined);
  const [listings, setListings] = useState<DatabaseListing[]>([]);
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
        return;
      }
      setListings(await fetchSavedListings(activeSession));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Saved posts load failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function removeSaved(listingId: string) {
    if (!session) return;
    setBusyId(listingId);
    setError("");
    setNotice("");
    try {
      await unsaveListing(session, listingId);
      setListings((current) => current.filter((listing) => listing.id !== listingId));
      setNotice("Post Saved keessaa haqameera.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Saved keessaa haquu hin dandeenye.");
    } finally {
      setBusyId(null);
    }
  }

  if (session === undefined) return <section className="ops-card"><p>Saved account ilaalaa jira…</p></section>;
  if (!session) return <SupabaseAuthCard title="Saved posts ilaaluuf FUAD account seeni" onAuthenticated={() => void load()} />;

  return (
    <section className="ops-card">
      <div className="ops-dashboard-head">
        <div>
          <span className="ops-eyebrow">PRIVATE FAVORITES</span>
          <h2>Saved posts</h2>
          <p>Account kee qofaaf kuufama; user biraa hin argu.</p>
        </div>
        <div className="ops-actions compact">
          <Link className="ops-button" href="/live-listings">Marketplace ilaali</Link>
          <button className="ops-button secondary" type="button" onClick={() => void load(session)} disabled={loading}>Refresh</button>
        </div>
      </div>

      <div className="ops-stat-grid ops-stat-grid-compact">
        <div className="ops-stat"><strong>{listings.length}</strong><span>Saved posts</span></div>
        <div className="ops-stat"><strong>{listings.filter((listing) => listing.status === "active").length}</strong><span>Active</span></div>
        <div className="ops-stat"><strong>{listings.filter((listing) => listing.transaction === "broker").length}</strong><span>Broker</span></div>
      </div>

      {loading && <p>Saved posts fidaa jira…</p>}
      {notice && <p className="ops-success" role="status">{notice}</p>}
      {error && <p className="ops-alert" role="alert">{error}</p>}
      {!loading && !error && listings.length === 0 && <div className="ops-note">Saved post hin jiru. Marketplace keessatti ♡ Save tuqi.</div>}

      <div className="ops-list">
        {listings.map((listing) => (
          <article className="ops-listing" key={listing.id}>
            <div>{listing.images[0] ? <img className="ops-listing-image" src={listing.images[0]} alt={listing.title} loading="lazy" decoding="async" /> : <div className="ops-listing-placeholder">{listing.icon}</div>}</div>
            <div>
              <div className="ops-listing-title-row"><h3>{listing.title}</h3><span className={`ops-pill ${listing.status}`}>{listing.status}</span></div>
              <p className="ops-price">ETB {Number(listing.price).toLocaleString()} · {listing.priceSuffix}</p>
              <p>{listing.location} · {listing.categoryLabel}</p>
              <p>{listing.description}</p>
              <div className="ops-actions">
                <a className="ops-button" href={`tel:${listing.phone.replace(/\s/g, "")}`}>Contact seller</a>
                <button className="ops-button danger" type="button" onClick={() => void removeSaved(listing.id)} disabled={busyId === listing.id}>{busyId === listing.id ? "Haqaa jira…" : "Saved keessaa haqi"}</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
