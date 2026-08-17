"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

type Props = { defaultSeller: string };

type UploadResult = { url?: string; error?: string };
type ListingResult = { listing?: { id: number | string; title: string }; error?: string };

const categories = [
  { id: "mineral", label: "Albuuda / Mineral", icon: "🪨", accent: "violet" },
  { id: "electronics", label: "Elektirooniksii", icon: "💻", accent: "blue" },
  { id: "farm", label: "Oomisha qonnaa", icon: "🌾", accent: "green" },
  { id: "construction", label: "Meeshaa ijaarsaa", icon: "🏗️", accent: "orange" },
  { id: "property", label: "Mana fi lafa", icon: "🏠", accent: "rose" },
  { id: "manufactured", label: "Oomisha warshaa", icon: "🏭", accent: "slate" },
  { id: "broker", label: "Tajaajila broker", icon: "🤝", accent: "teal" },
  { id: "buyer", label: "Barbaacha bitataa", icon: "🛒", accent: "gold" },
  { id: "livestock", label: "Horii fi bu'aa horii", icon: "🐄", accent: "brown" },
];

export default function DatabasePostForm({ defaultSeller }: Props) {
  const [transaction, setTransaction] = useState("sell");
  const [category, setCategory] = useState("farm");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [priceSuffix, setPriceSuffix] = useState("total");
  const [condition, setCondition] = useState("New");
  const [location, setLocation] = useState("");
  const [seller, setSeller] = useState(defaultSeller);
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedCategory = categories.find((item) => item.id === category) ?? categories[0];
  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  function choosePhotos(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []).slice(0, 5);
    setFiles(selected);
    setError(selected.some((file) => file.size > 5 * 1024 * 1024) ? "Suuraan tokko 5 MB caaluu hin qabu." : "");
  }

  async function uploadPhoto(file: File): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/uploads", { method: "POST", body: form });
    const payload = (await response.json()) as UploadResult;
    if (!response.ok || !payload.url) throw new Error(payload.error ?? "Photo upload failed.");
    return payload.url;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (files.length < 1 || files.length > 5) {
      setError("Suuraa 1 hanga 5 filadhu.");
      return;
    }
    if (files.some((file) => file.size > 5 * 1024 * 1024)) {
      setError("Suuraan tokko 5 MB caaluu hin qabu.");
      return;
    }

    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const images: string[] = [];
      for (const file of files) images.push(await uploadPhoto(file));

      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          categoryLabel: selectedCategory.label,
          transaction,
          price: Number(price),
          priceSuffix,
          location,
          seller,
          phone,
          role: transaction === "broker" ? "Broker" : transaction === "buy" ? "Buyer" : "Seller",
          condition,
          description,
          icon: selectedCategory.icon,
          accent: selectedCategory.accent,
          images,
        }),
      });
      const payload = (await response.json()) as ListingResult;
      if (!response.ok || !payload.listing) throw new Error(payload.error ?? "Maxxansa kuusuu hin dandeenye.");

      setSuccess(`Maxxansi #${payload.listing.id} database fi photo storage keessatti kuufameera.`);
      setTitle("");
      setPrice("");
      setLocation("");
      setPhone("");
      setDescription("");
      setFiles([]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Maxxansi hin milkoofne.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="ops-card" onSubmit={submit}>
      <div className="ops-note">Account kee ChatGPT identity waliin walqabatee jira. Maxxansi kun browser hundarra mul'ata; suuraan R2 keessatti, odeeffannoon D1 keessatti kuufama.</div>
      <div className="ops-grid" style={{ marginTop: 18 }}>
        <label className="ops-field">Gosa daldalaa
          <select value={transaction} onChange={(event) => setTransaction(event.target.value)}>
            <option value="sell">Gurgurtaa</option><option value="buy">Barbaacha bitataa</option><option value="broker">Broker</option>
          </select>
        </label>
        <label className="ops-field">Category
          <select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option value={item.id} key={item.id}>{item.icon} {item.label}</option>)}</select>
        </label>
        <label className="ops-field ops-span-2">Mata-duree
          <input value={title} onChange={(event) => setTitle(event.target.value)} minLength={4} maxLength={80} required placeholder="Fkn: Sibiila 12mm gurgurama" />
        </label>
        <label className="ops-field">Gatii ETB
          <input type="number" min="0" value={price} onChange={(event) => setPrice(event.target.value)} required />
        </label>
        <label className="ops-field">Safartuu gatii
          <select value={priceSuffix} onChange={(event) => setPriceSuffix(event.target.value)}><option value="total">Waliigala</option><option value="kg">Kiiloo</option><option value="ton">Toonii</option><option value="piece">Tokko</option><option value="month">Ji'a</option><option value="percent">Komishinii %</option></select>
        </label>
        <label className="ops-field">Haala
          <select value={condition} onChange={(event) => setCondition(event.target.value)}><option>New</option><option>Used</option><option>Fresh</option><option>Available</option><option>Wanted</option><option>Service</option></select>
        </label>
        <label className="ops-field">Bakka
          <input value={location} onChange={(event) => setLocation(event.target.value)} required placeholder="Adama" />
        </label>
        <label className="ops-field">Maqaa gurguraa/company
          <input value={seller} onChange={(event) => setSeller(event.target.value)} minLength={2} required />
        </label>
        <label className="ops-field">Bilbila
          <input value={phone} onChange={(event) => setPhone(event.target.value)} minLength={9} required placeholder="+2519..." />
        </label>
        <label className="ops-field ops-span-2">Ibsa
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} minLength={12} rows={5} required placeholder="Qulqullina, baay'ina, geejjiba fi odeeffannoo barbaachisaa..." />
        </label>
        <label className="ops-field ops-span-2 ops-photo-input">Suuraa 1–5 (JPG, PNG, WebP; tokkoon 5 MB gadi)
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={choosePhotos} required />
          {previews.length > 0 && <span className="ops-photo-preview">{previews.map((url, index) => <img src={url} alt={`Preview ${index + 1}`} key={url} />)}</span>}
        </label>
      </div>
      {error && <p className="ops-alert" role="alert">{error}</p>}
      {success && <p className="ops-success">{success} <a href="/my-listings">Maxxansa koo ilaali →</a></p>}
      <div className="ops-actions"><button className="ops-button" type="submit" disabled={busy}>{busy ? "Suuraa fi maxxansa kuusaa jira…" : "Database keessatti maxxansi"}</button></div>
    </form>
  );
}
