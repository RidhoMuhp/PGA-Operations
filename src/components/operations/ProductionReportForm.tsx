"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FilePlus2 } from "lucide-react";
import { useOperations } from "@/components/operations/OperationsProvider";
import { getLocalDateString, ProductionType } from "@/data/mockOperations";

export default function ProductionReportForm({ type }: { type: ProductionType }) {
  const router = useRouter();
  const { data, ready, saveReport } = useOperations();
  const [reportDate, setReportDate] = useState(getLocalDateString);
  const [submittedBy, setSubmittedBy] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async (status: "draft" | "submitted") => {
    if (!reportDate || !submittedBy) {
      setError("Tanggal laporan dan pegawai pelapor wajib diisi.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await saveReport({
        reportName: `Laporan Harian ${type.product}`,
        department: "Produksi",
        divisionId: "production",
        productionTypeId: type.id,
        reportTypeSlug: type.id,
        reportDate,
        submittedBy,
        status,
        notes: notes.trim() || undefined,
      });
      router.push(`/divisions/production/${type.id}/reports`);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Laporan gagal disimpan. Silakan coba kembali.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <Link
          href={`/divisions/production/${type.id}/reports`}
          className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-800"
        >
          <ArrowLeft size={14} /> Kembali ke riwayat
        </Link>
        <p className="text-sm font-semibold text-emerald-800">Laporan Harian</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-950">{type.name}</h2>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          save("submitted");
        }}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
            <FilePlus2 size={19} />
          </span>
          <div>
            <h3 className="font-bold text-slate-900">Informasi Laporan</h3>
            <p className="text-xs text-slate-500">Data dicatat hanya untuk {type.product}.</p>
          </div>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">
            Tanggal laporan *
            <input
              type="date"
              required
              value={reportDate}
              onChange={(event) => setReportDate(event.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal"
            />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Pegawai pelapor *
            <select
              required
              value={submittedBy}
              onChange={(event) => setSubmittedBy(event.target.value)}
              className="mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal"
            >
              <option value="">Pilih pegawai</option>
                  {data.employees.map((employee) => (
                    <option key={employee.id} value={employee.name}>{employee.name}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
            Catatan harian
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={5}
              placeholder="Tambahkan catatan operasional untuk laporan ini..."
              className="mt-1.5 block w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal"
            />
          </label>
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={saving || !ready}
            onClick={() => save("draft")}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Simpan Draft
          </button>
          <button
            type="submit"
            disabled={saving || !ready}
            className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Submit Laporan"}
          </button>
        </div>
      </form>
    </div>
  );
}
