"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "../../lib/supabase-browser";
import {
  resendSignupConfirmation,
  signUpWithConfirmationRedirect,
} from "../../lib/supabase-auth-confirmation";

type Props = {
  title?: string;
  onAuthenticated?: () => void;
};

function isEmailNotConfirmed(message: string): boolean {
  return /email not confirmed|email.*confirm/i.test(message);
}

export default function SupabaseAuthCard({ title = "FUAD account seeni", onAuthenticated }: Props) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [confirmationPending, setConfirmationPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (mode === "signup") {
        const result = await signUpWithConfirmationRedirect(email.trim(), password, fullName.trim());
        if (!result.session) {
          setConfirmationPending(true);
          setMessage("Account uumameera. Confirmation email ergameera; link sana yeroo tokko tuqi, sana booda Login godhi.");
          setMode("login");
          return;
        }
      } else {
        await signIn(email.trim(), password);
      }
      setConfirmationPending(false);
      setMessage("Milkaa'eera. Database account kee waliin walqabateera.");
      if (onAuthenticated) onAuthenticated();
      else window.location.reload();
    } catch (caught) {
      const raw = caught instanceof Error ? caught.message : "Account seenuu hin dandeenye.";
      if (isEmailNotConfirmed(raw)) {
        setConfirmationPending(true);
        setError("Email kee hin mirkanoofne. Confirmation link tuqi ykn button armaan gadiitiin email haaraa ergi.");
      } else {
        setError(raw);
      }
    } finally {
      setBusy(false);
    }
  }

  async function resendConfirmation() {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setError("Confirmation email erguuf email kee galchi.");
      return;
    }

    setResending(true);
    setError("");
    setMessage("");
    try {
      await resendSignupConfirmation(normalizedEmail);
      setConfirmationPending(true);
      setMessage("Confirmation email haaraan ergameera. Inbox, Spam fi All Mail ilaali; link haaraa yeroo tokko qofa tuqi.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Confirmation email irra deebi'ii erguu hin dandeenye.");
    } finally {
      setResending(false);
    }
  }

  return (
    <section className="ops-card">
      <div className="ops-note">Supabase Auth fayyadama. Password kee app ykn admin bira hin darbu; Supabase qofa irratti mirkanaa'a.</div>
      <h2 style={{ marginTop: 20 }}>{title}</h2>
      <form onSubmit={submit}>
        <div className="ops-grid">
          {mode === "signup" && (
            <label className="ops-field ops-span-2">Maqaa guutuu
              <input value={fullName} onChange={(event) => setFullName(event.target.value)} minLength={2} required placeholder="Maqaa kee" />
            </label>
          )}
          <label className="ops-field ops-span-2">Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" placeholder="name@example.com" />
          </label>
          <label className="ops-field ops-span-2">Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="Minimum 8 characters" />
          </label>
        </div>
        {error && <p className="ops-alert" role="alert">{error}</p>}
        {message && <p className="ops-success" role="status">{message}</p>}
        <div className="ops-actions">
          <button className="ops-button" type="submit" disabled={busy || resending}>{busy ? "Egaa jira…" : mode === "login" ? "Login" : "Account uumi"}</button>
          <button className="ops-button secondary" type="button" disabled={busy || resending} onClick={() => { setMode((current) => current === "login" ? "signup" : "login"); setError(""); setMessage(""); setConfirmationPending(false); }}>
            {mode === "login" ? "Account haaraa uumi" : "Account qaba — Login"}
          </button>
          {confirmationPending && (
            <button className="ops-button secondary" type="button" disabled={busy || resending || !email.trim()} onClick={() => void resendConfirmation()}>
              {resending ? "Ergaa jira…" : "Confirmation email irra deebi'i ergi"}
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
