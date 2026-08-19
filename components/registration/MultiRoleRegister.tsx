"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { signUpMarketplaceAccount } from "../../lib/marketplace-auth";
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

type Copy = {
  close: string;
  subtitle: string;
  info: string;
  business: string;
  plan: string;
  finish: string;
  step: string;
  title: string;
  intro: string;
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  passwordMismatch: string;
  phone: string;
  region: string;
  chooseRegion: string;
  businessName: string;
  optional: string;
  next: string;
  describe: string;
  describeIntro: string;
  change: string;
  experience: string;
  experiencePlaceholder: string;
  back: string;
  choosePlan: string;
  planIntro: string;
  standard: string;
  recommended: string;
  registration: string;
  featureProfile: string;
  featureCloud: string;
  featurePhotos: string;
  featureDashboard: string;
  noPayment: string;
  cloudTitle: string;
  cloudBody: string;
  submitting: string;
  complete: string;
  failed: string;
  successKicker: string;
  welcome: string;
  successBeforeRole: string;
  successAfterRole: string;
  confirmationTitle: string;
  confirmationBody: string;
  registeredRole: string;
  regionLabel: string;
  enter: string;
  closeAfterConfirmation: string;
};

const copy: Record<Language, Copy> = {
  om: {
    close: "Galmee cufi",
    subtitle: "Galmee Supabase cloud",
    info: "Odeeffannoo",
    business: "Oomisha",
    plan: "Karoora",
    finish: "Xumura",
    step: "TARKAANFII",
    title: "FUAD account kee uumi.",
    intro: "Gahee, email fi odeeffannoo daldalaa guuti; account kee browser hundarra hojjetti.",
    fullName: "Maqaa guutuu",
    email: "Email",
    password: "Password",
    confirmPassword: "Password irra deebi'i",
    passwordMismatch: "Password lamaan wal hin simu.",
    phone: "Lakkoofsa bilbilaa",
    region: "Naannoo",
    chooseRegion: "Naannoo fili",
    businessName: "Maqaa daldalaa / farm",
    optional: "Yoo qabaatte",
    next: "Itti fufi",
    describe: "Damee hojii kee nuuf ibsi.",
    describeIntro: "Odeeffannoon kun profile cloud kee keessatti kuufama.",
    change: "Jijjiiri",
    experience: "Muuxannoo / ibsa gabaabaa",
    experiencePlaceholder: "Waggaa muuxannoo, capacity ykn wanta adda taate…",
    back: "Duubatti",
    choosePlan: "Karoora jalqabaa kee mirkaneessi.",
    planIntro: "Galmeen fi maxxansi jalqabaa bilisa.",
    standard: "Marketplace irratti jalqabuuf",
    recommended: "Filannoo gaarii",
    registration: "galmee",
    featureProfile: "Profile role tokko",
    featureCloud: "Mobile fi browser hunda irratti login",
    featurePhotos: "Suuraa 1–5 waliin maxxansa",
    featureDashboard: "Owner fi admin control",
    noPayment: "Kaffaltiin hin barbaachisu.",
    cloudTitle: "Supabase database waliin walqabata.",
    cloudBody: "Profile kee device tokko qofa irratti osoo hin taane cloud keessatti kuufama.",
    submitting: "Account uumaa jira…",
    complete: "Account uumi",
    failed: "Galmeen hin milkoofne.",
    successKicker: "GALMEEN MILKAA'EERA",
    welcome: "Baga gara FUAD ESMART dhuftan!",
    successBeforeRole: "gahee",
    successAfterRole: "ta'uun galmooftetta. Amma maxxansuu dandeessa.",
    confirmationTitle: "Email kee mirkaneessi",
    confirmationBody: "Account uumameera. Email keessatti confirmation link tuqi; sana booda FUAD Login irraa seeni.",
    registeredRole: "Gahee galmaa'e",
    regionLabel: "Naannoo",
    enter: "Marketplace seeni",
    closeAfterConfirmation: "Cufi",
  },
  en: {
    close: "Close registration",
    subtitle: "Supabase cloud registration",
    info: "Information",
    business: "Business",
    plan: "Plan",
    finish: "Finish",
    step: "STEP",
    title: "Create your FUAD account.",
    intro: "Add your role, email and business details; the account works across browsers.",
    fullName: "Full name",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm password",
    passwordMismatch: "The passwords do not match.",
    phone: "Phone number",
    region: "Region",
    chooseRegion: "Choose a region",
    businessName: "Business / farm name",
    optional: "Optional",
    next: "Continue",
    describe: "Tell us about your business.",
    describeIntro: "This information is stored in your cloud profile.",
    change: "Change",
    experience: "Experience / short description",
    experiencePlaceholder: "Experience, capacity or what makes you different…",
    back: "Back",
    choosePlan: "Confirm your starter plan.",
    planIntro: "Registration and your first listing are free.",
    standard: "Everything needed to start",
    recommended: "Recommended",
    registration: "registration",
    featureProfile: "One role profile",
    featureCloud: "Login across phones and browsers",
    featurePhotos: "Listings with 1–5 photos",
    featureDashboard: "Owner and admin controls",
    noPayment: "No payment is required.",
    cloudTitle: "Connected to the Supabase database.",
    cloudBody: "Your profile is stored in the cloud, not only on this device.",
    submitting: "Creating account…",
    complete: "Create account",
    failed: "Registration failed.",
    successKicker: "REGISTRATION COMPLETE",
    welcome: "Welcome to FUAD ESMART!",
    successBeforeRole: "you registered as",
    successAfterRole: "You can now publish your first listing.",
    confirmationTitle: "Confirm your email",
    confirmationBody: "Your account was created. Open the confirmation link in your email, then sign in from FUAD Login.",
    registeredRole: "Registered role",
    regionLabel: "Region",
    enter: "Enter marketplace",
    closeAfterConfirmation: "Close",
  },
  am: {
    close: "ምዝገባውን ዝጋ",
    subtitle: "የSupabase cloud ምዝገባ",
    info: "መረጃ",
    business: "ንግድ",
    plan: "ዕቅድ",
    finish: "ጨርስ",
    step: "ደረጃ",
    title: "የFUAD መለያዎን ይፍጠሩ።",
    intro: "ሚና፣ email እና የንግድ መረጃ ያስገቡ፤ መለያው በሁሉም browser ላይ ይሰራል።",
    fullName: "ሙሉ ስም",
    email: "Email",
    password: "Password",
    confirmPassword: "Password ደግመው ያስገቡ",
    passwordMismatch: "Password ሁለቱ አይዛመዱም።",
    phone: "ስልክ ቁጥር",
    region: "ክልል",
    chooseRegion: "ክልል ይምረጡ",
    businessName: "የንግድ / የእርሻ ስም",
    optional: "ካለ",
    next: "ቀጥል",
    describe: "ስለ ንግድዎ ይንገሩን።",
    describeIntro: "ይህ መረጃ በcloud profile ውስጥ ይቀመጣል።",
    change: "ቀይር",
    experience: "ልምድ / አጭር መግለጫ",
    experiencePlaceholder: "ልምድ፣ አቅም ወይም ልዩነትዎ…",
    back: "ተመለስ",
    choosePlan: "የመጀመሪያ ዕቅድዎን ያረጋግጡ።",
    planIntro: "ምዝገባና የመጀመሪያ ማስታወቂያ ነፃ ናቸው።",
    standard: "ገበያውን ለመጀመር",
    recommended: "የሚመከር",
    registration: "ምዝገባ",
    featureProfile: "አንድ የሚና profile",
    featureCloud: "በሁሉም ስልክና browser login",
    featurePhotos: "1–5 ፎቶ ያለው ማስታወቂያ",
    featureDashboard: "Owner እና admin control",
    noPayment: "ክፍያ አያስፈልግም።",
    cloudTitle: "ከSupabase database ጋር ይገናኛል።",
    cloudBody: "Profile በዚህ መሣሪያ ብቻ ሳይሆን cloud ውስጥ ይቀመጣል።",
    submitting: "መለያ በመፍጠር ላይ…",
    complete: "መለያ ፍጠር",
    failed: "ምዝገባው አልተሳካም።",
    successKicker: "ምዝገባው ተጠናቋል",
    welcome: "ወደ FUAD ESMART እንኳን ደህና መጡ!",
    successBeforeRole: "በሚና",
    successAfterRole: "ተመዝግበዋል። አሁን ማስታወቂያ መለጠፍ ይችላሉ።",
    confirmationTitle: "Email ያረጋግጡ",
    confirmationBody: "መለያው ተፈጥሯል። በemail የተላከውን confirmation link ይክፈቱ፤ ከዚያ FUAD Login ይጠቀሙ።",
    registeredRole: "የተመዘገበ ሚና",
    regionLabel: "ክልል",
    enter: "ወደ ገበያው ግባ",
    closeAfterConfirmation: "ዝጋ",
  },
};

