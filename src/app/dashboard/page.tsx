"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Users,
} from "lucide-react";
import Link from "next/link";
import DivisionCard from "@/components/operations/DivisionCard";
import ReportDetail from "@/components/reports/ReportDetail";
import ReportStatusBadge from "@/components/reports/ReportStatusBadge";
import { useOperations } from "@/components/operations/OperationsProvider";
import {
  divisions,
  getLocalDateString,
  productionTypes,
} from "@/data/mockOperations";
import type { OperationsReport } from "@/types/operations";

function formatTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
  }).format(new Date(`${value}T00:00:00`));
}

export default function DashboardPage() {
  const { data, ready } = useOperations();
  const [selectedReport, setSelectedReport] = useState<OperationsReport | null>(null);
  const today = getLocalDateString();

  const submittedReports = data.reports.filter((report) => report.status !== "draft");
  const pendingReports = data.reports.filter(
    (report) => report.status === "submitted" || report.status === "under_review",
  );
  const todayAttendance = data.attendance.filter((record) => record.workDate === today);

  const metricsByDivision = useMemo(
    () =>
      Object.fromEntries(
        divisions.map((division) => {
          const reports = data.reports.filter((report) => report.divisionId === division.id);
          return [
            division.id,
            {
              attendanceToday: todayAttendance.filter(
                (record) => record.divisionId === division.id,
              ).length,
              submittedReports: reports.filter((report) => report.status !== "draft").length,
              pendingApprovals: reports.filter(
                (report) =>
                  report.status === "submitted" || report.status === "under_review",
              ).length,
            },
          ];
        }),
      ),
    [data.reports, todayAttendance],
  );

  const recentReports = [...data.reports]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  const recentActivities = useMemo(() => {
    const reportActivities = data.reports.map((report) => ({
      id: `report-${report.id}`,
      title: report.reportName,
      detail: `${report.submittedBy} · ${report.status === "submitted" ? "Mengirim laporan" : report.status === "approved" ? "Laporan disetujui" : "Memperbarui laporan"}`,
      timestamp: report.createdAt,
      icon: FileText,
      color: "bg-blue-50 text-blue-700",
    }));
    const attendanceActivities = data.attendance.map((record) => {
      const employee = data.employees.find((item) => item.id === record.employeeId);
      const type = productionTypes.find((item) => item.id === record.productionTypeId);
      const terminal = data.terminals.find((item) => item.id === record.terminalId);
      return {
        id: `attendance-${record.id}`,
        title: `${employee?.name ?? "Pegawai"} tercatat hadir`,
        detail: type
          ? `${type.name}${terminal ? ` · ${terminal.id}` : ""}`
          : divisions.find((division) => division.id === record.divisionId)?.name ?? "Divisi",
        timestamp: record.scannedAt,
        icon: Users,
        color: "bg-emerald-50 text-emerald-700",
      };
    });
    return [...reportActivities, ...attendanceActivities]
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, 6);
  }, [data.attendance, data.employees, data.reports, data.terminals]);

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-emerald-800">Pusat operasional</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
              Workspace Divisi
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Pilih divisi untuk membuka aktivitas, absensi, dan laporan hariannya.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600">
            <CalendarDays size={15} className="text-emerald-700" />
            {new Intl.DateTimeFormat("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(new Date())}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          {divisions.map((division) => (
            <DivisionCard
              key={division.id}
              division={division}
              metrics={
                !ready
                  ? {
                      attendanceToday: "—",
                      submittedReports: "—",
                      pendingApprovals: "—",
                    }
                  : metricsByDivision[division.id] ?? {
                  attendanceToday: 0,
                  submittedReports: 0,
                  pendingApprovals: 0,
                    }
              }
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Ringkasan umum
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Aktivitas Hari Ini</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[
            {
              label: "Total catatan absensi hari ini",
              value: todayAttendance.length,
              icon: Users,
              style: "bg-emerald-50 text-emerald-800",
              note: "Seluruh divisi",
            },
            {
              label: "Total laporan dikirim",
              value: submittedReports.length,
              icon: FileText,
              style: "bg-blue-50 text-blue-800",
              note: "Tidak termasuk draft",
            },
            {
              label: "Menunggu approval",
              value: pendingReports.length,
              icon: Clock3,
              style: "bg-amber-50 text-amber-800",
              note: "Perlu tinjauan penanggung jawab",
            },
          ].map(({ label, value, icon: Icon, style, note }) => (
            <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">{label}</p>
                  <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                    {ready ? value : "—"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">{note}</p>
                </div>
                <div className={`grid h-11 w-11 place-items-center rounded-xl ${style}`}>
                  <Icon size={20} />
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,.8fr)]">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="font-bold text-slate-900">Laporan Terbaru</h3>
                <p className="mt-0.5 text-xs text-slate-500">Aktivitas laporan dari seluruh divisi</p>
              </div>
              <Link
                href="/reports"
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:underline"
              >
                Semua laporan <ArrowUpRight size={14} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Laporan</th>
                    <th className="px-5 py-3 font-semibold">Divisi</th>
                    <th className="px-5 py-3 font-semibold">Tanggal</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentReports.map((report) => (
                    <tr
                      key={report.id}
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => setSelectedReport(report)}
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-800">{report.reportName}</p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {report.reportNumber} · {report.submittedBy}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{report.department}</td>
                      <td className="px-5 py-3.5 text-slate-600">{formatDate(report.reportDate)}</td>
                      <td className="px-5 py-3.5">
                        <ReportStatusBadge status={report.status} />
                      </td>
                    </tr>
                  ))}
                  {!recentReports.length && (
                    <tr>
                      <td colSpan={4} className="px-5 py-10 text-center text-sm text-slate-500">
                        Belum ada laporan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Aktivitas Operasional</h3>
                <p className="mt-0.5 text-xs text-slate-500">Aktivitas terbaru dari Supabase</p>
              </div>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-600">
                <Activity size={18} />
              </span>
            </div>
            <div className="mt-5 space-y-4">
              {recentActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex gap-3">
                    <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${activity.color}`}>
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{activity.title}</p>
                      <div className="mt-0.5 flex justify-between gap-2 text-xs text-slate-500">
                        <span className="truncate">{activity.detail}</span>
                        <time className="shrink-0">{formatTime(activity.timestamp)}</time>
                      </div>
                    </div>
                  </div>
                );
              })}
              {!recentActivities.length && (
                <p className="py-8 text-center text-sm text-slate-500">Belum ada aktivitas.</p>
              )}
            </div>
          </section>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">Ringkasan Divisi</h3>
              <p className="mt-0.5 text-xs text-slate-500">Distribusi catatan absensi hari ini</p>
            </div>
            <CheckCircle2 size={19} className="text-emerald-700" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {divisions.map((division) => {
              const count = todayAttendance.filter(
                (record) => record.divisionId === division.id,
              ).length;
              const percent = todayAttendance.length
                ? (count / todayAttendance.length) * 100
                : 0;
              return (
                <div key={division.id}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-slate-700">{division.name}</span>
                    <span className="font-bold text-slate-900">{ready ? count : "—"}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-600 transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </section>

      <ReportDetail report={selectedReport} onClose={() => setSelectedReport(null)} />
    </div>
  );
}
