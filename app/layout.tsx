import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/lib/auth/context";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DiploChain — Vérification Sécurisée des Diplômes",
    template: "%s | DiploChain",
  },
  description:
    "DiploChain certifie les diplômes burkinabè par cryptographie RSA et blockchain Polygon. Vérification instantanée par les recruteurs et établissements.",
  keywords: [
    "diplôme",
    "blockchain",
    "vérification",
    "Burkina Faso",
    "MIABE 2026",
    "cryptographie",
    "Polygon",
  ],
  authors: [{ name: "Equipe-BF-10" }],
  openGraph: {
    title: "DiploChain — Vérification Sécurisée des Diplômes",
    description:
      "Système de certification de diplômes par cryptographie et blockchain pour les universités burkinabè.",
    locale: "fr_BF",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-white text-slate-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
