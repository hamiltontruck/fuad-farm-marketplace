"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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
  { id: "mineral", label: "Mineral", oromo: "Albuuda", icon: "🪨", accent: "violet", count: "1.2K" },
  { id: "electronics", label: "Electronics", oromo: "Elektirooniksii", icon: "💻", accent: "blue", count: "4.8K" },
  { id: "farm", label: "Farm Products", oromo: "Oomisha qonnaa", icon: "🌾", accent: "green", count: "3.4K" },
  { id: "construction", label: "Construction", oromo: "Meeshaa ijaarsaa", icon: "🏗️", accent: "orange", count: "2.1K" },
  { id: "property", label: "Property & Houses", oromo: "Mana fi lafa", icon: "🏠", accent: "rose", count: "1.9K" },
  { id: "manufactured", label: "Manufactured", oromo: "Oomisha warshaa", icon: "🏭", accent: "slate", count: "1.5K" },
  { id: "broker", label: "Broker Services", oromo: "Tajaajila broker", icon: "🤝", accent: "teal", count: "980" },
  { id: "buyer", label: "Buy Requests", oromo: "Barbaacha bitataa", icon: "🛒", accent: "gold", count: "740" },
  { id: "livestock", label: "Livestock & Animal Products", oromo: "Bu’aa horsiisa horii", icon: "🐄", accent: "brown", count: "1.1K" },
];

type Props = {
  open: boolean;
  onClose: () => void;
  onComplete: (listing: Listing) => void;
  defaultSeller?: string;
};

const locations = ["Addis Ababa", "Adama", "Dire Dawa", "Hawassa", "Bahir Dar", "Jigjiga", "Mekelle", "Jimma", "Shashemene", "Bishoftu"];

