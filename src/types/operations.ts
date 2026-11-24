import { MachineThreadUsage } from "@/types/threadUsage";
import { WasteMaterialItem } from "@/types/wasteMaterial";
import { Report } from "@/types/report";

export type DivisionId = "production" | "warehouse" | "operations" | "cleaning";

export type ProductionTypeId =
  | "sagu"
  | "tapioka-1kg"
  | "tapioka-200gr"
  | "tapioka-500gr"
  | "tapioka-2kg"
  | "maizena"
  | "maizena-rk";

export interface Employee {
  id: string;
  barcode: string;
  name: string;
  role: string;
  isTestRecord?: boolean;
}

export interface AttendanceTerminal {
  id: string;
  productionTypeId: ProductionTypeId;
  location: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  divisionId: DivisionId;
  productionTypeId?: ProductionTypeId;
  terminalId?: string;
  sessionId?: string;
  workDate: string;
  scannedAt: string;
  method: "barcode" | "manual";
  reviewedAt?: string;
}

export interface OperationsReport extends Report {
  divisionId: DivisionId;
  reportTypeSlug?: string;
  productionTypeId?: ProductionTypeId;
  machineUsage?: MachineThreadUsage[];
  materials?: WasteMaterialItem[];
}

export interface OperationsData {
  employees: Employee[];
  terminals: AttendanceTerminal[];
  attendance: AttendanceRecord[];
  reports: OperationsReport[];
}

export type ReportStatusAction = "approve" | "request-revision" | "collect";
