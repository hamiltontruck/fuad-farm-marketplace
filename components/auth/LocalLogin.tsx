"use client";

import { FormEvent, useEffect, useState } from "react";
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
    close: "Seensa cufi", subtitle: "Seensa marketplace", kicker: "BAGA NAGAAN DEEBITAN", title: "Gara account keetti seeni.", intro: "Lakkoofsa bilbilaa yeroo galmee fayyadamte galchi.", phone: "Lakkoofsa bilbilaa", localTitle: "Seensa fakkeenyaa kan device kanaa", localBody: "Account kun device kana qofa irratti hojjetti. Database project yeroo biraa wal qunnamsiifna.", submit: "Seeni", noAccount: "Account hin qabduu?", register: "Bilisa galmaa’i", missing: "Account device kana irratti hin argamne. Dura galmaa’i.", mismatch: "Lakkoofsi bilbilaa galmee kanaa waliin hin simu.",
  },
  en: {
    close: "Close login", subtitle: "Marketplace login", kicker: "WELCOME BACK", title: "Sign in to your account.", intro: "Enter the phone number you used during registration.", phone: "Phone number", localTitle: "Device-local demo login", localBody: "This account works only on this device. We will connect the project database later.", submit: "Sign in", noAccount: "Don't have an account?", register: "Register free", missing: "No account was found on this device. Register first.", mismatch: "That phone number does not match this account.",
  },
  am: {
    close: "መግቢያውን ዝጋ", subtitle: "የገበያ መግቢያ", kicker: "እንኳን ደህና መጡ", title: "ወደ መለያዎ ይግቡ።", intro: "ሲመዘገቡ የተጠቀሙበትን ስልክ ቁጥር ያስገቡ።", phone: "ስልክ ቁጥር", localTitle: "የዚህ መሣሪያ የሙከራ መግቢያ", localBody: "ይህ መለያ በዚህ መሣሪያ ላይ ብቻ ይሰራል። የፕሮጀክቱን ዳታቤዝ በኋላ እናገናኛለን።", submit: "ግባ", noAccount: "መለያ የለዎትም?", register: "በነፃ ይመዝገቡ", missing: "በዚህ መሣሪያ ላይ መለያ አልተገኘም። መጀመሪያ ይመዝገቡ።", mismatch: "የስልክ ቁጥሩ ከዚህ መለያ ጋር አይዛመድም።",
  },
};

function normalizePhone(value: string) {
  return value.replace(/\D/g, "").slice(-9);
}

export default function LocalLogin({ open, account, onClose, onLogin, onRegister, language }: Props) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const t = loginCopy[language];

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

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!account) {
      setError(t.missing);
      return;
    }
    if (normalizePhone(phone) !== normalizePhone(account.phone)) {
      setError(t.mismatch);
      return;
    }
    onLogin(account);
  }

  return (
    <div className="flow-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="flow-modal login-flow" role="dialog" aria-modal="true" aria-labelledby="login-title">
        <button className="flow-close" type="button" onClick={onClose} aria-label={t.close}>×</button>
        <div className="flow-brand"><span>FE</span><div><strong>FUAD ESMART</strong><small>{t.subtitle}</small></div></div>
        <div className="flow-panel login-panel">
          <div className="flow-heading"><span>{t.kicker}</span><h2 id="login-title">{t.title}</h2><p>{t.intro}</p></div>
          <form onSubmit={submit}>
            <div className="field-grid">
              <label>{t.phone}<input autoFocus inputMode="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+251 9…" pattern="[+0-9 ]{9,}" required /></label>
            </div>
            <div className="local-mode-note"><span>⌁</span><p><strong>{t.localTitle}</strong><br />{t.localBody}</p></div>
            {error && <p className="flow-error" role="alert">{error}</p>}
            <button className="primary-action wide ripple login-submit" type="submit">{t.submit} <span>→</span></button>
          </form>
          <div className="login-register-link"><span>{t.noAccount}</span><button type="button" onClick={onRegister}>{t.register}</button></div>
        </div>
      </section>
    </div>
  );
}
