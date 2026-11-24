import Link from "next/link";
import { ArrowUpRight, Factory, Package, Recycle, Sparkles } from "lucide-react";
import { DivisionDefinition } from "@/data/mockOperations";

const icons = {
  factory: Factory,
  warehouse: Package,
  recycle: Recycle,
  cleaning: Sparkles,
};

const accents = {
  emerald: {
    icon: "bg-emerald-100 text-emerald-800",
    border: "hover:border-emerald-300",
    link: "text-emerald-800",
    pill: "bg-emerald-50 text-emerald-800",
  },
  blue: {
    icon: "bg-blue-100 text-blue-800",
    border: "hover:border-blue-300",
    link: "text-blue-800",
    pill: "bg-blue-50 text-blue-800",
  },
  amber: {
    icon: "bg-amber-100 text-amber-800",
    border: "hover:border-amber-300",
    link: "text-amber-800",
    pill: "bg-amber-50 text-amber-800",
  },
  violet: {
    icon: "bg-violet-100 text-violet-800",
    border: "hover:border-violet-300",
    link: "text-violet-800",
    pill: "bg-violet-50 text-violet-800",
  },
};

export interface DivisionMetrics {
  attendanceToday: number | string;
  submittedReports: number | string;
  pendingApprovals: number | string;
}

export default function DivisionCard({
  division,
  metrics,
}: {
  division: DivisionDefinition;
  metrics: DivisionMetrics;
}) {
  const Icon = icons[division.icon];
  const accent = accents[division.accent as keyof typeof accents];

  return (
    <article
      className={`group relative flex min-h-[270px] flex-col overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${
        division.id === "production"
          ? "border-emerald-200 ring-1 ring-emerald-100"
          : `border-slate-200 ${accent.border}`
      }`}
    >
      {division.id === "production" && (
        <div className="absolute right-0 top-0 rounded-bl-xl bg-emerald-700 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white">
          7 tipe produksi
        </div>
      )}
      <div className="flex items-start gap-4">
        <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${accent.icon}`}>
          <Icon size={23} strokeWidth={1.8} />
        </div>
        <div className="min-w-0 pt-0.5">
          <h3 className="text-lg font-bold text-slate-900">{division.name}</h3>
          <p className="mt-1 text-sm leading-5 text-slate-500">{division.description}</p>
        </div>
      </div>

      <div className="mt-auto grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
        <div>
          <p className="text-xl font-bold text-slate-900">{metrics.attendanceToday}</p>
          <p className="mt-0.5 text-[10px] leading-4 text-slate-500 sm:text-xs">Absensi hari ini</p>
        </div>
        <div>
          <p className="text-xl font-bold text-slate-900">{metrics.submittedReports}</p>
          <p className="mt-0.5 text-[10px] leading-4 text-slate-500 sm:text-xs">Laporan dikirim</p>
        </div>
        <div>
          <p className="text-xl font-bold text-slate-900">{metrics.pendingApprovals}</p>
          <p className="mt-0.5 text-[10px] leading-4 text-slate-500 sm:text-xs">Menunggu approval</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${accent.pill}`}>
          {division.id === "production" ? "Workspace lini produksi" : "Workspace divisi"}
        </span>
        <Link
          href={division.href}
          className={`inline-flex items-center gap-1 text-sm font-bold ${accent.link}`}
        >
          Buka workspace
          <ArrowUpRight size={16} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </article>
  );
}
