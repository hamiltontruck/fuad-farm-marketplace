"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import {
  createListing,
  deleteListingImages,
  getSession,
  uploadListingImage,
} from "../../lib/supabase-browser";
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
  images?: string[];
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
  { id: "livestock", label: "Livestock & Animal Products", oromo: "Bu'aa horsiisa horii", amharic: "እንስሳትና የእንስሳት ውጤቶች", icon: "🐄", accent: "brown", count: "1.1K" },
] as const;

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
  initialTransaction?: TransactionType;
};

type Copy = Record<string, string>;

const locations = ["Addis Ababa", "Adama", "Dire Dawa", "Hawassa", "Bahir Dar", "Jigjiga", "Mekelle", "Jimma", "Shashemene", "Bishoftu"];

const postCopy: Record<Language, Copy> = {
  om: {
    close: "Unka maxxansaa cufi", brand: "MAXXANSA BAASI", type: "Gosa", details: "Odeeffannoo", confirm: "Mirkaneessi", finish: "Xumura", step: "TARKAANFII",
    chooseTitle: "Maal maxxansuu barbaadda?", chooseIntro: "Gosa daldalaa fi category kee filadhu.", transactionAria: "Gosa daldalaa", sell: "Gurguruu", sellHint: "Gurguruu barbaada", buy: "Bitachuu", buyHint: "Bitachuu barbaada", broker: "Broker", brokerHint: "Gama lamaan wal qunnamsiisa", categoryAria: "Category maxxansaa", next: "Itti fufi",
    describeTitle: "Maxxansa kee ibsi.", describeIntro: "Mata-duree, gatii, suuraa fi odeeffannoo ifaa galchi.", forSale: "Gurgurtaaf", wanted: "Barbaadama", brokerOffer: "Tajaajila broker", change: "Jijjiiri", adTitle: "Mata-duree maxxansaa", adPlaceholder: "Fkn: Samsung laptop haaraa gurgurama", price: "Gatii (ETB)", unit: "Safartuu gatii", total: "Waliigala", perKg: "Kiiloo", perTon: "Toonii", perGram: "Giraamii", perMonth: "Ji'a", perPiece: "Tokko", commission: "Komishinii %", condition: "Haala", new: "Haaraa", used: "Kan fayyadame", fresh: "Fresh", available: "Jira", service: "Tajaajila", location: "Bakka", chooseCity: "Magaalaa fili", description: "Ibsa", descriptionPlaceholder: "Qulqullina, baay'ina, geejjibaa fi odeeffannoo barbaachisaa…", photos: "Suuraa 1–5 (JPG, PNG, WebP; tokkoon 5 MB gadi)", photoRequired: "Suuraa 1 hanga 5 filadhu.", photoInvalid: "JPG, PNG ykn WebP qofa; suuraan tokko 5 MB caaluu hin qabu.", back: "Duubatti",
    confirmTitle: "Odeeffannoo mirkaneessi.", confirmIntro: "Contact sirrii galchi; maxxansi cloud database keessatti kuufama.", contactName: "Maqaa quunnamtii", contactPlaceholder: "Maqaa nama ykn company", phone: "Lakkoofsa bilbilaa", terms: "Odeeffannoon ani galche sirrii dha; seera marketplace nan fudhadha.", privacyTitle: "Maxxansi Supabase cloud keessatti kuufama.", privacyBody: "Browser fi mobile hunda irraa ni mul'ata; owner qofatu jijjiira ykn haqa.", cloudTitle: "Database + listing-images Storage", cloudBody: "Suuraan Storage keessatti, odeeffannoon listings table keessatti kuufama.", publish: "Maxxansa baasi", publishing: "Suuraa fi maxxansa kuusaa jira…", loginRequired: "Jalqaba FUAD account keetiin Login godhi.", failed: "Maxxansi hin milkoofne.", successKicker: "MAXXANSI MILKAA'EERA", successTitle: "Ad kee cloud marketplace irratti baheera!", successBody: "amma browser fi mobile hunda irraa mul'ata.", view: "Maxxansa ilaali", justNow: "Amma", sellerRole: "Gurguraa", buyerRole: "Bitataa", brokerRole: "Broker",
  },
  en: {
    close: "Close post form", brand: "POST AD", type: "Type", details: "Details", confirm: "Confirm", finish: "Finish", step: "STEP",
    chooseTitle: "What would you like to post?", chooseIntro: "Choose the trade type and category.", transactionAria: "Trade type", sell: "Sell", sellHint: "I want to sell", buy: "Buy", buyHint: "I want to buy", broker: "Broker", brokerHint: "I connect both sides", categoryAria: "Listing category", next: "Continue",
    describeTitle: "Describe your listing.", describeIntro: "Add a title, price, photos and useful details.", forSale: "For sale", wanted: "Wanted", brokerOffer: "Broker offer", change: "Change", adTitle: "Ad title", adPlaceholder: "Example: New Samsung laptop for sale", price: "Price (ETB)", unit: "Price unit", total: "Total", perKg: "Per kg", perTon: "Per ton", perGram: "Per gram", perMonth: "Per month", perPiece: "Per piece", commission: "Commission %", condition: "Condition", new: "New", used: "Used", fresh: "Fresh", available: "Available", service: "Service", location: "Location", chooseCity: "Choose a city", description: "Description", descriptionPlaceholder: "Quality, quantity, delivery and other useful details…", photos: "1–5 photos (JPG, PNG, WebP; max 5 MB each)", photoRequired: "Choose between one and five photos.", photoInvalid: "Use JPG, PNG or WebP; each photo must be 5 MB or smaller.", back: "Back",
    confirmTitle: "Confirm your information.", confirmIntro: "Add correct contact details; the listing will be stored in the cloud.", contactName: "Contact name", contactPlaceholder: "Person or company name", phone: "Phone number", terms: "The information is correct and I accept the marketplace rules.", privacyTitle: "This listing is stored in Supabase cloud.", privacyBody: "It appears across browsers and only the owner can edit or delete it.", cloudTitle: "Database + listing-images Storage", cloudBody: "Photos go to Storage and listing details go to the listings table.", publish: "Publish ad", publishing: "Uploading photos and listing…", loginRequired: "Sign in to your FUAD account first.", failed: "The listing could not be published.", successKicker: "LISTING PUBLISHED", successTitle: "Your ad is live in the cloud marketplace!", successBody: "is now visible across phones and browsers.", view: "View listing", justNow: "Just now", sellerRole: "Seller", buyerRole: "Buyer", brokerRole: "Broker",
  },
  am: {
    close: "የማስታወቂያ ቅጹን ዝጋ", brand: "ማስታወቂያ ለጥፍ", type: "ዓይነት", details: "ዝርዝር", confirm: "አረጋግጥ", finish: "ጨርስ", step: "ደረጃ",
    chooseTitle: "ምን መለጠፍ ይፈልጋሉ?", chooseIntro: "የንግድ ዓይነትና ምድብ ይምረጡ።", transactionAria: "የንግድ ዓይነት", sell: "መሸጥ", sellHint: "መሸጥ እፈልጋለሁ", buy: "መግዛት", buyHint: "መግዛት እፈልጋለሁ", broker: "ደላላ", brokerHint: "ገዢና ሻጭን አገናኛለሁ", categoryAria: "የማስታወቂያ ምድብ", next: "ቀጥል",
    describeTitle: "ማስታወቂያዎን ይግለጹ።", describeIntro: "ርዕስ፣ ዋጋ፣ ፎቶና ጠቃሚ መረጃ ያስገቡ።", forSale: "ለሽያጭ", wanted: "ይፈለጋል", brokerOffer: "የደላላ አገልግሎት", change: "ቀይር", adTitle: "የማስታወቂያ ርዕስ", adPlaceholder: "ለምሳሌ፦ Samsung laptop ለሽያጭ", price: "ዋጋ (ETB)", unit: "የዋጋ መለኪያ", total: "ጠቅላላ", perKg: "በኪሎ", perTon: "በቶን", perGram: "በግራም", perMonth: "በወር", perPiece: "በአንድ", commission: "ኮሚሽን %", condition: "ሁኔታ", new: "አዲስ", used: "ያገለገለ", fresh: "ትኩስ", available: "ይገኛል", service: "አገልግሎት", location: "ቦታ", chooseCity: "ከተማ ይምረጡ", description: "መግለጫ", descriptionPlaceholder: "ጥራት፣ ብዛት፣ መላኪያና ጠቃሚ መረጃ…", photos: "1–5 ፎቶ (JPG, PNG, WebP፤ እያንዳንዱ ከ5 MB በታች)", photoRequired: "ከ1 እስከ 5 ፎቶ ይምረጡ።", photoInvalid: "JPG, PNG ወይም WebP ብቻ፤ እያንዳንዱ ከ5 MB በታች መሆን አለበት።", back: "ተመለስ",
    confirmTitle: "መረጃውን ያረጋግጡ።", confirmIntro: "ትክክለኛ መገኛ ያስገቡ፤ ማስታወቂያው cloud ውስጥ ይቀመጣል።", contactName: "የመገኛ ስም", contactPlaceholder: "የሰው ወይም የድርጅት ስም", phone: "ስልክ ቁጥር", terms: "መረጃው ትክክል ነው፤ የገበያውን ደንብ ተቀብያለሁ።", privacyTitle: "ማስታወቂያው በSupabase cloud ይቀመጣል።", privacyBody: "በሁሉም browser ይታያል፤ owner ብቻ ማስተካከልና ማጥፋት ይችላል።", cloudTitle: "Database + listing-images Storage", cloudBody: "ፎቶዎች Storage ውስጥ፣ ዝርዝሩ listings table ውስጥ ይቀመጣል።", publish: "ማስታወቂያ ለጥፍ", publishing: "ፎቶና ማስታወቂያ በመጫን ላይ…", loginRequired: "መጀመሪያ ወደ FUAD account ይግቡ።", failed: "ማስታወቂያው አልተሳካም።", successKicker: "ማስታወቂያው ወጥቷል", successTitle: "ማስታወቂያዎ በcloud marketplace ላይ ወጥቷል!", successBody: "አሁን በሁሉም ስልክና browser ላይ ይታያል።", view: "ማስታወቂያውን ይመልከቱ", justNow: "አሁን", sellerRole: "ሻጭ", buyerRole: "ገዢ", brokerRole: "ደላላ",
  },
};

