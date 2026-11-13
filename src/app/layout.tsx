import type { Metadata } from "next";
import { Inter, Permanent_Marker } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { getConfig } from "@/lib/config";
import "./globals.css";

// Texto em Inter; nome e títulos com cara de pichação, como a arte do Vitinho
const font = Inter({ variable: "--font-main", subsets: ["latin"] });
const marker = Permanent_Marker({ variable: "--font-marker", weight: "400", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getConfig();
  return { title: profile.name, description: profile.bio };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="scroll-smooth" data-scroll-behavior="smooth">
      <body className={`${font.variable} ${marker.variable} antialiased min-h-screen font-sans`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
