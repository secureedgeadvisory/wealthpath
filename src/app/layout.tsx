import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorkerRegister } from "@/components/pwa/sw-register";
import { SplashScreen } from "@/components/pwa/splash-screen";
import { InstallPrompt } from "@/components/pwa/install-prompt";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0D1117",
};

export const metadata: Metadata = {
  title: "WealthPath — Your Financial Journey Starts Here",
  description:
    "Tell me your dream number and how much you can save daily. I'll show you the path, walk with you every day, and make sure you arrive.",
  keywords: ["wealth building", "financial journey", "savings", "investment education"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WealthPath",
  },
  icons: {
    apple: "/icons/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${font.variable} dark`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-screen font-sans antialiased text-[15px]">
        <ServiceWorkerRegister />
        <SplashScreen />
        {children}
        <InstallPrompt />
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
