import type { MachineThreadUsage } from "@/types/threadUsage";
import type { WasteMaterialItem } from "@/types/wasteMaterial";
import {
  AttendanceRecord,
  AttendanceTerminal,
  Employee,
  OperationsReport,
} from "@/types/operations";
import type { Json } from "@/types/supabase";
import {
  AttendanceRow,
  EmployeeRow,
  OperationsReportRow,
  TerminalRow,
} from "@/lib/supabase/database.types";

export function mapEmployeeRow(row: EmployeeRow): Employee {
  return {
    id: row.employee_id,
    barcode: row.barcode,
    name: row.full_name,
    role: row.role,
    isTestRecord: row.is_test_record,
  };
}

export function mapTerminalRow(row: TerminalRow): AttendanceTerminal {
  return {
    id: row.id,
    productionTypeId: row.production_type_id,
    location: row.location,
  };
}

export function mapAttendanceRow(row: AttendanceRow): AttendanceRecord {
  return {
    id: row.id,
    employeeId: row.employee_id,
    divisionId: row.division_id,
    ...(row.production_type_id ? { productionTypeId: row.production_type_id } : {}),
    ...(row.terminal_id ? { terminalId: row.terminal_id } : {}),
    ...(row.session_id ? { sessionId: row.session_id } : {}),
    workDate: row.work_date,
    scannedAt: row.scanned_at,
    method: row.method,
    ...(row.reviewed_at ? { reviewedAt: row.reviewed_at } : {}),
  };
}

function isRecord(value: Json): value is { [key: string]: Json | undefined } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseMachineUsage(value: Json | undefined): MachineThreadUsage[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) throw new Error("Payload machineUsage laporan tidak valid.");

  return value.map((item) => {
    if (!isRecord(item)) throw new Error("Baris machineUsage laporan tidak valid.");
    const { machine, openingStock, added, used, remaining } = item;
    if (
      typeof machine !== "number" ||
      typeof openingStock !== "number" ||
      typeof added !== "number" ||
      typeof used !== "number" ||
      typeof remaining !== "number"
    ) {
      throw new Error("Kolom machineUsage laporan tidak valid.");
    }
    return { machine, openingStock, added, used, remaining };
  });
}

function parseMaterials(value: Json | undefined): WasteMaterialItem[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) throw new Error("Payload materials laporan tidak valid.");

  return value.map((item) => {
    if (!isRecord(item)) throw new Error("Baris materials laporan tidak valid.");
    const { itemName, weightKg, quantity, quantityUnit } = item;
    if (
      typeof itemName !== "string" ||
      typeof weightKg !== "number" ||
      typeof quantity !== "number" ||
      (quantityUnit !== "kg" && quantityUnit !== "bal")
    ) {
      throw new Error("Kolom materials laporan tidak valid.");
    }
    return { itemName, weightKg, quantity, quantityUnit };
  });
}

export function mapOperationsReportRow(row: OperationsReportRow): OperationsReport {
  const payload = isRecord(row.payload) ? row.payload : {};
  const machineUsage = parseMachineUsage(payload.machineUsage);
  const materials = parseMaterials(payload.materials);

  return {
    id: row.id,
    reportNumber: row.report_number,
    reportName: row.report_name,
    department: row.department,
    divisionId: row.division_id,
    ...(row.report_type_slug ? { reportTypeSlug: row.report_type_slug } : {}),
    ...(row.production_type_id
      ? { productionTypeId: row.production_type_id }
      : {}),
    reportDate: row.report_date,
    submittedBy: row.submitted_by,
    status: row.status as OperationsReport["status"],
    createdAt: row.created_at,
    ...(row.notes ? { notes: row.notes } : {}),
    ...(machineUsage ? { machineUsage } : {}),
    ...(materials ? { materials } : {}),
  };
}

export function reportPayload(report: Partial<OperationsReport>): Json {
  const payload: { [key: string]: Json | undefined } = {};
  if (report.machineUsage) {
    payload.machineUsage = report.machineUsage.map((usage) => ({
      machine: usage.machine,
      openingStock: usage.openingStock,
      added: usage.added,
      used: usage.used,
      remaining: usage.remaining,
    }));
  }
  if (report.materials) {
    payload.materials = report.materials.map((material) => ({
      itemName: material.itemName,
      weightKg: material.weightKg,
      quantity: material.quantity,
      quantityUnit: material.quantityUnit,
    }));
  }
  return payload;
}
