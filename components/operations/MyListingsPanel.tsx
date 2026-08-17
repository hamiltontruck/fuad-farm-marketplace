"use client";

import { useCallback, useEffect, useState } from "react";
import type { DatabaseListing } from "./types";

type Feed = { listings?: DatabaseListing[]; error?: string };

export default function MyListingsPanel() {
  const [listings, setListings] = useState<DatabaseListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/my-listings", { headers: { Accept: "application/json" } });
      const payload = (await response.json()) as Feed;
      if (!response.ok) throw new Error(payload.error ?? "Maxxansa kee fiduu hin dandeenye.");
      setListings(payload.listings ?? []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Maxxansa kee fiduu hin dandeenye.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function setStatus(id: number, status: "active" | "sold") {
    setBusyId(id);
    setError("");
    try {
      const response = await fetch(`/api/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const payload = (await response.json()) as { listing?: DatabaseListing; error?: string };
      if (!response.ok || !payload.listing) throw new Error(payload.error ?? "Status jijjiiruu hin dandeenye.");
      setListings((current) => current.map((item) => item.id === id ? payload.listing as DatabaseListing : item));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Status jijjiiruu hin dandeenye.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: number) {
    if (!window.confirm("Maxxansa kana guutummaatti haquu?")) return;
    setBusyId(id);
    setError("");
    try {
      const response = await fetch(`/api/listings/${id}`, { method: "DELETE" });
      const payload = (await response.json()) as { deleted?: boolean; error?: string };
      if (!response.ok || !payload.deleted) throw new Error(payload.error ?? "Maxxansa haquu hin dandeenye.");
      setListings((current) => current.filter((item) => item.id !== id));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Maxxansa haquu hin dandeenye.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="ops-card">
      <div className="ops-actions" style={{ marginTop: 0, marginBottom: 18 }}>
        <a className="ops-button" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }} href="/post">＋ Maxxansa haaraa</a>
        <button className="ops-button secondary" type="button" onClick={() => void load()} disabled={loading}>Refresh</button>
      </div>
      {loading && <p>Database keessaa maxxansa kee fidaa jira…</p>}
      {error && <p className="ops-alert" role="alert">{error}</p>}
      {!loading && !error && listings.length === 0 && <div className="ops-note">Account kanaan maxxansi database keessatti hin jiru.</div>}
      <div className="ops-list">
        {listings.map((listing) => (
          <article className="ops-listing" key={listing.id}>
            <div>{listing.images[0] ? <img className="ops-listing-image" src={listing.images[0]} alt={listing.title} /> : <div className="ops-listing-placeholder">{listing.icon}</div>}</div>
            <div>
              <h3>{listing.title}</h3>
              <p>ETB {Number(listing.price).toLocaleString()} · {listing.location}</p>
              <p>{listing.description}</p>
              <div className="ops-meta"><span className={`ops-pill ${listing.status}`}>{listing.status}</span><span className="ops-pill">#{listing.id}</span><span className="ops-pill">{listing.transaction}</span></div>
              <div className="ops-actions">
                {listing.status !== "sold" && <button className="ops-button warning" type="button" onClick={() => void setStatus(listing.id, "sold")} disabled={busyId === listing.id}>Sold godhi</button>}
                {listing.status !== "active" && <button className="ops-button" type="button" onClick={() => void setStatus(listing.id, "active")} disabled={busyId === listing.id}>Active deebisi</button>}
                <button className="ops-button danger" type="button" onClick={() => void remove(listing.id)} disabled={busyId === listing.id}>Delete</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
