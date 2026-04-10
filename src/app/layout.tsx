import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ToasterProvider } from "@/components/ui/toaster-provider";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JechangeMaMutuelle",
  description:
    "SaaS moderne de demandes mutuelle, paiement en ligne et gestion de leads.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50 font-sans text-slate-900">
        {children}
        <ToasterProvider />
      </body>
    </html>
  );
}
