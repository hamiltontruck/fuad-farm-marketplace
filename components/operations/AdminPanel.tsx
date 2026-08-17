"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { DatabaseListing } from "./types";

type Feed = { listings?: DatabaseListing[]; error?: string };
type Status = "active" | "sold" | "hidden";

export default function AdminPanel() {
  const [listings, setListings] = useState<DatabaseListing[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/listings", { headers: { Accept: "application/json" } });
      const payload = (await response.json()) as Feed;
      if (!response.ok) throw new Error(payload.error ?? "Admin listings load failed.");
      setListings(payload.listings ?? []);
    } catch (caught) {
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

  async function changeStatus(id: number, status: Status) {
    setBusyId(id);
    setError("");
    try {
      const response = await fetch(`/api/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const payload = (await response.json()) as { listing?: DatabaseListing; error?: string };
      if (!response.ok || !payload.listing) throw new Error(payload.error ?? "Moderation update failed.");
      setListings((current) => current.map((item) => item.id === id ? payload.listing as DatabaseListing : item));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Moderation update failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: number) {
    if (!window.confirm("Admin delete: maxxansa fi suuraa isaa guutummaatti haquu?")) return;
    setBusyId(id);
    setError("");
    try {
      const response = await fetch(`/api/listings/${id}`, { method: "DELETE" });
      const payload = (await response.json()) as { deleted?: boolean; error?: string };
      if (!response.ok || !payload.deleted) throw new Error(payload.error ?? "Admin delete failed.");
      setListings((current) => current.filter((item) => item.id !== id));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Admin delete failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="ops-card">
      <div className="ops-note">Admin qofa: maxxansa Active, Sold, Hidden godhuu fi guutummaatti delete gochuu dandeessa. Authorization server irratti email secretiin mirkanaa'a.</div>
      <div className="ops-grid" style={{ marginTop: 18 }}>
        <label className="ops-field">Search
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Title, seller, phone, location..." />
        </label>
        <label className="ops-field">Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">Hunda</option><option value="active">Active</option><option value="sold">Sold</option><option value="hidden">Hidden</option></select>
        </label>
      </div>
      <div className="ops-actions"><button className="ops-button secondary" type="button" onClick={() => void load()} disabled={loading}>Refresh database</button><span className="ops-pill">{visible.length} shown / {listings.length} total</span></div>
      {loading && <p>Admin database fidaa jira…</p>}
      {error && <p className="ops-alert" role="alert">{error}</p>}
      <div className="ops-list">
        {visible.map((listing) => (
          <article className="ops-listing" key={listing.id}>
            <div>{listing.images[0] ? <img className="ops-listing-image" src={listing.images[0]} alt={listing.title} /> : <div className="ops-listing-placeholder">{listing.icon}</div>}</div>
            <div>
              <h3>{listing.title}</h3>
              <p><strong>{listing.seller}</strong> · {listing.phone} · {listing.location}</p>
              <p>ETB {Number(listing.price).toLocaleString()} · {listing.description}</p>
              <div className="ops-meta"><span className={`ops-pill ${listing.status}`}>{listing.status}</span><span className="ops-pill">#{listing.id}</span><span className="ops-pill">{listing.transaction}</span>{listing.ownerEmail && <span className="ops-pill">owner linked</span>}</div>
              <div className="ops-actions">
                <button className="ops-button" type="button" onClick={() => void changeStatus(listing.id, "active")} disabled={busyId === listing.id || listing.status === "active"}>Active</button>
                <button className="ops-button warning" type="button" onClick={() => void changeStatus(listing.id, "sold")} disabled={busyId === listing.id || listing.status === "sold"}>Sold</button>
                <button className="ops-button secondary" type="button" onClick={() => void changeStatus(listing.id, "hidden")} disabled={busyId === listing.id || listing.status === "hidden"}>Hide</button>
                <button className="ops-button danger" type="button" onClick={() => void remove(listing.id)} disabled={busyId === listing.id}>Delete</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
