"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, Plus, Search } from "lucide-react";
import ReportStatusBadge from "@/components/reports/ReportStatusBadge";
import ReportDetail from "@/components/reports/ReportDetail";
import WasteMaterialForm from "@/components/forms/WasteMaterialForm";
import ThreadUsageForm from "@/components/forms/ThreadUsageForm";
import type { ThreadUsageFormData } from "@/components/forms/ThreadUsageForm";
import { useOperations } from "@/components/operations/OperationsProvider";
import { departmentName, divisions } from "@/data/mockOperations";
import type { OperationsReport } from "@/types/operations";
import type { WasteMaterialSubmission } from "@/types/wasteMaterial";

const reportCategories: Record<string, { title: string; divisionId: OperationsReport["divisionId"] }> = {
  "laporan-produksi-maizena": { title: "Laporan Produksi Maizena", divisionId: "production" },
  "laporan-produksi-maizena-rk": { title: "Laporan Produksi Maizena RK", divisionId: "production" },
  "laporan-produksi-sagu": { title: "Laporan Produksi Sagu", divisionId: "production" },
  "produksi-tapioka-1kg": { title: "Produksi Tapioka 1 kg", divisionId: "production" },
  "produksi-tapioka-200gr": { title: "Produksi Tapioka 200 gr", divisionId: "production" },
  "produksi-tapioka-500gr": { title: "Produksi Tapioka 500 gr", divisionId: "production" },
  "produksi-tapioka-2kg": { title: "Produksi Tapioka 2 kg", divisionId: "production" },
  "timbangan-hasil-produksi": { title: "Timbangan Hasil Produksi", divisionId: "production" },
  "pemakaian-bahan-baku-produksi": { title: "Pemakaian Bahan Baku Produksi", divisionId: "production" },
  "pemakaian-benang": { title: "Pemakaian Benang", divisionId: "warehouse" },
  "pemakaian-karung": { title: "Pemakaian Karung", divisionId: "warehouse" },
  "serah-terima-hasil-produksi": { title: "Serah Terima Hasil Produksi", divisionId: "warehouse" },
  "laporan-plastik-kardus-bekas": { title: "Laporan Harian Plastik/Kardus Bekas", divisionId: "operations" },
  "laporan-staff-gudang": { title: "Laporan Staff Gudang", divisionId: "warehouse" },
  "laporan-penanggung-jawab": { title: "Laporan Penanggung Jawab", divisionId: "operations" },
  "laporan-petugas-kebersihan": { title: "Laporan Petugas Kebersihan", divisionId: "cleaning" },
};

