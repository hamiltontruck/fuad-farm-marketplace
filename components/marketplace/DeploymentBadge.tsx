export default function DeploymentBadge() {
  return (
    <div
      role="status"
      aria-label="FUAD Marketplace deployment status"
      style={{
        position: "relative",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        width: "100%",
        minHeight: 38,
        padding: "8px 14px",
        boxSizing: "border-box",
        background: "linear-gradient(90deg, #06213f 0%, #0a4b78 50%, #06213f 100%)",
        color: "#ffffff",
        fontSize: 13,
        fontWeight: 800,
        letterSpacing: "0.02em",
        textAlign: "center",
        borderBottom: "1px solid rgba(255,255,255,0.18)",
      }}
    >
      <span aria-hidden="true">●</span>
      <span>FUAD Marketplace · Africa Market · Supabase Connected</span>
    </div>
  );
}
