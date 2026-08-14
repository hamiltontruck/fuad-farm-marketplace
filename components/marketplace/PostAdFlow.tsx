"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Language } from "../../lib/i18n";
import StepIndicator from "../registration/StepIndicator";

export type TransactionType = "sell" | "buy" | "broker";

export type Listing = {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  transaction: TransactionType;
  price: number;
  priceSuffix: string;
  location: string;
  seller: string;
  role: string;
  condition: string;
  description: string;
  icon: string;
  accent: string;
  time: string;
  phone?: string;
  verified?: boolean;
  sample?: boolean;
};

export const listingCategories = [
  { id: "mineral", label: "Mineral", oromo: "Albuuda", amharic: "ማዕድን", icon: "🪨", accent: "violet", count: "1.2K" },
  { id: "electronics", label: "Electronics", oromo: "Elektirooniksii", amharic: "ኤሌክትሮኒክስ", icon: "💻", accent: "blue", count: "4.8K" },
  { id: "farm", label: "Farm Products", oromo: "Oomisha qonnaa", amharic: "የእርሻ ምርቶች", icon: "🌾", accent: "green", count: "3.4K" },
  { id: "construction", label: "Construction", oromo: "Meeshaa ijaarsaa", amharic: "የግንባታ ዕቃዎች", icon: "🏗️", accent: "orange", count: "2.1K" },
  { id: "property", label: "Property & Houses", oromo: "Mana fi lafa", amharic: "ቤትና መሬት", icon: "🏠", accent: "rose", count: "1.9K" },
  { id: "manufactured", label: "Manufactured", oromo: "Oomisha warshaa", amharic: "የፋብሪካ ምርቶች", icon: "🏭", accent: "slate", count: "1.5K" },
  { id: "broker", label: "Broker Services", oromo: "Tajaajila broker", amharic: "የደላላ አገልግሎት", icon: "🤝", accent: "teal", count: "980" },
  { id: "buyer", label: "Buy Requests", oromo: "Barbaacha bitataa", amharic: "የግዢ ጥያቄዎች", icon: "🛒", accent: "gold", count: "740" },
  { id: "livestock", label: "Livestock & Animal Products", oromo: "Bu’aa horsiisa horii", amharic: "እንስሳትና የእንስሳት ውጤቶች", icon: "🐄", accent: "brown", count: "1.1K" },
];

export function getCategoryName(category: (typeof listingCategories)[number], language: Language) {
  if (language === "om") return category.oromo;
  if (language === "am") return category.amharic;
  return category.label;
}

type Props = {
  open: boolean;
  onClose: () => void;
  onComplete: (listing: Listing) => void;
  defaultSeller?: string;
  language: Language;
};

const locations = ["Addis Ababa", "Adama", "Dire Dawa", "Hawassa", "Bahir Dar", "Jigjiga", "Mekelle", "Jimma", "Shashemene", "Bishoftu"];

