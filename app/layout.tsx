import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FUAD ESMART Marketplace",
  description: "Ethiopia's multi-sector marketplace for farmers, livestock, manufacturers, sellers, brokers, electronics, minerals, property and buyers.",
  other: { "codex-preview": "development" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="om"><body>{children}</body></html>;
}
