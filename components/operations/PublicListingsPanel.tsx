"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchPublicListings } from "../../lib/supabase-browser";
import type { DatabaseListing } from "./types";

export default function PublicListingsPanel() {
  const [listings, setListings] = useState<DatabaseListing[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setListings(await fetchPublicListings());
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

  return (
    <section className="ops-card">
      <div className="ops-note">Maxxansi kun Supabase database irraa kallattiin dhufa; Chrome, Firefox, Safari, mobile fi computer irratti data tokko mul'ata.</div>
      <div className="ops-grid" style={{ marginTop: 18, marginBottom: 18 }}>
        <label className="ops-field ops-span-2">Marketplace search
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Meeshaa, category, seller ykn location barbaadi…" />
        </label>
      </div>
      <div className="ops-actions"><button className="ops-button secondary" type="button" onClick={() => void load()} disabled={loading}>Refresh Supabase</button></div>
      {loading && <p>Supabase keessaa maxxansa fidaa jira…</p>}
      {error && <p className="ops-alert" role="alert">{error}</p>}
      <div className="ops-list">
        {visible.map((listing) => (
          <article className="ops-listing" key={listing.id}>
            <div>{listing.images[0] ? <img className="ops-listing-image" src={listing.images[0]} alt={listing.title} /> : <div className="ops-listing-placeholder">{listing.icon}</div>}</div>
            <div>
              <h3>{listing.title}</h3>
              <p><strong>ETB {Number(listing.price).toLocaleString()}</strong>{listing.priceSuffix !== "total" ? ` / ${listing.priceSuffix}` : ""} · {listing.location}</p>
              <p>{listing.description}</p>
              <p><strong>{listing.seller}</strong> · {listing.categoryLabel}</p>
              <div className="ops-meta"><span className={`ops-pill ${listing.status}`}>{listing.status}</span><span className="ops-pill">{listing.transaction}</span>{listing.images.length > 1 && <span className="ops-pill">{listing.images.length} photos</span>}</div>
              <div className="ops-actions"><a className="ops-button" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }} href={`tel:${listing.phone.replace(/\s/g, "")}`}>Contact seller</a></div>
            </div>
          </article>
        ))}
      </div>
      {!loading && !error && visible.length === 0 && <div className="ops-note">Maxxansi wal-simu hin argamne.</div>}
    </section>
  );
}
