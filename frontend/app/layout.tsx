import type { Metadata } from "next";
import "./globals.css";
import { ClientLayout } from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "AssetFlow - Enterprise Asset & Resource Management",
  description: "Enterprise Asset Management ERP for Odoo Hackathon 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
