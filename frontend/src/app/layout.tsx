import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Trader Hub — Minimalist FinTech Command",
  description: "Unified Portfolio & Execution Management for Daytrad & EDCA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-black text-[#f5f5f7] min-h-screen selection:bg-white/20 selection:text-white">
        <Sidebar />
        <div className="pl-64 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 p-6 md:p-8 lg:p-10 max-w-[1600px] w-full mx-auto overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
