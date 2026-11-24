"use client";

import { Database, ShieldCheck } from "lucide-react";
import { useOperations } from "@/components/operations/OperationsProvider";

export default function SettingsPage() {
  const { data, ready, persistenceError } = useOperations();

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <p className="text-sm font-semibold text-emerald-800">Preferensi Sistem</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-950">Pengaturan</h2>
        <p className="mt-1 text-sm text-slate-500">Status koneksi dan penyimpanan PGA Operations.</p>
      </div>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-800">
            <Database size={20} />
          </span>
          <div>
            <h3 className="font-bold text-slate-900">Database Supabase staging</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Absensi dan laporan disimpan di database staging. Kunci database hanya digunakan oleh server aplikasi.
            </p>
            <p
              role={persistenceError ? "alert" : "status"}
              className={`mt-3 text-sm font-semibold ${persistenceError ? "text-red-700" : "text-emerald-800"}`}
            >
              {!ready
                ? "Memeriksa koneksi..."
                : persistenceError
                  ? persistenceError
                  : `Terhubung · ${data.employees.length} pegawai · ${data.terminals.length} terminal`}
            </p>
          </div>
        </div>
      </section>
      <p className="flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck size={15} /> Profil dan notifikasi pada header hanya elemen visual; autentikasi pengguna belum diaktifkan.
      </p>
    </div>
  );
}
