import type { Metadata } from "next";
import { DM_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-receipt",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "STLL HAUS Photobooth",
  description: "Thermal keepsake layouts for still moments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${geistMono.variable} min-h-dvh antialiased`}
    >
      {/*
        min-h-dvh on body avoids iOS Safari flex children collapsing to 0 height
        (looked like a blank / black full-screen area behind routed content).
      */}
      <body className="flex min-h-dvh w-full flex-col">{children}</body>
    </html>
  );
}
