"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./CountryMarkets.module.css";

type Language = "om" | "en" | "am";

type Market = {
  id: string;
  name: string;
  flag: string;
};

const STORAGE_KEY = "fuad-market-country-v1";
const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://gdckzjtneidkngfjfjlx.supabase.co").replace(/\/$/, "");
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_jw5M6GAGQCFawBYabP8SIw_aawQM49_";

const fallbackMarkets: Market[] = [
  { id: "all-africa", name: "All Africa", flag: "🌍" },
  { id: "egypt", name: "Egypt", flag: "🇪🇬" },
  { id: "morocco", name: "Morocco", flag: "🇲🇦" },
  { id: "sudan", name: "Sudan", flag: "🇸🇩" },
  { id: "south-sudan", name: "South Sudan", flag: "🇸🇸" },
  { id: "ethiopia", name: "Ethiopia", flag: "🇪🇹" },
  { id: "kenya", name: "Kenya", flag: "🇰🇪" },
  { id: "tanzania", name: "Tanzania", flag: "🇹🇿" },
  { id: "uganda", name: "Uganda", flag: "🇺🇬" },
  { id: "rwanda", name: "Rwanda", flag: "🇷🇼" },
  { id: "burundi", name: "Burundi", flag: "🇧🇮" },
  { id: "dr-congo", name: "DR Congo", flag: "🇨🇩" },
  { id: "angola", name: "Angola", flag: "🇦🇴" },
  { id: "malawi", name: "Malawi", flag: "🇲🇼" },
  { id: "zambia", name: "Zambia", flag: "🇿🇲" },
  { id: "zimbabwe", name: "Zimbabwe", flag: "🇿🇼" },
  { id: "botswana", name: "Botswana", flag: "🇧🇼" },
  { id: "namibia", name: "Namibia", flag: "🇳🇦" },
  { id: "eswatini", name: "Eswatini", flag: "🇸🇿" },
  { id: "south-africa", name: "South Africa", flag: "🇿🇦" },
  { id: "nigeria", name: "Nigeria", flag: "🇳🇬" },
  { id: "ghana", name: "Ghana", flag: "🇬🇭" },
  { id: "cote-divoire", name: "Côte d’Ivoire", flag: "🇨🇮" },
  { id: "senegal", name: "Senegal", flag: "🇸🇳" },
];

const copy: Record<Language, { title: string; intro: string; allAfrica: string }> = {
  om: {
    title: "BIYYA FILADHU",
    intro: "Gabaa Afrikaa hunda ykn biyya tokko fili.",
    allAfrica: "Afrikaa hunda",
  },
  en: {
    title: "BROWSE BY MARKET",
    intro: "Browse all African markets or choose one country.",
    allAfrica: "All Africa",
  },
  am: {
    title: "በገበያ ይፈልጉ",
    intro: "መላ አፍሪካን ወይም አንድ ሀገር ይምረጡ።",
    allAfrica: "መላ አፍሪካ",
  },
};

function currentLanguage(): Language {
  const value = document.documentElement.lang;
  return value === "en" || value === "am" ? value : "om";
}

async function fetchMarkets(signal: AbortSignal): Promise<Market[]> {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/markets?select=id,name,flag&is_active=eq.true&order=sort_order.asc`,
    {
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      },
      cache: "no-store",
      signal,
    },
  );

  if (!response.ok) throw new Error(`Markets request failed (${response.status}).`);
  const rows = await response.json() as Market[];
  return rows.filter((market) => market.id && market.name && market.flag);
}

export default function CountryMarkets() {
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [language, setLanguage] = useState<Language>("om");
  const [selected, setSelected] = useState("all-africa");
  const [markets, setMarkets] = useState<Market[]>(fallbackMarkets);

  useEffect(() => {
    const footer = document.querySelector<HTMLElement>(".market-footer");
    if (!footer) return;

    const portalHost = document.createElement("div");
    portalHost.className = styles.host;
    portalHost.setAttribute("data-country-market-host", "true");
    const copyright = footer.querySelector(":scope > small");
    footer.insertBefore(portalHost, copyright);
    setHost(portalHost);

    setLanguage(currentLanguage());
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && fallbackMarkets.some((market) => market.id === stored)) setSelected(stored);

    const controller = new AbortController();
    void fetchMarkets(controller.signal)
      .then((rows) => {
        if (!rows.length) return;
        setMarkets(rows);
        const current = window.localStorage.getItem(STORAGE_KEY) ?? "all-africa";
        if (!rows.some((market) => market.id === current)) {
          window.localStorage.setItem(STORAGE_KEY, "all-africa");
          setSelected("all-africa");
        }
      })
      .catch(() => {
        // Keep the built-in list available when the network is temporarily unavailable.
      });

    const observer = new MutationObserver(() => setLanguage(currentLanguage()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

    return () => {
      controller.abort();
      observer.disconnect();
      portalHost.remove();
    };
  }, []);

  function chooseMarket(market: Market) {
    setSelected(market.id);
    window.localStorage.setItem(STORAGE_KEY, market.id);
    window.dispatchEvent(new CustomEvent("fuad:market-change", { detail: market }));
  }

  if (!host) return null;
  const t = copy[language];

  return createPortal(
    <section className={styles.section} aria-labelledby="country-markets-title">
      <div className={styles.heading}>
        <h2 id="country-markets-title">{t.title}</h2>
        <p>{t.intro}</p>
      </div>
      <div className={styles.grid} role="group" aria-label={t.title}>
        {markets.map((market) => {
          const isActive = selected === market.id;
          const label = market.id === "all-africa" ? t.allAfrica : market.name;
          return (
            <button
              className={`${styles.chip} ${isActive ? styles.active : ""}`}
              key={market.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => chooseMarket(market)}
            >
              <span aria-hidden="true">{market.flag}</span>
              <strong>{label}</strong>
            </button>
          );
        })}
      </div>
    </section>,
    host,
  );
}
