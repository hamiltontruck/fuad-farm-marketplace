"use client";

import { useEffect, useMemo, useState } from "react";
import type { Language } from "../../lib/i18n";
import type { Listing, TransactionType } from "../marketplace/PostAdFlow";
import type { RegistrationPayload } from "../registration/MultiRoleRegister";
import { getRoleName, roleOptions, type RoleId } from "../registration/RoleSelector";

type DashboardView = "overview" | "listings" | "saved" | "profile";
type CoreDashboardRole = "farmer" | "manufacturer" | "seller" | "broker" | "buyer";

type Props = {
  open: boolean;
  profile: RegistrationPayload;
  listings: Listing[];
  savedIds: string[];
  language: Language;
  onClose: () => void;
  onPost: (transaction: TransactionType) => void;
  onBrowse: () => void;
  onSelectListing: (listing: Listing) => void;
  onLogout: () => void;
};

const dashboardCopy: Record<Language, Record<string, string>> = {
  om: {
    dashboard: "Dashboard", close: "Dashboard cufi", overview: "Gabaabumatti", listings: "Maxxansa koo", saved: "Kan kuufame", profile: "Profile", welcome: "Baga nagaan dhuftan", local: "LOCAL MODE", localBody: "Odeeffannoon dashboard device kana qofa irratti kuufama.", allActivity: "Hojii daldalaa kee bakka tokko irraa to’adhu.", myListings: "Maxxansa koo", rolePosts: "Maxxansa role", savedItems: "Kan kuufame", messages: "Ergaa haaraa", quickActions: "Hojii saffisaa", browse: "Marketplace ilaali", recent: "Maxxansa kee dhihoo", viewAll: "Hunda ilaali", emptyTitle: "Maxxansi kee ammaaf hin jiru", emptyBody: "Maxxansa jalqabaa baasuun buyer fi seller si barbaadan bira ga’i.", status: "Jira", view: "Ilaali", marketplaceActivity: "Carraa role keetii", checklist: "Tarkaanfii itti aanu", listingsTitle: "Maxxansa kee hunda", listingsIntro: "Maxxansa gurgurtaa, bitannaa fi broker device kana irratti uumte.", savedTitle: "Maxxansa kuufatte", savedIntro: "Carraa booda ilaaluuf saved goote hunda.", savedEmpty: "Maxxansi saved godhame hin jiru.", profileTitle: "Odeeffannoo profile", profileIntro: "Galmee marketplace device kana irratti kuufame.", fullName: "Maqaa guutuu", phone: "Lakkoofsa bilbilaa", region: "Naannoo", business: "Daldala / farm", specialty: "Damee hojii", experience: "Muuxannoo", role: "Gahee", logout: "Account keessaa ba’i", noValue: "Hin galmoofne", postNow: "Amma maxxansi", active: "HOJII IRRA JIRA", sale: "Gurgurtaa", buy: "Barbaacha bitataa", broker: "Broker", sampleNote: "Dashboard kun maxxansa mataa keetii qofa lakkaa’a; sample marketplace hin lakkaa’u.",
  },
  en: {
    dashboard: "Dashboard", close: "Close dashboard", overview: "Overview", listings: "My listings", saved: "Saved", profile: "Profile", welcome: "Welcome", local: "LOCAL MODE", localBody: "Dashboard data is stored only on this device.", allActivity: "Manage your marketplace activity in one place.", myListings: "My listings", rolePosts: "Role posts", savedItems: "Saved items", messages: "New messages", quickActions: "Quick actions", browse: "Browse marketplace", recent: "Your recent listings", viewAll: "View all", emptyTitle: "You have no listings yet", emptyBody: "Publish your first listing and reach buyers, sellers and brokers.", status: "Active", view: "View", marketplaceActivity: "Opportunities for your role", checklist: "Recommended next steps", listingsTitle: "All your listings", listingsIntro: "Sale, buy and broker listings created on this device.", savedTitle: "Your saved listings", savedIntro: "All the opportunities you saved to review later.", savedEmpty: "You have not saved any listings yet.", profileTitle: "Profile information", profileIntro: "Your marketplace registration saved on this device.", fullName: "Full name", phone: "Phone number", region: "Region", business: "Business / farm", specialty: "Specialty", experience: "Experience", role: "Role", logout: "Log out", noValue: "Not provided", postNow: "Post now", active: "ACTIVE", sale: "For sale", buy: "Buy request", broker: "Broker", sampleNote: "This dashboard counts only your own listings; marketplace samples are excluded.",
  },
  am: {
    dashboard: "ዳሽቦርድ", close: "ዳሽቦርዱን ዝጋ", overview: "አጠቃላይ", listings: "የእኔ ማስታወቂያ", saved: "የተቀመጡ", profile: "ፕሮፋይል", welcome: "እንኳን ደህና መጡ", local: "የመሣሪያው መረጃ", localBody: "የዳሽቦርዱ መረጃ በዚህ መሣሪያ ላይ ብቻ ይቀመጣል።", allActivity: "የገበያ እንቅስቃሴዎን በአንድ ቦታ ያስተዳድሩ።", myListings: "የእኔ ማስታወቂያ", rolePosts: "የሚና ማስታወቂያ", savedItems: "የተቀመጡ", messages: "አዲስ መልዕክቶች", quickActions: "ፈጣን ተግባሮች", browse: "ገበያውን ይመልከቱ", recent: "የቅርብ ማስታወቂያዎችዎ", viewAll: "ሁሉን ይመልከቱ", emptyTitle: "እስካሁን ማስታወቂያ የለዎትም", emptyBody: "የመጀመሪያ ማስታወቂያዎን ይለጥፉና ገዢዎችን፣ ሻጮችንና ደላሎችን ያግኙ።", status: "ንቁ", view: "ይመልከቱ", marketplaceActivity: "ለሚናዎ የሚሆኑ ዕድሎች", checklist: "ቀጣይ የሚመከሩ ደረጃዎች", listingsTitle: "ሁሉም ማስታወቂያዎችዎ", listingsIntro: "በዚህ መሣሪያ የፈጠሩት የሽያጭ፣ የግዢና የደላላ ማስታወቂያ።", savedTitle: "የተቀመጡ ማስታወቂያዎች", savedIntro: "በኋላ ለማየት ያስቀመጧቸው ዕድሎች።", savedEmpty: "እስካሁን ያስቀመጡት ማስታወቂያ የለም።", profileTitle: "የፕሮፋይል መረጃ", profileIntro: "በዚህ መሣሪያ ላይ የተቀመጠ የገበያ ምዝገባዎ።", fullName: "ሙሉ ስም", phone: "ስልክ ቁጥር", region: "ክልል", business: "ንግድ / እርሻ", specialty: "የስራ ዘርፍ", experience: "ልምድ", role: "ሚና", logout: "ከመለያ ውጣ", noValue: "አልተሰጠም", postNow: "አሁን ይለጥፉ", active: "ንቁ", sale: "ለሽያጭ", buy: "የግዢ ጥያቄ", broker: "ደላላ", sampleNote: "ይህ ዳሽቦርድ የእርስዎን ማስታወቂያ ብቻ ይቆጥራል፤ የምሳሌ ማስታወቂያዎች አይካተቱም።",
  },
};

