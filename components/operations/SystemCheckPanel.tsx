"use client";

import { useEffect, useState } from "react";
import { checkSupabase } from "../../lib/supabase-browser";

type Health = {
  database: boolean;
  storage: boolean;
  signedIn: boolean;
  admin: boolean;
  errors: string[];
};

export default function SystemCheckPanel() {
  const [health, setHealth] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);
  const [browserStorage, setBrowserStorage] = useState(false);

  async function run() {
    setLoading(true);
    try {
      const token = `fuad-test-${Date.now()}`;
      window.localStorage.setItem("fuad-system-check", token);
      setBrowserStorage(window.localStorage.getItem("fuad-system-check") === token);
      window.localStorage.removeItem("fuad-system-check");
      setHealth(await checkSupabase());
    } catch (error) {
      setHealth({ database: false, storage: false, signedIn: false, admin: false, errors: [error instanceof Error ? error.message : "System check failed."] });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void run(); }, []);

  const coreHealthy = Boolean(health?.database && health?.storage);

  return (
    <section className="ops-card">
      <div className="ops-note">Page kana Chrome, Firefox, Safari ykn mobile browser adda addaa irraa bani. Supabase Database fi listing-images Storage PASS yoo ta'an, data cloud keessatti browser hundarra qoodama.</div>
      <div className="ops-checks" style={{ marginTop: 18 }}>
        <div className="ops-check"><span>Browser local session capability</span><strong className={browserStorage ? "ok" : "fail"}>{browserStorage ? "PASS" : "FAIL"}</strong></div>
        <div className="ops-check"><span>Supabase database</span><strong className={health?.database ? "ok" : "fail"}>{health?.database ? "PASS" : "NOT READY"}</strong></div>
        <div className="ops-check"><span>listing-images Storage</span><strong className={health?.storage ? "ok" : "fail"}>{health?.storage ? "PASS" : "NOT READY"}</strong></div>
        <div className="ops-check"><span>FUAD account signed in</span><strong className={health?.signedIn ? "ok" : "fail"}>{health?.signedIn ? "PASS" : "OPTIONAL"}</strong></div>
        <div className="ops-check"><span>Supabase admin access</span><strong className={health?.admin ? "ok" : "fail"}>{health?.admin ? "PASS" : "NOT ADMIN"}</strong></div>
      </div>
      {loading && <p>Supabase system check fiigaa jira…</p>}
      {health?.errors.length ? <div className="ops-alert">{health.errors.map((error) => <div key={error}>{error}</div>)}</div> : null}
      {coreHealthy && <p className="ops-success">Supabase database fi photo storage hojii irra jiru.</p>}
      <div className="ops-actions"><button className="ops-button" type="button" onClick={() => void run()} disabled={loading}>Check again</button><a className="ops-button secondary" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }} href="/post">Test post</a></div>
      <p style={{ color: "#64748b", marginTop: 18, overflowWrap: "anywhere" }}>Browser: {typeof navigator === "undefined" ? "server" : navigator.userAgent}</p>
    </section>
  );
}
