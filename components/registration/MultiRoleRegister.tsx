"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import RoleSelector, { roleOptions, type RoleId } from "./RoleSelector";
import StepIndicator from "./StepIndicator";

export type RegistrationPayload = {
  role: RoleId;
  fullName: string;
  phone: string;
  region: string;
  businessName: string;
  specialty: string;
  experience: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onComplete: (payload: RegistrationPayload) => void;
  initialRole?: RoleId | null;
};

const specialtyLabels: Record<RoleId, { label: string; placeholder: string }> = {
  farmer: { label: "Oomisha qonnaa ijoo", placeholder: "Fkn: Buna, xaafii, kuduraa" },
  manufacturer: { label: "Oomisha ati oomishitu", placeholder: "Fkn: PVC pipe, furniture, packaging" },
  seller: { label: "Gosa daldalaa", placeholder: "Fkn: Meeshaa ijaarsaa, mana keessaa" },
  broker: { label: "Damee broker", placeholder: "Fkn: Mana, albuuda, qonna" },
  electronics: { label: "Gosa elektirooniksii", placeholder: "Fkn: Laptop, phone, solar" },
  mineral: { label: "Gosa albuudaa", placeholder: "Fkn: Warqee, marble, gemstone" },
  buyer: { label: "Wanta bituu barbaaddu", placeholder: "Fkn: Buna 5 ton, laptop 20" },
};

const regions = ["Addis Ababa", "Oromia", "Amhara", "Somali", "Sidama", "Tigray", "Afar", "Harari", "Dire Dawa", "Benishangul-Gumuz", "Gambela", "South Ethiopia"];

