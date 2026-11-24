"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ProductionReportList from "@/components/operations/ProductionReportList";
import { productionTypes } from "@/data/mockOperations";

export default function ProductionReportsPage() {
  const { type: typeId } = useParams<{ type: string }>();
  const type = productionTypes.find((item) => item.id === typeId);
  if (!type) return <p className="rounded-xl bg-white p-6 text-sm text-slate-600">Tipe produksi tidak ditemukan.</p>;

  return (
    <div className="space-y-4">
      <Link
        href={`/divisions/production/${type.id}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-800"
      >
        <ArrowLeft size={14} /> Kembali ke workspace
      </Link>
      <ProductionReportList type={type} />
    </div>
  );
}
