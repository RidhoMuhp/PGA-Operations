"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Barcode,
  FilePlus2,
  History,
  Users,
} from "lucide-react";
import { useOperations } from "@/components/operations/OperationsProvider";
import {
  getLocalDateString,
  getTerminalForProductionType,
  productionTypes,
} from "@/data/mockOperations";

export default function ProductionTypeWorkspacePage() {
  const { type: typeId } = useParams<{ type: string }>();
  const type = productionTypes.find((item) => item.id === typeId);
  const { data, ready } = useOperations();

  if (!type) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <h2 className="font-bold text-slate-900">Tipe produksi tidak ditemukan</h2>
        <Link href="/divisions/production" className="mt-4 inline-block text-sm font-semibold text-emerald-800">
          Kembali ke Produksi
        </Link>
      </div>
    );
  }

  const today = getLocalDateString();
  const terminal = getTerminalForProductionType(type.id);
  const attendance = data.attendance.filter(
    (record) =>
      record.productionTypeId === type.id &&
      record.workDate === today,
  );
  const scannedEmployees = new Set(attendance.map((record) => record.employeeId)).size;
  const reports = data.reports.filter((report) => report.productionTypeId === type.id);
  const pendingReports = reports.filter(
    (report) => report.status === "submitted" || report.status === "under_review",
  );

  return (
    <div className="space-y-7">
      <div>
        <Link href="/divisions/production" className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-800">
          <ArrowLeft size={14} /> Semua tipe produksi
        </Link>
        <p className="text-sm font-semibold text-emerald-800">Workspace Produksi</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{type.name}</h2>
        <p className="mt-1 text-sm text-slate-500">
          Scan kehadiran di terminal area ini dan kelola laporan khusus untuk {type.product}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[
          { label: "Pegawai scan hari ini", value: scannedEmployees, icon: Users, tone: "emerald" },
          { label: "Laporan tercatat", value: reports.length, icon: History, tone: "violet" },
          { label: "Menunggu approval", value: pendingReports.length, icon: FilePlus2, tone: "amber" },
        ].map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${
              tone === "emerald" ? "bg-emerald-50 text-emerald-800" :
              tone === "violet" ? "bg-violet-50 text-violet-800" :
              "bg-amber-50 text-amber-800"
            }`}>
              <Icon size={19} />
            </span>
            <p className="mt-4 text-2xl font-bold text-slate-900">{ready ? value : "—"}</p>
            <p className="mt-0.5 text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {terminal ? (
          <Link
            href={`/terminals/${terminal.id}`}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
              <Barcode size={21} />
            </span>
            <h3 className="mt-4 font-bold text-slate-900">Terminal Absensi</h3>
            <p className="mt-1 text-sm text-slate-500">
              {terminal.id} · {terminal.location}
            </p>
            <p className="mt-4 text-xs font-bold text-emerald-800">Buka layar scan →</p>
          </Link>
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            Terminal absensi belum terdaftar untuk lini ini.
          </div>
        )}
        <Link
          href={`/divisions/production/${type.id}/reports/new`}
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
        >
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-100 text-blue-800">
            <FilePlus2 size={21} />
          </span>
          <h3 className="mt-4 font-bold text-slate-900">Laporan Harian</h3>
          <p className="mt-1 text-sm text-slate-500">
            Buat catatan harian produksi tanpa mencampur lini lainnya.
          </p>
          <p className="mt-4 text-xs font-bold text-blue-800">Buat laporan →</p>
        </Link>
        <Link
          href={`/divisions/production/${type.id}/reports`}
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-violet-300 hover:shadow-md"
        >
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-100 text-violet-800">
            <History size={21} />
          </span>
          <h3 className="mt-4 font-bold text-slate-900">Riwayat Laporan</h3>
          <p className="mt-1 text-sm text-slate-500">
            Cari dan tinjau laporan yang hanya terkait tipe {type.product}.
          </p>
          <p className="mt-4 text-xs font-bold text-violet-800">{ready ? reports.length : "—"} laporan · Buka riwayat →</p>
        </Link>
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-emerald-950">
        Terminal menetapkan tipe produksi secara otomatis. Pegawai melakukan scan sendiri; penanggung jawab hanya melihat dan mengekspor ringkasan.
      </div>
    </div>
  );
}
