"use client";

import { useEffect } from "react";
import { fetchPublicListings } from "../../lib/supabase-browser";
import type { Listing, TransactionType } from "./PostAdFlow";

const LOCAL_LISTINGS_KEY = "fuad-marketplace-listings-v1";
const INITIAL_RELOAD_KEY = "fuad-marketplace-supabase-sync-reloaded-v1";

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

export default function ListingSync() {
  useEffect(() => {
    let active = true;

    async function loadSupabaseListings() {
      try {
        const rows = await fetchPublicListings();
        if (!active) return false;

        const remote: Listing[] = rows
          .filter((row) => row.transaction === "sell" || row.transaction === "buy" || row.transaction === "broker")
          .map((row) => ({
            id: row.id,
            title: row.title,
            category: row.category,
            categoryLabel: row.categoryLabel,
            transaction: row.transaction as TransactionType,
            price: row.price,
            priceSuffix: row.priceSuffix,
            location: row.location,
            seller: row.seller,
            phone: row.phone,
            role: row.role,
            condition: row.condition,
            description: row.description,
            icon: row.icon,
            accent: row.accent,
            time: row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "Recent",
            verified: row.verified,
            sample: false,
          }));

        // Keep old unsent local drafts visible on their original device, while all
        // successfully published Supabase listings are shared across browsers.
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

    async function syncAndRefresh() {
      const changed = await loadSupabaseListings();
      if (!active || !changed) {
        window.sessionStorage.removeItem(INITIAL_RELOAD_KEY);
        return;
      }
      if (window.sessionStorage.getItem(INITIAL_RELOAD_KEY) !== "done") {
        window.sessionStorage.setItem(INITIAL_RELOAD_KEY, "done");
        window.location.reload();
      }
    }

    void syncAndRefresh();
    const timer = window.setInterval(() => void syncAndRefresh(), 15000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return null;
}
