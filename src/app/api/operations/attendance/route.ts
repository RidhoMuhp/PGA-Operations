import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getOperationsApiUnavailableResponse } from "@/lib/operationsApiAccess";
import { mapAttendanceRow } from "@/lib/operationsMappers";
import { isRecord, isValidDate } from "@/lib/operationsValidation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const unavailable = getOperationsApiUnavailableResponse();
  if (unavailable) return unavailable;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request scan bukan JSON yang valid." }, { status: 400 });
  }

  if (!isRecord(body)) {
    return Response.json({ error: "Data scan tidak valid." }, { status: 400 });
  }

  const barcode = typeof body.barcode === "string" ? body.barcode.trim().toLocaleUpperCase() : "";
  const terminalId = typeof body.terminalId === "string" ? body.terminalId.trim() : "";
  const workDate = body.workDate;
  if (!barcode || !terminalId || !isValidDate(workDate)) {
    return Response.json({ error: "Barcode, terminal, atau tanggal scan tidak valid." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const [employeeResult, terminalResult] = await Promise.all([
      supabase
        .from("operations_employees")
        .select("*")
        .eq("barcode", barcode)
        .maybeSingle(),
      supabase
        .from("operations_attendance_terminals")
        .select("*")
        .eq("id", terminalId)
        .eq("is_active", true)
        .maybeSingle(),
    ]);

    if (employeeResult.error || terminalResult.error) {
      console.error(
        "Supabase attendance lookup failed",
        employeeResult.error?.code ?? terminalResult.error?.code,
        employeeResult.error?.message ?? terminalResult.error?.message,
      );
      return Response.json({ error: "Data pegawai atau terminal gagal diperiksa." }, { status: 503 });
    }
    if (!employeeResult.data) {
      return Response.json({ error: "Barcode pegawai tidak ditemukan." }, { status: 404 });
    }
    if (!terminalResult.data) {
      return Response.json({ error: "Terminal absensi tidak aktif atau tidak terdaftar." }, { status: 404 });
    }

    const sessionId = `${terminalResult.data.id}:${workDate}`;
    const { data: row, error } = await supabase
      .from("operations_attendance_records")
      .insert({
        employee_id: employeeResult.data.employee_id,
        division_id: "production",
        production_type_id: terminalResult.data.production_type_id,
        terminal_id: terminalResult.data.id,
        session_id: sessionId,
        work_date: workDate,
        method: "barcode",
      })
      .select("*")
      .single();

    if (error?.code === "23505") {
      return Response.json(
        {
          success: false,
          message: `${employeeResult.data.full_name} sudah memindai barcode di terminal ini hari ini. Scan duplikat tidak disimpan.`,
        },
        { status: 409 },
      );
    }
    if (error || !row) {
      if (error) console.error("Supabase attendance insert failed", error.code, error.message);
      return Response.json({ error: "Scan gagal disimpan ke database." }, { status: 503 });
    }

    return Response.json({
      success: true,
      message: `${employeeResult.data.full_name} tercatat di terminal ${terminalResult.data.id}.`,
      record: mapAttendanceRow(row),
    });
  } catch (error) {
    console.error("Supabase attendance request failed", error);
    return Response.json({ error: "Koneksi database absensi gagal." }, { status: 503 });
  }
}
