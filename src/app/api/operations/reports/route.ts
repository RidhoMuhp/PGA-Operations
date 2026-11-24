import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getOperationsApiUnavailableResponse } from "@/lib/operationsApiAccess";
import { mapOperationsReportRow, reportPayload } from "@/lib/operationsMappers";
import { parseReportSubmission } from "@/lib/operationsValidation";

export const runtime = "nodejs";

function reportPrefix(divisionId: string): string {
  if (divisionId === "production") return "PRD";
  if (divisionId === "warehouse") return "GDG";
  if (divisionId === "operations") return "OPS";
  return "CLN";
}

export async function POST(request: Request) {
  const unavailable = getOperationsApiUnavailableResponse();
  if (unavailable) return unavailable;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Data laporan bukan JSON yang valid." }, { status: 400 });
  }

  const report = parseReportSubmission(body);
  if (!report) {
    return Response.json({ error: "Data laporan tidak lengkap atau tidak valid." }, { status: 400 });
  }

  const datePart = report.reportDate.replaceAll("-", "");
  const uniquePart = globalThis.crypto.randomUUID().slice(0, 8).toUpperCase();
  const reportNumber = `${reportPrefix(report.divisionId)}-${datePart}-${uniquePart}`;

  try {
    const { data: row, error } = await getSupabaseAdmin()
      .from("operations_reports")
      .insert({
        report_number: reportNumber,
        report_name: report.reportName,
        department: report.department,
        division_id: report.divisionId,
        report_type_slug: report.reportTypeSlug ?? null,
        production_type_id: report.productionTypeId ?? null,
        report_date: report.reportDate,
        submitted_by: report.submittedBy,
        status: report.status,
        notes: report.notes ?? null,
        payload: reportPayload(report),
      })
      .select("*")
      .single();

    if (error || !row) {
      if (error) console.error("Supabase report insert failed", error.code, error.message);
      return Response.json({ error: "Laporan gagal disimpan ke database." }, { status: 503 });
    }

    return Response.json({ report: mapOperationsReportRow(row) }, { status: 201 });
  } catch (error) {
    console.error("Supabase report request failed", error);
    return Response.json({ error: "Koneksi database laporan gagal." }, { status: 503 });
  }
}
