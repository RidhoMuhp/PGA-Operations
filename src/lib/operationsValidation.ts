import type { DivisionId, OperationsReport, ProductionTypeId } from "@/types/operations";
import type { Report } from "@/types/report";

const divisionIds: DivisionId[] = ["production", "warehouse", "operations", "cleaning"];
const productionTypeIds: ProductionTypeId[] = [
  "sagu",
  "tapioka-1kg",
  "tapioka-200gr",
  "tapioka-500gr",
  "tapioka-2kg",
  "maizena",
  "maizena-rk",
];
const departments: Report["department"][] = [
  "Produksi",
  "Gudang",
  "Operasional",
  "Kebersihan",
  "Absensi",
];

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMachineUsage(value: unknown): value is NonNullable<OperationsReport["machineUsage"]> {
  return (
    Array.isArray(value) &&
    value.every(
      (row) =>
        isRecord(row) &&
        Number.isInteger(row.machine) &&
        Number.isInteger(row.openingStock) &&
        Number.isInteger(row.added) &&
        Number.isInteger(row.used) &&
        Number.isInteger(row.remaining) &&
        Number(row.machine) >= 1 &&
        Number(row.machine) <= 11 &&
        Number(row.openingStock) >= 0 &&
        Number(row.added) >= 0 &&
        Number(row.used) >= 0 &&
        Number(row.remaining) === Number(row.openingStock) + Number(row.added) - Number(row.used),
    )
  );
}

function isMaterials(value: unknown): value is NonNullable<OperationsReport["materials"]> {
  return (
    Array.isArray(value) &&
    value.every(
      (row) =>
        isRecord(row) &&
        typeof row.itemName === "string" &&
        row.itemName.trim().length > 0 &&
        typeof row.weightKg === "number" &&
        Number.isFinite(row.weightKg) &&
        row.weightKg > 0 &&
        typeof row.quantity === "number" &&
        Number.isFinite(row.quantity) &&
        row.quantity > 0 &&
        (row.quantityUnit === "kg" || row.quantityUnit === "bal"),
    )
  );
}

export function isValidDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

export function parseReportSubmission(
  value: unknown,
): Omit<OperationsReport, "id" | "reportNumber" | "createdAt"> | null {
  if (!isRecord(value)) return null;
  const {
    reportName,
    department,
    divisionId,
    reportTypeSlug,
    productionTypeId,
    reportDate,
    submittedBy,
    status,
    notes,
    machineUsage,
    materials,
  } = value;

  if (
    typeof reportName !== "string" ||
    !reportName.trim() ||
    typeof department !== "string" ||
    !departments.includes(department as Report["department"]) ||
    typeof divisionId !== "string" ||
    !divisionIds.includes(divisionId as DivisionId) ||
    !isValidDate(reportDate) ||
    typeof submittedBy !== "string" ||
    !submittedBy.trim() ||
    (status !== "draft" && status !== "submitted") ||
    (reportTypeSlug !== undefined && typeof reportTypeSlug !== "string") ||
    (productionTypeId !== undefined &&
      (typeof productionTypeId !== "string" ||
        !productionTypeIds.includes(productionTypeId as ProductionTypeId))) ||
    (notes !== undefined && typeof notes !== "string") ||
    (machineUsage !== undefined && !isMachineUsage(machineUsage)) ||
    (materials !== undefined && !isMaterials(materials))
  ) {
    return null;
  }

  return {
    reportName: reportName.trim(),
    department: department as Report["department"],
    divisionId: divisionId as DivisionId,
    ...(typeof reportTypeSlug === "string" ? { reportTypeSlug } : {}),
    ...(typeof productionTypeId === "string"
      ? { productionTypeId: productionTypeId as ProductionTypeId }
      : {}),
    reportDate,
    submittedBy: submittedBy.trim(),
    status,
    ...(typeof notes === "string" && notes.trim() ? { notes: notes.trim() } : {}),
    ...(Array.isArray(machineUsage) ? { machineUsage } : {}),
    ...(Array.isArray(materials) ? { materials } : {}),
  };
}
