"use client";
import { useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, FileText, Eye } from "lucide-react";
import { mockReports } from "@/data/mockReports";
import ReportStatusBadge from "@/components/reports/ReportStatusBadge";
import ReportDetail from "@/components/reports/ReportDetail";
import { Report } from "@/types/report";

export default function DashboardPage() {
  const [selected,setSelected]=useState<Report|null>(null);
  const today=mockReports.filter(r=>r.reportDate==="2026-11-23");
  const stats=[
    ["Total Laporan Hari Ini",today.length,FileText,"bg-blue-50 text-blue-700"],
    ["Menunggu Approval",mockReports.filter(r=>["submitted","under_review"].includes(r.status)).length,Clock3,"bg-amber-50 text-amber-700"],
    ["Disetujui",mockReports.filter(r=>r.status==="approved").length,CheckCircle2,"bg-emerald-50 text-emerald-700"],
    ["Perlu Revisi",mockReports.filter(r=>r.status==="revision_requested").length,AlertTriangle,"bg-red-50 text-red-700"],
  ] as const;
  const dept=["Produksi","Gudang","Operasional","Absensi"] as const;
  const pending=mockReports.filter(r=>r.status==="submitted"||r.status==="under_review");

  return <div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(([label,value,Icon,color])=>(
        <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,.05)]">
          <div className="flex items-start justify-between"><div><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold text-slate-800">{value}</p></div><div className={`grid h-10 w-10 place-items-center rounded-lg ${color}`}><Icon size={20}/></div></div>
        </div>
      ))}
    </div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,.8fr)]">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b px-5 py-4"><h2 className="font-bold">Recent Reports</h2></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">No. Laporan</th><th className="px-5 py-3">Nama Laporan</th><th className="px-5 py-3">Departemen</th><th className="px-5 py-3">Pengirim</th><th className="px-5 py-3">Status</th><th className="px-5 py-3"></th></tr></thead>
          <tbody className="divide-y">{mockReports.slice(0,5).map(r=><tr key={r.id} className="hover:bg-slate-50"><td className="px-5 py-3 font-medium text-slate-700">{r.reportNumber}</td><td className="px-5 py-3">{r.reportName}</td><td className="px-5 py-3">{r.department}</td><td className="px-5 py-3">{r.submittedBy}</td><td className="px-5 py-3"><ReportStatusBadge status={r.status}/></td><td className="px-5 py-3"><button onClick={()=>setSelected(r)} className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800" aria-label="Lihat detail"><Eye size={17}/></button></td></tr>)}</tbody>
        </table></div>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-bold">Department Summary</h2><div className="mt-5 space-y-4">{dept.map(d=>{const count=mockReports.filter(r=>r.department===d).length;return <div key={d}><div className="mb-1.5 flex justify-between text-sm"><span>{d}</span><span className="font-bold">{count}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#2e9e6b]" style={{width:`${Math.max(10,count*18)}%`}}/></div></div>})}</div></section>
    </div>
    <section className="rounded-xl border border-slate-200 bg-white"><div className="border-b px-5 py-4"><h2 className="font-bold">Pending Approvals</h2></div><div className="divide-y">{pending.map(r=><div key={r.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{r.reportName}</p><p className="mt-1 text-xs text-slate-500">{r.reportNumber} · {r.submittedBy}</p></div><div className="flex items-center gap-3"><ReportStatusBadge status={r.status}/><a href="/approvals" className="text-sm font-semibold text-[#217a54] hover:underline">Tinjau</a></div></div>)}</div></section>
    <ReportDetail report={selected} onClose={()=>setSelected(null)} />
  </div>;
}
