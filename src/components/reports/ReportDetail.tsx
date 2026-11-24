"use client";
import { X } from "lucide-react";
import { Report } from "@/types/report";
import { ThreadUsageReport } from "@/types/threadUsage";
import { WasteMaterialReport } from "@/types/wasteMaterial";
import ReportStatusBadge from "./ReportStatusBadge";

export default function ReportDetail({ report, onClose }: { report:(Report|ThreadUsageReport|WasteMaterialReport)|null; onClose:()=>void }) {
  if (!report) return null;
  const productionTypeId = "productionTypeId" in report && typeof report.productionTypeId === "string"
    ? report.productionTypeId
    : undefined;
  return <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
    <button className="absolute inset-0 bg-slate-950/40" onClick={onClose} aria-label="Tutup"/>
    <div className="relative w-full max-w-lg rounded-xl bg-white shadow-xl">
      <div className="flex items-center justify-between border-b px-5 py-4"><h2 className="font-bold">Detail Laporan</h2><button onClick={onClose} className="rounded p-1 hover:bg-slate-100"><X size={18}/></button></div>
      <div className="space-y-4 p-5">
        <div className="flex justify-between"><div><p className="text-xs text-slate-500">Nomor Laporan</p><p className="font-semibold">{report.reportNumber}</p></div><ReportStatusBadge status={report.status}/></div>
        <dl className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4 text-sm"><div><dt className="text-xs text-slate-500">Nama Laporan</dt><dd className="mt-1 font-medium">{report.reportName}</dd></div><div><dt className="text-xs text-slate-500">Departemen</dt><dd className="mt-1 font-medium">{report.department}</dd></div><div><dt className="text-xs text-slate-500">Dibuat oleh</dt><dd className="mt-1 font-medium">{report.submittedBy}</dd></div><div><dt className="text-xs text-slate-500">Tanggal</dt><dd className="mt-1 font-medium">{report.reportDate}</dd></div></dl>
        {productionTypeId && <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm"><p className="text-xs font-semibold text-emerald-800">Tipe produksi</p><p className="mt-1 capitalize">{productionTypeId.replaceAll("-", " ")}</p></div>}
        {report.notes && <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm"><p className="text-xs font-semibold text-amber-800">{report.status === "revision_requested" ? "Catatan revisi" : "Catatan laporan"}</p><p className="mt-1">{report.notes}</p></div>}
        {"machineUsage" in report && <div className="overflow-x-auto"><h3 className="mb-2 text-sm font-bold">Catatan Pemakaian Benang (roll/cone)</h3><table className="w-full min-w-[480px] text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="px-3 py-2 text-left">Mesin</th><th className="px-3 py-2 text-right">Stok awal</th><th className="px-3 py-2 text-right">Tambahan</th><th className="px-3 py-2 text-right">Terpakai</th><th className="px-3 py-2 text-right">Sisa</th></tr></thead><tbody className="divide-y">{report.machineUsage.map(machine=><tr key={machine.machine}><td className="px-3 py-2">M{machine.machine}</td><td className="px-3 py-2 text-right">{machine.openingStock}</td><td className="px-3 py-2 text-right">{machine.added}</td><td className="px-3 py-2 text-right">{machine.used}</td><td className="px-3 py-2 text-right font-semibold">{machine.remaining}</td></tr>)}</tbody></table></div>}
        {"materials" in report && <div><h3 className="mb-2 text-sm font-bold">Daftar Plastik/Kardus Bekas</h3><div className="space-y-2">{report.materials.map((material,index)=><div key={`${material.itemName}-${index}`} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"><span>{material.itemName}</span><span className="font-medium">{material.weightKg} kg · {material.quantity} {material.quantityUnit}</span></div>)}</div></div>}
      </div>
      <div className="flex justify-end border-t px-5 py-3"><button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-slate-50">Tutup</button></div>
    </div>
  </div>;
}
