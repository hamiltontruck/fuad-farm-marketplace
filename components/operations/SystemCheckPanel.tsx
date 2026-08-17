"use client";

import { useEffect, useState } from "react";

type Health = {
  healthy?: boolean;
  checks?: Record<string, boolean>;
  errors?: string[];
};

const labels: Record<string, string> = {
  api: "API route",
  database: "D1 database",
  photoStorage: "R2 photo storage",
  adminConfigured: "ADMIN_EMAILS configured",
  signedIn: "ChatGPT sign-in",
  adminAccess: "Admin authorization",
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

      const response = await fetch(`/api/health?t=${Date.now()}`, { cache: "no-store" });
      setHealth((await response.json()) as Health);
    } catch (error) {
      setHealth({ healthy: false, checks: { api: false }, errors: [error instanceof Error ? error.message : "System check failed."] });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void run(); }, []);

  return (
    <section className="ops-card">
      <div className="ops-note">Page kana Chrome, Firefox, Safari ykn mobile browser adda addaa irraa bani. D1 fi R2 PASS yoo ta'an, data cloud keessatti browser hundarra qoodama.</div>
      <div className="ops-checks" style={{ marginTop: 18 }}>
        <div className="ops-check"><span>Browser local capability</span><strong className={browserStorage ? "ok" : "fail"}>{browserStorage ? "PASS" : "FAIL"}</strong></div>
        {Object.entries(health?.checks ?? {}).map(([key, value]) => <div className="ops-check" key={key}><span>{labels[key] ?? key}</span><strong className={value ? "ok" : "fail"}>{value ? "PASS" : "NOT READY"}</strong></div>)}
      </div>
      {loading && <p>System check fiigaa jira…</p>}
      {health?.errors?.length ? <div className="ops-alert">{health.errors.map((error) => <div key={error}>{error}</div>)}</div> : null}
      {health?.healthy && <p className="ops-success">Core database fi photo storage hojii irra jiru.</p>}
      <div className="ops-actions"><button className="ops-button" type="button" onClick={() => void run()} disabled={loading}>Check again</button><a className="ops-button secondary" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }} href="/post">Test post</a></div>
      <p style={{ color: "#64748b", marginTop: 18, overflowWrap: "anywhere" }}>Browser: {typeof navigator === "undefined" ? "server" : navigator.userAgent}</p>
    </section>
  );
}
