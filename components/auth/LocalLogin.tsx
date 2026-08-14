"use client";

import { FormEvent, useEffect, useState } from "react";
import type { RegistrationPayload } from "../registration/MultiRoleRegister";

type Props = {
  open: boolean;
  account: RegistrationPayload | null;
  onClose: () => void;
  onLogin: (profile: RegistrationPayload) => void;
  onRegister: () => void;
};

function normalizePhone(value: string) {
  return value.replace(/\D/g, "").slice(-9);
}

export default function LocalLogin({ open, account, onClose, onLogin, onRegister }: Props) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

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
      setError("Account device kana irratti hin argamne. Dura galmaa’i.");
      return;
    }
    if (normalizePhone(phone) !== normalizePhone(account.phone)) {
      setError("Lakkoofsi bilbilaa galmee kanaa waliin hin simu.");
      return;
    }
    onLogin(account);
  }

  return (
    <div className="flow-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="flow-modal login-flow" role="dialog" aria-modal="true" aria-labelledby="login-title">
        <button className="flow-close" type="button" onClick={onClose} aria-label="Close login">×</button>
        <div className="flow-brand"><span>FE</span><div><strong>FUAD ESMART</strong><small>Marketplace login</small></div></div>
        <div className="flow-panel login-panel">
          <div className="flow-heading"><span>WELCOME BACK</span><h2 id="login-title">Gara account keetti seeni.</h2><p>Lakkoofsa bilbilaa yeroo galmee fayyadamte galchi.</p></div>
          <form onSubmit={submit}>
            <div className="field-grid">
              <label>Phone number<input autoFocus inputMode="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+251 9…" pattern="[+0-9 ]{9,}" required /></label>
            </div>
            <div className="local-mode-note"><span>⌁</span><p><strong>Local demo login</strong><br />Account kun device kana qofa irratti hojjetti. Database project yeroo biraa wal qunnamsiifna.</p></div>
            {error && <p className="flow-error" role="alert">{error}</p>}
            <button className="primary-action wide ripple login-submit" type="submit">Seeni <span>→</span></button>
          </form>
          <div className="login-register-link"><span>Account hin qabduu?</span><button type="button" onClick={onRegister}>Bilisa galmaa’i</button></div>
        </div>
      </section>
    </div>
  );
}
