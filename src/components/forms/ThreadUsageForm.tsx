"use client";

import { useState } from "react";
import { mockEmployees } from "@/data/mockEmployees";
import { MachineThreadUsage } from "@/types/threadUsage";

type MachineValues = {
  openingStock: string;
  added: string;
  used: string;
};

export interface ThreadUsageFormData {
  reportDate: string;
  submittedBy: string;
  status: "draft" | "submitted";
  machineUsage: MachineThreadUsage[];
}

const machineNumbers = Array.from({ length: 11 }, (_, index) => index + 1);
const emptyMachine = (): MachineValues => ({
  openingStock: "0",
  added: "0",
  used: "0",
});

export default function ThreadUsageForm({
  onSave,
}: {
  onSave: (data: ThreadUsageFormData) => void;
}) {
  const [reportDate, setReportDate] = useState("2026-11-23");
  const [submittedBy, setSubmittedBy] = useState("");
  const [machines, setMachines] = useState<MachineValues[]>(
    machineNumbers.map(() => emptyMachine()),
  );
  const [error, setError] = useState("");

  const updateMachine = (
    index: number,
    field: keyof MachineValues,
    value: string,
  ) => {
    setMachines((current) =>
      current.map((machine, machineIndex) =>
        machineIndex === index ? { ...machine, [field]: value } : machine,
      ),
    );
  };

  const submit = (status: ThreadUsageFormData["status"]) => {
    if (!reportDate || !submittedBy) {
      setError("Tanggal laporan dan pegawai pelapor wajib diisi.");
      return;
    }

    const machineUsage = machines.map((machine, index) => {
      const openingStock = Number(machine.openingStock) || 0;
      const added = Number(machine.added) || 0;
      const used = Number(machine.used) || 0;

      return {
        machine: machineNumbers[index],
        openingStock,
        added,
        used,
        remaining: openingStock + added - used,
      };
    });

    const overusedMachine = machineUsage.find((machine) => machine.remaining < 0);
    if (overusedMachine) {
      setError(
        `Jumlah terpakai mesin M${overusedMachine.machine} melebihi stok awal dan tambahan.`,
      );
      return;
    }

    setError("");
    onSave({ reportDate, submittedBy, status, machineUsage });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b px-5 py-4">
          <h2 className="font-bold">Informasi Laporan</h2>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <label className="text-sm font-medium">
            Tanggal laporan *
            <input
              type="date"
              value={reportDate}
              onChange={(event) => setReportDate(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5"
            />
          </label>
          <label className="text-sm font-medium">
            Pegawai pelapor *
            <select
              value={submittedBy}
              onChange={(event) => setSubmittedBy(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5"
            >
              <option value="">Pilih pegawai</option>
              {mockEmployees.map((employee) => (
                <option key={employee} value={employee}>
                  {employee}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b px-5 py-4">
          <h2 className="font-bold">Catatan Pemakaian Benang</h2>
          <p className="mt-1 text-xs text-slate-500">
            Satuan stok benang: roll/cone. Sisa dihitung otomatis.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold text-slate-600">
                <th className="sticky left-0 z-10 min-w-36 border-b bg-slate-50 px-4 py-3 text-left">
                  Keterangan
                </th>
                {machineNumbers.map((machine) => (
                  <th key={machine} className="min-w-20 border-b px-3 py-3 text-center">
                    M{machine}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["Stok awal", "openingStock"],
                  ["Tambahan", "added"],
                  ["Terpakai", "used"],
                ] as const
              ).map(([label, field]) => (
                <tr key={field} className="border-b last:border-0">
                  <th className="sticky left-0 bg-white px-4 py-3 text-left font-medium text-slate-700">
                    {label}
                  </th>
                  {machines.map((machine, index) => (
                    <td key={index} className="px-2 py-2">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        aria-label={`${label} M${machineNumbers[index]} (roll/cone)`}
                        value={machine[field]}
                        onChange={(event) =>
                          updateMachine(index, field, event.target.value)
                        }
                        className="w-full rounded-md border border-slate-300 px-2 py-2 text-center focus:border-[#2e9e6b] focus:outline-none"
                      />
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-emerald-50/60">
                <th className="sticky left-0 bg-emerald-50 px-4 py-3 text-left font-semibold text-slate-800">
                  Sisa
                </th>
                {machines.map((machine, index) => {
                  const remaining =
                    (Number(machine.openingStock) || 0) +
                    (Number(machine.added) || 0) -
                    (Number(machine.used) || 0);
                  return (
                    <td
                      key={index}
                      className={`px-3 py-3 text-center font-semibold ${
                        remaining < 0 ? "text-red-700" : "text-emerald-800"
                      }`}
                    >
                      {remaining}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex flex-col-reverse gap-3 border-t px-5 py-4 sm:flex-row sm:justify-end">
          <button
            onClick={() => submit("draft")}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
          >
            Simpan Draft
          </button>
          <button
            onClick={() => submit("submitted")}
            className="rounded-lg bg-[#247f58] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1d6d4b]"
          >
            Submit Laporan
          </button>
        </div>
      </section>
    </div>
  );
}
