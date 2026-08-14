"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Language } from "../../lib/i18n";
import RoleSelector, { getRoleDescription, getRoleName, roleOptions, type RoleId } from "./RoleSelector";
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
  language: Language;
};

const specialtyLabels: Record<Language, Record<RoleId, { label: string; placeholder: string }>> = {
  om: {
    farmer: { label: "Oomisha qonnaa ijoo", placeholder: "Fkn: Buna, xaafii, kuduraa" }, manufacturer: { label: "Oomisha ati oomishitu", placeholder: "Fkn: PVC pipe, furniture, packaging" }, seller: { label: "Gosa daldalaa", placeholder: "Fkn: Meeshaa ijaarsaa, mana keessaa" }, broker: { label: "Damee broker", placeholder: "Fkn: Mana, albuuda, qonna" }, electronics: { label: "Gosa elektirooniksii", placeholder: "Fkn: Laptop, phone, solar" }, mineral: { label: "Gosa albuudaa", placeholder: "Fkn: Warqee, marble, gemstone" }, buyer: { label: "Wanta bituu barbaaddu", placeholder: "Fkn: Buna 5 ton, laptop 20" },
  },
  en: {
    farmer: { label: "Main farm product", placeholder: "Example: Coffee, teff, vegetables" }, manufacturer: { label: "Products you manufacture", placeholder: "Example: PVC pipes, furniture, packaging" }, seller: { label: "Type of business", placeholder: "Example: Construction or household materials" }, broker: { label: "Brokerage sector", placeholder: "Example: Property, mineral, agriculture" }, electronics: { label: "Electronics type", placeholder: "Example: Laptop, phone, solar" }, mineral: { label: "Mineral type", placeholder: "Example: Gold, marble, gemstone" }, buyer: { label: "What you want to buy", placeholder: "Example: 5 tons of coffee, 20 laptops" },
  },
  am: {
    farmer: { label: "ዋና የእርሻ ምርት", placeholder: "ለምሳሌ፦ ቡና፣ ጤፍ፣ አትክልት" }, manufacturer: { label: "የሚያመርቱት ምርት", placeholder: "ለምሳሌ፦ PVC ቱቦ፣ ፈርኒቸር፣ ማሸጊያ" }, seller: { label: "የንግድ ዓይነት", placeholder: "ለምሳሌ፦ የግንባታ ወይም የቤት ዕቃ" }, broker: { label: "የደላላ ዘርፍ", placeholder: "ለምሳሌ፦ ቤት፣ ማዕድን፣ እርሻ" }, electronics: { label: "የኤሌክትሮኒክስ ዓይነት", placeholder: "ለምሳሌ፦ Laptop፣ phone፣ solar" }, mineral: { label: "የማዕድን ዓይነት", placeholder: "ለምሳሌ፦ ወርቅ፣ marble፣ gemstone" }, buyer: { label: "መግዛት የሚፈልጉት", placeholder: "ለምሳሌ፦ 5 ቶን ቡና፣ 20 laptop" },
  },
};

const regions = ["Addis Ababa", "Oromia", "Amhara", "Somali", "Sidama", "Tigray", "Afar", "Harari", "Dire Dawa", "Benishangul-Gumuz", "Gambela", "South Ethiopia"];

