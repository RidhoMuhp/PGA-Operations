"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Barcode, Download, Search, Users } from "lucide-react";
import BarcodeGraphic from "@/components/operations/BarcodeGraphic";
import DownloadBarcodeButton from "@/components/operations/DownloadBarcodeButton";
import { useOperations } from "@/components/operations/OperationsProvider";
import {
  getLocalDateString,
  productionTypes,
} from "@/data/mockOperations";
import type { AttendanceRecord, AttendanceTerminal } from "@/types/operations";

function formatTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(value);
}

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export default function TerminalAttendanceScreen({
  terminal,
}: {
  terminal: AttendanceTerminal;
}) {
  const { data, ready, persistenceError, recordAttendance } = useOperations();
  const inputRef = useRef<HTMLInputElement>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [barcode, setBarcode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [summaryDate, setSummaryDate] = useState("");
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState<{
    success: boolean;
    message: string;
    record?: AttendanceRecord;
  } | null>(null);

  const productionType = productionTypes.find(
    (type) => type.id === terminal.productionTypeId,
  );
  const today = now ? getLocalDateString(now) : summaryDate;
  const todayRecords = useMemo(
    () =>
      data.attendance
        .filter(
          (record) =>
            record.terminalId === terminal.id &&
            record.workDate === today,
        )
        .sort((a, b) => b.scannedAt.localeCompare(a.scannedAt)),
    [data.attendance, terminal.id, today],
  );
  const todayScans = todayRecords.filter((record) => record.method === "barcode");
  const latestSuccessfulScan = todayScans[0];
  const dateRecords = useMemo(
    () =>
      data.attendance
        .filter(
          (record) =>
            record.terminalId === terminal.id &&
            record.workDate === summaryDate,
        )
        .sort((a, b) => b.scannedAt.localeCompare(a.scannedAt)),
    [data.attendance, summaryDate, terminal.id],
  );
  const summaryRecords = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return dateRecords.filter((record) => {
      const employee = data.employees.find((item) => item.id === record.employeeId);
      return (
        !query ||
        employee?.name.toLocaleLowerCase().includes(query) ||
        employee?.id.toLocaleLowerCase().includes(query)
      );
    });
  }, [data.employees, dateRecords, search]);
  const scannedEmployeeCount = new Set(todayScans.map((record) => record.employeeId)).size;

  useEffect(() => {
    const initialTime = new Date();
    setNow(initialTime);
    setSummaryDate(getLocalDateString(initialTime));
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const submitScan = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!barcode.trim() || scanning) {
      setFeedback({ success: false, message: "Pindai barcode pegawai terlebih dahulu." });
      inputRef.current?.focus();
      return;
    }

    setScanning(true);
    try {
      const result = await recordAttendance(barcode, terminal.id);
      setFeedback(result);
      if (result.success) setBarcode("");
    } finally {
      setScanning(false);
      inputRef.current?.focus();
    }
  };

  const exportDailySummary = () => {
    const rows = [
      ["Tanggal", "Terminal", "Tipe Produksi", "ID Pegawai", "Nama Pegawai", "Waktu Scan", "Sumber"],
      ...data.attendance
        .filter(
          (record) =>
            record.terminalId === terminal.id &&
            record.workDate === summaryDate,
        )
        .sort((a, b) => a.scannedAt.localeCompare(b.scannedAt))
        .map((record) => {
          const employee = data.employees.find((item) => item.id === record.employeeId);
          return [
            record.workDate,
            terminal.id,
            productionType?.name ?? terminal.productionTypeId,
            employee?.id ?? record.employeeId,
            employee?.name ?? "Pegawai",
            new Intl.DateTimeFormat("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }).format(new Date(record.scannedAt)),
            record.method === "manual" ? "Catatan manual lama" : "Barcode",
          ];
        }),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${terminal.id}-${summaryDate}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => window.URL.revokeObjectURL(url), 0);
  };

  if (!productionType) {
    return <p className="rounded-xl bg-white p-6 text-sm text-slate-600">Tipe produksi terminal tidak ditemukan.</p>;
  }

  const latestEmployee = latestSuccessfulScan
    ? data.employees.find((employee) => employee.id === latestSuccessfulScan.employeeId)
    : undefined;
  const testEmployee = data.employees.find((employee) => employee.isTestRecord);

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-[#10233f] p-5 text-white shadow-sm sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
          Terminal Absensi · {terminal.id}
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{productionType.name}</h2>
            <p className="mt-1 text-sm text-slate-300">{terminal.location}</p>
          </div>
          <p aria-live="off" className="text-sm font-medium text-slate-200">
            {now ? formatDateTime(now) : "Memuat waktu..."}
          </p>
        </div>
      </header>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(290px,.7fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
              <Barcode size={25} />
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Pindai barcode pegawai</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Arahkan barcode unik pegawai ke scanner USB. Data akan tercatat saat scanner mengirim Enter.
              </p>
            </div>
          </div>
          <form onSubmit={submitScan} className="mt-6 space-y-3">
            <input
              ref={inputRef}
              autoFocus
              autoComplete="off"
              value={barcode}
              onChange={(event) => setBarcode(event.target.value)}
              disabled={!ready || Boolean(persistenceError) || scanning}
              placeholder="Siap menerima barcode..."
              aria-label="Input barcode pegawai"
              className="w-full rounded-2xl border-2 border-emerald-300 px-5 py-5 text-xl font-semibold tracking-wide text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-50 sm:text-2xl"
            />
            <button
              type="submit"
              disabled={!ready || Boolean(persistenceError) || scanning}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Barcode size={18} /> {scanning ? "Menyimpan scan..." : "Catat hasil scan"}
            </button>
          </form>

          {persistenceError && (
            <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {persistenceError}
            </div>
          )}

          {feedback && (
            <div
              role={feedback.success ? "status" : "alert"}
              className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
                feedback.success
                  ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                  : "border-amber-200 bg-amber-50 text-amber-950"
              }`}
            >
              <p className="font-semibold">{feedback.message}</p>
              {feedback.record && (
                <p className="mt-1 text-xs">
                  {feedback.record.workDate} · {formatTime(feedback.record.scannedAt)} · {terminal.id}
                </p>
              )}
            </div>
          )}
          <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-500">
            Terminal tidak memerlukan login pegawai dan hanya mencatat barcode yang dipindai. Pemindaian bukan verifikasi identitas fisik.
          </p>
          {testEmployee && (
            <div className="mt-4 rounded-xl border border-dashed border-emerald-300 bg-emerald-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-900">Barcode uji coba</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {testEmployee.name} · {testEmployee.barcode}
              </p>
              <div className="mt-3 rounded-lg bg-white p-3">
                <BarcodeGraphic value={testEmployee.barcode} />
              </div>
              <div className="mt-3">
                <DownloadBarcodeButton
                  value={testEmployee.barcode}
                  fileName={`${testEmployee.id}-${testEmployee.barcode}`}
                />
              </div>
              <p className="mt-2 text-xs text-slate-600">
                Unduh PNG untuk memindainya dengan aplikasi HP yang mendukung Code 128. Jika file ada di HP yang sama,
                gunakan fitur scan dari galeri. Pemindai HP hanya membaca kode; untuk mencatat absensi gunakan kolom scan terminal ini.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-emerald-800">
                <Users size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold text-emerald-950">Pegawai scan hari ini</p>
                <p className="text-xs text-emerald-800">{ready ? today : "Menyiapkan data..."}</p>
              </div>
            </div>
            <p className="mt-4 text-4xl font-bold text-emerald-950">
              {ready ? scannedEmployeeCount : "—"}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Scan terakhir berhasil</p>
            {latestSuccessfulScan && latestEmployee ? (
              <>
                <p className="mt-3 text-lg font-bold text-slate-900">{latestEmployee.name}</p>
                <p className="mt-0.5 text-sm text-slate-500">{latestEmployee.id}</p>
                <p className="mt-3 text-sm font-semibold text-emerald-800">
                  {formatTime(latestSuccessfulScan.scannedAt)}
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                {ready ? "Belum ada scan berhasil hari ini." : "Menyiapkan data scan..."}
              </p>
            )}
          </article>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="font-bold text-slate-900">Ringkasan kehadiran terminal</h3>
            <p className="mt-1 text-xs text-slate-500">
              {ready
                ? `${summaryRecords.length} catatan · terminal ${terminal.id}`
                : "Memuat data Supabase..."}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="sr-only" htmlFor="attendance-summary-date">Tanggal ringkasan</label>
            <input
              id="attendance-summary-date"
              type="date"
              value={summaryDate}
              onChange={(event) => setSummaryDate(event.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
            />
            <label className="relative">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama atau ID"
                aria-label="Cari pegawai di ringkasan absensi"
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm sm:w-56"
              />
            </label>
            <button
              type="button"
              onClick={exportDailySummary}
              disabled={!ready || !dateRecords.length}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={16} /> Ekspor CSV
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Pegawai</th>
                <th className="px-5 py-3">Tipe produksi</th>
                <th className="px-5 py-3">Terminal</th>
                <th className="px-5 py-3">Tanggal dan waktu scan</th>
                <th className="px-5 py-3">Sumber</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summaryRecords.map((record) => {
                const employee = data.employees.find((item) => item.id === record.employeeId);
                return (
                  <tr key={record.id}>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800">{employee?.name ?? "Pegawai"}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{employee?.id ?? record.employeeId}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{productionType.name}</td>
                    <td className="px-5 py-3.5 text-slate-600">{terminal.id}</td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {record.workDate} · {formatTime(record.scannedAt)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {record.method === "manual" ? "Catatan manual lama" : "Barcode"}
                    </td>
                  </tr>
                );
              })}
              {ready && !summaryRecords.length && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-500">
                    Tidak ada catatan scan untuk filter ini.
                  </td>
                </tr>
              )}
              {!ready && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-500">
                    Memuat data absensi...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