function isValidImage(file: File) {
  return ["image/jpeg", "image/png", "image/webp"].includes(file.type) && file.size <= 5 * 1024 * 1024;
}

export default function PostAdFlow({ open, onClose, onComplete, defaultSeller = "", language, initialTransaction = "sell" }: Props) {
  const [step, setStep] = useState(0);
  const [transaction, setTransaction] = useState<TransactionType>(initialTransaction);
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [priceSuffix, setPriceSuffix] = useState(initialTransaction === "broker" ? "percent" : "total");
  const [condition, setCondition] = useState(initialTransaction === "buy" ? "Wanted" : initialTransaction === "broker" ? "Service" : "New");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [seller, setSeller] = useState(defaultSeller);
  const [phone, setPhone] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const t = postCopy[language];

  const selectedCategory = useMemo(() => listingCategories.find((item) => item.id === category), [category]);
  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  useEffect(() => {
    if (!open) return;
    setTransaction(initialTransaction);
    setSeller(defaultSeller);
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
  }, [defaultSeller, initialTransaction, loading, onClose, open]);

  if (!open) return null;

  function resetAndClose() {
    setStep(0);
    setTransaction(initialTransaction);
    setCategory("");
    setTitle("");
    setPrice("");
    setPriceSuffix(initialTransaction === "broker" ? "percent" : "total");
    setCondition(initialTransaction === "buy" ? "Wanted" : initialTransaction === "broker" ? "Service" : "New");
    setLocation("");
    setDescription("");
    setSeller(defaultSeller);
    setPhone("");
    setFiles([]);
    setLoading(false);
    setSubmitError("");
    onClose();
  }

  function choosePhotos(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []).slice(0, 5);
    setFiles(selected);
    setSubmitError(selected.length && selected.every(isValidImage) ? "" : t.photoInvalid);
  }

  function selectTransaction(next: TransactionType) {
    setTransaction(next);
    setCondition(next === "buy" ? "Wanted" : next === "broker" ? "Service" : "New");
    if (next === "broker") setPriceSuffix("percent");
    else if (priceSuffix === "percent") setPriceSuffix("total");
  }

  function nextDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (files.length < 1 || files.length > 5) {
      setSubmitError(t.photoRequired);
      return;
    }
    if (!files.every(isValidImage)) {
      setSubmitError(t.photoInvalid);
      return;
    }
    setSubmitError("");
    setStep(2);
  }

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedCategory) return;
    setLoading(true);
    setSubmitError("");
    let uploadedUrls: string[] = [];
    try {
      const session = await getSession();
      if (!session) throw new Error(t.loginRequired);

      for (const file of files) {
        const uploaded = await uploadListingImage(session, file);
        uploadedUrls.push(uploaded.url);
      }

      const roleLabel = transaction === "broker" ? t.brokerRole : transaction === "buy" ? t.buyerRole : t.sellerRole;
      const saved = await createListing(session, {
        title,
        category: selectedCategory.id,
        category_label: getCategoryName(selectedCategory, language),
        transaction,
        price: Number(price),
        price_suffix: priceSuffix,
        location,
        seller_name: seller,
        phone,
        role_label: roleLabel,
        condition,
        description,
        image_urls: uploadedUrls,
      });

      onComplete({
        id: saved.id,
        title: saved.title,
        category: saved.category,
        categoryLabel: saved.categoryLabel,
        transaction: saved.transaction as TransactionType,
        price: saved.price,
        priceSuffix: saved.priceSuffix,
        location: saved.location,
        seller: saved.seller,
        phone: saved.phone,
        role: saved.role,
        condition: saved.condition,
        description: saved.description,
        icon: saved.icon,
        accent: saved.accent,
        images: saved.images,
        time: t.justNow,
        verified: saved.verified,
        sample: false,
      });
      setStep(3);
    } catch (error) {
      const session = await getSession();
      if (session && uploadedUrls.length) await deleteListingImages(session, uploadedUrls).catch(() => undefined);
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
            <form onSubmit={(event) => { event.preventDefault(); setStep(1); }}>
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
                <label className="ops-photo-input">{t.photos}<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={choosePhotos} required />{previews.length > 0 && <span className="ops-photo-preview">{previews.map((url, index) => <img src={url} alt={`Preview ${index + 1}`} key={url} />)}</span>}</label>
              </div>
              {submitError && <p className="flow-error" role="alert">{submitError}</p>}
              <div className="flow-actions"><button className="secondary-action" type="button" onClick={() => setStep(0)}>← {t.back}</button><button className="primary-action ripple" type="submit">{t.next} <span>→</span></button></div>
            </form>
          )}

          {step === 2 && selectedCategory && (
            <form onSubmit={publish}>
              <div className="flow-heading"><span>{t.step} 03</span><h2 id="post-ad-title">{t.confirmTitle}</h2><p>{t.confirmIntro}</p></div>
              <div className="ad-preview-mini"><div className={`ad-preview-icon ${selectedCategory.accent}`}>{previews[0] ? <img src={previews[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 18 }} /> : selectedCategory.icon}</div><div><span>{transaction === "sell" ? t.sell.toUpperCase() : transaction === "buy" ? t.buy.toUpperCase() : t.broker.toUpperCase()} · {getCategoryName(selectedCategory, language)}</span><h3>{title}</h3><p>{location} · {condition}</p><strong>ETB {Number(price || 0).toLocaleString()} {priceSuffix !== "total" ? `/ ${priceSuffix}` : ""}</strong></div></div>
              <div className="field-grid two-col compact-fields">
                <label>{t.contactName}<input value={seller} onChange={(event) => setSeller(event.target.value)} placeholder={t.contactPlaceholder} required /></label>
                <label>{t.phone}<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+251 9…" pattern="[+0-9 ]{9,}" required /></label>
              </div>
              <label className="confirm-check"><input type="checkbox" required /><span>{t.terms}</span></label>
              <div className="safe-note"><span>🔒</span><p><strong>{t.privacyTitle}</strong><br />{t.privacyBody}</p></div>
              <div className="local-mode-note"><span>☁</span><p><strong>{t.cloudTitle}</strong><br />{t.cloudBody}</p></div>
              {submitError && <p className="flow-error" role="alert">{submitError}</p>}
              <div className="flow-actions"><button className="secondary-action" type="button" onClick={() => setStep(1)} disabled={loading}>← {t.back}</button><button className="primary-action ripple" type="submit" disabled={loading}>{loading ? <><i className="spinner" /> {t.publishing}</> : <>{t.publish} <span>↑</span></>}</button></div>
            </form>
          )}

          {step === 3 && (
            <div className="flow-success"><div className="success-orbit post-success"><span>↑</span></div><p className="success-kicker">{t.successKicker}</p><h2 id="post-ad-title">{t.successTitle}</h2><p><strong>{title}</strong> {t.successBody}</p><button className="primary-action wide ripple" type="button" onClick={resetAndClose}>{t.view} <span>→</span></button></div>
          )}
        </div>
      </section>
    </div>
  );
}
