import Link from "next/link";
import { ArrowRight, Factory, Package } from "lucide-react";
import { ProductionType } from "@/data/mockOperations";

const toneStyles: Record<string, { icon: string; border: string }> = {
  amber: { icon: "bg-amber-100 text-amber-800", border: "hover:border-amber-300" },
  blue: { icon: "bg-blue-100 text-blue-800", border: "hover:border-blue-300" },
  violet: { icon: "bg-violet-100 text-violet-800", border: "hover:border-violet-300" },
  cyan: { icon: "bg-cyan-100 text-cyan-800", border: "hover:border-cyan-300" },
  orange: { icon: "bg-orange-100 text-orange-800", border: "hover:border-orange-300" },
  green: { icon: "bg-emerald-100 text-emerald-800", border: "hover:border-emerald-300" },
  rose: { icon: "bg-rose-100 text-rose-800", border: "hover:border-rose-300" },
};

export default function ProductionTypeCard({
  type,
  attendanceCount,
  reportCount,
}: {
  type: ProductionType;
  attendanceCount: number | string;
  reportCount: number | string;
}) {
  const tone = toneStyles[type.tone] ?? toneStyles.green;
  const Icon = type.icon === "factory" ? Factory : Package;

  return (
    <Link
      href={`/divisions/production/${type.id}`}
      className={`group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${tone.border}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`grid h-11 w-11 place-items-center rounded-xl ${tone.icon}`}>
          <Icon size={21} />
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
          Lini produksi
        </span>
      </div>
      <h3 className="mt-4 font-bold text-slate-900">{type.name}</h3>
      <p className="mt-1 min-h-10 text-sm leading-5 text-slate-500">{type.description}</p>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="flex gap-5">
          <div>
            <p className="text-sm font-bold text-slate-900">{attendanceCount}</p>
            <p className="text-[10px] text-slate-500">Absensi hari ini</p>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">{reportCount}</p>
            <p className="text-[10px] text-slate-500">Laporan</p>
          </div>
        </div>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-50 text-slate-500 transition group-hover:bg-emerald-700 group-hover:text-white">
          <ArrowRight size={16} />
        </span>
      </div>
    </Link>
  );
}