const roleDashboardCopy: Record<Language, Record<CoreDashboardRole, { eyebrow: string; title: string; summary: string; primary: string; metric: string; tips: [string, string, string] }>> = {
  om: {
    farmer: { eyebrow: "DASHBOARD QONNAAN BULAA", title: "Oomisha kee gara gabaatti fidi.", summary: "Oomisha qonnaa maxxansi, bitattoota hordofi fi carraa broker argi.", primary: "Oomisha qonnaa maxxansi", metric: "Oomisha gurgurtaaf", tips: ["Oomisha, baay’ina fi gatii sirriitti galchi.", "Bakka fi geejjiba ibsa keessatti dabali.", "Barbaacha bitataa haaraa yeroo yeroon ilaali."] },
    manufacturer: { eyebrow: "DASHBOARD OOMISHTAA", title: "Oomisha warshaa kee guddisi.", summary: "Product haaraa baasi, buyer jumlaa argi fi dhiyeessii kee to’adhu.", primary: "Oomisha warshaa maxxansi", metric: "Product gurgurtaaf", tips: ["Capacity fi minimum order ibsi.", "Ragaa qulqullinaa yoo jiraate eeri.", "Buyer jumlaa fi seller waliin wal qunnami."] },
    seller: { eyebrow: "DASHBOARD GURGURAA", title: "Daldala kee saffisaan guddisi.", summary: "Maxxansa gurgurtaa to’adhu, carraa bitataa argi fi saved items ilaali.", primary: "Meeshaa gurgurtaaf maxxansi", metric: "Maxxansa gurgurtaa", tips: ["Suuraa fi ibsa qulqulluu qopheessi.", "Gatii fi haala meeshaa ifatti galchi.", "Contact siif dhufu saffisaan deebisi."] },
    broker: { eyebrow: "DASHBOARD BROKER", title: "Bitataa fi gurguraa wal qunnamsiisi.", summary: "Broker post kee, commission fi carraa wal-simsiisuu bakka tokko irraa ilaali.", primary: "Tajaajila broker maxxansi", metric: "Broker post", tips: ["Damee broker fi bakka hojii ifa godhi.", "Commission kee dursee ibsi.", "Ragaa gama lamaanii mirkaneessi."] },
    buyer: { eyebrow: "DASHBOARD BITATAA", title: "Wanta barbaaddu saffisaan argadhu.", summary: "Buy request baasi, seller offers hordofi fi maxxansa gaarii kuusi.", primary: "Barbaacha bitataa maxxansi", metric: "Buy request", tips: ["Baay’ina, budget fi deadline ibsi.", "Bakka delivery barbaaddu galchi.", "Seller fi broker mirkanaa’an filadhu."] },
  },
  en: {
    farmer: { eyebrow: "FARMER DASHBOARD", title: "Bring your harvest to market.", summary: "List farm products, follow buyer demand and discover broker opportunities.", primary: "Post a farm product", metric: "Products for sale", tips: ["Add the exact product, quantity and price.", "Include your location and delivery options.", "Review new buyer requests regularly."] },
    manufacturer: { eyebrow: "MANUFACTURER DASHBOARD", title: "Grow your manufactured products.", summary: "Publish products, reach wholesale buyers and manage your supply offers.", primary: "Post a manufactured product", metric: "Products for sale", tips: ["State your capacity and minimum order.", "Mention quality certificates when available.", "Connect with wholesale buyers and sellers."] },
    seller: { eyebrow: "SELLER DASHBOARD", title: "Grow your business faster.", summary: "Manage sale listings, find buyer demand and keep useful opportunities saved.", primary: "Post an item for sale", metric: "Sale listings", tips: ["Use clear product details and photos.", "State the price and condition clearly.", "Respond quickly when buyers contact you."] },
    broker: { eyebrow: "BROKER DASHBOARD", title: "Connect buyers and sellers.", summary: "Track broker posts, commissions and matching opportunities in one place.", primary: "Post a broker service", metric: "Broker posts", tips: ["Clearly state your sector and service area.", "Explain your commission in advance.", "Verify both parties before a deal."] },
    buyer: { eyebrow: "BUYER DASHBOARD", title: "Find what you need faster.", summary: "Publish buy requests, follow seller offers and save strong listings.", primary: "Post a buy request", metric: "Buy requests", tips: ["State quantity, budget and deadline.", "Add the required delivery location.", "Prefer verified sellers and brokers."] },
  },
  am: {
    farmer: { eyebrow: "የገበሬ ዳሽቦርድ", title: "ምርትዎን ወደ ገበያ ያቅርቡ።", summary: "የእርሻ ምርት ይለጥፉ፣ የገዢ ፍላጎት ይከታተሉና የደላላ ዕድሎችን ያግኙ።", primary: "የእርሻ ምርት ይለጥፉ", metric: "ለሽያጭ የቀረቡ ምርቶች", tips: ["ትክክለኛ ምርት፣ ብዛትና ዋጋ ያስገቡ።", "ቦታና የማድረስ አማራጭ ይጨምሩ።", "አዳዲስ የግዢ ጥያቄዎችን ይመልከቱ።"] },
    manufacturer: { eyebrow: "የአምራች ዳሽቦርድ", title: "የፋብሪካ ምርትዎን ያሳድጉ።", summary: "አዲስ ምርት ያቅርቡ፣ የጅምላ ገዢዎችን ያግኙና አቅርቦትዎን ያስተዳድሩ።", primary: "የፋብሪካ ምርት ይለጥፉ", metric: "ለሽያጭ የቀረቡ ምርቶች", tips: ["የማምረት አቅምና ዝቅተኛ ትዕዛዝ ይግለጹ።", "የጥራት ማረጋገጫ ካለ ይጥቀሱ።", "ከጅምላ ገዢዎችና ሻጮች ጋር ይገናኙ።"] },
    seller: { eyebrow: "የሻጭ ዳሽቦርድ", title: "ንግድዎን በፍጥነት ያሳድጉ።", summary: "የሽያጭ ማስታወቂያዎችን ያስተዳድሩ፣ ገዢዎችን ያግኙና ጠቃሚ ዕድሎችን ያስቀምጡ።", primary: "የሽያጭ ማስታወቂያ ይለጥፉ", metric: "የሽያጭ ማስታወቂያ", tips: ["ግልጽ የምርት መረጃና ፎቶ ይጠቀሙ።", "ዋጋና ሁኔታ በግልጽ ይግለጹ።", "ገዢዎች ሲያገኙዎ ፈጥነው ይመልሱ።"] },
    broker: { eyebrow: "የደላላ ዳሽቦርድ", title: "ገዢና ሻጭን ያገናኙ።", summary: "የደላላ ማስታወቂያ፣ ኮሚሽንና የማገናኘት ዕድሎችን በአንድ ቦታ ይከታተሉ።", primary: "የደላላ አገልግሎት ይለጥፉ", metric: "የደላላ ማስታወቂያ", tips: ["ዘርፍና የአገልግሎት ቦታ በግልጽ ይግለጹ።", "ኮሚሽንዎን አስቀድመው ያስረዱ።", "ከስምምነት በፊት ሁለቱንም ወገኖች ያረጋግጡ።"] },
    buyer: { eyebrow: "የገዢ ዳሽቦርድ", title: "የሚፈልጉትን በፍጥነት ያግኙ።", summary: "የግዢ ጥያቄ ይለጥፉ፣ የሻጭ አቅርቦት ይከታተሉና ጥሩ ማስታወቂያዎችን ያስቀምጡ።", primary: "የግዢ ጥያቄ ይለጥፉ", metric: "የግዢ ጥያቄ", tips: ["ብዛት፣ በጀትና የጊዜ ገደብ ይግለጹ።", "የሚፈልጉትን የመላኪያ ቦታ ያስገቡ።", "የተረጋገጡ ሻጮችና ደላሎችን ይምረጡ።"] },
  },
};

