import type { Metadata } from "next";
import CountryMarkets from "../components/marketplace/CountryMarkets";
import DeploymentBadge from "../components/marketplace/DeploymentBadge";
import ListingSync from "../components/marketplace/ListingSync";
import MarketCountryBridge from "../components/marketplace/MarketCountryBridge";
import MarketplaceControlBar from "../components/operations/MarketplaceControlBar";
import "./globals.css";
import "./operations.css";

export const metadata: Metadata = {
  title: "FUAD ESMART Marketplace",
  description: "FUAD ESMART is Ethiopia's Oromo, English and Amharic marketplace for farmers, livestock, manufacturers, sellers, brokers, electronics, minerals, property and buyers.",
  other: { "codex-preview": "development" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="om"><body><DeploymentBadge /><MarketCountryBridge /><ListingSync />{children}<CountryMarkets /><MarketplaceControlBar /></body></html>;
}
