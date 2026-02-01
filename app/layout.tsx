import type { Metadata } from "next";
import { Inter, Space_Mono } from "next/font/google";
import "./globals.css"; // CRITICAL: This link must exist to "turn on" the styles

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceMono = Space_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "The Sentient Home",
  description: "NeuroDesign™ Sensory Intelligence for Everyday Living",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${spaceMono.variable} antialiased font-sans`}>
        {children}
      </body>
    </html>
  );
}
