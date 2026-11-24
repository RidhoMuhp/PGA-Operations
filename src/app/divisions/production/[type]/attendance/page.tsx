"use client";

import { useParams } from "next/navigation";
import TerminalAttendanceScreen from "@/components/operations/TerminalAttendanceScreen";
import { useOperations } from "@/components/operations/OperationsProvider";
import { productionTypes } from "@/data/mockOperations";

export default function ProductionAttendancePage() {
  const { type: typeId } = useParams<{ type: string }>();
  const { data, ready, persistenceError } = useOperations();
  const type = productionTypes.find((item) => item.id === typeId);
  if (!type) return <p className="rounded-xl bg-white p-6 text-sm text-slate-600">Tipe produksi tidak ditemukan.</p>;

  if (!ready) return <p className="rounded-xl bg-white p-6 text-sm text-slate-600">Memuat konfigurasi terminal...</p>;
  if (persistenceError) return <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">{persistenceError}</p>;

  const terminal = data.terminals.find((item) => item.productionTypeId === type.id);
  if (!terminal) return <p className="rounded-xl bg-white p-6 text-sm text-slate-600">Terminal untuk lini produksi ini belum terdaftar.</p>;

  return <TerminalAttendanceScreen terminal={terminal} />;
}