export default function ReportCategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const category = reportCategories[slug];
  const { data, ready, saveReport } = useOperations();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [date, setDate] = useState("");
  const [selected, setSelected] = useState<OperationsReport | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [notice, setNotice] = useState("");

  if (!category) {
    return <p className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600">Kategori laporan tidak ditemukan.</p>;
  }

  const division = divisions.find((item) => item.id === category.divisionId);
  const query = search.trim().toLocaleLowerCase();
  const rows = data.reports
    .filter((report) => report.reportTypeSlug === slug)
    .filter((report) => status === "all" || report.status === status)
    .filter((report) => !date || report.reportDate === date)
    .filter((report) =>
      !query ||
      report.reportName.toLocaleLowerCase().includes(query) ||
      report.reportNumber.toLocaleLowerCase().includes(query) ||
      report.submittedBy.toLocaleLowerCase().includes(query),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const saveThreadReport = async (formData: ThreadUsageFormData) => {
    await saveReport({
      reportName: category.title,
      department: departmentName[category.divisionId],
      divisionId: category.divisionId,
      reportTypeSlug: slug,
      reportDate: formData.reportDate,
      submittedBy: formData.submittedBy,
      status: formData.status,
      machineUsage: formData.machineUsage,
    });
    setNotice(formData.status === "draft" ? "Draft berhasil disimpan di Supabase." : "Laporan berhasil disubmit.");
    setFormOpen(false);
  };

  const saveWasteReport = async (formData: WasteMaterialSubmission) => {
    await saveReport({
      reportName: category.title,
      department: formData.department,
      divisionId: "operations",
      reportTypeSlug: slug,
      reportDate: formData.reportDate,
      submittedBy: formData.submittedBy,
      status: formData.status,
      notes: formData.notes || undefined,
      materials: formData.materials,
    });
    setNotice(formData.status === "draft" ? "Draft berhasil disimpan di Supabase." : "Laporan berhasil disubmit.");
    setFormOpen(false);
  };

  if (formOpen && !ready) {
    return <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">Memuat data Supabase...</p>;
  }

  if (formOpen && slug === "pemakaian-benang") {
    return (
      <div>
        <button type="button" onClick={() => setFormOpen(false)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800">
          <ArrowLeft size={15} /> Kembali ke daftar
        </button>
        <ThreadUsageForm onSave={saveThreadReport} />
      </div>
    );
  }
  if (formOpen && slug === "laporan-plastik-kardus-bekas") {
    return (
      <div>
        <button type="button" onClick={() => setFormOpen(false)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800">
          <ArrowLeft size={15} /> Kembali ke daftar
        </button>
        <WasteMaterialForm onSuccess={saveWasteReport} />
      </div>
    );
  }

  const hasExistingForm = slug === "pemakaian-benang" || slug === "laporan-plastik-kardus-bekas";

  return (
    <div className="space-y-5">
      <div>
        {division && (
          <Link href={division.href} className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-800">
            <ArrowLeft size={14} /> Kembali ke {division.name}
          </Link>
        )}
        <p className="text-sm font-semibold text-emerald-800">{division?.name} / Laporan</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">{category.title}</h2>
            <p className="mt-1 text-sm text-slate-500">Riwayat dan status laporan kategori ini.</p>
          </div>
          {hasExistingForm ? (
            <button type="button" onClick={() => setFormOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800">
              <Plus size={17} /> Tambah laporan
            </button>
          ) : (
            <span className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
              Form khusus belum tersedia
            </span>
          )}
        </div>
      </div>
      {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{notice}</div>}
      {!hasExistingForm && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          Kategori ini tetap tersedia di workspace. Form bisnis spesifik belum ditambahkan karena field yang dibutuhkan belum didefinisikan.
        </div>
      )}
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[minmax(220px,1fr)_180px_190px]">
        <div className="relative">
          <Search size={17} className="absolute left-3 top-2.5 text-slate-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari laporan, nomor, atau pegawai" className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm" />
        </div>
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} aria-label="Filter tanggal" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
        <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter status" className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm">
          <option value="all">Semua status</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="revision_requested">Perlu Revisi</option>
          <option value="approved">Approved</option>
          <option value="collected">Collected</option>
        </select>
      </div>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="font-bold text-slate-900">Daftar Laporan</h3>
          <p className="mt-1 text-xs text-slate-500">{ready ? `${rows.length} laporan sesuai filter` : "Memuat data Supabase..."}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
              <tr><th className="px-5 py-3">Nomor / laporan</th><th className="px-5 py-3">Pelapor</th><th className="px-5 py-3">Tanggal</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Detail</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((report) => (
                <tr key={report.id}>
                  <td className="px-5 py-3.5"><p className="font-semibold text-slate-800">{report.reportName}</p><p className="mt-0.5 text-xs text-slate-400">{report.reportNumber}</p></td>
                  <td className="px-5 py-3.5 text-slate-600">{report.submittedBy}</td>
                  <td className="px-5 py-3.5 text-slate-600">{report.reportDate}</td>
                  <td className="px-5 py-3.5"><ReportStatusBadge status={report.status} /></td>
                  <td className="px-5 py-3.5"><button type="button" onClick={() => setSelected(report)} aria-label={`Lihat ${report.reportName}`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Eye size={17} /></button></td>
                </tr>
              ))}
              {ready && !rows.length && <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-500">Belum ada laporan untuk kategori ini.</td></tr>}
              {!ready && <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-500">Memuat data Supabase...</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      <ReportDetail report={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