const specialtyLabels: Record<Language, Record<RoleId, { label: string; placeholder: string }>> = {
  om: {
    farmer: { label: "Oomisha qonnaa ijoo", placeholder: "Fkn: Buna, xaafii, kuduraa" },
    manufacturer: { label: "Oomisha ati oomishitu", placeholder: "Fkn: PVC pipe, furniture" },
    seller: { label: "Gosa daldalaa", placeholder: "Fkn: Meeshaa ijaarsaa" },
    broker: { label: "Damee broker", placeholder: "Fkn: Mana, albuuda, qonna" },
    electronics: { label: "Gosa elektirooniksii", placeholder: "Fkn: Laptop, phone, solar" },
    mineral: { label: "Gosa albuudaa", placeholder: "Fkn: Warqee, marble" },
    buyer: { label: "Wanta bituu barbaaddu", placeholder: "Fkn: Buna toonii 5" },
  },
  en: {
    farmer: { label: "Main farm product", placeholder: "Example: Coffee, teff, vegetables" },
    manufacturer: { label: "Products you manufacture", placeholder: "Example: PVC pipes, furniture" },
    seller: { label: "Type of business", placeholder: "Example: Construction materials" },
    broker: { label: "Brokerage sector", placeholder: "Example: Property, mineral, agriculture" },
    electronics: { label: "Electronics type", placeholder: "Example: Laptop, phone, solar" },
    mineral: { label: "Mineral type", placeholder: "Example: Gold, marble" },
    buyer: { label: "What you want to buy", placeholder: "Example: Five tons of coffee" },
  },
  am: {
    farmer: { label: "ዋና የእርሻ ምርት", placeholder: "ለምሳሌ፦ ቡና፣ ጤፍ" },
    manufacturer: { label: "የሚያመርቱት ምርት", placeholder: "ለምሳሌ፦ PVC ቱቦ፣ ፈርኒቸር" },
    seller: { label: "የንግድ ዓይነት", placeholder: "ለምሳሌ፦ የግንባታ ዕቃ" },
    broker: { label: "የደላላ ዘርፍ", placeholder: "ለምሳሌ፦ ቤት፣ ማዕድን" },
    electronics: { label: "የኤሌክትሮኒክስ ዓይነት", placeholder: "ለምሳሌ፦ Laptop፣ phone" },
    mineral: { label: "የማዕድን ዓይነት", placeholder: "ለምሳሌ፦ ወርቅ፣ marble" },
    buyer: { label: "መግዛት የሚፈልጉት", placeholder: "ለምሳሌ፦ 5 ቶን ቡና" },
  },
};

