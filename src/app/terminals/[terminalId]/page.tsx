"use client";

import { useParams } from "next/navigation";
import TerminalAttendanceScreen from "@/components/operations/TerminalAttendanceScreen";
import { useOperations } from "@/components/operations/OperationsProvider";

export default function TerminalPage() {
  const { terminalId } = useParams<{ terminalId: string }>();
  const { data, ready, persistenceError } = useOperations();
  const terminal = data.terminals.find((item) => item.id === terminalId);

  if (!ready) {
    return <p className="rounded-xl bg-white p-6 text-sm text-slate-600">Memuat konfigurasi terminal...</p>;
  }
  if (persistenceError) {
    return <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">{persistenceError}</p>;
  }

  if (!terminal) {
    return <p className="rounded-xl bg-white p-6 text-sm text-slate-600">Terminal absensi tidak terdaftar.</p>;
  }

  return <TerminalAttendanceScreen terminal={terminal} />;
}
