"use client";

import { useEffect, useMemo, useState } from "react";
import MultiRoleRegister from "../components/registration/MultiRoleRegister";
import type { RoleId } from "../components/registration/RoleSelector";
import PostAdFlow, { listingCategories, type Listing, type TransactionType } from "../components/marketplace/PostAdFlow";

const demoListings: Listing[] = [
  { id: "demo-1", title: "High-grade gold ore supply", category: "mineral", categoryLabel: "Mineral", transaction: "broker", price: 1850, priceSuffix: "gram", location: "Adola", seller: "Dawa Mineral Link", role: "Mineral Broker", condition: "Available", description: "Verified small-scale mining supply. Assay and quantity documents available for serious buyers.", icon: "🪨", accent: "violet", time: "18 min ago", verified: true, sample: true },
  { id: "demo-2", title: "Dell Latitude Core i7 laptop", category: "electronics", categoryLabel: "Electronics", transaction: "sell", price: 48000, priceSuffix: "total", location: "Addis Ababa", seller: "Nile Tech Store", role: "Electronics Seller", condition: "Used", description: "16GB RAM, 512GB SSD, clean condition with original charger and 30-day shop warranty.", icon: "💻", accent: "blue", time: "32 min ago", verified: true, sample: true },
  { id: "demo-3", title: "Premium white teff — 8 tons", category: "farm", categoryLabel: "Farm Products", transaction: "sell", price: 118, priceSuffix: "kg", location: "Bishoftu", seller: "Biftu Farmers Union", role: "Farmer Cooperative", condition: "Fresh", description: "New season white teff, cleaned and bagged. Transport can be arranged for bulk buyers.", icon: "🌾", accent: "green", time: "1 hr ago", verified: true, sample: true },
  { id: "demo-4", title: "12mm reinforcement steel bars", category: "construction", categoryLabel: "Construction", transaction: "sell", price: 132000, priceSuffix: "ton", location: "Adama", seller: "Rift Construction Supply", role: "Material Seller", condition: "New", description: "Grade 60 steel reinforcement bars. Full mill certificate and delivery service available.", icon: "🏗️", accent: "orange", time: "2 hrs ago", verified: true, sample: true },
  { id: "demo-5", title: "3-bedroom family house for sale", category: "property", categoryLabel: "Property & Houses", transaction: "broker", price: 12800000, priceSuffix: "total", location: "Addis Ababa", seller: "Liya Property Broker", role: "House Broker", condition: "Available", description: "Finished family home with title deed, parking and water tank. Viewing by appointment.", icon: "🏠", accent: "rose", time: "3 hrs ago", verified: true, sample: true },
  { id: "demo-6", title: "Locally manufactured PVC pipes", category: "manufactured", categoryLabel: "Manufactured", transaction: "sell", price: 640, priceSuffix: "piece", location: "Hawassa", seller: "Abyssinia Plastics", role: "Manufacturer", condition: "New", description: "Multiple diameters available for construction and irrigation. Factory-direct volume prices.", icon: "🏭", accent: "slate", time: "Today", verified: true, sample: true },
  { id: "demo-7", title: "Looking to buy washed coffee", category: "buyer", categoryLabel: "Buy Requests", transaction: "buy", price: 310, priceSuffix: "kg", location: "Dire Dawa", seller: "East Coffee Export", role: "Bulk Buyer", condition: "Wanted", description: "Seeking 20 tons of traceable washed Arabica. Cooperative and producer offers welcome.", icon: "🛒", accent: "gold", time: "Today", verified: true, sample: true },
  { id: "demo-8", title: "Farm-to-market broker service", category: "broker", categoryLabel: "Broker Services", transaction: "broker", price: 2, priceSuffix: "total", location: "Jimma", seller: "Hassan Trade Link", role: "Agricultural Broker", condition: "Service", description: "Connecting coffee, spice and grain producers with verified wholesale buyers across Ethiopia.", icon: "🤝", accent: "teal", time: "Yesterday", verified: true, sample: true },
  { id: "demo-9", title: "Healthy goats and chickens for sale", category: "livestock", categoryLabel: "Livestock & Animal Products", transaction: "sell", price: 12500, priceSuffix: "piece", location: "Shashemene", seller: "Wabe Livestock Farm", role: "Livestock Farmer", condition: "Available", description: "Healthy goats and chickens raised with proper care. Buyers can inspect animals before purchase.", icon: "🐄", accent: "brown", time: "Today", verified: true, sample: true },
];

