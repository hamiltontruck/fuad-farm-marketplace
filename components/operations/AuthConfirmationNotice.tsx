"use client";

import { useEffect, useState } from "react";

type Notice = {
  kind: "success" | "error";
  title: string;
  body: string;
};

function readNotice(): Notice | null {
  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const errorCode = hash.get("error_code") ?? search.get("error_code");
  const errorDescription = hash.get("error_description") ?? search.get("error_description");

  if (errorCode || errorDescription) {
    const expired = errorCode === "otp_expired" || /expired|invalid/i.test(errorDescription ?? "");
    return {
      kind: "error",
      title: expired ? "Confirmation link yeroon isaa darbeera" : "Email confirmation hin milkoofne",
      body: expired
        ? "Link duraan fayyadameera ykn yeroon isaa darbeera. Login yaali; yoo hin hojjanne confirmation email haaraa ergi."
        : (errorDescription ?? "Email confirmation irra deebi'ii yaali."),
    };
  }

  if (search.get("auth") === "confirmed" || hash.get("type") === "signup") {
    return {
      kind: "success",
      title: "Email kee mirkanaa'eera",
      body: "Amma FUAD account keetiin login gochuu dandeessa. Email confirmed — you can now log in. ኢሜይልዎ ተረጋግጧል።",
    };
  }

  return null;
}

export default function AuthConfirmationNotice() {
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    setNotice(readNotice());
  }, []);

  if (!notice) return null;

  return (
    <aside
      role={notice.kind === "error" ? "alert" : "status"}
      style={{
        position: "fixed",
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 250,
        width: "min(92vw, 640px)",
        padding: "14px 16px",
        borderRadius: 14,
        border: notice.kind === "error" ? "1px solid #ef9aa5" : "1px solid #7fd5b4",
        background: notice.kind === "error" ? "#fff5f6" : "#f1fff8",
        color: "#13233a",
        boxShadow: "0 18px 48px rgba(7,26,53,.2)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <strong style={{ display: "block", marginBottom: 4 }}>{notice.title}</strong>
          <span style={{ fontSize: 13, lineHeight: 1.55 }}>{notice.body}</span>
          <div style={{ marginTop: 10 }}>
            <a href="/my-listings" style={{ fontSize: 12, fontWeight: 850, color: "#1358b0" }}>Login / Seeni →</a>
          </div>
        </div>
        <button
          type="button"
          aria-label="Close confirmation notice"
          onClick={() => setNotice(null)}
          style={{ border: 0, background: "transparent", fontSize: 20, cursor: "pointer", lineHeight: 1 }}
        >
          ×
        </button>
      </div>
    </aside>
  );
}