const postCopy: Record<Language, Record<string, string>> = {
  om: {
    close: "Unka maxxansaa cufi", brand: "MAXXANSA BAASI", type: "Gosa", details: "Odeeffannoo", confirm: "Mirkaneessi", finish: "Xumura", step: "TARKAANFII", chooseTitle: "Maal maxxansuu barbaadda?", chooseIntro: "Gosa daldalaa fi category kee filadhu.", transactionAria: "Gosa daldalaa maxxansaa", sell: "Gurguruu", sellHint: "Gurguruu barbaada", buy: "Bitachuu", buyHint: "Bitachuu barbaada", broker: "Broker", brokerHint: "Gama lamaan wal qunnamsiisa", categoryAria: "Category maxxansaa", next: "Itti fufi", describeTitle: "Maxxansa kee ibsi.", describeIntro: "Maqaa gabaabaa, gatii fi odeeffannoo ifaa galchi.", forSale: "Gurgurtaaf", wanted: "Barbaadama", brokerOffer: "Tajaajila broker", change: "Jijjiiri", adTitle: "Mata-duree maxxansaa", adPlaceholder: "Fkn: Samsung laptop haaraa gurgurama", price: "Gatii (ETB)", unit: "Safartuu gatii", total: "Gatii waliigalaa", perKg: "Kiiloo tokko", perTon: "Toonii tokko", perGram: "Giraamii tokko", perMonth: "Ji’a tokko", perPiece: "Tokko tokko", commission: "Komishinii %", condition: "Haala", new: "Haaraa", used: "Kan fayyadame", fresh: "Haaraa / Fresh", available: "Jira", service: "Tajaajila", location: "Bakka", chooseCity: "Magaalaa fili", description: "Ibsa", descriptionPlaceholder: "Qulqullina, baay’ina, geejjibaa fi odeeffannoo barbaachisaa…", back: "Duubatti", confirmTitle: "Odeeffannoo mirkaneessi.", confirmIntro: "Buyer ykn seller si quunnamuuf contact sirrii galchi.", contactName: "Maqaa quunnamtii", contactPlaceholder: "Maqaa nama ykn company", phone: "Lakkoofsa bilbilaa", terms: "Odeeffannoon ani galche sirrii dha; seera marketplace nan fudhadha.", privacyTitle: "Lakkoofsi bilbilaa kee card irratti hin mul’atu.", privacyBody: "Buyer ‘Contact’ yeroo tuqu qofa itti fayyadama.", localTitle: "Maxxansi device kana irratti kuufama.", localBody: "Database project keessaa yeroo biraa wal qunnamsiifna.", publish: "Maxxansa baasi", publishing: "Maxxansaa jira…", failed: "Maxxansi hin milkoofne.", successKicker: "MAXXANSI MILKAA’EERA", successTitle: "Ad kee marketplace irratti baheera!", successBody: "amma namoota Itoophiyaa keessatti barbaadan bira ga’uu danda’a.", view: "Maxxansa ilaali", justNow: "Amma", sellerRole: "Gurguraa", buyerRole: "Bitataa", brokerRole: "Broker",
  },
  en: {
    close: "Close post ad form", brand: "POST AD", type: "Type", details: "Details", confirm: "Confirm", finish: "Finish", step: "STEP", chooseTitle: "What would you like to post?", chooseIntro: "Choose your trade type and category.", transactionAria: "Listing transaction type", sell: "Sell", sellHint: "I want to sell", buy: "Buy", buyHint: "I want to buy", broker: "Broker", brokerHint: "I connect both sides", categoryAria: "Listing category", next: "Continue", describeTitle: "Describe your listing.", describeIntro: "Add a clear title, price and useful details.", forSale: "For sale", wanted: "Wanted", brokerOffer: "Broker offer", change: "Change", adTitle: "Ad title", adPlaceholder: "Example: New Samsung laptop for sale", price: "Price (ETB)", unit: "Price unit", total: "Total price", perKg: "Per kg", perTon: "Per ton", perGram: "Per gram", perMonth: "Per month", perPiece: "Per piece", commission: "Commission %", condition: "Condition", new: "New", used: "Used", fresh: "Fresh", available: "Available", service: "Service", location: "Location", chooseCity: "Choose a city", description: "Description", descriptionPlaceholder: "Quality, quantity, delivery and other useful details…", back: "Back", confirmTitle: "Confirm your information.", confirmIntro: "Add correct contact details so buyers or sellers can reach you.", contactName: "Contact name", contactPlaceholder: "Person or company name", phone: "Phone number", terms: "The information I entered is correct and I accept the marketplace rules.", privacyTitle: "Your phone number is not shown on the card.", privacyBody: "It is used only when a buyer taps Contact.", localTitle: "This listing is saved on this device.", localBody: "We will connect the project database later.", publish: "Publish ad", publishing: "Publishing…", failed: "The listing could not be published.", successKicker: "LISTING PUBLISHED", successTitle: "Your ad is live on the marketplace!", successBody: "can now reach people looking for it across Ethiopia.", view: "View listing", justNow: "Just now", sellerRole: "Seller", buyerRole: "Buyer", brokerRole: "Broker",
  },
  am: {
    close: "የማስታወቂያ ቅጹን ዝጋ", brand: "ማስታወቂያ ለጥፍ", type: "ዓይነት", details: "ዝርዝር", confirm: "አረጋግጥ", finish: "ጨርስ", step: "ደረጃ", chooseTitle: "ምን መለጠፍ ይፈልጋሉ?", chooseIntro: "የንግድ ዓይነትና ምድብ ይምረጡ።", transactionAria: "የማስታወቂያ ንግድ ዓይነት", sell: "መሸጥ", sellHint: "መሸጥ እፈልጋለሁ", buy: "መግዛት", buyHint: "መግዛት እፈልጋለሁ", broker: "ደላላ", brokerHint: "ገዢና ሻጭን አገናኛለሁ", categoryAria: "የማስታወቂያ ምድብ", next: "ቀጥል", describeTitle: "ማስታወቂያዎን ይግለጹ።", describeIntro: "ግልጽ ርዕስ፣ ዋጋና ጠቃሚ መረጃ ያስገቡ።", forSale: "ለሽያጭ", wanted: "ይፈለጋል", brokerOffer: "የደላላ አገልግሎት", change: "ቀይር", adTitle: "የማስታወቂያ ርዕስ", adPlaceholder: "ለምሳሌ፦ አዲስ Samsung laptop ለሽያጭ", price: "ዋጋ (ETB)", unit: "የዋጋ መለኪያ", total: "ጠቅላላ ዋጋ", perKg: "በኪሎ", perTon: "በቶን", perGram: "በግራም", perMonth: "በወር", perPiece: "በአንድ", commission: "ኮሚሽን %", condition: "ሁኔታ", new: "አዲስ", used: "ያገለገለ", fresh: "ትኩስ", available: "ይገኛል", service: "አገልግሎት", location: "ቦታ", chooseCity: "ከተማ ይምረጡ", description: "መግለጫ", descriptionPlaceholder: "ጥራት፣ ብዛት፣ መላኪያና ሌላ አስፈላጊ መረጃ…", back: "ተመለስ", confirmTitle: "መረጃውን ያረጋግጡ።", confirmIntro: "ገዢ ወይም ሻጭ እንዲያገኝዎ ትክክለኛ መገኛ ያስገቡ።", contactName: "የመገኛ ስም", contactPlaceholder: "የሰው ወይም የድርጅት ስም", phone: "ስልክ ቁጥር", terms: "ያስገባሁት መረጃ ትክክል ነው፤ የገበያውን ደንብ ተቀብያለሁ።", privacyTitle: "ስልክ ቁጥርዎ በካርዱ ላይ አይታይም።", privacyBody: "ገዢው ‘ያግኙ’ ሲጫን ብቻ ጥቅም ላይ ይውላል።", localTitle: "ማስታወቂያው በዚህ መሣሪያ ላይ ይቀመጣል።", localBody: "የፕሮጀክቱን ዳታቤዝ በኋላ እናገናኛለን።", publish: "ማስታወቂያ ለጥፍ", publishing: "በመለጠፍ ላይ…", failed: "ማስታወቂያውን መለጠፍ አልተቻለም።", successKicker: "ማስታወቂያው ተለጥፏል", successTitle: "ማስታወቂያዎ በገበያው ላይ ወጥቷል!", successBody: "አሁን በኢትዮጵያ የሚፈልጉትን ሰዎች ማግኘት ይችላል።", view: "ማስታወቂያውን ይመልከቱ", justNow: "አሁን", sellerRole: "ሻጭ", buyerRole: "ገዢ", brokerRole: "ደላላ",
  },
};

