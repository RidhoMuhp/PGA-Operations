"use client";

import { useMemo, useState } from "react";
import { Eye, Search } from "lucide-react";
import ReportDetail from "@/components/reports/ReportDetail";
import ReportStatusBadge from "@/components/reports/ReportStatusBadge";
import { useOperations } from "@/components/operations/OperationsProvider";
import { divisions } from "@/data/mockOperations";
import { OperationsReport } from "@/types/operations";

export default function ReportsIndex({ history = false }: { history?: boolean }) {
  const { data, ready } = useOperations();
  const [search, setSearch] = useState("");
  const [division, setDivision] = useState("all");
  const [status, setStatus] = useState("all");
  const [date, setDate] = useState("");
  const [selected, setSelected] = useState<OperationsReport | null>(null);

  const reports = useMemo(
    () =>
      data.reports
        .filter((report) => division === "all" || report.divisionId === division)
        .filter((report) => status === "all" || report.status === status)
        .filter((report) => !date || report.reportDate === date)
        .filter((report) => {
          const query = search.trim().toLocaleLowerCase();
          return (
            !query ||
            report.reportName.toLocaleLowerCase().includes(query) ||
            report.reportNumber.toLocaleLowerCase().includes(query) ||
            report.submittedBy.toLocaleLowerCase().includes(query)
          );
        })
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [data.reports, date, division, search, status],
  );

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-emerald-800">
          {history ? "Arsip Operasional" : "Semua Divisi"}
        </p>
        <h2 className="mt-1 text-2xl font-bold text-slate-950">
          {history ? "Riwayat Laporan" : "Semua Laporan"}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {history
            ? "Cari dan tinjau laporan dari seluruh divisi."
            : "Daftar laporan lintas divisi, termasuk draft dan yang sedang ditinjau."}
        </p>
      </div>
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[minmax(210px,1fr)_170px_170px_190px]">
        <div className="relative">
          <Search size={17} className="absolute left-3 top-2.5 text-slate-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari laporan, nomor, atau pegawai" className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500" />
        </div>
        <select value={division} onChange={(event) => setDivision(event.target.value)} aria-label="Filter divisi" className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm">
          <option value="all">Semua divisi</option>
          {divisions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter status" className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm">
          <option value="all">Semua status</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="revision_requested">Perlu Revisi</option>
          <option value="approved">Approved</option>
          <option value="collected">Collected</option>
        </select>
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} aria-label="Filter tanggal" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="font-bold text-slate-900">{history ? "Arsip Laporan" : "Daftar Laporan"}</h3>
            <p className="mt-1 text-xs text-slate-500">{ready ? `${reports.length} laporan ditemukan` : "Memuat data Supabase..."}</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[790px] text-left text-sm">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
              <tr><th className="px-5 py-3">Nomor / laporan</th><th className="px-5 py-3">Divisi</th><th className="px-5 py-3">Tanggal</th><th className="px-5 py-3">Pelapor</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Detail</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3.5"><p className="font-semibold text-slate-800">{report.reportName}</p><p className="mt-0.5 text-xs text-slate-400">{report.reportNumber}</p></td>
                  <td className="px-5 py-3.5 text-slate-600">{report.department}{report.productionTypeId ? <span className="mt-0.5 block text-[11px] text-slate-400">{report.productionTypeId.replaceAll("-", " ")}</span> : null}</td>
                  <td className="px-5 py-3.5 text-slate-600">{report.reportDate}</td>
                  <td className="px-5 py-3.5 text-slate-600">{report.submittedBy}</td>
                  <td className="px-5 py-3.5"><ReportStatusBadge status={report.status} /></td>
                  <td className="px-5 py-3.5"><button type="button" onClick={() => setSelected(report)} aria-label={`Lihat ${report.reportName}`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Eye size={17} /></button></td>
                </tr>
              ))}
              {ready && !reports.length && <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-500">Tidak ada laporan sesuai filter.</td></tr>}
              {!ready && <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-500">Memuat data Supabase...</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      <ReportDetail report={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
