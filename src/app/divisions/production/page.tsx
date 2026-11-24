"use client";

import Link from "next/link";
import { ArrowLeft, ClipboardList, Users } from "lucide-react";
import ProductionTypeCard from "@/components/operations/ProductionTypeCard";
import { useOperations } from "@/components/operations/OperationsProvider";
import { getLocalDateString, productionTypes } from "@/data/mockOperations";

export default function ProductionWorkspacePage() {
  const { data, ready } = useOperations();
  const today = getLocalDateString();
  const todayAttendance = data.attendance.filter(
    (record) => record.divisionId === "production" && record.workDate === today,
  );
  const submittedReports = data.reports.filter(
    (report) => report.divisionId === "production" && report.status !== "draft",
  );
  const pending = submittedReports.filter(
    (report) => report.status === "submitted" || report.status === "under_review",
  );

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/dashboard" className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-800">
            <ArrowLeft size={14} /> Kembali ke dashboard
          </Link>
          <p className="text-sm font-semibold text-emerald-800">Workspace Divisi</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            Produksi
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Pilih tipe produksi untuk membuka absensi, ringkasan harian, dan laporan lini tersebut.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Absensi produksi hari ini", value: todayAttendance.length, icon: Users },
          { label: "Laporan dikirim", value: submittedReports.length, icon: ClipboardList },
          { label: "Menunggu approval", value: pending.length, icon: ClipboardList },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-800">
              <Icon size={19} />
            </span>
            <div>
              <p className="text-2xl font-bold text-slate-900">{ready ? value : "—"}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <section>
        <div className="mb-4">
          <h3 className="font-bold text-slate-900">Tipe Produksi</h3>
          <p className="mt-1 text-sm text-slate-500">
            Absensi dan laporan setiap tipe dikelola terpisah.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {productionTypes.map((type) => (
            <ProductionTypeCard
              key={type.id}
              type={type}
              attendanceCount={
                ready
                  ? new Set(
                      todayAttendance
                        .filter((record) => record.productionTypeId === type.id)
                        .map((record) => record.employeeId),
                    ).size
                  : "—"
              }
              reportCount={
                ready
                  ? data.reports.filter((report) => report.productionTypeId === type.id).length
                  : "—"
              }
            />
          ))}
        </div>
      </section>
    </div>
  );
}
