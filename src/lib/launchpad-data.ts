// ─── Launchpad Setup Guide Data ───
// Dynamically generated based on path vehicle_mix

import type { VehicleMix } from "@/types";

export interface SetupPlatform {
  name: string;
  region: string;
  url?: string;
}

export interface StarterTip {
  label: string;
  detail: string;
}

export interface SetupSection {
  id: string;
  vehicle: string;
  allocation: number;
  title: string;
  explanation: string;
  platforms: SetupPlatform[];
  starterTips: StarterTip[];
  warning?: string;
}

const VEHICLE_CONFIGS: Record<
  string,
  Omit<SetupSection, "id" | "vehicle" | "allocation">
> = {
  savings: {
    title: "Open a high-yield savings account",
    explanation:
      "High-yield savings currently offer 4-5% APY — stable, risk-free growth with instant access to your money.",
    platforms: [
      { name: "Wio Bank", region: "UAE" },
      { name: "Mashreq Neo", region: "UAE" },
      { name: "Marcus by Goldman Sachs", region: "US" },
      { name: "Ally Bank", region: "US" },
      { name: "Chip", region: "UK" },
      { name: "Monzo", region: "UK" },
    ],
    starterTips: [
      { label: "Look for no-fee accounts", detail: "Avoid accounts that charge monthly maintenance fees" },
      { label: "Check APY, not APR", detail: "APY includes compounding — it's the real return" },
      { label: "Enable auto-transfer", detail: "Set up daily auto-transfer from your checking account" },
    ],
  },
  gold: {
    title: "Set up a gold investment account",
    explanation:
      "Gold has historically returned 8-12% annually and acts as an inflation hedge during market downturns.",
    platforms: [
      { name: "Dubai Gold Souk (Physical)", region: "UAE" },
      { name: "UAE Gold ETF via Sarwa", region: "UAE" },
      { name: "Vaulted", region: "US" },
      { name: "APMEX", region: "US" },
      { name: "BullionVault", region: "Global" },
      { name: "iShares Gold Trust (IAU)", region: "Global" },
    ],
    starterTips: [
      { label: "ETFs are easier than physical", detail: "Gold ETFs like GLD or IAU trade like stocks — no storage needed" },
      { label: "Start with paper gold", detail: "Physical gold has storage costs and premiums — start digital" },
    ],
  },
  etf: {
    title: "Open a brokerage account for ETF investing",
    explanation:
      "Index ETFs track the market and historically return 10-15% annually. Set up auto-invest if your broker supports it.",
    platforms: [
      { name: "Sarwa", region: "UAE" },
      { name: "Interactive Brokers", region: "UAE / Global" },
      { name: "Saxo Bank", region: "UAE / Global" },
      { name: "Vanguard", region: "US" },
      { name: "Fidelity", region: "US" },
      { name: "Charles Schwab", region: "US" },
      { name: "Trading 212", region: "EU / UK" },
    ],
    starterTips: [
      { label: "VOO or VTI", detail: "S&P 500 or US Total Market — the gold standard of passive investing" },
      { label: "VWRA", detail: "All-world ETF — global diversification in one fund" },
      { label: "QQQ", detail: "Nasdaq-100 tech-heavy — higher growth, higher volatility" },
      { label: "Set up auto-invest", detail: "Most brokers let you schedule recurring purchases — set it and forget it" },
    ],
  },
  crypto: {
    title: "Set up a crypto exchange account",
    explanation:
      "Crypto is the highest-growth and highest-risk vehicle. Use the exchange's recurring buy feature to automate your daily DCA.",
    platforms: [
      { name: "Crypto.com", region: "Global" },
      { name: "Binance", region: "Global" },
      { name: "Coinbase", region: "US / EU" },
      { name: "BitOasis", region: "UAE / GCC" },
      { name: "Rain", region: "UAE / GCC" },
      { name: "Kraken", region: "Global" },
    ],
    starterTips: [
      { label: "Start BTC/ETH 50/50", detail: "The two largest cryptocurrencies — safest entry point" },
      { label: "Use recurring buy", detail: "Most exchanges offer auto-DCA — removes emotion from buying" },
      { label: "Enable 2FA immediately", detail: "Authenticator app, not SMS — critical for security" },
      { label: "Never share your seed phrase", detail: "No legitimate service will ever ask for it" },
    ],
    warning:
      "Never invest more in crypto than you can afford to lose. This is the volatile portion of your path. Crypto markets can drop 50%+ in weeks.",
  },
};

export function generateSetupSections(vehicleMix: VehicleMix): SetupSection[] {
  return Object.entries(vehicleMix)
    .filter(([, pct]) => pct && pct > 0)
    .map(([vehicle, pct]) => {
      const config = VEHICLE_CONFIGS[vehicle];
      if (!config) return null;
      return {
        id: `setup-${vehicle}`,
        vehicle,
        allocation: pct!,
        ...config,
        explanation: config.explanation.replace(
          /\d+-\d+%/,
          config.explanation.match(/\d+-\d+%/)?.[0] || ""
        ) + ` Your path allocates ${pct}% here.`,
      };
    })
    .filter(Boolean) as SetupSection[];
}
