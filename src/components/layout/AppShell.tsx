"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  ClipboardCheck,
  Database,
  FileClock,
  Files,
  LayoutDashboard,
  Menu,
  PackageOpen,
  Settings,
  X,
} from "lucide-react";
import {
  attendanceTerminals,
  divisions,
  productionTypes,
} from "@/data/mockOperations";
import { useOperations } from "@/components/operations/OperationsProvider";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Semua Laporan", href: "/reports", icon: Files },
  { label: "Approval", href: "/approvals", icon: ClipboardCheck },
  { label: "Riwayat Laporan", href: "/reports/history", icon: FileClock },
  { label: "Master Data", href: "/master-data", icon: Database },
  { label: "Pengaturan", href: "/settings", icon: Settings },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const { persistenceError } = useOperations();

  useEffect(() => {
    setCurrentDate(
      new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date()),
    );
  }, []);

  const title = useMemo(() => {
    if (pathname === "/dashboard") return "Dashboard";
    if (pathname === "/reports") return "Semua Laporan";
    if (pathname === "/reports/history") return "Riwayat Laporan";
    if (pathname === "/approvals") return "Approval Laporan";
    if (pathname === "/master-data") return "Master Data";
    if (pathname === "/settings") return "Pengaturan";
    if (pathname.startsWith("/terminals/")) {
      const terminalId = pathname.split("/")[2];
      const terminal = attendanceTerminals.find((item) => item.id === terminalId);
      return productionTypes.find((type) => type.id === terminal?.productionTypeId)?.name
        ?? "Terminal Absensi";
    }
    if (pathname.startsWith("/divisions/production")) {
      const typeId = pathname.split("/")[3];
      return productionTypes.find((type) => type.id === typeId)?.name ?? "Workspace Produksi";
    }
    if (pathname.startsWith("/divisions/")) {
      const divisionId = pathname.split("/")[2];
      return divisions.find((division) => division.id === divisionId)?.name ?? "Workspace Divisi";
    }
    if (pathname.startsWith("/reports/")) {
      const slug = pathname.split("/")[2];
      return productionTypes.find((type) => type.id === slug)?.name ?? "Laporan Divisi";
    }
    return "PGA Operations System";
  }, [pathname]);

  const sidebar = (
    <aside className="flex h-full w-[272px] flex-col bg-[#10233f] text-white">
      <div className="flex h-[76px] items-center gap-3 border-b border-white/10 px-5">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500 shadow-lg shadow-emerald-950/30">
          <PackageOpen size={21} />
        </div>
        <div>
          <p className="font-bold leading-tight">PGA Operations</p>
          <p className="mt-1 text-[11px] text-slate-400">Operations management</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5" aria-label="Navigasi utama">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
          Menu utama
        </p>
        {navigation.map(({ label, href, icon: Icon }) => {
          const active =
            pathname === href ||
            (href === "/reports" && pathname.startsWith("/reports/") && pathname !== "/reports/history");
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-950/20"
                  : "text-slate-300 hover:bg-white/7 hover:text-white"
              }`}
            >
              <Icon size={18} strokeWidth={1.8} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-5 py-4">
        <p className="text-xs font-semibold text-slate-300">Mode demonstrasi</p>
        <p className="mt-1 text-[11px] text-slate-500">Data mock tersimpan di browser</p>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">{sidebar}</div>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Tutup navigasi"
            className="absolute inset-0 bg-slate-950/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0">
            {sidebar}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-5 rounded-lg p-2 text-white hover:bg-white/10"
              aria-label="Tutup menu"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
      <div className="w-full lg:pl-[272px]">
        <header className="sticky top-0 z-20 flex min-h-[76px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Buka navigasi"
            >
              <Menu size={21} />
            </button>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                PGA Operations System
              </p>
              <h1 className="mt-0.5 text-lg font-bold text-slate-900">{title}</h1>
              {currentDate && (
                <p className="mt-0.5 hidden text-xs capitalize text-slate-500 sm:block">
                  {currentDate}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              aria-label="Notifikasi demo"
              title="Notifikasi demo"
              className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            </button>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">Administrator Demo</p>
              <p className="text-[11px] text-slate-500">Profil tampilan</p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#10233f] text-xs font-bold text-white ring-2 ring-emerald-100">
              AD
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1600px] p-4 md:p-6 lg:p-8">
          {persistenceError && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
            >
              {persistenceError}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
