"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type {
  AttendanceRecord,
  AttendanceTerminal,
  Employee,
  OperationsData,
  OperationsReport,
  ReportStatusAction,
} from "@/types/operations";
import { getLocalDateString } from "@/data/mockOperations";

interface AttendanceResult {
  success: boolean;
  message: string;
  record?: AttendanceRecord;
}

interface ReportUpdateResult {
  success: boolean;
  message: string;
  report?: OperationsReport;
}

interface OperationsContextValue {
  data: OperationsData;
  ready: boolean;
  persistenceError: string;
  recordAttendance: (
    barcode: string,
    terminalId: string,
  ) => Promise<AttendanceResult>;
  saveReport: (
    report: Omit<OperationsReport, "id" | "reportNumber" | "createdAt">,
  ) => Promise<OperationsReport>;
  updateReportStatus: (
    reportId: string,
    action: ReportStatusAction,
    notes?: string,
  ) => Promise<ReportUpdateResult>;
}

const emptyData: OperationsData = {
  employees: [],
  terminals: [],
  attendance: [],
  reports: [],
};

const OperationsContext = createContext<OperationsContextValue | null>(null);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isEmployee(value: unknown): value is Employee {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.barcode === "string" &&
    typeof value.name === "string" &&
    typeof value.role === "string" &&
    (value.isTestRecord === undefined || typeof value.isTestRecord === "boolean")
  );
}

function isTerminal(value: unknown): value is AttendanceTerminal {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.productionTypeId === "string" &&
    typeof value.location === "string"
  );
}

function isAttendanceRecord(value: unknown): value is AttendanceRecord {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.employeeId === "string" &&
    ["production", "warehouse", "operations", "cleaning"].includes(String(value.divisionId)) &&
    typeof value.workDate === "string" &&
    typeof value.scannedAt === "string" &&
    (value.method === "barcode" || value.method === "manual") &&
    (value.productionTypeId === undefined || typeof value.productionTypeId === "string") &&
    (value.terminalId === undefined || typeof value.terminalId === "string") &&
    (value.sessionId === undefined || typeof value.sessionId === "string") &&
    (value.reviewedAt === undefined || typeof value.reviewedAt === "string")
  );
}

function isOperationsReport(value: unknown): value is OperationsReport {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.reportNumber === "string" &&
    typeof value.reportName === "string" &&
    typeof value.department === "string" &&
    ["production", "warehouse", "operations", "cleaning"].includes(String(value.divisionId)) &&
    typeof value.reportDate === "string" &&
    typeof value.submittedBy === "string" &&
    typeof value.createdAt === "string" &&
    ["draft", "submitted", "under_review", "revision_requested", "approved", "collected"].includes(
      String(value.status),
    )
  );
}

function isOperationsData(value: unknown): value is OperationsData {
  return (
    isRecord(value) &&
    Array.isArray(value.employees) &&
    value.employees.every(isEmployee) &&
    Array.isArray(value.terminals) &&
    value.terminals.every(isTerminal) &&
    Array.isArray(value.attendance) &&
    value.attendance.every(isAttendanceRecord) &&
    Array.isArray(value.reports) &&
    value.reports.every(isOperationsReport)
  );
}

function errorMessage(payload: unknown, status: number): string {
  if (isRecord(payload) && typeof payload.error === "string") return payload.error;
  if (isRecord(payload) && typeof payload.message === "string") return payload.message;
  return `Permintaan database gagal (HTTP ${status}).`;
}

async function responseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function errorText(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function OperationsProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OperationsData>(emptyData);
  const [ready, setReady] = useState(false);
  const [persistenceError, setPersistenceError] = useState("");

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const response = await fetch("/api/operations", { cache: "no-store" });
        const payload = await responseJson(response);
        if (!response.ok) throw new Error(errorMessage(payload, response.status));
        if (!isOperationsData(payload)) {
          throw new Error("Respons database operasi memiliki format yang tidak valid.");
        }
        if (active) {
          setData(payload);
          setPersistenceError("");
        }
      } catch (error) {
        if (active) {
          setPersistenceError(errorText(error, "Koneksi ke database operasi gagal."));
        }
      } finally {
        if (active) setReady(true);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const recordAttendance = useCallback<OperationsContextValue["recordAttendance"]>(
    async (barcode, terminalId) => {
      try {
        const response = await fetch("/api/operations/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            barcode,
            terminalId,
            workDate: getLocalDateString(),
          }),
        });
        const payload = await responseJson(response);
        if (!response.ok) {
          const message = errorMessage(payload, response.status);
          if (response.status >= 500) setPersistenceError(message);
          return { success: false, message };
        }
        if (
          !isRecord(payload) ||
          payload.success !== true ||
          typeof payload.message !== "string" ||
          !isAttendanceRecord(payload.record)
        ) {
          throw new Error("Respons scan dari database tidak valid.");
        }
        const record = payload.record;
        setData((current) => ({
          ...current,
          attendance: [record, ...current.attendance],
        }));
        setPersistenceError("");
        return {
          success: true,
          message: payload.message,
          record,
        };
      } catch (error) {
        const message = errorText(error, "Scan gagal disimpan ke database.");
        setPersistenceError(message);
        return { success: false, message };
      }
    },
    [],
  );

  const saveReport = useCallback<OperationsContextValue["saveReport"]>(
    async (report) => {
      try {
        const response = await fetch("/api/operations/reports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(report),
        });
        const payload = await responseJson(response);
        if (!response.ok) throw new Error(errorMessage(payload, response.status));
        if (!isRecord(payload) || !isOperationsReport(payload.report)) {
          throw new Error("Respons laporan dari database tidak valid.");
        }
        const savedReport = payload.report;
        setData((current) => ({
          ...current,
          reports: [savedReport, ...current.reports],
        }));
        setPersistenceError("");
        return savedReport;
      } catch (error) {
        const message = errorText(error, "Laporan gagal disimpan ke database.");
        setPersistenceError(message);
        throw new Error(message);
      }
    },
    [],
  );

  const updateReportStatus = useCallback<OperationsContextValue["updateReportStatus"]>(
    async (reportId, action, notes) => {
      try {
        const response = await fetch(`/api/operations/reports/${encodeURIComponent(reportId)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, notes }),
        });
        const payload = await responseJson(response);
        if (!response.ok) return { success: false, message: errorMessage(payload, response.status) };
        if (
          !isRecord(payload) ||
          payload.success !== true ||
          typeof payload.message !== "string" ||
          !isOperationsReport(payload.report)
        ) {
          throw new Error("Respons status laporan dari database tidak valid.");
        }
        const updatedReport = payload.report;
        setData((current) => ({
          ...current,
          reports: current.reports.map((report) =>
            report.id === updatedReport.id ? updatedReport : report,
          ),
        }));
        setPersistenceError("");
        return { success: true, message: payload.message, report: updatedReport };
      } catch (error) {
        const message = errorText(error, "Status laporan gagal diperbarui.");
        setPersistenceError(message);
        return { success: false, message };
      }
    },
    [],
  );

  const value = useMemo(
    () => ({
      data,
      ready,
      persistenceError,
      recordAttendance,
      saveReport,
      updateReportStatus,
    }),
    [data, ready, persistenceError, recordAttendance, saveReport, updateReportStatus],
  );

  return <OperationsContext.Provider value={value}>{children}</OperationsContext.Provider>;
}

export function useOperations() {
  const context = useContext(OperationsContext);
  if (!context) {
    throw new Error("useOperations must be used inside OperationsProvider.");
  }
  return context;
}

export function useLocalToday() {
  return getLocalDateString();
}
