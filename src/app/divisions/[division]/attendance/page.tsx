"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Clock3, Search } from "lucide-react";
import { useOperations } from "@/components/operations/OperationsProvider";
import { divisions, getLocalDateString } from "@/data/mockOperations";
import type { DivisionId } from "@/types/operations";

function isAttendanceDivision(id: DivisionId): id is "warehouse" | "cleaning" {
  return id === "warehouse" || id === "cleaning";
}

export default function DivisionAttendancePage() {
  const { division: divisionId } = useParams<{ division: string }>();
  const division = divisions.find((item) => item.id === divisionId);
  const { data, ready } = useOperations();
  const [workDate, setWorkDate] = useState(getLocalDateString);
  const [search, setSearch] = useState("");

  const records = useMemo(
    () =>
      data.attendance
        .filter((record) => record.divisionId === divisionId && record.workDate === workDate)
        .sort((a, b) => b.scannedAt.localeCompare(a.scannedAt)),
    [data.attendance, divisionId, workDate],
  );
  const visibleRecords = records.filter((record) => {
    const employee = data.employees.find((item) => item.id === record.employeeId);
    const query = search.trim().toLocaleLowerCase();
    return (
      !query ||
      employee?.name.toLocaleLowerCase().includes(query) ||
      employee?.id.toLocaleLowerCase().includes(query)
    );
  });

  if (!division || !isAttendanceDivision(division.id)) {
    return <p className="rounded-xl bg-white p-6 text-sm text-slate-600">Halaman absensi divisi tidak tersedia.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/divisions/${division.id}`} className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-800">
          <ArrowLeft size={14} /> Kembali ke workspace
        </Link>
        <p className="text-sm font-semibold text-emerald-800">Absensi Divisi</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-950">{division.name}</h2>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="font-bold text-slate-900">Riwayat Kehadiran</h3>
            <p className="mt-1 text-xs text-slate-500">
              {ready ? `${records.length} catatan · ${workDate}` : "Memuat data Supabase..."}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="text-xs font-semibold text-slate-600">
              Tanggal kerja
              <input
                type="date"
                value={workDate}
                onChange={(event) => setWorkDate(event.target.value)}
                className="mt-1 block rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-normal"
              />
            </label>
            <label className="relative self-end">
              <span className="sr-only">Cari pegawai</span>
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama atau ID"
                className="rounded-xl border border-slate-300 py-2.5 pl-9 pr-3 text-sm"
              />
            </label>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
              <tr><th className="px-5 py-3">Pegawai</th><th className="px-5 py-3">Waktu scan</th><th className="px-5 py-3">Sumber</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleRecords.map((record) => {
                const employee = data.employees.find((item) => item.id === record.employeeId);
                return (
                  <tr key={record.id}>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800">{employee?.name ?? "Pegawai"}</p>
                      <p className="text-xs text-slate-400">{employee?.id ?? record.employeeId}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 size={14} />
                        {new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(record.scannedAt))}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {record.method === "manual" ? "Catatan manual lama" : "Barcode"}
                    </td>
                  </tr>
                );
              })}
              {ready && !visibleRecords.length && (
                <tr><td colSpan={3} className="px-5 py-10 text-center text-sm text-slate-500">Tidak ada catatan kehadiran untuk filter ini.</td></tr>
              )}
              {!ready && (
                <tr><td colSpan={3} className="px-5 py-10 text-center text-sm text-slate-500">Memuat data Supabase...</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
        Riwayat ini hanya-baca. Pencatatan kehadiran baru dilakukan pegawai melalui terminal barcode pada area yang terdaftar.
      </p>
    </div>
  );
}
