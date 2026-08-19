"use client";

import { FormEvent, useEffect, useState } from "react";
import { loginMarketplaceAccount } from "../../lib/marketplace-auth";
import type { Language } from "../../lib/i18n";
import type { RegistrationPayload } from "../registration/MultiRoleRegister";

type Props = {
  open: boolean;
  account: RegistrationPayload | null;
  onClose: () => void;
  onLogin: (profile: RegistrationPayload) => void;
  onRegister: () => void;
  language: Language;
};

const loginCopy: Record<Language, Record<string, string>> = {
  om: {
    close: "Seensa cufi",
    subtitle: "Seensa marketplace",
    kicker: "BAGA NAGAAN DEEBITAN",
    title: "Gara account keetti seeni.",
    intro: "Email fi password FUAD account kee galchi.",
    email: "Email",
    password: "Password",
    cloudTitle: "Supabase cloud account",
    cloudBody: "Account kun mobile fi browser hunda irratti database tokko waliin hojjetti.",
    submit: "Seeni",
    loading: "Seenaa jira…",
    noAccount: "Account hin qabduu?",
    register: "Bilisa galmaa’i",
    failed: "Email ykn password sirrii miti.",
  },
  en: {
    close: "Close login",
    subtitle: "Marketplace login",
    kicker: "WELCOME BACK",
    title: "Sign in to your account.",
    intro: "Enter your FUAD account email and password.",
    email: "Email",
    password: "Password",
    cloudTitle: "Supabase cloud account",
    cloudBody: "Your account works across phones and browsers using one shared database.",
    submit: "Sign in",
    loading: "Signing in…",
    noAccount: "Don't have an account?",
    register: "Register free",
    failed: "The email or password is incorrect.",
  },
  am: {
    close: "መግቢያውን ዝጋ",
    subtitle: "የገበያ መግቢያ",
    kicker: "እንኳን ደህና መጡ",
    title: "ወደ መለያዎ ይግቡ።",
    intro: "የFUAD መለያዎን email እና password ያስገቡ።",
    email: "Email",
    password: "Password",
    cloudTitle: "የSupabase cloud መለያ",
    cloudBody: "መለያዎ በሁሉም ስልክና browser ላይ ከአንድ database ጋር ይሰራል።",
    submit: "ግባ",
    loading: "በመግባት ላይ…",
    noAccount: "መለያ የለዎትም?",
    register: "በነፃ ይመዝገቡ",
    failed: "Email ወይም password ትክክል አይደለም።",
  },
};

export default function LocalLogin({ open, onClose, onLogin, onRegister, language }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const t = loginCopy[language];

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [busy, onClose, open]);

  if (!open) return null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const profile = await loginMarketplaceAccount(email, password);
      onLogin(profile);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t.failed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flow-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
      <section className="flow-modal login-flow" role="dialog" aria-modal="true" aria-labelledby="login-title">
        <button className="flow-close" type="button" onClick={onClose} disabled={busy} aria-label={t.close}>×</button>
        <div className="flow-brand"><span>FE</span><div><strong>FUAD ESMART</strong><small>{t.subtitle}</small></div></div>
        <div className="flow-panel login-panel">
          <div className="flow-heading"><span>{t.kicker}</span><h2 id="login-title">{t.title}</h2><p>{t.intro}</p></div>
          <form onSubmit={submit}>
            <div className="field-grid">
              <label>{t.email}<input autoFocus type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" required /></label>
              <label>{t.password}<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required /></label>
            </div>
            <div className="local-mode-note"><span>☁</span><p><strong>{t.cloudTitle}</strong><br />{t.cloudBody}</p></div>
            {error && <p className="flow-error" role="alert">{error}</p>}
            <button className="primary-action wide ripple login-submit" type="submit" disabled={busy}>{busy ? t.loading : t.submit} <span>→</span></button>
          </form>
          <div className="login-register-link"><span>{t.noAccount}</span><button type="button" disabled={busy} onClick={onRegister}>{t.register}</button></div>
        </div>
      </section>
    </div>
  );
}
