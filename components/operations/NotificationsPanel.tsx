"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deleteNotification,
  fetchNotifications,
  getSession,
  markAllNotificationsRead,
  markNotificationRead,
  type MarketplaceNotification,
  type SupabaseSession,
} from "../../lib/supabase-browser";
import SupabaseAuthCard from "./SupabaseAuthCard";

export default function NotificationsPanel() {
  const [session, setSession] = useState<SupabaseSession | null | undefined>(undefined);
  const [notifications, setNotifications] = useState<MarketplaceNotification[]>([]);
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
        setNotifications([]);
        return;
      }
      setNotifications(await fetchNotifications(activeSession));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Notifications load failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const unread = useMemo(() => notifications.filter((item) => !item.read_at).length, [notifications]);

  async function readOne(item: MarketplaceNotification) {
    if (!session || item.read_at) return;
    setBusyId(item.id);
    setError("");
    try {
      await markNotificationRead(session, item.id);
      const readAt = new Date().toISOString();
      setNotifications((current) => current.map((notification) => notification.id === item.id ? { ...notification, read_at: readAt } : notification));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Notification read update failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function readAll() {
    if (!session || unread === 0) return;
    setBusyId("all");
    setError("");
    setNotice("");
    try {
      await markAllNotificationsRead(session);
      const readAt = new Date().toISOString();
      setNotifications((current) => current.map((notification) => notification.read_at ? notification : { ...notification, read_at: readAt }));
      setNotice("Notifications hundi read ta'aniiru.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Notifications update failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(item: MarketplaceNotification) {
    if (!session) return;
    setBusyId(item.id);
    setError("");
    try {
      await deleteNotification(session, item.id);
      setNotifications((current) => current.filter((notification) => notification.id !== item.id));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Notification delete failed.");
    } finally {
      setBusyId(null);
    }
  }

  if (session === undefined) return <section className="ops-card"><p>Notifications account ilaalaa jira…</p></section>;
  if (!session) return <SupabaseAuthCard title="Notifications ilaaluuf FUAD account seeni" onAuthenticated={() => void load()} />;

  return (
    <section className="ops-card">
      <div className="ops-dashboard-head">
        <div>
          <span className="ops-eyebrow">ACCOUNT ALERTS</span>
          <h2>Notifications</h2>
          <p>Post moderation jijjiirama fi admin action account kee irratti ilaali.</p>
        </div>
        <div className="ops-actions compact">
          <button className="ops-button" type="button" onClick={() => void readAll()} disabled={busyId === "all" || unread === 0}>{busyId === "all" ? "Updating…" : `Mark all read (${unread})`}</button>
          <button className="ops-button secondary" type="button" onClick={() => void load(session)} disabled={loading}>Refresh</button>
          <Link className="ops-button secondary" href="/customer-dashboard">Dashboard</Link>
        </div>
      </div>

      <div className="ops-stat-grid ops-stat-grid-compact">
        <div className="ops-stat"><strong>{notifications.length}</strong><span>Total</span></div>
        <div className="ops-stat"><strong>{unread}</strong><span>Unread</span></div>
        <div className="ops-stat"><strong>{notifications.length - unread}</strong><span>Read</span></div>
      </div>

      {loading && <p>Notifications fidaa jira…</p>}
      {notice && <p className="ops-success" role="status">{notice}</p>}
      {error && <p className="ops-alert" role="alert">{error}</p>}
      {!loading && !error && notifications.length === 0 && <div className="ops-note">Notification hin jiru.</div>}

      <div className="ops-notification-list">
        {notifications.map((item) => (
          <article className={`ops-notification${item.read_at ? "" : " unread"}`} key={item.id}>
            <div className="ops-notification-icon" aria-hidden="true">{item.type === "moderation_delete" ? "🗑️" : "🔔"}</div>
            <div className="ops-notification-copy">
              <div className="ops-listing-title-row"><h3>{item.title}</h3>{!item.read_at && <span className="ops-pill pending">New</span>}</div>
              <p>{item.body}</p>
              <small>{new Date(item.created_at).toLocaleString()}</small>
              <div className="ops-actions">
                {!item.read_at && <button className="ops-button secondary" type="button" onClick={() => void readOne(item)} disabled={busyId === item.id}>Mark read</button>}
                {item.listing_id && <Link className="ops-button secondary" href="/live-listings">Open marketplace</Link>}
                <button className="ops-button danger" type="button" onClick={() => void remove(item)} disabled={busyId === item.id}>Delete</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
