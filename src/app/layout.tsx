import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/context/ThemeContext"; // ⭐ IMPORT DU THEME CONTEXT

// Polices Google
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Métadonnées de ton app
export const metadata: Metadata = {
  title: "IALynk",
  description: "Tableau de bord intelligent pour l’immobilier",
};

// Layout global (SERVER COMPONENT)
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          backgroundColor: "#f9fafb",
          minHeight: "100vh",
          margin: 0,
        }}
      >
        {/* ⭐ TOUT TON CRM PASSE DANS LE THEME PROVIDER */}
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
