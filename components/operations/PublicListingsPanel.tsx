"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deleteListing,
  deleteListingImages,
  fetchPublicListings,
  getSession,
  type SupabaseSession,
} from "../../lib/supabase-browser";
import type { DatabaseListing } from "./types";

export default function PublicListingsPanel() {
  const [listings, setListings] = useState<DatabaseListing[]>([]);
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const [nextListings, activeSession] = await Promise.all([
        fetchPublicListings(),
        getSession(),
      ]);
      setListings(nextListings);
      setSession(activeSession);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Listings load failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return listings.filter((listing) => {
      const haystack = `${listing.title} ${listing.categoryLabel} ${listing.location} ${listing.seller}`.toLowerCase();
      return !needle || haystack.includes(needle);
    });
  }, [listings, query]);

  async function removePost(listing: DatabaseListing) {
    if (!session || session.user.id !== listing.ownerId) {
      setError("Post kana haquuf account abbaa post sanaatiin seenuu qabda.");
      return;
    }
    if (!window.confirm("Post kana guutummaatti haquu? Suuraawwan isaa illee ni haqamu.")) return;

    setBusyId(listing.id);
    setError("");
    setNotice("");
    try {
      await deleteListing(session, listing.id);
      try {
        await deleteListingImages(session, listing.images);
      } catch {
        // The database row is already deleted. A storage cleanup failure must not restore the post.
      }
      setListings((current) => current.filter((item) => item.id !== listing.id));
      setNotice("Post kee milkaa'inaan haqameera.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Post haquu hin dandeenye.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="ops-card">
      <div className="ops-note">Maxxansi kun Supabase database irraa kallattiin dhufa; Chrome, Firefox, Safari, mobile fi computer irratti data tokko mul'ata.</div>
      <div className="ops-grid" style={{ marginTop: 18, marginBottom: 18 }}>
        <label className="ops-field ops-span-2">Marketplace search
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Meeshaa, category, seller ykn location barbaadi…" />
        </label>
      </div>
      <div className="ops-actions">
        <button className="ops-button secondary" type="button" onClick={() => void load()} disabled={loading}>Refresh Supabase</button>
        <a className="ops-button secondary" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }} href="/my-listings">Maxxansa koo bulchi</a>
      </div>
      {loading && <p>Supabase keessaa maxxansa fidaa jira…</p>}
      {notice && <p className="ops-note" role="status">{notice}</p>}
      {error && <p className="ops-alert" role="alert">{error}</p>}
      <div className="ops-list">
        {visible.map((listing) => {
          const isOwner = session?.user.id === listing.ownerId;
          return (
            <article className="ops-listing" key={listing.id}>
              <div>{listing.images[0] ? <img className="ops-listing-image" src={listing.images[0]} alt={listing.title} /> : <div className="ops-listing-placeholder">{listing.icon}</div>}</div>
              <div>
                <h3>{listing.title}</h3>
                <p><strong>ETB {Number(listing.price).toLocaleString()}</strong>{listing.priceSuffix !== "total" ? ` / ${listing.priceSuffix}` : ""} · {listing.location}</p>
                <p>{listing.description}</p>
                <p><strong>{listing.seller}</strong> · {listing.categoryLabel}</p>
                <div className="ops-meta"><span className={`ops-pill ${listing.status}`}>{listing.status}</span><span className="ops-pill">{listing.transaction}</span>{listing.images.length > 1 && <span className="ops-pill">{listing.images.length} photos</span>}{isOwner && <span className="ops-pill">Post kee</span>}</div>
                <div className="ops-actions">
                  <a className="ops-button" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }} href={`tel:${listing.phone.replace(/\s/g, "")}`}>Contact seller</a>
                  {isOwner && (
                    <button
                      className="ops-button danger"
                      type="button"
                      onClick={() => void removePost(listing)}
                      disabled={busyId === listing.id}
                      aria-busy={busyId === listing.id}
                    >
                      {busyId === listing.id ? "Haqaa jira…" : "Post haqi"}
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {!loading && !error && visible.length === 0 && <div className="ops-note">Maxxansi wal-simu hin argamne.</div>}
    </section>
  );
}