export default function PostAdFlow({ open, onClose, onComplete, defaultSeller = "" }: Props) {
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
        categoryLabel: selectedCategory.label,
        transaction,
        price: Number(price),
        priceSuffix,
        location,
        seller,
        role: transaction === "broker" ? "Broker" : transaction === "buy" ? "Buyer" : "Seller",
        condition,
        description,
        icon: selectedCategory.icon,
        accent: selectedCategory.accent,
        phone,
      };
      await new Promise((resolve) => window.setTimeout(resolve, 550));
      onComplete({ ...draft, id: `local-${Date.now()}`, time: "Just now", verified: false });
      setStep(3);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Maxxansi hin milkoofne.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flow-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !loading) resetAndClose(); }}>
      <section className="flow-modal post-flow" role="dialog" aria-modal="true" aria-labelledby="post-ad-title">
        <button className="flow-close" type="button" onClick={resetAndClose} disabled={loading} aria-label="Close post ad form">×</button>
        <div className="flow-brand"><span>FE</span><div><strong>POST AD</strong><small>FUAD ESMART Marketplace</small></div></div>
        <StepIndicator current={step} steps={["Gosa", "Odeeffannoo", "Mirkaneessi", "Xumura"]} />

        <div className="flow-panel" key={step}>
          {step === 0 && (
            <form onSubmit={nextCategory}>
              <div className="flow-heading"><span>STEP 01</span><h2 id="post-ad-title">Maal maxxansuu barbaadda?</h2><p>Gosa daldalaa fi category kee filadhu.</p></div>
              <div className="transaction-selector" role="radiogroup" aria-label="Listing transaction type">
                <button type="button" role="radio" aria-checked={transaction === "sell"} className={transaction === "sell" ? "transaction-card active" : "transaction-card"} onClick={() => selectTransaction("sell")}><span>🏷️</span><strong>Gurguruu</strong><small>I want to sell</small></button>
                <button type="button" role="radio" aria-checked={transaction === "buy"} className={transaction === "buy" ? "transaction-card active" : "transaction-card"} onClick={() => selectTransaction("buy")}><span>🛒</span><strong>Bitachuu</strong><small>I want to buy</small></button>
                <button type="button" role="radio" aria-checked={transaction === "broker"} className={transaction === "broker" ? "transaction-card active" : "transaction-card"} onClick={() => selectTransaction("broker")}><span>🤝</span><strong>Broker</strong><small>I connect both sides</small></button>
              </div>
              <div className="post-category-grid" role="radiogroup" aria-label="Listing category">
                {listingCategories.map((item) => <button type="button" role="radio" aria-checked={category === item.id} className={category === item.id ? `post-category active ${item.accent}` : `post-category ${item.accent}`} key={item.id} onClick={() => setCategory(item.id)}><span>{item.icon}</span><strong>{item.oromo}</strong><small>{item.label}</small></button>)}
              </div>
              <div className="flow-actions end"><button className="primary-action ripple" type="submit" disabled={!category}>Itti fufi <span>→</span></button></div>
            </form>
          )}

          {step === 1 && selectedCategory && (
            <form onSubmit={nextDetails}>
              <div className="flow-heading"><span>STEP 02 · {selectedCategory.label}</span><h2 id="post-ad-title">Maxxansa kee ibsi.</h2><p>Maqaa gabaabaa, gatii fi odeeffannoo ifaa galchi.</p></div>
              <div className="selected-role-banner listing-selection"><span>{selectedCategory.icon}</span><div><strong>{selectedCategory.oromo}</strong><small>{transaction === "sell" ? "For sale" : transaction === "buy" ? "Wanted" : "Broker offer"}</small></div><button type="button" onClick={() => setStep(0)}>Jijjiiri</button></div>
              <div className="field-grid">
                <label>Ad title<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Fkn: Samsung laptop haaraa gurgurama" minLength={4} maxLength={80} required /></label>
                <div className="field-grid two-col no-gap-bottom">
                  <label>Price (ETB)<input type="number" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="0" min="0" required /></label>
                  <label>Price unit<select value={priceSuffix} onChange={(event) => setPriceSuffix(event.target.value)}><option value="total">Total price</option><option value="kg">Per kg</option><option value="ton">Per ton</option><option value="gram">Per gram</option><option value="month">Per month</option><option value="piece">Per piece</option><option value="percent">Commission %</option></select></label>
                </div>
                <div className="field-grid two-col no-gap-bottom">
                  <label>Condition<select value={condition} onChange={(event) => setCondition(event.target.value)}><option>New</option><option>Used</option><option>Fresh</option><option>Available</option><option>Wanted</option><option>Service</option></select></label>
                  <label>Location<select value={location} onChange={(event) => setLocation(event.target.value)} required><option value="" disabled>City fili</option>{locations.map((item) => <option key={item}>{item}</option>)}</select></label>
                </div>
                <label>Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Quality, quantity, delivery fi odeeffannoo barbaachisaa…" minLength={12} rows={4} required /></label>
              </div>
              <div className="flow-actions"><button className="secondary-action" type="button" onClick={() => setStep(0)}>← Duubatti</button><button className="primary-action ripple" type="submit">Itti fufi <span>→</span></button></div>
            </form>
          )}

          {step === 2 && selectedCategory && (
            <form onSubmit={publish}>
              <div className="flow-heading"><span>STEP 03</span><h2 id="post-ad-title">Odeeffannoo mirkaneessi.</h2><p>Buyer ykn seller si quunnamuuf contact sirrii galchi.</p></div>
              <div className="ad-preview-mini">
                <div className={`ad-preview-icon ${selectedCategory.accent}`}>{selectedCategory.icon}</div>
                <div><span>{transaction.toUpperCase()} · {selectedCategory.label}</span><h3>{title}</h3><p>{location} · {condition}</p><strong>ETB {Number(price || 0).toLocaleString()} {priceSuffix !== "total" ? `/ ${priceSuffix}` : ""}</strong></div>
              </div>
              <div className="field-grid two-col compact-fields">
                <label>Contact name<input value={seller} onChange={(event) => setSeller(event.target.value)} placeholder="Maqaa nama ykn company" required /></label>
                <label>Phone number<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+251 9…" pattern="[+0-9 ]{9,}" required /></label>
              </div>
              <label className="confirm-check"><input type="checkbox" required /><span>Odeeffannoon ani galche sirrii dha; seera marketplace nan fudhadha.</span></label>
              <div className="safe-note"><span>🔒</span><p><strong>Lakkoofsi bilbilaa kee card irratti hin mul&apos;atu.</strong><br />Buyer “Contact” yeroo tuqu qofa itti fayyadama.</p></div>
              <div className="local-mode-note"><span>⌁</span><p><strong>Maxxansi device kana irratti kuufama.</strong><br />Database project keessaa yeroo biraa wal qunnamsiifna.</p></div>
              {submitError && <p className="flow-error" role="alert">{submitError}</p>}
              <div className="flow-actions"><button className="secondary-action" type="button" onClick={() => setStep(1)} disabled={loading}>← Duubatti</button><button className="primary-action ripple" type="submit" disabled={loading}>{loading ? <><i className="spinner" /> Maxxansaa jira…</> : <>Maxxansa baasi <span>↑</span></>}</button></div>
            </form>
          )}

          {step === 3 && (
            <div className="flow-success">
              <div className="success-orbit post-success"><span>↑</span></div>
              <p className="success-kicker">MAXXANSI MILKAA&apos;EERA</p>
              <h2 id="post-ad-title">Ad kee marketplace irratti baheera!</h2>
              <p><strong>{title}</strong> amma namoota Ethiopia keessatti barbaadan bira ga&apos;uu danda&apos;a.</p>
              <button className="primary-action wide ripple" type="button" onClick={resetAndClose}>Maxxansa ilaali <span>→</span></button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
