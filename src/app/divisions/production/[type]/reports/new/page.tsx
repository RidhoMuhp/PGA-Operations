"use client";

import { useParams } from "next/navigation";
import ProductionReportForm from "@/components/operations/ProductionReportForm";
import { productionTypes } from "@/data/mockOperations";

export default function NewProductionReportPage() {
  const { type: typeId } = useParams<{ type: string }>();
  const type = productionTypes.find((item) => item.id === typeId);
  if (!type) return <p className="rounded-xl bg-white p-6 text-sm text-slate-600">Tipe produksi tidak ditemukan.</p>;

  return <ProductionReportForm type={type} />;
}
