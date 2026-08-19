"use client";

import { useEffect } from "react";

const STORAGE_KEY = "fuad-market-country-v1";
const DEFAULT_COUNTRY = "ethiopia";

function readSelectedCountry(): string {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored && stored.trim() ? stored : "all-africa";
}

function countryForNewListing(): string {
  const selected = readSelectedCountry();
  return selected === "all-africa" ? DEFAULT_COUNTRY : selected;
}

function isPublicListingsRequest(url: string): boolean {
  return url.includes("/rest/v1/listings") && url.includes("status=neq.hidden");
}

function addCountryFilter(url: string, country: string): string {
  const parsed = new URL(url, window.location.origin);
  if (!parsed.searchParams.has("market_country")) {
    parsed.searchParams.set("market_country", `eq.${country}`);
  }
  return parsed.toString();
}

function withCountryInBody(body: BodyInit | null | undefined, country: string): BodyInit | null | undefined {
  if (typeof body !== "string") return body;
  try {
    const parsed = JSON.parse(body) as Record<string, unknown> | Record<string, unknown>[];
    if (Array.isArray(parsed)) {
      return JSON.stringify(parsed.map((item) => ({ ...item, market_country: item.market_country ?? country })));
    }
    return JSON.stringify({ ...parsed, market_country: parsed.market_country ?? country });
  } catch {
    return body;
  }
}

export default function MarketCountryBridge() {
  useEffect(() => {
    const originalFetch = window.fetch.bind(window);

    const applyDocumentState = () => {
      document.body.dataset.fuadMarket = readSelectedCountry();
    };

    applyDocumentState();

    const style = document.createElement("style");
    style.dataset.fuadMarketStyle = "true";
    style.textContent = `
      body[data-fuad-market]:not([data-fuad-market="all-africa"]):not([data-fuad-market="ethiopia"])
      .listing-card:has(.sample-badge) { display: none !important; }
    `;
    document.head.appendChild(style);

    const patchedFetch: typeof window.fetch = async (input, init) => {
      const requestUrl = typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;
      const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
      const isListingsEndpoint = requestUrl.includes("/rest/v1/listings");

      let nextInput: RequestInfo | URL = input;
      let nextInit = init;

      if (method === "GET" && isPublicListingsRequest(requestUrl)) {
        const selected = readSelectedCountry();
        if (selected !== "all-africa") {
          const nextUrl = addCountryFilter(requestUrl, selected);
          nextInput = input instanceof Request ? new Request(nextUrl, input) : nextUrl;
        }
      }

      if (method === "POST" && isListingsEndpoint) {
        const selected = countryForNewListing();
        const requestBody = init?.body ?? (input instanceof Request ? await input.clone().text() : undefined);
        nextInit = {
          ...init,
          body: withCountryInBody(requestBody, selected),
        };
        if (input instanceof Request) {
          nextInput = new Request(input, nextInit);
          nextInit = undefined;
        }
      }

      return originalFetch(nextInput, nextInit);
    };

    window.fetch = patchedFetch;

    const handleMarketChange = () => {
      applyDocumentState();
      window.location.reload();
    };

    window.addEventListener("fuad:market-change", handleMarketChange);

    return () => {
      window.fetch = originalFetch;
      window.removeEventListener("fuad:market-change", handleMarketChange);
      style.remove();
      delete document.body.dataset.fuadMarket;
    };
  }, []);

  return null;
}
