import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { getConfig } from "@/lib/config";
import "./globals.css";

// Fonte provisória: troque quando ele definir a identidade
const font = Inter({ variable: "--font-main", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getConfig();
  return { title: profile.name, description: profile.bio };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="scroll-smooth" data-scroll-behavior="smooth">
      <body className={`${font.variable} antialiased min-h-screen font-sans`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