const registerCopy: Record<Language, Record<string, string>> = {
  om: {
    close: "Galmee cufi", subtitle: "Galmee gahee hedduu", info: "Odeeffannoo", product: "Oomisha", plan: "Karoora", finish: "Xumura", step: "TARKAANFII", who: "Ati eenyuun galmaa’uu barbaadda?", whoIntro: "Role kee fili; form si barbaachisu qofa siif mul’ata.", fullName: "Maqaa guutuu", fullPlaceholder: "Maqaa guutuu", phone: "Lakkoofsa bilbilaa", region: "Naannoo", chooseRegion: "Naannoo fili", business: "Maqaa daldalaa / farm", optional: "Yoo qabaatte", next: "Itti fufi", describe: "Damee hojii kee nuuf ibsi.", describeIntro: "Odeeffannoon kun namoota sirrii waliin si wal qunnamsiisa.", change: "Jijjiiri", experience: "Muuxannoo / ibsa gabaabaa", experiencePlaceholder: "Waggaa meeqa, capacity, ykn wanta ati adda itti taate…", back: "Duubatti", choosePlan: "Karoora jalqabaa kee fili.", planIntro: "Yeroo ammaaf galmeen fi maxxansi jalqabaa bilisa.", standard: "Marketplace irratti jalqabuuf", recommended: "Filannoo gaarii", registration: "galmee", featureRole: "Profile role tokko", featureAd: "Maxxansa jalqabaa bilisa", featureNetwork: "Buyer fi broker network", featureDashboard: "Dashboard yeroo itti aanu", noPayment: "Kaffaltiin hin barbaachisu.", paymentBody: "Fuad Esmart yeroo kaffaltii online dabalutti odeeffannoo siif erga.", localTitle: "Yeroo ammaaf device kana irratti kuufama.", localBody: "Database project keessaa yeroo biraa wal qunnamsiifna.", submitting: "Galmeessaa jira…", complete: "Galmee xumuri", failed: "Galmeen hin milkoofne.", successKicker: "GALMEEN MILKAA’EERA", welcome: "Baga gara FUAD ESMART dhuftan!", successBeforeRole: "gahee", successAfterRole: "ta’uun galmooftetta. Amma maxxansa kee jalqabuu dandeessa.", registeredRole: "Gahee galmaa’e", regionLabel: "Naannoo", enter: "Marketplace seeni",
  },
  en: {
    close: "Close registration", subtitle: "Multi-role registration", info: "Information", product: "Business", plan: "Plan", finish: "Finish", step: "STEP", who: "Which role would you like to register as?", whoIntro: "Choose your role and we will show only the form you need.", fullName: "Full name", fullPlaceholder: "Your full name", phone: "Phone number", region: "Region", chooseRegion: "Choose a region", business: "Business / farm name", optional: "Optional", next: "Continue", describe: "Tell us about your business.", describeIntro: "This information helps connect you with the right people.", change: "Change", experience: "Experience / short description", experiencePlaceholder: "Years of experience, capacity or what makes you different…", back: "Back", choosePlan: "Choose your starter plan.", planIntro: "Registration and your first listing are currently free.", standard: "Everything you need to start", recommended: "Recommended", registration: "registration", featureRole: "One role profile", featureAd: "First listing free", featureNetwork: "Buyer and broker network", featureDashboard: "Dashboard access coming next", noPayment: "No payment is required.", paymentBody: "Fuad Esmart will notify you when online payments are introduced.", localTitle: "For now, this is saved on this device.", localBody: "We will connect the project database later.", submitting: "Registering…", complete: "Complete registration", failed: "Registration failed.", successKicker: "REGISTRATION COMPLETE", welcome: "Welcome to FUAD ESMART!", successBeforeRole: "you registered as", successAfterRole: "You can now publish your first listing.", registeredRole: "Registered role", regionLabel: "Region", enter: "Enter marketplace",
  },
  am: {
    close: "ምዝገባውን ዝጋ", subtitle: "የብዙ ሚና ምዝገባ", info: "መረጃ", product: "ንግድ", plan: "ዕቅድ", finish: "ጨርስ", step: "ደረጃ", who: "በየትኛው ሚና መመዝገብ ይፈልጋሉ?", whoIntro: "ሚናዎን ይምረጡ፤ የሚያስፈልግዎት ቅጽ ብቻ ይታያል።", fullName: "ሙሉ ስም", fullPlaceholder: "ሙሉ ስምዎ", phone: "ስልክ ቁጥር", region: "ክልል", chooseRegion: "ክልል ይምረጡ", business: "የንግድ / የእርሻ ስም", optional: "ካለ", next: "ቀጥል", describe: "ስለ ንግድዎ ይንገሩን።", describeIntro: "ይህ መረጃ ከትክክለኛ ሰዎች ጋር እንዲገናኙ ይረዳል።", change: "ቀይር", experience: "ልምድ / አጭር መግለጫ", experiencePlaceholder: "የልምድ ዓመት፣ አቅም ወይም ልዩነትዎ…", back: "ተመለስ", choosePlan: "የመጀመሪያ ዕቅድዎን ይምረጡ።", planIntro: "ምዝገባና የመጀመሪያ ማስታወቂያ አሁን በነፃ ናቸው።", standard: "ገበያውን ለመጀመር", recommended: "የሚመከር", registration: "ምዝገባ", featureRole: "አንድ የሚና ፕሮፋይል", featureAd: "የመጀመሪያ ማስታወቂያ ነፃ", featureNetwork: "የገዢና የደላላ ኔትወርክ", featureDashboard: "Dashboard መግቢያ በቅርቡ", noPayment: "ክፍያ አያስፈልግም።", paymentBody: "የመስመር ላይ ክፍያ ሲጨመር Fuad Esmart ያሳውቅዎታል።", localTitle: "ለአሁን በዚህ መሣሪያ ላይ ይቀመጣል።", localBody: "የፕሮጀክቱን ዳታቤዝ በኋላ እናገናኛለን።", submitting: "በመመዝገብ ላይ…", complete: "ምዝገባውን ጨርስ", failed: "ምዝገባው አልተሳካም።", successKicker: "ምዝገባው ተጠናቋል", welcome: "ወደ FUAD ESMART እንኳን ደህና መጡ!", successBeforeRole: "በሚና", successAfterRole: "ተመዝግበዋል። አሁን የመጀመሪያ ማስታወቂያዎን መለጠፍ ይችላሉ።", registeredRole: "የተመዘገበ ሚና", regionLabel: "ክልል", enter: "ወደ ገበያው ግባ",
  },
};

