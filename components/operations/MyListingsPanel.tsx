"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deleteListing,
  deleteListingImage,
  deleteListingImages,
  fetchMyListings,
  getSession,
  signOut,
  updateListing,
  type SupabaseSession,
} from "../../lib/supabase-browser";
import SupabaseAuthCard from "./SupabaseAuthCard";
import type { DatabaseListing, ListingStatus } from "./types";

type EditDraft = {
  title: string;
  price: string;
  priceSuffix: string;
  location: string;
  seller: string;
  phone: string;
  condition: string;
  description: string;
};

const emptyDraft: EditDraft = {
  title: "",
  price: "",
  priceSuffix: "total",
  location: "",
  seller: "",
  phone: "",
  condition: "Available",
  description: "",
};

export default function MyListingsPanel() {
  const [session, setSession] = useState<SupabaseSession | null | undefined>(undefined);
  const [listings, setListings] = useState<DatabaseListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditDraft>(emptyDraft);
  const [statusFilter, setStatusFilter] = useState<"all" | ListingStatus>("all");
  const [query, setQuery] = useState("");
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
      setListings(await fetchMyListings(activeSession));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Maxxansa kee fiduu hin dandeenye.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const stats = useMemo(() => ({
    total: listings.length,
    active: listings.filter((item) => item.status === "active").length,
    sold: listings.filter((item) => item.status === "sold").length,
    pending: listings.filter((item) => item.status === "pending").length,
    photos: listings.reduce((sum, item) => sum + item.images.length, 0),
  }), [listings]);

  const visibleListings = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return listings.filter((listing) => {
      if (statusFilter !== "all" && listing.status !== statusFilter) return false;
      if (!normalized) return true;
      return [listing.title, listing.description, listing.location, listing.categoryLabel, listing.transaction]
        .some((value) => value.toLowerCase().includes(normalized));
    });
  }, [listings, query, statusFilter]);

  function replaceListing(next: DatabaseListing) {
    setListings((current) => current.map((item) => item.id === next.id ? next : item));
  }

  function startEdit(listing: DatabaseListing) {
    setEditingId(listing.id);
    setDraft({
      title: listing.title,
      price: String(listing.price),
      priceSuffix: listing.priceSuffix,
      location: listing.location,
      seller: listing.seller,
      phone: listing.phone,
      condition: listing.condition,
      description: listing.description,
    });
    setError("");
    setNotice("");
  }

  async function saveEdit(listing: DatabaseListing) {
    if (!session) return;
    const price = Number(draft.price);
    if (!draft.title.trim() || !draft.location.trim() || !draft.seller.trim() || !draft.phone.trim() || !draft.description.trim()) {
      setError("Mata-duree, bakka, maqaa gurguraa, bilbila fi ibsa guuti.");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setError("Gatiin lakkoofsa sirrii ta'uu qaba.");
      return;
    }

    setBusyId(`edit:${listing.id}`);
    setError("");
    setNotice("");
    try {
      const updated = await updateListing(session, listing.id, {
        title: draft.title.trim(),
        price,
        price_suffix: draft.priceSuffix.trim() || "total",
        location: draft.location.trim(),
        seller_name: draft.seller.trim(),
        phone: draft.phone.trim(),
        condition: draft.condition.trim() || "Available",
        description: draft.description.trim(),
      });
      replaceListing(updated);
      setEditingId(null);
      setNotice("Maxxansi kee milkaa'inaan haaromfameera.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Maxxansa jijjiiruu hin dandeenye.");
    } finally {
      setBusyId(null);
    }
  }

  async function setStatus(id: string, status: "active" | "sold") {
    if (!session) return;
    setBusyId(`status:${id}`);
    setError("");
    setNotice("");
    try {
      const listing = await updateListing(session, id, { status });
      replaceListing(listing);
      setNotice(status === "sold" ? "Post sold jedhamee mallatteeffameera." : "Post active deebi'eera.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Status jijjiiruu hin dandeenye.");
    } finally {
      setBusyId(null);
    }
  }

  async function removePhoto(listing: DatabaseListing, photoUrl: string, index: number) {
    if (!session) return;
    if (listing.images.length <= 1) {
      setError("Post tokko irratti suuraan tokko yoo xiqqaate hafuu qaba. Post guutuu haquu ykn suuraa haaraa dabaluu fayyadami.");
      return;
    }
    if (!window.confirm(`Suuraa ${index + 1} post kana keessaa haquu?`)) return;

    const operationId = `photo:${listing.id}:${index}`;
    const nextImages = listing.images.filter((url) => url !== photoUrl);
    setBusyId(operationId);
    setError("");
    setNotice("");
    try {
      const updated = await updateListing(session, listing.id, { image_urls: nextImages });
      replaceListing(updated);
      try {
        await deleteListingImage(session, photoUrl);
        setNotice("Suuraan post fi Storage keessaa haqameera.");
      } catch {
        setNotice("Suuraan post irraa haqameera; Storage cleanup yeroo itti aanu irra deebi'amee ilaalama.");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Suuraa haquu hin dandeenye.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(listing: DatabaseListing) {
    if (!session || !window.confirm("Post kana guutummaatti haquu? Suuraawwan isaa illee ni haqamu.")) return;
    setBusyId(`delete:${listing.id}`);
    setError("");
    setNotice("");
    try {
      await deleteListing(session, listing.id);
      try {
        await deleteListingImages(session, listing.images);
      } catch {
        // The post remains deleted even when best-effort Storage cleanup fails.
      }
      setListings((current) => current.filter((item) => item.id !== listing.id));
      if (editingId === listing.id) setEditingId(null);
      setNotice("Post kee milkaa'inaan haqameera.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Post haquu hin dandeenye.");
    } finally {
      setBusyId(null);
    }
  }

  if (session === undefined || loading && session === undefined) return <section className="ops-card"><p>Supabase account ilaalaa jira…</p></section>;
  if (!session) return <SupabaseAuthCard title="Maxxansa kee ilaaluuf FUAD account seeni" onAuthenticated={() => void load()} />;

  return (
    <section className="ops-card">
      <div className="ops-dashboard-head">
        <div>
          <span className="ops-eyebrow">CUSTOMER CONTROL</span>
          <h2>Maxxansa kee bulchi</h2>
          <p>Account: <strong>{session.user.email}</strong></p>
        </div>
        <div className="ops-actions compact">
          <a className="ops-button" href="/post">＋ Maxxansa haaraa</a>
          <button className="ops-button secondary" type="button" onClick={() => void load(session)} disabled={loading}>Refresh</button>
          <button className="ops-button secondary" type="button" onClick={() => void signOut().then(() => { setSession(null); setListings([]); })}>Logout</button>
        </div>
      </div>

      <div className="ops-stat-grid" aria-label="Customer listing summary">
        <div className="ops-stat"><strong>{stats.total}</strong><span>Post hunda</span></div>
        <div className="ops-stat"><strong>{stats.active}</strong><span>Active</span></div>
        <div className="ops-stat"><strong>{stats.sold}</strong><span>Sold</span></div>
        <div className="ops-stat"><strong>{stats.pending}</strong><span>Pending</span></div>
        <div className="ops-stat"><strong>{stats.photos}</strong><span>Suuraawwan</span></div>
      </div>

      <div className="ops-toolbar">
        <label className="ops-field ops-search-field">
          Post barbaadi
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Mata-duree, bakka ykn gosa…" />
        </label>
        <label className="ops-field">
          Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | ListingStatus)}>
            <option value="all">Hunda</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="sold">Sold</option>
            <option value="hidden">Hidden</option>
          </select>
        </label>
      </div>

      <div className="ops-note">Owner ID Supabase Auth irraa mirkanaa'a. Edit, status, photo delete fi post delete hundi RLS ownership check keessa darbu.</div>
      {loading && <p>Supabase keessaa maxxansa kee fidaa jira…</p>}
      {notice && <p className="ops-success" role="status">{notice}</p>}
      {error && <p className="ops-alert" role="alert">{error}</p>}
      {!loading && !error && listings.length === 0 && <div className="ops-note">Account kanaan maxxansi Supabase keessatti hin jiru.</div>}
      {!loading && listings.length > 0 && visibleListings.length === 0 && <div className="ops-note">Filter kanaan post hin argamne.</div>}

      <div className="ops-list ops-dashboard-list">
        {visibleListings.map((listing) => {
          const isEditing = editingId === listing.id;
          const listingBusy = busyId?.includes(listing.id) ?? false;
          return (
            <article className="ops-listing ops-dashboard-listing" key={listing.id}>
              <div className="ops-listing-gallery">
                {listing.images.length > 0 ? listing.images.map((image, index) => {
                  const photoBusy = busyId === `photo:${listing.id}:${index}`;
                  return (
                    <figure className="ops-photo-tile" key={image}>
                      <img className="ops-listing-image" src={image} alt={`${listing.title} ${index + 1}`} loading="lazy" />
                      <button
                        type="button"
                        className="ops-photo-delete"
                        onClick={() => void removePhoto(listing, image, index)}
                        disabled={listingBusy}
                        aria-label={`Suuraa ${index + 1} haqi`}
                      >{photoBusy ? "…" : "×"}</button>
                    </figure>
                  );
                }) : <div className="ops-listing-placeholder">{listing.icon}</div>}
              </div>

              <div>
                {!isEditing ? (
                  <>
                    <div className="ops-listing-title-row">
                      <h3>{listing.title}</h3>
                      <span className={`ops-pill ${listing.status}`}>{listing.status}</span>
                    </div>
                    <p className="ops-price">ETB {Number(listing.price).toLocaleString()} · {listing.priceSuffix}</p>
                    <p>{listing.location} · {listing.phone}</p>
                    <p>{listing.description}</p>
                    <div className="ops-meta">
                      <span className="ops-pill">{listing.id.slice(0, 8)}</span>
                      <span className="ops-pill">{listing.transaction}</span>
                      <span className="ops-pill">{listing.images.length} photo</span>
                    </div>
                  </>
                ) : (
                  <div className="ops-edit-panel">
                    <h3>Post sirreessi</h3>
                    <div className="ops-grid">
                      <label className="ops-field">Mata-duree<input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} /></label>
                      <label className="ops-field">Gatii<input type="number" min="0" inputMode="decimal" value={draft.price} onChange={(event) => setDraft((current) => ({ ...current, price: event.target.value }))} /></label>
                      <label className="ops-field">Gatii suffix<input value={draft.priceSuffix} onChange={(event) => setDraft((current) => ({ ...current, priceSuffix: event.target.value }))} /></label>
                      <label className="ops-field">Bakka<input value={draft.location} onChange={(event) => setDraft((current) => ({ ...current, location: event.target.value }))} /></label>
                      <label className="ops-field">Maqaa gurguraa<input value={draft.seller} onChange={(event) => setDraft((current) => ({ ...current, seller: event.target.value }))} /></label>
                      <label className="ops-field">Bilbila<input inputMode="tel" value={draft.phone} onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))} /></label>
                      <label className="ops-field ops-span-2">Haala<input value={draft.condition} onChange={(event) => setDraft((current) => ({ ...current, condition: event.target.value }))} /></label>
                      <label className="ops-field ops-span-2">Ibsa<textarea rows={4} value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} /></label>
                    </div>
                  </div>
                )}

                <div className="ops-actions">
                  {!isEditing ? (
                    <button className="ops-button secondary" type="button" onClick={() => startEdit(listing)} disabled={listingBusy}>Post sirreessi</button>
                  ) : (
                    <>
                      <button className="ops-button" type="button" onClick={() => void saveEdit(listing)} disabled={listingBusy}>{busyId === `edit:${listing.id}` ? "Save godhaa jira…" : "Save godhi"}</button>
                      <button className="ops-button secondary" type="button" onClick={() => setEditingId(null)} disabled={listingBusy}>Dhiisi</button>
                    </>
                  )}
                  {listing.status !== "sold" && <button className="ops-button warning" type="button" onClick={() => void setStatus(listing.id, "sold")} disabled={listingBusy}>Sold godhi</button>}
                  {listing.status !== "active" && listing.status !== "hidden" && <button className="ops-button" type="button" onClick={() => void setStatus(listing.id, "active")} disabled={listingBusy}>Active deebisi</button>}
                  <button className="ops-button danger" type="button" onClick={() => void remove(listing)} disabled={listingBusy} aria-busy={busyId === `delete:${listing.id}`}>
                    {busyId === `delete:${listing.id}` ? "Haqaa jira…" : "Post haqi"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
