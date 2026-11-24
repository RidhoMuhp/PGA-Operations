"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  FileClock,
  Users,
} from "lucide-react";
import { useOperations } from "@/components/operations/OperationsProvider";
import { divisions, getLocalDateString } from "@/data/mockOperations";
import { DivisionId } from "@/types/operations";

const reportLinks: Record<Exclude<DivisionId, "production">, { label: string; slug: string; description: string }[]> = {
  warehouse: [
    { label: "Pemakaian Benang", slug: "pemakaian-benang", description: "Catatan pemakaian benang per mesin." },
    { label: "Pemakaian Karung", slug: "pemakaian-karung", description: "Riwayat pemakaian karung gudang." },
    { label: "Serah Terima Hasil Produksi", slug: "serah-terima-hasil-produksi", description: "Laporan serah terima hasil produksi." },
  ],
  operations: [
    { label: "Plastik/Kardus Bekas", slug: "laporan-plastik-kardus-bekas", description: "Laporan material bekas operasional." },
  ],
  cleaning: [
    { label: "Laporan Petugas Kebersihan", slug: "laporan-petugas-kebersihan", description: "Riwayat laporan petugas kebersihan." },
  ],
};

export default function DivisionWorkspacePage() {
  const { division: divisionId } = useParams<{ division: string }>();
  const division = divisions.find((item) => item.id === divisionId);
  const { data, ready } = useOperations();

  if (!division || division.id === "production") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="font-bold text-slate-900">Workspace divisi tidak ditemukan</p>
        <Link href="/dashboard" className="mt-3 inline-block text-sm font-semibold text-emerald-800">
          Kembali ke dashboard
        </Link>
      </div>
    );
  }

  const today = getLocalDateString();
  const todayAttendance = data.attendance.filter(
    (record) => record.divisionId === division.id && record.workDate === today,
  );
  const divisionReports = data.reports.filter((report) => report.divisionId === division.id);
  const pending = divisionReports.filter(
    (report) => report.status === "submitted" || report.status === "under_review",
  );

  return (
    <div className="space-y-7">
      <div>
        <Link href="/dashboard" className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-800">
          <ArrowLeft size={14} /> Kembali ke dashboard
        </Link>
        <p className="text-sm font-semibold text-emerald-800">Workspace Divisi</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-950">{division.name}</h2>
        <p className="mt-1 text-sm text-slate-500">{division.description}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Absensi hari ini", value: todayAttendance.length, icon: Users },
          { label: "Laporan dikirim", value: divisionReports.filter((item) => item.status !== "draft").length, icon: ClipboardList },
          { label: "Menunggu approval", value: pending.length, icon: FileClock },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-800"><Icon size={19} /></span>
            <div>
              <p className="text-2xl font-bold text-slate-900">{ready ? value : "—"}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {division.id !== "operations" && (
        <Link
          href={`/divisions/${division.id}/attendance`}
          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-emerald-800"><Users size={20} /></span>
            <div>
              <h3 className="font-bold text-slate-900">Absensi {division.name}</h3>
              <p className="mt-1 text-sm text-slate-500">Lihat riwayat kehadiran untuk tanggal yang dipilih.</p>
            </div>
          </div>
          <ArrowRight size={19} className="text-emerald-800" />
        </Link>
      )}

      <section>
        <div className="mb-4">
          <h3 className="font-bold text-slate-900">Laporan Divisi</h3>
          <p className="mt-1 text-sm text-slate-500">Pilih jenis laporan yang tersedia untuk {division.name}.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reportLinks[division.id].map((item) => {
            const count = divisionReports.filter((report) => report.reportTypeSlug === item.slug).length;
            return (
              <Link
                key={item.slug}
                href={`/reports/${item.slug}`}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-800">
                  <ClipboardList size={19} />
                </span>
                <h4 className="mt-4 font-bold text-slate-900">{item.label}</h4>
                <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-500">{ready ? count : "—"} laporan</span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800">
                    Buka laporan <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
