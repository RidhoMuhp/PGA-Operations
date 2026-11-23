import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "PGA Operations",
  description: "PT Pancaran Gemilang Abadi - Internal Operations Management System",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body><AppShell>{children}</AppShell></body>
    </html>
  );
}
