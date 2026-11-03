import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { SiteBackground } from "@/components/SiteBackground";
import "./globals.css";

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "11.11 Lucky Wheel | Exclusive discounts",
  description: "Spin once for exclusive 11.11 sale discounts. One entry per French mobile number.",
  openGraph: {
    title: "11.11 Lucky Wheel",
    description: "Spin once for exclusive sale discounts.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans">
        <SiteBackground />
        {children}
      </body>
    </html>
  );
}