export default function MultiRoleRegister({ open, onClose, onComplete, initialRole = null, language }: Props) {
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
  const t = registerCopy[language];

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
      setSubmitError(error instanceof Error ? error.message : t.failed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flow-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !loading) resetAndClose(); }}>
      <section className="flow-modal register-flow" role="dialog" aria-modal="true" aria-labelledby="registration-title">
        <button className="flow-close" type="button" onClick={resetAndClose} disabled={loading} aria-label={t.close}>×</button>
        <div className="flow-brand"><span>FE</span><div><strong>FUAD ESMART</strong><small>{t.subtitle}</small></div></div>
        <StepIndicator current={step} steps={[t.info, t.product, t.plan, t.finish]} />

        <div className="flow-panel" key={step}>
          {step === 0 && (
            <form onSubmit={nextFromInfo}>
              <div className="flow-heading"><span>{t.step} 01</span><h2 id="registration-title">{t.who}</h2><p>{t.whoIntro}</p></div>
              <RoleSelector value={role} onChange={setRole} language={language} />
              <div className="field-grid two-col compact-fields">
                <label>{t.fullName}<input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder={t.fullPlaceholder} required /></label>
                <label>{t.phone}<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+251 9…" pattern="[+0-9 ]{9,}" required /></label>
                <label>{t.region}<select value={region} onChange={(event) => setRegion(event.target.value)} required><option value="" disabled>{t.chooseRegion}</option>{regions.map((item) => <option key={item}>{item}</option>)}</select></label>
                <label>{t.business}<input value={businessName} onChange={(event) => setBusinessName(event.target.value)} placeholder={t.optional} /></label>
              </div>
              <div className="flow-actions end"><button className="primary-action ripple" type="submit" disabled={!role}>{t.next} <span>→</span></button></div>
            </form>
          )}

          {step === 1 && role && (
            <form onSubmit={nextFromProduct}>
              <div className="flow-heading"><span>{t.step} 02 · {selectedRole && getRoleName(selectedRole, language)}</span><h2 id="registration-title">{t.describe}</h2><p>{t.describeIntro}</p></div>
              <div className="selected-role-banner"><span>{selectedRole?.icon}</span><div><strong>{selectedRole && getRoleName(selectedRole, language)}</strong><small>{selectedRole && getRoleDescription(selectedRole, language)}</small></div><button type="button" onClick={() => setStep(0)}>{t.change}</button></div>
              <div className="field-grid">
                <label>{specialtyLabels[language][role].label}<input value={specialty} onChange={(event) => setSpecialty(event.target.value)} placeholder={specialtyLabels[language][role].placeholder} required /></label>
                <label>{t.experience}<textarea value={experience} onChange={(event) => setExperience(event.target.value)} placeholder={t.experiencePlaceholder} rows={4} required /></label>
              </div>
              <div className="flow-actions"><button className="secondary-action" type="button" onClick={() => setStep(0)}>← {t.back}</button><button className="primary-action ripple" type="submit">{t.next} <span>→</span></button></div>
            </form>
          )}

          {step === 2 && role && (
            <div>
              <div className="flow-heading"><span>{t.step} 03</span><h2 id="registration-title">{t.choosePlan}</h2><p>{t.planIntro}</p></div>
              <div className="plan-card selected-plan"><div className="plan-top"><span className="plan-icon">✦</span><div><strong>FUAD Standard</strong><small>{t.standard}</small></div><em>{t.recommended}</em></div><div className="plan-price"><strong>ETB 0</strong><span>/ {t.registration}</span></div><ul><li>✓ {t.featureRole}</li><li>✓ {t.featureAd}</li><li>✓ {t.featureNetwork}</li><li>✓ {t.featureDashboard}</li></ul></div>
              <div className="safe-note"><span>🛡️</span><p><strong>{t.noPayment}</strong><br />{t.paymentBody}</p></div>
              <div className="local-mode-note"><span>⌁</span><p><strong>{t.localTitle}</strong><br />{t.localBody}</p></div>
              {submitError && <p className="flow-error" role="alert">{submitError}</p>}
              <div className="flow-actions"><button className="secondary-action" type="button" onClick={() => setStep(1)} disabled={loading}>← {t.back}</button><button className="primary-action ripple" type="button" onClick={finishRegistration} disabled={loading}>{loading ? <><i className="spinner" /> {t.submitting}</> : <>{t.complete} <span>→</span></>}</button></div>
            </div>
          )}

          {step === 3 && (
            <div className="flow-success">
              <div className="success-orbit"><span>✓</span></div>
              <p className="success-kicker">{t.successKicker}</p>
              <h2 id="registration-title">{t.welcome}</h2>
              <p><strong>{fullName}</strong>, {t.successBeforeRole} <strong>{selectedRole && getRoleName(selectedRole, language)}</strong> {t.successAfterRole}</p>
              <div className="success-summary"><span>{selectedRole?.icon}</span><div><small>{t.registeredRole}</small><strong>{selectedRole && getRoleName(selectedRole, language)}</strong></div><div><small>{t.regionLabel}</small><strong>{region}</strong></div></div>
              <button className="primary-action wide ripple" type="button" onClick={resetAndClose}>{t.enter} <span>→</span></button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
