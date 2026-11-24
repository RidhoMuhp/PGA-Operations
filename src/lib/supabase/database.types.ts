import type { DivisionId, ProductionTypeId } from "@/types/operations";
import type { Report, ReportStatus } from "@/types/report";
import type { Json } from "@/types/supabase";

type Table<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type EmployeeRow = {
  employee_id: string;
  barcode: string;
  full_name: string;
  role: string;
  is_test_record: boolean;
  created_at: string;
};

export type TerminalRow = {
  id: string;
  production_type_id: ProductionTypeId;
  location: string;
  is_active: boolean;
};

export type AttendanceRow = {
  id: string;
  employee_id: string;
  division_id: DivisionId;
  production_type_id: ProductionTypeId | null;
  terminal_id: string | null;
  session_id: string | null;
  work_date: string;
  scanned_at: string;
  method: "barcode" | "manual";
  reviewed_at: string | null;
};

export type OperationsReportRow = {
  id: string;
  report_number: string;
  report_name: string;
  department: Report["department"];
  division_id: DivisionId;
  report_type_slug: string | null;
  production_type_id: ProductionTypeId | null;
  report_date: string;
  submitted_by: string;
  status: ReportStatus;
  created_at: string;
  notes: string | null;
  payload: Json;
};

export type Database = {
  public: {
    Tables: {
      operations_employees: Table<
        EmployeeRow,
        Omit<EmployeeRow, "created_at"> & { created_at?: string },
        Partial<EmployeeRow>
      >;
      operations_attendance_terminals: Table<
        TerminalRow,
        Omit<TerminalRow, "is_active"> & { is_active?: boolean },
        Partial<TerminalRow>
      >;
      operations_attendance_records: Table<
        AttendanceRow,
        Omit<AttendanceRow, "id" | "scanned_at" | "reviewed_at"> & {
          id?: string;
          scanned_at?: string;
          reviewed_at?: string | null;
        },
        Partial<AttendanceRow>
      >;
      operations_reports: Table<
        OperationsReportRow,
        Omit<OperationsReportRow, "id" | "created_at" | "notes" | "payload"> & {
          id?: string;
          created_at?: string;
          notes?: string | null;
          payload?: Json;
        },
        Partial<OperationsReportRow>
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
