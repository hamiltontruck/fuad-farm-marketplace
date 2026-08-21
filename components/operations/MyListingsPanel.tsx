"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteListing,
  deleteListingImages,
  fetchMyListings,
  getSession,
  signOut,
  updateListing,
  type SupabaseSession,
} from "../../lib/supabase-browser";
import SupabaseAuthCard from "./SupabaseAuthCard";
import type { DatabaseListing } from "./types";

export default function MyListingsPanel() {
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
      setListings(await fetchMyListings(activeSession));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Maxxansa kee fiduu hin dandeenye.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function setStatus(id: string, status: "active" | "sold") {
    if (!session) return;
    setBusyId(id);
    setError("");
    setNotice("");
    try {
      const listing = await updateListing(session, id, { status });
      setListings((current) => current.map((item) => item.id === id ? listing : item));
      setNotice(status === "sold" ? "Post sold jedhamee mallatteeffameera." : "Post active deebi'eera.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Status jijjiiruu hin dandeenye.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(listing: DatabaseListing) {
    if (!session || !window.confirm("Post kana guutummaatti haquu? Suuraawwan isaa illee ni haqamu.")) return;
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

  if (session === undefined || loading && session === undefined) return <section className="ops-card"><p>Supabase account ilaalaa jira…</p></section>;
  if (!session) return <SupabaseAuthCard title="Maxxansa kee ilaaluuf FUAD account seeni" onAuthenticated={() => void load()} />;

  return (
    <section className="ops-card">
      <div className="ops-note">Account: <strong>{session.user.email}</strong>. Owner ID Supabase Auth irraa mirkanaa'a; maxxansa nama biraa jijjiiruu hin dandeessu.</div>
      <div className="ops-actions" style={{ marginTop: 18, marginBottom: 18 }}>
        <a className="ops-button" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }} href="/post">＋ Maxxansa haaraa</a>
        <button className="ops-button secondary" type="button" onClick={() => void load(session)} disabled={loading}>Refresh</button>
        <button className="ops-button secondary" type="button" onClick={() => void signOut().then(() => { setSession(null); setListings([]); })}>Logout</button>
      </div>
      {loading && <p>Supabase keessaa maxxansa kee fidaa jira…</p>}
      {notice && <p className="ops-note" role="status">{notice}</p>}
      {error && <p className="ops-alert" role="alert">{error}</p>}
      {!loading && !error && listings.length === 0 && <div className="ops-note">Account kanaan maxxansi Supabase keessatti hin jiru.</div>}
      <div className="ops-list">
        {listings.map((listing) => (
          <article className="ops-listing" key={listing.id}>
            <div>{listing.images[0] ? <img className="ops-listing-image" src={listing.images[0]} alt={listing.title} /> : <div className="ops-listing-placeholder">{listing.icon}</div>}</div>
            <div>
              <h3>{listing.title}</h3>
              <p>ETB {Number(listing.price).toLocaleString()} · {listing.location}</p>
              <p>{listing.description}</p>
              <div className="ops-meta"><span className={`ops-pill ${listing.status}`}>{listing.status}</span><span className="ops-pill">{listing.id.slice(0, 8)}</span><span className="ops-pill">{listing.transaction}</span></div>
              <div className="ops-actions">
                {listing.status !== "sold" && <button className="ops-button warning" type="button" onClick={() => void setStatus(listing.id, "sold")} disabled={busyId === listing.id}>Sold godhi</button>}
                {listing.status !== "active" && listing.status !== "hidden" && <button className="ops-button" type="button" onClick={() => void setStatus(listing.id, "active")} disabled={busyId === listing.id}>Active deebisi</button>}
                <button
                  className="ops-button danger"
                  type="button"
                  onClick={() => void remove(listing)}
                  disabled={busyId === listing.id}
                  aria-busy={busyId === listing.id}
                >
                  {busyId === listing.id ? "Haqaa jira…" : "Post haqi"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