const regions = [
  "Addis Ababa",
  "Oromia",
  "Amhara",
  "Somali",
  "Sidama",
  "Tigray",
  "Afar",
  "Harari",
  "Dire Dawa",
  "Benishangul-Gumuz",
  "Gambela",
  "South Ethiopia",
];

export default function MultiRoleRegister({ open, onClose, onComplete, initialRole = null, language }: Props) {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<RoleId | null>(initialRole);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [experience, setExperience] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmationRequired, setConfirmationRequired] = useState(false);
  const t = copy[language];

  const selectedRole = useMemo(() => roleOptions.find((item) => item.id === role), [role]);

  useEffect(() => {
    if (!open) return;
    if (initialRole) setRole(initialRole);
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
  }, [initialRole, loading, onClose, open]);

  if (!open) return null;

  function resetAndClose() {
    setStep(0);
    setRole(null);
    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setPhone("");
    setRegion("");
    setBusinessName("");
    setSpecialty("");
    setExperience("");
    setLoading(false);
    setSubmitError("");
    setConfirmationRequired(false);
    onClose();
  }

  function nextFromInfo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    if (password !== confirmPassword) {
      setSubmitError(t.passwordMismatch);
      return;
    }
    setStep(1);
  }

  function nextFromBusiness(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStep(2);
  }

  async function finishRegistration() {
    if (!role) return;
    setLoading(true);
    setSubmitError("");
    try {
      const payload: RegistrationPayload = { role, fullName, phone, region, businessName, specialty, experience };
      const result = await signUpMarketplaceAccount(email, password, payload);
      setConfirmationRequired(result.confirmationRequired);
      if (result.profile) onComplete(result.profile);
      setStep(3);
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
        <StepIndicator current={step} steps={[t.info, t.business, t.plan, t.finish]} />

        <div className="flow-panel" key={step}>
          {step === 0 && (
            <form onSubmit={nextFromInfo}>
              <div className="flow-heading"><span>{t.step} 01</span><h2 id="registration-title">{t.title}</h2><p>{t.intro}</p></div>
              <RoleSelector value={role} onChange={setRole} language={language} />
              <div className="field-grid two-col compact-fields">
                <label>{t.fullName}<input value={fullName} onChange={(event) => setFullName(event.target.value)} minLength={2} required /></label>
                <label>{t.email}<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" required /></label>
                <label>{t.password}<input type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required /></label>
                <label>{t.confirmPassword}<input type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} required /></label>
                <label>{t.phone}<input value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" autoComplete="tel" placeholder="+251 9…" pattern="[+0-9 ]{9,}" required /></label>
                <label>{t.region}<select value={region} onChange={(event) => setRegion(event.target.value)} required><option value="" disabled>{t.chooseRegion}</option>{regions.map((item) => <option key={item}>{item}</option>)}</select></label>
                <label className="flow-span-2">{t.businessName}<input value={businessName} onChange={(event) => setBusinessName(event.target.value)} placeholder={t.optional} /></label>
              </div>
              {submitError && <p className="flow-error" role="alert">{submitError}</p>}
              <div className="flow-actions end"><button className="primary-action ripple" type="submit" disabled={!role}>{t.next} <span>→</span></button></div>
            </form>
          )}

          {step === 1 && role && (
            <form onSubmit={nextFromBusiness}>
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
              <div className="plan-card selected-plan"><div className="plan-top"><span className="plan-icon">✦</span><div><strong>FUAD Standard</strong><small>{t.standard}</small></div><em>{t.recommended}</em></div><div className="plan-price"><strong>ETB 0</strong><span>/ {t.registration}</span></div><ul><li>✓ {t.featureProfile}</li><li>✓ {t.featureCloud}</li><li>✓ {t.featurePhotos}</li><li>✓ {t.featureDashboard}</li></ul></div>
              <div className="safe-note"><span>🛡️</span><p><strong>{t.noPayment}</strong><br />{t.cloudTitle}</p></div>
              <div className="local-mode-note"><span>☁</span><p><strong>{t.cloudTitle}</strong><br />{t.cloudBody}</p></div>
              {submitError && <p className="flow-error" role="alert">{submitError}</p>}
              <div className="flow-actions"><button className="secondary-action" type="button" onClick={() => setStep(1)} disabled={loading}>← {t.back}</button><button className="primary-action ripple" type="button" onClick={finishRegistration} disabled={loading}>{loading ? <><i className="spinner" /> {t.submitting}</> : <>{t.complete} <span>→</span></>}</button></div>
            </div>
          )}

          {step === 3 && (
            <div className="flow-success">
              <div className="success-orbit"><span>✓</span></div>
              <p className="success-kicker">{t.successKicker}</p>
              <h2 id="registration-title">{confirmationRequired ? t.confirmationTitle : t.welcome}</h2>
              <p>{confirmationRequired ? t.confirmationBody : <><strong>{fullName}</strong>, {t.successBeforeRole} <strong>{selectedRole && getRoleName(selectedRole, language)}</strong> {t.successAfterRole}</>}</p>
              <div className="success-summary"><span>{selectedRole?.icon}</span><div><small>{t.registeredRole}</small><strong>{selectedRole && getRoleName(selectedRole, language)}</strong></div><div><small>{t.regionLabel}</small><strong>{region}</strong></div></div>
              <button className="primary-action wide ripple" type="button" onClick={resetAndClose}>{confirmationRequired ? t.closeAfterConfirmation : t.enter} <span>→</span></button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