export default function MultiRoleRegister({ open, onClose, onComplete, initialRole = null }: Props) {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<RoleId | null>(initialRole);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [experience, setExperience] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const selectedRole = useMemo(() => roleOptions.find((item) => item.id === role), [role]);

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
    setRole(null);
    setFullName("");
    setPhone("");
    setRegion("");
    setBusinessName("");
    setSpecialty("");
    setExperience("");
    setLoading(false);
    setSubmitError("");
    onClose();
  }

  function nextFromInfo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStep(1);
  }

  function nextFromProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStep(2);
  }

  async function finishRegistration() {
    if (!role) return;
    setLoading(true);
    setSubmitError("");
    try {
      const payload = { role, fullName, phone, region, businessName, specialty, experience };
      await new Promise((resolve) => window.setTimeout(resolve, 550));
      setStep(3);
      onComplete(payload);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Galmeen hin milkoofne.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flow-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !loading) resetAndClose(); }}>
      <section className="flow-modal register-flow" role="dialog" aria-modal="true" aria-labelledby="registration-title">
        <button className="flow-close" type="button" onClick={resetAndClose} disabled={loading} aria-label="Close registration">×</button>
        <div className="flow-brand"><span>FE</span><div><strong>FUAD ESMART</strong><small>Multi-role registration</small></div></div>
        <StepIndicator current={step} />

        <div className="flow-panel" key={step}>
          {step === 0 && (
            <form onSubmit={nextFromInfo}>
              <div className="flow-heading"><span>STEP 01</span><h2 id="registration-title">Ati eenyuun galmaa&apos;uu barbaadda?</h2><p>Role kee fili; form si barbaachisu qofa siif mul&apos;ata.</p></div>
              <RoleSelector value={role} onChange={setRole} />
              <div className="field-grid two-col compact-fields">
                <label>Full name<input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Maqaa guutuu" required /></label>
                <label>Phone number<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+251 9…" pattern="[+0-9 ]{9,}" required /></label>
                <label>Region<select value={region} onChange={(event) => setRegion(event.target.value)} required><option value="" disabled>Region fili</option>{regions.map((item) => <option key={item}>{item}</option>)}</select></label>
                <label>Business / farm name<input value={businessName} onChange={(event) => setBusinessName(event.target.value)} placeholder="Yoo qabaatte" /></label>
              </div>
              <div className="flow-actions end"><button className="primary-action ripple" type="submit" disabled={!role}>Itti fufi <span>→</span></button></div>
            </form>
          )}

          {step === 1 && role && (
            <form onSubmit={nextFromProduct}>
              <div className="flow-heading"><span>STEP 02 · {selectedRole?.english}</span><h2 id="registration-title">Damee hojii kee nuuf ibsi.</h2><p>Odeeffannoon kun namoota sirrii waliin si wal qunnamsiisa.</p></div>
              <div className="selected-role-banner"><span>{selectedRole?.icon}</span><div><strong>{selectedRole?.label}</strong><small>{selectedRole?.description}</small></div><button type="button" onClick={() => setStep(0)}>Jijjiiri</button></div>
              <div className="field-grid">
                <label>{specialtyLabels[role].label}<input value={specialty} onChange={(event) => setSpecialty(event.target.value)} placeholder={specialtyLabels[role].placeholder} required /></label>
                <label>Muuxannoo / ibsa gabaabaa<textarea value={experience} onChange={(event) => setExperience(event.target.value)} placeholder="Waggaa meeqa, capacity, ykn wanta ati adda itti taate…" rows={4} required /></label>
              </div>
              <div className="flow-actions"><button className="secondary-action" type="button" onClick={() => setStep(0)}>← Duubatti</button><button className="primary-action ripple" type="submit">Itti fufi <span>→</span></button></div>
            </form>
          )}

          {step === 2 && role && (
            <div>
              <div className="flow-heading"><span>STEP 03</span><h2 id="registration-title">Karoora jalqabaa kee fili.</h2><p>Yeroo ammaaf galmeen fi maxxansi jalqabaa bilisa.</p></div>
              <div className="plan-card selected-plan"><div className="plan-top"><span className="plan-icon">✦</span><div><strong>FUAD Standard</strong><small>Marketplace irratti jalqabuuf</small></div><em>Recommended</em></div><div className="plan-price"><strong>ETB 0</strong><span>/ registration</span></div><ul><li>✓ Profile role tokko</li><li>✓ Maxxansa jalqabaa bilisa</li><li>✓ Buyer &amp; broker network</li><li>✓ Dashboard access yeroo itti aanu</li></ul></div>
              <div className="safe-note"><span>🛡️</span><p><strong>Kaffaltiin hin barbaachisu.</strong><br />Fuad Esmart yeroo kaffaltii online dabalutti odeeffannoo siif erga.</p></div>
              <div className="local-mode-note"><span>⌁</span><p><strong>Yeroo ammaaf device kana irratti kuufama.</strong><br />Database project keessaa yeroo biraa wal qunnamsiifna.</p></div>
              {submitError && <p className="flow-error" role="alert">{submitError}</p>}
              <div className="flow-actions"><button className="secondary-action" type="button" onClick={() => setStep(1)} disabled={loading}>← Duubatti</button><button className="primary-action ripple" type="button" onClick={finishRegistration} disabled={loading}>{loading ? <><i className="spinner" /> Galmeessaa jira…</> : <>Galmee xumuri <span>→</span></>}</button></div>
            </div>
          )}

          {step === 3 && (
            <div className="flow-success">
              <div className="success-orbit"><span>✓</span></div>
              <p className="success-kicker">GALMEEN MILKAA&apos;EERA</p>
              <h2 id="registration-title">Baga gara FUAD ESMART dhuftan!</h2>
              <p><strong>{fullName}</strong>, role <strong>{selectedRole?.label}</strong> ta&apos;uun galmooftetta. Amma maxxansa kee jalqabuu dandeessa.</p>
              <div className="success-summary"><span>{selectedRole?.icon}</span><div><small>Registered role</small><strong>{selectedRole?.english}</strong></div><div><small>Region</small><strong>{region}</strong></div></div>
              <button className="primary-action wide ripple" type="button" onClick={resetAndClose}>Marketplace seeni <span>→</span></button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
