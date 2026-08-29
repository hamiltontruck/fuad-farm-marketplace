import Link from "next/link";

export default function MarketplaceControlBar() {
  return (
    <nav className="ops-floating-nav" aria-label="Marketplace database controls">
      <Link href="/post">＋ Photo post</Link>
      <Link href="/live-listings">Cloud posts</Link>
      <Link href="/saved">♡ Saved</Link>
      <Link href="/customer-dashboard">Dashboard</Link>
      <Link href="/broker-dashboard">Broker</Link>
      <Link href="/notifications">Alerts</Link>
      <Link href="/admin">Admin</Link>
      <Link href="/system-check">Check</Link>
    </nav>
  );
}
