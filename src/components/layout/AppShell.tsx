"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3, Box, ChevronDown, ClipboardCheck, Factory, FileClock,
  LayoutDashboard, Menu, PackageOpen, Recycle, Users, X,
} from "lucide-react";

const groups = [
  { label:"Dashboard", href:"/dashboard", icon:LayoutDashboard },
  { label:"Administrasi Produksi", icon:Factory, children:[
    ["Laporan Produksi Maizena","laporan-produksi-maizena"],
    ["Laporan Produksi Maizena RK","laporan-produksi-maizena-rk"],
    ["Laporan Produksi Sagu","laporan-produksi-sagu"],
    ["Produksi Tapioka 1 kg","produksi-tapioka-1kg"],
    ["Produksi Tapioka 200 gr","produksi-tapioka-200gr"],
    ["Produksi Tapioka 500 gr","produksi-tapioka-500gr"],
    ["Produksi Tapioka 2 kg","produksi-tapioka-2kg"],
    ["Timbangan Hasil Produksi","timbangan-hasil-produksi"],
    ["Pemakaian Bahan Baku Produksi","pemakaian-bahan-baku-produksi"],
  ]},
  { label:"Administrasi Gudang", icon:Box, children:[
    ["Pemakaian Benang","pemakaian-benang"],
    ["Pemakaian Karung","pemakaian-karung"],
    ["Serah Terima Hasil Produksi","serah-terima-hasil-produksi"],
  ]},
  { label:"Administrasi Operasional", icon:Recycle, children:[
    ["Laporan Plastik/Kardus Bekas","laporan-plastik-kardus-bekas"],
  ]},
  { label:"Absensi Harian", icon:Users, children:[
    ["Laporan Staff Gudang","laporan-staff-gudang"],
    ["Laporan Penanggung Jawab","laporan-penanggung-jawab"],
    ["Laporan Petugas Kebersihan","laporan-petugas-kebersihan"],
  ]},
  { label:"Approval", href:"/approvals", icon:ClipboardCheck },
  { label:"Riwayat Laporan", href:"/reports", icon:FileClock },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string[]>(["Administrasi Produksi","Administrasi Gudang","Administrasi Operasional","Absensi Harian"]);
  const title = groups.flatMap(g => g.href ? [{label:g.label,href:g.href}] : (g.children ?? []).map(([label,slug]) => ({label,href:`/reports/${slug}`}))).find(x => x.href === pathname)?.label ?? "PGA Operations";

  const toggle = (label:string) => setExpanded(v => v.includes(label) ? v.filter(x => x !== label) : [...v,label]);

  const nav = (
    <aside className="flex h-full w-72 flex-col bg-[#132744] text-white">
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#33a474]"><PackageOpen size={20}/></div>
        <div><p className="font-bold leading-tight">PGA Operations</p><p className="text-[11px] text-slate-300">Internal Operations</p></div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {groups.map((g) => {
          const Icon = g.icon;
          if (g.href) return (
            <Link key={g.label} href={g.href} onClick={() => setOpen(false)}
              className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${pathname===g.href ? "bg-[#28a36a] text-white" : "text-slate-200 hover:bg-white/8"}`}>
              <Icon size={18}/>{g.label}
            </Link>
          );
          const isOpen = expanded.includes(g.label);
          return <div key={g.label} className="mb-1">
            <button onClick={() => toggle(g.label)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-200 hover:bg-white/8">
              <Icon size={18}/><span className="flex-1 text-left">{g.label}</span><ChevronDown size={15} className={`transition ${isOpen?"rotate-180":""}`}/>
            </button>
            {isOpen && <div className="ml-5 border-l border-white/10 py-1">
              {g.children?.map(([label,slug]) => {
                const href=`/reports/${slug}`;
                return <Link key={slug} href={href} onClick={() => setOpen(false)} className={`block rounded-r-lg border-l-2 py-2 pl-4 pr-2 text-xs ${pathname===href?"border-[#4bd09a] bg-white/8 text-white":"border-transparent text-slate-300 hover:text-white"}`}>{label}</Link>;
              })}
            </div>}
          </div>;
        })}
      </nav>
      <div className="border-t border-white/10 p-4 text-xs text-slate-400">PGA Operations v0.1</div>
    </aside>
  );

  return (
    <div className="min-h-screen lg:flex">
      <div className="hidden lg:block lg:fixed lg:inset-y-0 lg:left-0">{nav}</div>
      {open && <div className="fixed inset-0 z-50 lg:hidden"><button aria-label="Tutup navigasi" className="absolute inset-0 bg-slate-950/50" onClick={() => setOpen(false)} /><div className="absolute inset-y-0 left-0">{nav}<button onClick={() => setOpen(false)} className="absolute right-3 top-3 text-white"><X size={20}/></button></div></div>}
      <div className="w-full lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-8">
          <div className="flex items-center gap-3"><button className="rounded-lg p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Buka navigasi"><Menu size={21}/></button><div><h1 className="text-base font-bold text-slate-800 lg:text-lg">{title}</h1><p className="hidden text-xs text-slate-500 sm:block">Senin, 23 November 2026</p></div></div>
          <div className="flex items-center gap-3"><div className="hidden text-right sm:block"><p className="text-xs font-semibold">Administrator Demo</p><p className="text-[11px] text-slate-500">Mock role view</p></div><div className="grid h-9 w-9 place-items-center rounded-full bg-[#132744] text-xs font-bold text-white">AD</div></div>
        </header>
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
