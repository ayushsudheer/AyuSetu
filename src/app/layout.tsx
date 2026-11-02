import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BhashaBridge – Speak Your Language, Be Understood",
  description:
    "AI-powered multilingual voice-to-complaint generator for Indian citizens. Speak in Hindi, Marathi, and 20+ Indian languages to generate formal, authoritative legal & civic complaints using Sarvam Saaras v4 and Sarvam 105B.",
  keywords: [
    "Sarvam AI",
    "BhashaBridge",
    "Speech to Text",
    "Indic LLM",
    "Grievance Generator",
    "Consumer Complaint",
    "CPGRAMS",
    "Multilingual AI",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased selection:bg-indigo-500 selection:text-white bg-[#eef2f8] text-slate-800">
        {children}
      </body>
    </html>
  );
}
