"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import ReportDetail from "@/components/reports/ReportDetail";
import ReportStatusBadge from "@/components/reports/ReportStatusBadge";
import { useOperations } from "@/components/operations/OperationsProvider";
import type { OperationsReport } from "@/types/operations";

export default function ApprovalsPage() {
  const { data, ready, updateReportStatus } = useOperations();
  const [selected, setSelected] = useState<OperationsReport | null>(null);
  const [revisionFor, setRevisionFor] = useState<OperationsReport | null>(null);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [error, setError] = useState("");
  const [savingReportId, setSavingReportId] = useState<string | null>(null);

  const eligible = data.reports
    .filter((report) =>
      ["submitted", "under_review", "approved", "revision_requested"].includes(report.status),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const handleAction = async (
    report: OperationsReport,
    action: "approve" | "request-revision" | "collect",
    notes?: string,
  ) => {
    if (savingReportId) return;
    setSavingReportId(report.id);
    try {
      const result = await updateReportStatus(report.id, action, notes);
      if (!result.success) {
        setError(result.message);
        return;
      }
      setError("");
      setRevisionFor(null);
      setRevisionNotes("");
    } finally {
      setSavingReportId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-emerald-800">Pemeriksaan Penanggung Jawab</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-950">Approval Laporan</h2>
        <p className="mt-1 text-sm text-slate-500">
          Review laporan dilakukan terpisah dari tinjauan absensi pegawai.
        </p>
      </div>
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="font-bold text-slate-900">Laporan untuk Ditinjau</h3>
            <p className="mt-1 text-xs text-slate-500">{ready ? `${eligible.length} laporan dalam alur review` : "Memuat data Supabase..."}</p>
          </div>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-800"><CheckCircle2 size={18} /></span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[790px] text-left text-sm">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
              <tr><th className="px-5 py-3">Laporan</th><th className="px-5 py-3">Divisi</th><th className="px-5 py-3">Pelapor</th><th className="px-5 py-3">Tanggal</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Tindakan</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {eligible.map((report) => (
                <tr key={report.id}>
                  <td className="px-5 py-3.5"><p className="font-semibold text-slate-800">{report.reportName}</p><p className="mt-0.5 text-xs text-slate-400">{report.reportNumber}</p></td>
                  <td className="px-5 py-3.5 text-slate-600">{report.department}</td>
                  <td className="px-5 py-3.5 text-slate-600">{report.submittedBy}</td>
                  <td className="px-5 py-3.5 text-slate-600">{report.reportDate}</td>
                  <td className="px-5 py-3.5"><ReportStatusBadge status={report.status} /></td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      {report.status === "approved" ? (
                        <button disabled={savingReportId === report.id} onClick={() => void handleAction(report, "collect")} className="rounded-lg border border-violet-200 px-2.5 py-1.5 text-xs font-semibold text-violet-800 hover:bg-violet-50 disabled:opacity-50">Tandai diterima</button>
                      ) : report.status === "revision_requested" ? (
                        <button onClick={() => setSelected(report)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">Lihat detail</button>
                      ) : (
                        <>
                          <button disabled={savingReportId === report.id} onClick={() => void handleAction(report, "approve")} className="rounded-lg bg-emerald-700 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">Approve</button>
                          <button onClick={() => { setRevisionFor(report); setRevisionNotes(""); }} className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50">Minta revisi</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {ready && !eligible.length && <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-500">Tidak ada laporan dalam antrean approval.</td></tr>}
              {!ready && <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-500">Memuat data Supabase...</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <ReportDetail report={selected} onClose={() => setSelected(null)} />
      {revisionFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button className="absolute inset-0 bg-slate-950/50" onClick={() => setRevisionFor(null)} aria-label="Tutup catatan revisi" />
          <section className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-slate-100 px-5 py-4">
              <h3 className="font-bold text-slate-900">Minta Revisi</h3>
              <p className="mt-1 text-xs text-slate-500">{revisionFor.reportNumber} · {revisionFor.reportName}</p>
            </div>
            <div className="p-5">
              <label className="text-sm font-semibold text-slate-700">
                Catatan untuk pelapor
                <textarea value={revisionNotes} onChange={(event) => setRevisionNotes(event.target.value)} rows={5} className="mt-1.5 block w-full rounded-xl border border-slate-300 p-3 text-sm font-normal" placeholder="Jelaskan bagian yang perlu diperbaiki..." />
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
              <button onClick={() => setRevisionFor(null)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Batal</button>
              <button
                disabled={revisionNotes.trim().length < 3 || savingReportId === revisionFor.id}
                onClick={() => void handleAction(revisionFor, "request-revision", revisionNotes)}
                className="rounded-xl bg-red-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                Kirim catatan
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
