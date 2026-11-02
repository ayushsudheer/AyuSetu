import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BhashaBridge – Speak Your Language, Be Understood",
  description:
    "Convert spoken Hindi, Marathi & 20+ Indian language voice complaints into formal, professional grievance letters using Sarvam AI. Free, instant, no login needed.",
  keywords: ["Sarvam AI", "BhashaBridge", "voice grievance", "Indic languages", "complaint generator", "CPGRAMS", "consumer complaint India"],
  openGraph: {
    title: "BhashaBridge – Speak Your Language, Be Understood",
    description: "AI-powered multilingual voice-to-complaint generator for Indian citizens",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
