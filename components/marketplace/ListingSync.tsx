"use client";

import { useEffect } from "react";
import type { Listing, TransactionType } from "./PostAdFlow";

const LOCAL_LISTINGS_KEY = "fuad-marketplace-listings-v1";
const INITIAL_RELOAD_KEY = "fuad-marketplace-remote-sync-reloaded-v1";

type RemoteListing = Omit<Listing, "id" | "time" | "transaction"> & {
  id: number | string;
  transaction: string;
  createdAt?: string;
};

function readLocalListings(): Listing[] {
  try {
    const value = JSON.parse(window.localStorage.getItem(LOCAL_LISTINGS_KEY) ?? "[]") as unknown;
    return Array.isArray(value) ? (value as Listing[]) : [];
  } catch {
    return [];
  }
}

function writeLocalListings(listings: Listing[]) {
  window.localStorage.setItem(LOCAL_LISTINGS_KEY, JSON.stringify(listings));
}

function normalizeRemoteListing(row: RemoteListing): Listing | null {
  if (row.transaction !== "sell" && row.transaction !== "buy" && row.transaction !== "broker") return null;
  const createdAt = row.createdAt ? new Date(`${row.createdAt.replace(" ", "T")}Z`) : null;
  const time = createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt.toLocaleDateString() : "Recent";

  return {
    ...row,
    id: String(row.id),
    transaction: row.transaction as TransactionType,
    time,
    phone: row.phone ?? "",
    verified: Boolean(row.verified),
    sample: false,
  };
}

export default function ListingSync() {
  useEffect(() => {
    let active = true;
    const inFlight = new Set<string>();

    async function uploadPendingListings() {
      const current = readLocalListings();
      const pending = current.filter((listing) => listing.id.startsWith("local-") && !inFlight.has(listing.id));
      if (!pending.length) return;

      for (const listing of pending) {
        inFlight.add(listing.id);
        try {
          const response = await fetch("/api/listings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(listing),
          });
          const payload = (await response.json()) as { listing?: RemoteListing };
          if (!response.ok || !payload.listing || !active) continue;

          const saved = normalizeRemoteListing(payload.listing);
          if (!saved) continue;

          const latest = readLocalListings();
          writeLocalListings(latest.map((item) => (item.id === listing.id ? { ...saved, time: item.time } : item)));
        } catch {
          // Keep the local listing and retry later when the connection is available.
        } finally {
          inFlight.delete(listing.id);
        }
      }
    }

    async function loadRemoteListings() {
      try {
        const response = await fetch("/api/listings", { headers: { Accept: "application/json" } });
        if (!response.ok) return false;
        const payload = (await response.json()) as { listings?: RemoteListing[] };
        if (!Array.isArray(payload.listings) || !active) return false;

        const remote = payload.listings.map(normalizeRemoteListing).filter((listing): listing is Listing => Boolean(listing));
        const localPending = readLocalListings().filter((listing) => listing.id.startsWith("local-"));
        const merged = [...localPending, ...remote];
        const before = JSON.stringify(readLocalListings());
        const after = JSON.stringify(merged);
        if (before === after) return false;

        writeLocalListings(merged);
        return true;
      } catch {
        return false;
      }
    }

    async function initialSync() {
      await uploadPendingListings();
      const changed = await loadRemoteListings();
      if (!active) return;

      if (changed && window.sessionStorage.getItem(INITIAL_RELOAD_KEY) !== "done") {
        window.sessionStorage.setItem(INITIAL_RELOAD_KEY, "done");
        window.location.reload();
        return;
      }
      window.sessionStorage.removeItem(INITIAL_RELOAD_KEY);
    }

    void initialSync();
    const timer = window.setInterval(() => void uploadPendingListings(), 1500);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return null;
}
