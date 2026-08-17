"use client";

import { FormEvent, useState } from "react";
import { signIn, signUp } from "../../lib/supabase-browser";

type Props = {
  title?: string;
  onAuthenticated?: () => void;
};

export default function SupabaseAuthCard({ title = "FUAD account seeni", onAuthenticated }: Props) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (mode === "signup") {
        const result = await signUp(email.trim(), password, fullName.trim());
        if (!result.session) {
          setMessage("Account uumameera. Email kee keessatti confirmation link tuqi; sana booda Login godhi.");
          setMode("login");
          return;
        }
      } else {
        await signIn(email.trim(), password);
      }
      setMessage("Milkaa'eera. Database account kee waliin walqabateera.");
      if (onAuthenticated) onAuthenticated();
      else window.location.reload();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Account seenuu hin dandeenye.");
    } finally {
      setBusy(false);
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
        {message && <p className="ops-success">{message}</p>}
        <div className="ops-actions">
          <button className="ops-button" type="submit" disabled={busy}>{busy ? "Egaa jira…" : mode === "login" ? "Login" : "Account uumi"}</button>
          <button className="ops-button secondary" type="button" disabled={busy} onClick={() => { setMode((current) => current === "login" ? "signup" : "login"); setError(""); setMessage(""); }}>
            {mode === "login" ? "Account haaraa uumi" : "Account qaba — Login"}
          </button>
        </div>
      </form>
    </section>
  );
}