export default function PostAdFlow({ open, onClose, onComplete, defaultSeller = "", language }: Props) {
  const [step, setStep] = useState(0);
  const [transaction, setTransaction] = useState<TransactionType>("sell");
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [priceSuffix, setPriceSuffix] = useState("total");
  const [condition, setCondition] = useState("New");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [seller, setSeller] = useState(defaultSeller);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const t = postCopy[language];

  const selectedCategory = useMemo(() => listingCategories.find((item) => item.id === category), [category]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [loading, onClose, open]);

  if (!open) return null;

  function resetAndClose() {
    setStep(0);
    setTransaction("sell");
    setCategory("");
    setTitle("");
    setPrice("");
    setPriceSuffix("total");
    setCondition("New");
    setLocation("");
    setDescription("");
    setSeller(defaultSeller);
    setPhone("");
    setLoading(false);
    setSubmitError("");
    onClose();
  }

  function nextCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStep(1);
  }

  function selectTransaction(next: TransactionType) {
    setTransaction(next);
    setCondition(next === "buy" ? "Wanted" : next === "broker" ? "Service" : "New");
    if (next === "broker") setPriceSuffix("percent");
    else if (priceSuffix === "percent") setPriceSuffix("total");
  }

  function nextDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStep(2);
  }

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedCategory) return;
    setLoading(true);
    setSubmitError("");
    try {
      const draft = {
        title,
        category: selectedCategory.id,
        categoryLabel: getCategoryName(selectedCategory, language),
        transaction,
        price: Number(price),
        priceSuffix,
        location,
        seller,
        role: transaction === "broker" ? t.brokerRole : transaction === "buy" ? t.buyerRole : t.sellerRole,
        condition,
        description,
        icon: selectedCategory.icon,
        accent: selectedCategory.accent,
        phone,
      };
      await new Promise((resolve) => window.setTimeout(resolve, 550));
      onComplete({ ...draft, id: `local-${Date.now()}`, time: t.justNow, verified: false });
      setStep(3);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : t.failed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flow-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !loading) resetAndClose(); }}>
      <section className="flow-modal post-flow" role="dialog" aria-modal="true" aria-labelledby="post-ad-title">
        <button className="flow-close" type="button" onClick={resetAndClose} disabled={loading} aria-label={t.close}>×</button>
        <div className="flow-brand"><span>FE</span><div><strong>{t.brand}</strong><small>FUAD ESMART Marketplace</small></div></div>
        <StepIndicator current={step} steps={[t.type, t.details, t.confirm, t.finish]} />

        <div className="flow-panel" key={step}>
          {step === 0 && (
            <form onSubmit={nextCategory}>
              <div className="flow-heading"><span>{t.step} 01</span><h2 id="post-ad-title">{t.chooseTitle}</h2><p>{t.chooseIntro}</p></div>
              <div className="transaction-selector" role="radiogroup" aria-label={t.transactionAria}>
                <button type="button" role="radio" aria-checked={transaction === "sell"} className={transaction === "sell" ? "transaction-card active" : "transaction-card"} onClick={() => selectTransaction("sell")}><span>🏷️</span><strong>{t.sell}</strong><small>{t.sellHint}</small></button>
                <button type="button" role="radio" aria-checked={transaction === "buy"} className={transaction === "buy" ? "transaction-card active" : "transaction-card"} onClick={() => selectTransaction("buy")}><span>🛒</span><strong>{t.buy}</strong><small>{t.buyHint}</small></button>
                <button type="button" role="radio" aria-checked={transaction === "broker"} className={transaction === "broker" ? "transaction-card active" : "transaction-card"} onClick={() => selectTransaction("broker")}><span>🤝</span><strong>{t.broker}</strong><small>{t.brokerHint}</small></button>
              </div>
              <div className="post-category-grid" role="radiogroup" aria-label={t.categoryAria}>
                {listingCategories.map((item) => <button type="button" role="radio" aria-checked={category === item.id} className={category === item.id ? `post-category active ${item.accent}` : `post-category ${item.accent}`} key={item.id} onClick={() => setCategory(item.id)}><span>{item.icon}</span><strong>{getCategoryName(item, language)}</strong><small>{language === "en" ? item.oromo : item.label}</small></button>)}
              </div>
              <div className="flow-actions end"><button className="primary-action ripple" type="submit" disabled={!category}>{t.next} <span>→</span></button></div>
            </form>
          )}

          {step === 1 && selectedCategory && (
            <form onSubmit={nextDetails}>
              <div className="flow-heading"><span>{t.step} 02 · {getCategoryName(selectedCategory, language)}</span><h2 id="post-ad-title">{t.describeTitle}</h2><p>{t.describeIntro}</p></div>
              <div className="selected-role-banner listing-selection"><span>{selectedCategory.icon}</span><div><strong>{getCategoryName(selectedCategory, language)}</strong><small>{transaction === "sell" ? t.forSale : transaction === "buy" ? t.wanted : t.brokerOffer}</small></div><button type="button" onClick={() => setStep(0)}>{t.change}</button></div>
              <div className="field-grid">
                <label>{t.adTitle}<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={t.adPlaceholder} minLength={4} maxLength={80} required /></label>
                <div className="field-grid two-col no-gap-bottom">
                  <label>{t.price}<input type="number" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="0" min="0" required /></label>
                  <label>{t.unit}<select value={priceSuffix} onChange={(event) => setPriceSuffix(event.target.value)}><option value="total">{t.total}</option><option value="kg">{t.perKg}</option><option value="ton">{t.perTon}</option><option value="gram">{t.perGram}</option><option value="month">{t.perMonth}</option><option value="piece">{t.perPiece}</option><option value="percent">{t.commission}</option></select></label>
                </div>
                <div className="field-grid two-col no-gap-bottom">
                  <label>{t.condition}<select value={condition} onChange={(event) => setCondition(event.target.value)}><option value="New">{t.new}</option><option value="Used">{t.used}</option><option value="Fresh">{t.fresh}</option><option value="Available">{t.available}</option><option value="Wanted">{t.wanted}</option><option value="Service">{t.service}</option></select></label>
                  <label>{t.location}<select value={location} onChange={(event) => setLocation(event.target.value)} required><option value="" disabled>{t.chooseCity}</option>{locations.map((item) => <option key={item}>{item}</option>)}</select></label>
                </div>
                <label>{t.description}<textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder={t.descriptionPlaceholder} minLength={12} rows={4} required /></label>
              </div>
              <div className="flow-actions"><button className="secondary-action" type="button" onClick={() => setStep(0)}>← {t.back}</button><button className="primary-action ripple" type="submit">{t.next} <span>→</span></button></div>
            </form>
          )}

          {step === 2 && selectedCategory && (
            <form onSubmit={publish}>
              <div className="flow-heading"><span>{t.step} 03</span><h2 id="post-ad-title">{t.confirmTitle}</h2><p>{t.confirmIntro}</p></div>
              <div className="ad-preview-mini">
                <div className={`ad-preview-icon ${selectedCategory.accent}`}>{selectedCategory.icon}</div>
                <div><span>{transaction === "sell" ? t.sell.toUpperCase() : transaction === "buy" ? t.buy.toUpperCase() : t.broker.toUpperCase()} · {getCategoryName(selectedCategory, language)}</span><h3>{title}</h3><p>{location} · {condition}</p><strong>ETB {Number(price || 0).toLocaleString()} {priceSuffix !== "total" ? `/ ${priceSuffix}` : ""}</strong></div>
              </div>
              <div className="field-grid two-col compact-fields">
                <label>{t.contactName}<input value={seller} onChange={(event) => setSeller(event.target.value)} placeholder={t.contactPlaceholder} required /></label>
                <label>{t.phone}<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+251 9…" pattern="[+0-9 ]{9,}" required /></label>
              </div>
              <label className="confirm-check"><input type="checkbox" required /><span>{t.terms}</span></label>
              <div className="safe-note"><span>🔒</span><p><strong>{t.privacyTitle}</strong><br />{t.privacyBody}</p></div>
              <div className="local-mode-note"><span>⌁</span><p><strong>{t.localTitle}</strong><br />{t.localBody}</p></div>
              {submitError && <p className="flow-error" role="alert">{submitError}</p>}
              <div className="flow-actions"><button className="secondary-action" type="button" onClick={() => setStep(1)} disabled={loading}>← {t.back}</button><button className="primary-action ripple" type="submit" disabled={loading}>{loading ? <><i className="spinner" /> {t.publishing}</> : <>{t.publish} <span>↑</span></>}</button></div>
            </form>
          )}

          {step === 3 && (
            <div className="flow-success">
              <div className="success-orbit post-success"><span>↑</span></div>
              <p className="success-kicker">{t.successKicker}</p>
              <h2 id="post-ad-title">{t.successTitle}</h2>
              <p><strong>{title}</strong> {t.successBody}</p>
              <button className="primary-action wide ripple" type="button" onClick={resetAndClose}>{t.view} <span>→</span></button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