const locations = ["All Ethiopia", "Addis Ababa", "Adama", "Dire Dawa", "Hawassa", "Bahir Dar", "Jigjiga", "Mekelle", "Jimma", "Bishoftu"];

function transactionLabel(type: TransactionType) {
  if (type === "sell") return "FOR SALE";
  if (type === "buy") return "WANTED";
  return "BROKER";
}

function formatPrice(listing: Listing) {
  if (listing.category === "broker" && listing.price <= 5) return `${listing.price}% commission`;
  const suffix = listing.priceSuffix === "total" ? "" : ` / ${listing.priceSuffix}`;
  return `ETB ${listing.price.toLocaleString()}${suffix}`;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("All Ethiopia");
  const [category, setCategory] = useState("all");
  const [transaction, setTransaction] = useState<"all" | TransactionType>("all");
  const [listings, setListings] = useState<Listing[]>(demoListings);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [postOpen, setPostOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [registeredName, setRegisteredName] = useState("");
  const [registeredRole, setRegisteredRole] = useState<RoleId | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/listings")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Could not load listings")))
      .then((body: { listings?: Array<Omit<Listing, "id" | "time"> & { id: number; createdAt?: string }> }) => {
        if (!active || !body.listings?.length) return;
        const savedListings: Listing[] = body.listings.map((listing) => ({
          ...listing,
          id: String(listing.id),
          time: "Recently",
          sample: false,
        }));
        setListings([...savedListings, ...demoListings]);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  const filteredListings = useMemo(() => {
    const search = query.trim().toLowerCase();
    return listings.filter((listing) => {
      const matchesSearch = !search || [listing.title, listing.categoryLabel, listing.location, listing.seller, listing.description].join(" ").toLowerCase().includes(search);
      const matchesLocation = location === "All Ethiopia" || listing.location === location;
      const matchesCategory = category === "all" || listing.category === category;
      const matchesTransaction = transaction === "all" || listing.transaction === transaction;
      return matchesSearch && matchesLocation && matchesCategory && matchesTransaction;
    });
  }, [category, listings, location, query, transaction]);

  function selectCategory(id: string) {
    setCategory(id);
    document.getElementById("listings")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function addListing(listing: Listing) {
    setListings((current) => [listing, ...current]);
    setCategory("all");
    setTransaction("all");
    setNotice("Maxxansi kee marketplace irratti baheera!");
    window.setTimeout(() => setNotice(""), 4200);
  }

  function completeRegistration(payload: { role: RoleId; fullName: string }) {
    setRegisteredName(payload.fullName);
    setRegisteredRole(payload.role);
    setNotice("Galmeen kee milkaa'eera. Amma ad maxxansuu dandeessa.");
    window.setTimeout(() => setNotice(""), 4200);
  }

  return (
    <main className="marketplace-app">
      <header className="market-header">
        <a className="esmart-brand" href="#top" aria-label="FUAD ESMART Marketplace home">
          <span className="esmart-mark">FE</span>
          <span><strong>FUAD ESMART</strong><small>TRADING PLC · MARKETPLACE</small></span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#categories">Categories</a>
          <a href="#listings">Marketplace</a>
          <a href="#how">How it works</a>
        </nav>
        <div className="market-actions">
          <button className="notification-button" type="button" aria-label="Notifications"><span>🔔</span><i /></button>
          {registeredName ? <button className="profile-chip" type="button"><span>{registeredName.slice(0, 1).toUpperCase()}</span><small>{registeredName.split(" ")[0]}</small></button> : <button className="header-register" type="button" onClick={() => setRegisterOpen(true)}>Register</button>}
          <button className="post-ad-button ripple" type="button" onClick={() => setPostOpen(true)}><span>＋</span> Post Ad</button>
        </div>
      </header>

      <section className="market-hero" id="top">
        <div className="hero-glow glow-one" /><div className="hero-glow glow-two" />
        <div className="hero-market-copy">
          <div className="live-pill"><i /> Ethiopia&apos;s multi-sector marketplace</div>
          <h1>Buy it. Sell it.<br /><em>Broker it.</em></h1>
          <p>Farm products, minerals, electronics, houses, construction materials and manufactured goods—all in one trusted Ethiopian market.</p>
          <form className="universal-search" onSubmit={(event) => { event.preventDefault(); document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" }); }}>
            <label className="hero-search-field"><span aria-hidden="true">⌕</span><span className="sr-only">Search marketplace</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Maal barbaadda?  What are you looking for?" /></label>
            <label className="hero-location-field"><span aria-hidden="true">⌖</span><span className="sr-only">Choose location</span><select value={location} onChange={(event) => setLocation(event.target.value)}>{locations.map((item) => <option key={item}>{item}</option>)}</select></label>
            <button className="hero-search-button ripple" type="submit">Search</button>
          </form>
          <div className="hero-quick-links"><span>Popular:</span><button type="button" onClick={() => { setQuery("Laptop"); setCategory("all"); }}>Laptop</button><button type="button" onClick={() => selectCategory("mineral")}>Mineral</button><button type="button" onClick={() => selectCategory("farm")}>Farm product</button><button type="button" onClick={() => selectCategory("property")}>House</button></div>
          <div className="market-stats">
            <div><strong>16K+</strong><span>Active listings</span></div>
            <div><strong>7</strong><span>Business roles</span></div>
            <div><strong>12</strong><span>Regions covered</span></div>
            <div><strong>24/7</strong><span>Marketplace access</span></div>
          </div>
        </div>

        <div className="hero-market-visual" aria-label="Marketplace activity illustration">
          <div className="trade-orbit orbit-a"><span>🌾</span></div>
          <div className="trade-orbit orbit-b"><span>💻</span></div>
          <div className="trade-orbit orbit-c"><span>🪨</span></div>
          <div className="trade-orbit orbit-d"><span>🏠</span></div>
          <div className="trade-core"><span className="core-logo">FE</span><strong>ONE MARKET</strong><small>Buy · Sell · Broker</small></div>
          <div className="floating-deal deal-one"><span>✓</span><div><strong>Verified seller</strong><small>Adama · just now</small></div></div>
          <div className="floating-deal deal-two"><span>↗</span><div><strong>New buyer request</strong><small>20 tons coffee</small></div></div>
          <svg className="orbit-lines" viewBox="0 0 500 500" aria-hidden="true"><circle cx="250" cy="250" r="171" /><circle cx="250" cy="250" r="115" /></svg>
        </div>
      </section>

      <section className="category-section" id="categories">
        <div className="market-section-heading"><div><span>EXPLORE CATEGORIES</span><h2>Everything your business needs.</h2></div><p>Gosa tokko fili; maxxansa gurgurtaa, barbaacha bitataa fi broker waliin argi.</p></div>
        <div className="market-category-grid">
          {listingCategories.map((item, index) => (
            <button className={`market-category-card ${item.accent} ${category === item.id ? "active" : ""}`} style={{ animationDelay: `${index * 55}ms` }} key={item.id} type="button" onClick={() => selectCategory(item.id)}>
              <span className="category-art">{item.icon}</span><span className="category-info"><strong>{item.oromo}</strong><small>{item.label}</small><em>{item.count} ads</em></span><i>→</i>
            </button>
          ))}
        </div>
      </section>

      <section className="listings-section" id="listings">
        <div className="listing-toolbar">
          <div><span>{category === "all" ? "LATEST LISTINGS" : listingCategories.find((item) => item.id === category)?.label.toUpperCase()}</span><h2>{category === "all" ? "Fresh opportunities for you" : listingCategories.find((item) => item.id === category)?.oromo}</h2><p>{filteredListings.length} results found</p></div>
          <div className="transaction-tabs" role="group" aria-label="Filter listings by trade type">
            {(["all", "sell", "buy", "broker"] as const).map((item) => <button className={transaction === item ? "active" : ""} key={item} type="button" onClick={() => setTransaction(item)}>{item === "all" ? "All ads" : item === "sell" ? "For sale" : item === "buy" ? "Wanted" : "Broker"}</button>)}
          </div>
        </div>

        {filteredListings.length ? (
          <div className="listing-grid">
            {filteredListings.map((listing, index) => (
              <article className="listing-card" style={{ animationDelay: `${Math.min(index, 7) * 60}ms` }} key={listing.id}>
                <button className={`listing-visual ${listing.accent}`} type="button" onClick={() => setSelectedListing(listing)} aria-label={`View ${listing.title}`}>
                  <span className="listing-icon">{listing.icon}</span>
                  <span className={`trade-badge ${listing.transaction}`}>{transactionLabel(listing.transaction)}</span>
                  {listing.sample && <span className="sample-badge">SAMPLE</span>}
                  <span className="heart" aria-hidden="true">♡</span>
                </button>
                <div className="listing-body">
                  <div className="listing-meta"><span>{listing.categoryLabel}</span><span>⌖ {listing.location}</span></div>
                  <button className="listing-title" type="button" onClick={() => setSelectedListing(listing)}>{listing.title}</button>
                  <p>{listing.description}</p>
                  <div className="seller-line"><span>{listing.seller.slice(0, 1)}</span><div><strong>{listing.seller}</strong><small>{listing.verified && <i>✓</i>} {listing.role}</small></div><time>{listing.time}</time></div>
                  <div className="listing-price"><strong>{formatPrice(listing)}</strong><button type="button" onClick={() => setSelectedListing(listing)}>View ad <span>→</span></button></div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="no-listings"><span>⌕</span><h3>Maxxansi hin argamne</h3><p>Search, bakka ykn filter jijjiiri.</p><button type="button" onClick={() => { setQuery(""); setLocation("All Ethiopia"); setCategory("all"); setTransaction("all"); }}>Clear all filters</button></div>
        )}
      </section>

      <section className="roles-showcase" id="how">
        <div className="roles-copy"><span>MULTI-ROLE SYSTEM</span><h2>Role kee filadhu.<br />Gabaa kee jalqabi.</h2><p>FUAD ESMART keessatti namni hundi karaa isaaf ta&apos;een galmaa&apos;a; form fi marketplace isa barbaachisu qofa argata.</p><button className="light-action ripple" type="button" onClick={() => setRegisterOpen(true)}>Bilisa galmaa&apos;i <span>→</span></button></div>
        <div className="roles-map">
          {[{ icon: "👨‍🌾", name: "Farmer" }, { icon: "🏭", name: "Manufacturer" }, { icon: "🏪", name: "Seller" }, { icon: "🤝", name: "Broker" }, { icon: "💻", name: "Electronics" }, { icon: "🪨", name: "Mineral" }, { icon: "🛒", name: "Buyer" }].map((role, index) => <button className="mini-role-card" style={{ animationDelay: `${index * 80}ms` }} type="button" key={role.name} onClick={() => setRegisterOpen(true)}><span>{role.icon}</span><strong>{role.name}</strong><small>Select role</small></button>)}
        </div>
      </section>

      <section className="market-steps">
        <div className="market-section-heading centered"><div><span>HOW IT WORKS</span><h2>Start trading in four simple steps.</h2></div></div>
        <div className="how-grid"><article><span>01</span><i>◎</i><h3>Galmaa&apos;i</h3><p>Role kee fili; profile hojii kee guuti.</p></article><article><span>02</span><i>＋</i><h3>Post maxxansi</h3><p>Gurgurtaa, bitannaa ykn broker ta&apos;uun ad baasi.</p></article><article><span>03</span><i>⌕</i><h3>Wal barbaadi</h3><p>Search fi filter fayyadamuun partner sirrii argadhu.</p></article><article><span>04</span><i>✓</i><h3>Daldala xumuri</h3><p>Odeeffannoo mirkaneeffadhu; karaa nagaatiin walii gali.</p></article></div>
      </section>

      <section className="final-cta">
        <div><span>FUAD ESMART TRADING PLC</span><h2>Gabaa kee har&apos;a jalqabi.</h2><p>Post jalqabaa bilisa. Role hundaaf marketplace tokko.</p></div><div><button className="cta-register ripple" type="button" onClick={() => setRegisterOpen(true)}>Create account</button><button className="cta-post ripple" type="button" onClick={() => setPostOpen(true)}>＋ Post Ad Free</button></div>
      </section>

      <footer className="market-footer">
        <div className="footer-main"><div className="footer-brand-wide"><span className="esmart-mark">FE</span><div><strong>FUAD ESMART</strong><small>TRADING PLC · ETHIOPIA</small></div></div><p>Qonnaan bulaa, oomishtaa, seller, broker fi buyer gabaa amanamaa tokko keessatti wal qunnamsiifna.</p></div>
        <div><strong>Marketplace</strong><a href="#categories">Categories</a><a href="#listings">Latest ads</a><button type="button" onClick={() => setPostOpen(true)}>Post an ad</button></div>
        <div><strong>Company</strong><a href="#how">How it works</a><button type="button" onClick={() => setRegisterOpen(true)}>Register</button><a href="#top">Safety tips</a></div>
        <div><strong>Support</strong><a href="#top">Help center</a><a href="#top">Contact</a><a href="#top">Privacy</a></div>
        <small>© 2026 FUAD ESMART TRADING PLC. All rights reserved.</small>
      </footer>

      <MultiRoleRegister open={registerOpen} onClose={() => setRegisterOpen(false)} onComplete={completeRegistration} />
      <PostAdFlow open={postOpen} onClose={() => setPostOpen(false)} onComplete={addListing} defaultSeller={registeredName} />

      {selectedListing && (
        <div className="flow-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedListing(null); }}>
          <section className="listing-detail" role="dialog" aria-modal="true" aria-labelledby="listing-detail-title">
            <button className="flow-close" type="button" onClick={() => setSelectedListing(null)} aria-label="Close listing">×</button>
            <div className={`detail-visual ${selectedListing.accent}`}><span>{selectedListing.icon}</span><i className={`trade-badge ${selectedListing.transaction}`}>{transactionLabel(selectedListing.transaction)}</i>{selectedListing.sample && <em>SAMPLE LISTING</em>}</div>
            <div className="detail-content">
              <span className="detail-category">{selectedListing.categoryLabel} · {selectedListing.condition}</span>
              <h2 id="listing-detail-title">{selectedListing.title}</h2>
              <strong className="detail-price">{formatPrice(selectedListing)}</strong>
              <div className="detail-facts"><span>⌖ {selectedListing.location}</span><span>◷ {selectedListing.time}</span><span>{selectedListing.verified ? "✓ Verified profile" : "New profile"}</span></div>
              <h3>Description</h3><p>{selectedListing.description}</p>
              <div className="detail-seller"><span>{selectedListing.seller.slice(0, 1)}</span><div><small>Posted by</small><strong>{selectedListing.seller}</strong><em>{selectedListing.role}</em></div></div>
              <div className="detail-actions"><button className="contact-action ripple" type="button" onClick={() => { setNotice("Contact request qophaa'eera — seller si quunnama."); setSelectedListing(null); window.setTimeout(() => setNotice(""), 4200); }}>☎ Contact seller</button><button className="save-action" type="button">♡ Save</button></div>
              {selectedListing.sample && <p className="sample-note">Kun fakkeenya maxxansaa qofa. Maxxansi haaraan namoota irraa dhufu marketplace irratti itti dabalama.</p>}
            </div>
          </section>
        </div>
      )}

      {notice && <div className="toast-notice" role="status"><span>✓</span><p>{notice}</p></div>}
    </main>
  );
}
