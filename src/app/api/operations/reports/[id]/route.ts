import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getOperationsApiUnavailableResponse } from "@/lib/operationsApiAccess";
import { mapOperationsReportRow } from "@/lib/operationsMappers";
import { isRecord } from "@/lib/operationsValidation";
import type { ReportStatusAction } from "@/types/operations";

export const runtime = "nodejs";

const validActions: ReportStatusAction[] = ["approve", "request-revision", "collect"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const unavailable = getOperationsApiUnavailableResponse();
  if (unavailable) return unavailable;

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Data perubahan status bukan JSON yang valid." }, { status: 400 });
  }

  if (!isRecord(body) || typeof body.action !== "string" || !validActions.includes(body.action as ReportStatusAction)) {
    return Response.json({ error: "Aksi approval tidak valid." }, { status: 400 });
  }

  const action = body.action as ReportStatusAction;
  const notes = typeof body.notes === "string" ? body.notes.trim() : "";
  if (action === "request-revision" && notes.length < 3) {
    return Response.json({ error: "Catatan revisi minimal 3 karakter." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: current, error: readError } = await supabase
      .from("operations_reports")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (readError) {
      console.error("Supabase report lookup failed", readError.code, readError.message);
      return Response.json({ error: "Laporan gagal dibaca dari database." }, { status: 503 });
    }
    if (!current) return Response.json({ error: "Laporan tidak ditemukan." }, { status: 404 });

    const allowed =
      action === "collect"
        ? current.status === "approved"
        : current.status === "submitted" || current.status === "under_review";
    if (!allowed) {
      return Response.json({ error: "Status laporan tidak memungkinkan untuk aksi ini." }, { status: 409 });
    }

    const status =
      action === "approve"
        ? "approved"
        : action === "request-revision"
          ? "revision_requested"
          : "collected";
    const { data: updated, error: updateError } = await supabase
      .from("operations_reports")
      .update({
        status,
        ...(action === "request-revision" ? { notes } : {}),
      })
      .eq("id", id)
      .eq("status", current.status)
      .select("*")
      .maybeSingle();

    if (updateError) {
      console.error("Supabase report status update failed", updateError.code, updateError.message);
      return Response.json({ error: "Status laporan gagal diperbarui." }, { status: 503 });
    }
    if (!updated) {
      return Response.json({ error: "Laporan berubah di perangkat lain. Muat ulang sebelum mencoba lagi." }, { status: 409 });
    }

    return Response.json({
      success: true,
      message: "Status laporan berhasil diperbarui.",
      report: mapOperationsReportRow(updated),
    });
  } catch (error) {
    console.error("Supabase report status request failed", error);
    return Response.json({ error: "Koneksi database laporan gagal." }, { status: 503 });
  }
}