function normalizeDashboardRole(role: RoleId): CoreDashboardRole {
  if (role === "electronics") return "seller";
  if (role === "mineral") return "broker";
  return role;
}

function transactionName(transaction: TransactionType, t: Record<string, string>) {
  if (transaction === "sell") return t.sale;
  if (transaction === "buy") return t.buy;
  return t.broker;
}

export default function RoleDashboard({ open, profile, listings, savedIds, language, onClose, onPost, onBrowse, onSelectListing, onLogout }: Props) {
  const [view, setView] = useState<DashboardView>("overview");
  const t = dashboardCopy[language];
  const role = roleOptions.find((item) => item.id === profile.role)!;
  const coreRole = normalizeDashboardRole(profile.role);
  const roleCopy = roleDashboardCopy[language][coreRole];
  const primaryTransaction: TransactionType = coreRole === "buyer" ? "buy" : coreRole === "broker" ? "broker" : "sell";

  const myListings = useMemo(() => listings.filter((listing) => !listing.sample && listing.seller.trim().toLowerCase() === profile.fullName.trim().toLowerCase()), [listings, profile.fullName]);
  const savedListings = useMemo(() => listings.filter((listing) => savedIds.includes(listing.id)), [listings, savedIds]);
  const rolePostCount = myListings.filter((listing) => listing.transaction === primaryTransaction).length;

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose, open]);

  if (!open) return null;

  const navItems: Array<{ id: DashboardView; icon: string; label: string; count?: number }> = [
    { id: "overview", icon: "⌂", label: t.overview },
    { id: "listings", icon: "▤", label: t.listings, count: myListings.length },
    { id: "saved", icon: "♡", label: t.saved, count: savedListings.length },
    { id: "profile", icon: "◎", label: t.profile },
  ];

  function openListing(listing: Listing) {
    onClose();
    onSelectListing(listing);
  }

  function renderListingRows(items: Listing[], emptyText: string) {
    if (!items.length) return <div className="dashboard-empty"><span>▤</span><h3>{emptyText}</h3><p>{t.emptyBody}</p><button type="button" onClick={() => onPost(primaryTransaction)}>＋ {roleCopy.primary}</button></div>;
    return <div className="dashboard-listing-stack">{items.map((listing) => <article className="dashboard-listing-row" key={listing.id}><span className={`dashboard-listing-icon ${listing.accent}`}>{listing.icon}</span><div><small>{transactionName(listing.transaction, t)} · {listing.location}</small><strong>{listing.title}</strong><em>{listing.time}</em></div><div><b>ETB {listing.price.toLocaleString()}</b><button type="button" onClick={() => openListing(listing)}>{t.view} →</button></div></article>)}</div>;
  }

  return (
    <div className="dashboard-layer" role="presentation">
      <section className="role-dashboard" role="dialog" aria-modal="true" aria-labelledby="dashboard-title">
        <aside className="dashboard-sidebar">
          <div className="dashboard-brand"><span>FE</span><div><strong>FUAD ESMART</strong><small>{t.dashboard}</small></div></div>
          <nav aria-label={t.dashboard}>{navItems.map((item) => <button className={view === item.id ? "active" : ""} type="button" key={item.id} onClick={() => setView(item.id)}><i>{item.icon}</i><span>{item.label}</span>{item.count !== undefined && <em>{item.count}</em>}</button>)}</nav>
          <div className="dashboard-local-note"><strong>{t.local}</strong><p>{t.localBody}</p></div>
        </aside>

        <div className="dashboard-main">
          <header className="dashboard-topbar"><div><span className="dashboard-avatar">{profile.fullName.slice(0, 1).toUpperCase()}</span><div><small>{t.welcome}</small><strong>{profile.fullName}</strong></div></div><button type="button" onClick={onClose} aria-label={t.close}>×</button></header>

          <div className="dashboard-content">
            {view === "overview" && <>
              <section className="dashboard-hero">
                <div><span>{roleCopy.eyebrow}</span><h1 id="dashboard-title">{roleCopy.title}</h1><p>{roleCopy.summary}</p><div><button className="dashboard-primary-action ripple" type="button" onClick={() => onPost(primaryTransaction)}>＋ {roleCopy.primary}</button><button className="dashboard-secondary-action" type="button" onClick={onBrowse}>{t.browse} →</button></div></div>
                <div className="dashboard-role-art"><span>{role.icon}</span><strong>{getRoleName(role, language)}</strong><small>{profile.businessName || profile.specialty}</small></div>
              </section>

              <section className="dashboard-stat-grid" aria-label={t.allActivity}>
                <article><span>▤</span><div><strong>{myListings.length}</strong><small>{t.myListings}</small></div></article>
                <article><span>↗</span><div><strong>{rolePostCount}</strong><small>{roleCopy.metric}</small></div></article>
                <article><span>♥</span><div><strong>{savedListings.length}</strong><small>{t.savedItems}</small></div></article>
                <article><span>✉</span><div><strong>0</strong><small>{t.messages}</small></div></article>
              </section>

              <div className="dashboard-overview-grid">
                <section className="dashboard-panel"><div className="dashboard-panel-heading"><div><span>{t.active}</span><h2>{t.recent}</h2></div>{myListings.length > 2 && <button type="button" onClick={() => setView("listings")}>{t.viewAll} →</button>}</div>{renderListingRows(myListings.slice(0, 2), t.emptyTitle)}</section>
                <aside className="dashboard-panel dashboard-role-guide"><span>{t.marketplaceActivity}</span><h2>{t.checklist}</h2><ol>{roleCopy.tips.map((tip, index) => <li key={tip}><b>{index + 1}</b><p>{tip}</p></li>)}</ol><p className="dashboard-sample-note">ⓘ {t.sampleNote}</p></aside>
              </div>
            </>}

            {view === "listings" && <section className="dashboard-page-panel"><div className="dashboard-page-heading"><span>{roleCopy.eyebrow}</span><h1 id="dashboard-title">{t.listingsTitle}</h1><p>{t.listingsIntro}</p><button type="button" onClick={() => onPost(primaryTransaction)}>＋ {t.postNow}</button></div>{renderListingRows(myListings, t.emptyTitle)}</section>}

            {view === "saved" && <section className="dashboard-page-panel"><div className="dashboard-page-heading"><span>{t.saved.toUpperCase()}</span><h1 id="dashboard-title">{t.savedTitle}</h1><p>{t.savedIntro}</p><button type="button" onClick={onBrowse}>{t.browse} →</button></div>{renderListingRows(savedListings, t.savedEmpty)}</section>}

            {view === "profile" && <section className="dashboard-page-panel"><div className="dashboard-page-heading"><span>{getRoleName(role, language).toUpperCase()}</span><h1 id="dashboard-title">{t.profileTitle}</h1><p>{t.profileIntro}</p></div><div className="dashboard-profile-card"><div className="dashboard-profile-identity"><span>{profile.fullName.slice(0, 1).toUpperCase()}</span><div><h2>{profile.fullName}</h2><p>{getRoleName(role, language)} · {profile.region}</p></div></div><dl><div><dt>{t.role}</dt><dd>{role.icon} {getRoleName(role, language)}</dd></div><div><dt>{t.phone}</dt><dd>{profile.phone}</dd></div><div><dt>{t.region}</dt><dd>{profile.region}</dd></div><div><dt>{t.business}</dt><dd>{profile.businessName || t.noValue}</dd></div><div><dt>{t.specialty}</dt><dd>{profile.specialty || t.noValue}</dd></div><div><dt>{t.experience}</dt><dd>{profile.experience || t.noValue}</dd></div></dl><button className="dashboard-logout" type="button" onClick={onLogout}>{t.logout}</button></div></section>}
          </div>
        </div>
      </section>
    </div>
  );
}
