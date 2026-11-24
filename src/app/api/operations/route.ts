import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getOperationsApiUnavailableResponse } from "@/lib/operationsApiAccess";
import {
  mapAttendanceRow,
  mapEmployeeRow,
  mapOperationsReportRow,
  mapTerminalRow,
} from "@/lib/operationsMappers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const unavailable = getOperationsApiUnavailableResponse();
  if (unavailable) return unavailable;

  try {
    const supabase = getSupabaseAdmin();
    const [employees, terminals, attendance, reports] = await Promise.all([
      supabase.from("operations_employees").select("*").order("employee_id"),
      supabase
        .from("operations_attendance_terminals")
        .select("*")
        .eq("is_active", true)
        .order("id"),
      supabase
        .from("operations_attendance_records")
        .select("*")
        .order("scanned_at", { ascending: false }),
      supabase.from("operations_reports").select("*").order("created_at", { ascending: false }),
    ]);

    const failure = employees.error ?? terminals.error ?? attendance.error ?? reports.error;
    if (failure) {
      console.error("Supabase operations read failed", failure.code, failure.message);
      return Response.json(
        { error: "Data operasi gagal dimuat dari Supabase." },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }

    if (!employees.data || !terminals.data || !attendance.data || !reports.data) {
      console.error("Supabase returned an empty operations query result.");
      return Response.json(
        { error: "Respons database operasi tidak lengkap." },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }

    return Response.json(
      {
        employees: employees.data.map(mapEmployeeRow),
        terminals: terminals.data.map(mapTerminalRow),
        attendance: attendance.data.map(mapAttendanceRow),
        reports: reports.data.map(mapOperationsReportRow),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Supabase operations read failed", error);
    return Response.json(
      { error: "Koneksi ke database operasi gagal." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
