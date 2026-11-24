"use client";

import { BadgeCheck, Barcode, Search, Users } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import BarcodeGraphic from "@/components/operations/BarcodeGraphic";
import DownloadBarcodeButton from "@/components/operations/DownloadBarcodeButton";
import { useOperations } from "@/components/operations/OperationsProvider";

export default function MasterDataPage() {
  const [query, setQuery] = useState("");
  const { data, ready } = useOperations();
  const employees = data.employees.filter((employee) =>
    `${employee.name} ${employee.id} ${employee.barcode}`
      .toLocaleLowerCase()
      .includes(query.trim().toLocaleLowerCase()),
  );
  const testEmployee = data.employees.find((employee) => employee.isTestRecord);
  const saguTerminal = data.terminals.find((terminal) => terminal.productionTypeId === "sagu");

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-emerald-800">Data Referensi</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-950">Master Data Pegawai</h2>
        <p className="mt-1 text-sm text-slate-500">Daftar pegawai dan barcode yang terdaftar di Supabase staging.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-800"><Users size={20} /></span>
          <div><p className="text-2xl font-bold text-slate-900">{ready ? data.employees.length : "—"}</p><p className="text-xs text-slate-500">Pegawai terdaftar</p></div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-800"><Barcode size={20} /></span>
          <div><p className="text-sm font-bold text-slate-900">ID simulasi</p><p className="text-xs text-slate-500">Bukan verifikasi identitas</p></div>
        </div>
      </div>
      {testEmployee && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">Data uji coba barcode</p>
          <h3 className="mt-1 text-lg font-bold text-slate-900">{testEmployee.name}</h3>
          <p className="mt-1 text-sm text-slate-600">
            {testEmployee.id} · {testEmployee.barcode} · Code 128
          </p>
          {saguTerminal && (
            <Link
              href={`/terminals/${encodeURIComponent(saguTerminal.id)}`}
              className="mt-3 inline-flex rounded-lg bg-emerald-800 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-900"
            >
              Buka terminal Produksi Sagu
            </Link>
          )}
          <div className="mt-3">
            <DownloadBarcodeButton
              value={testEmployee.barcode}
              fileName={`${testEmployee.id}-${testEmployee.barcode}`}
            />
          </div>
          <p className="mt-3 max-w-lg text-xs leading-5 text-slate-600">
            Untuk scan dengan HP, buka PNG di aplikasi pemindai yang mendukung Code 128. Jika file ada di HP yang sama,
            gunakan fitur scan dari galeri; kamera tidak dapat memindai layar HP itu sendiri.
          </p>
        </div>
          <div className="mt-4 max-w-sm rounded-xl border border-emerald-100 bg-white p-3 sm:mt-0">
            <BarcodeGraphic value={testEmployee.barcode} />
          </div>
        </section>
      )}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h3 className="font-bold text-slate-900">Daftar Pegawai</h3><p className="mt-1 text-xs text-slate-500">{ready ? `${employees.length} pegawai ditemukan` : "Memuat data Supabase..."}</p></div>
          <div className="relative w-full sm:max-w-xs">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari pegawai atau ID" className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-sm" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
              <tr><th className="px-5 py-3">Pegawai</th><th className="px-5 py-3">ID Pegawai</th><th className="px-5 py-3">Barcode Code 128</th><th className="px-5 py-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td className="px-5 py-3.5 font-semibold text-slate-800">
                    {employee.name}
                    {employee.isTestRecord && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">UJI COBA</span>}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{employee.id}</td>
                  <td className="px-5 py-3.5">
                    <div className="max-w-[220px]">
                      <BarcodeGraphic value={employee.barcode} compact />
                      <span className="mt-1 block font-mono text-xs text-slate-600">{employee.barcode}</span>
                      <div className="mt-2">
                        <DownloadBarcodeButton
                          compact
                          value={employee.barcode}
                          fileName={`${employee.id}-${employee.barcode}`}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5"><span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800"><BadgeCheck size={14} />{employee.isTestRecord ? "Data uji coba" : "Aktif (demo)"}</span></td>
                </tr>
              ))}
              {!employees.length && <tr><td colSpan={4} className="px-5 py-10 text-center text-sm text-slate-500">Pegawai tidak ditemukan.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
