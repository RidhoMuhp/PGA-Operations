import {
  AttendanceRecord,
  AttendanceTerminal,
  DivisionId,
  Employee,
  OperationsData,
  OperationsReport,
  ProductionTypeId,
} from "@/types/operations";

export interface ProductionType {
  id: ProductionTypeId;
  name: string;
  product: string;
  description: string;
  icon: "wheat" | "package" | "flask" | "factory";
  tone: string;
}

export interface DivisionDefinition {
  id: DivisionId;
  name: string;
  description: string;
  href: string;
  icon: "factory" | "warehouse" | "recycle" | "cleaning";
  accent: string;
}

export const divisions: DivisionDefinition[] = [
  {
    id: "production",
    name: "Produksi",
    description: "Absensi dan laporan harian per lini produksi.",
    href: "/divisions/production",
    icon: "factory",
    accent: "emerald",
  },
  {
    id: "warehouse",
    name: "Gudang",
    description: "Aktivitas gudang, penggunaan bahan, dan serah terima.",
    href: "/divisions/warehouse",
    icon: "warehouse",
    accent: "blue",
  },
  {
    id: "operations",
    name: "Operasional",
    description: "Pelaporan material dan kegiatan operasional.",
    href: "/divisions/operations",
    icon: "recycle",
    accent: "amber",
  },
  {
    id: "cleaning",
    name: "Kebersihan",
    description: "Kehadiran harian tim kebersihan.",
    href: "/divisions/cleaning",
    icon: "cleaning",
    accent: "violet",
  },
];

export const productionTypes: ProductionType[] = [
  {
    id: "sagu",
    name: "Produksi Sagu",
    product: "Sagu",
    description: "Absensi dan catatan harian produksi sagu.",
    icon: "wheat",
    tone: "amber",
  },
  {
    id: "tapioka-1kg",
    name: "Produksi Tapioka 1 kg",
    product: "Tapioka 1 kg",
    description: "Kegiatan produksi kemasan 1 kg.",
    icon: "package",
    tone: "blue",
  },
  {
    id: "tapioka-200gr",
    name: "Produksi Tapioka 200 gr",
    product: "Tapioka 200 gr",
    description: "Kegiatan produksi kemasan 200 gr.",
    icon: "package",
    tone: "violet",
  },
  {
    id: "tapioka-500gr",
    name: "Produksi Tapioka 500 gr",
    product: "Tapioka 500 gr",
    description: "Kegiatan produksi kemasan 500 gr.",
    icon: "package",
    tone: "cyan",
  },
  {
    id: "tapioka-2kg",
    name: "Produksi Tapioka 2 kg",
    product: "Tapioka 2 kg",
    description: "Kegiatan produksi kemasan 2 kg.",
    icon: "package",
    tone: "orange",
  },
  {
    id: "maizena",
    name: "Produksi Maizena",
    product: "Maizena",
    description: "Kegiatan produksi maizena.",
    icon: "flask",
    tone: "green",
  },
  {
    id: "maizena-rk",
    name: "Produksi Maizena RK",
    product: "Maizena RK",
    description: "Kegiatan produksi maizena RK.",
    icon: "factory",
    tone: "rose",
  },
];

export const attendanceTerminals: AttendanceTerminal[] = [
  { id: "TERM-SAGU-01", productionTypeId: "sagu", location: "Area Produksi Sagu" },
  { id: "TERM-TAPIOKA-1KG-01", productionTypeId: "tapioka-1kg", location: "Area Produksi Tapioka 1 kg" },
  { id: "TERM-TAPIOKA-200G-01", productionTypeId: "tapioka-200gr", location: "Area Produksi Tapioka 200 gr" },
  { id: "TERM-TAPIOKA-500G-01", productionTypeId: "tapioka-500gr", location: "Area Produksi Tapioka 500 gr" },
  { id: "TERM-TAPIOKA-2KG-01", productionTypeId: "tapioka-2kg", location: "Area Produksi Tapioka 2 kg" },
  { id: "TERM-MAIZENA-01", productionTypeId: "maizena", location: "Area Produksi Maizena" },
  { id: "TERM-MAIZENA-RK-01", productionTypeId: "maizena-rk", location: "Area Produksi Maizena RK" },
];

export function getAttendanceTerminal(terminalId: string): AttendanceTerminal | undefined {
  return attendanceTerminals.find((terminal) => terminal.id === terminalId);
}

export function getTerminalForProductionType(
  productionTypeId: ProductionTypeId,
): AttendanceTerminal | undefined {
  return attendanceTerminals.find((terminal) => terminal.productionTypeId === productionTypeId);
}

export function getTerminalSessionId(terminalId: string, workDate: string): string {
  return `${terminalId}:${workDate}`;
}

export function generateEmployeeBarcode(sequence: number): string {
  return `PGA-${String(sequence).padStart(4, "0")}`;
}

export const mockTestEmployee: Employee = {
  id: "EMP-008",
  barcode: generateEmployeeBarcode(8),
  name: "Pegawai Uji Coba",
  role: "Operator Produksi",
  isTestRecord: true,
};

export const mockEmployeeRecords: Employee[] = [
  { id: "EMP-001", barcode: generateEmployeeBarcode(1), name: "Siti Rahmawati", role: "Operator Produksi" },
  { id: "EMP-002", barcode: generateEmployeeBarcode(2), name: "Budi Santoso", role: "Operator Produksi" },
  { id: "EMP-003", barcode: generateEmployeeBarcode(3), name: "Agus Prasetyo", role: "Operator Produksi" },
  { id: "EMP-004", barcode: generateEmployeeBarcode(4), name: "Dewi Lestari", role: "Operator Produksi" },
  { id: "EMP-005", barcode: generateEmployeeBarcode(5), name: "Hendra Wijaya", role: "Operator Produksi" },
  { id: "EMP-006", barcode: generateEmployeeBarcode(6), name: "Rina Marlina", role: "Petugas Gudang" },
  { id: "EMP-007", barcode: generateEmployeeBarcode(7), name: "Nur Aisyah", role: "Petugas Kebersihan" },
  mockTestEmployee,
];

export const mockEmployees = mockEmployeeRecords
  .filter((employee) => !employee.isTestRecord)
  .map((employee) => employee.name);

export const divisionName: Record<DivisionId, string> = {
  production: "Produksi",
  warehouse: "Gudang",
  operations: "Operasional",
  cleaning: "Kebersihan",
};

export const departmentName: Record<DivisionId, OperationsReport["department"]> = {
  production: "Produksi",
  warehouse: "Gudang",
  operations: "Operasional",
  cleaning: "Kebersihan",
};

export function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return getLocalDateString(date);
}

function timestampAt(date: string, hour: number, minute: number): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day, hour, minute).toISOString();
}

function employeeId(index: number): string {
  return mockEmployeeRecords[index].id;
}

function attendance(
  id: string,
  employeeIndex: number,
  divisionId: DivisionId,
  workDate: string,
  hour: number,
  minute: number,
  productionTypeId?: ProductionTypeId,
  reviewed = false,
): AttendanceRecord {
  const terminal = productionTypeId
    ? getTerminalForProductionType(productionTypeId)
    : undefined;
  return {
    id,
    employeeId: employeeId(employeeIndex),
    divisionId,
    productionTypeId,
    ...(terminal
      ? {
          terminalId: terminal.id,
          sessionId: getTerminalSessionId(terminal.id, workDate),
        }
      : {}),
    workDate,
    scannedAt: timestampAt(workDate, hour, minute),
    method: "barcode",
    ...(reviewed ? { reviewedAt: timestampAt(workDate, hour + 1, minute) } : {}),
  };
}

function report(
  id: string,
  reportNumber: string,
  reportName: string,
  divisionId: DivisionId,
  reportTypeSlug: string,
  reportDate: string,
  submittedBy: string,
  status: OperationsReport["status"],
  createdAt: string,
  extra: Partial<OperationsReport> = {},
): OperationsReport {
  return {
    id,
    reportNumber,
    reportName,
    department: departmentName[divisionId],
    divisionId,
    reportTypeSlug,
    reportDate,
    submittedBy,
    status,
    createdAt,
    ...extra,
  };
}

export function createMockOperationsData(): OperationsData {
  const today = getLocalDateString();
  const yesterday = dateOffset(-1);
  const twoDaysAgo = dateOffset(-2);

  const attendanceRecords: AttendanceRecord[] = [
    attendance("att-001", 0, "production", today, 7, 1, "sagu", true),
    attendance("att-002", 1, "production", today, 7, 4, "tapioka-1kg"),
    attendance("att-003", 2, "production", today, 7, 8, "maizena"),
    attendance("att-004", 3, "production", today, 7, 11, "tapioka-200gr"),
    attendance("att-005", 4, "production", yesterday, 7, 2, "sagu", true),
    attendance("att-006", 5, "warehouse", today, 7, 16, undefined, true),
    attendance("att-007", 6, "cleaning", today, 6, 58, undefined),
    attendance("att-008", 2, "operations", today, 7, 20, undefined),
  ];

  const reports: OperationsReport[] = [
    report("rep-001", "PRD-SAG-001", "Laporan Harian Produksi Sagu", "production", "produksi-sagu", today, "Siti Rahmawati", "submitted", timestampAt(today, 8, 15), { productionTypeId: "sagu", notes: "Catatan produksi sagu hari ini." }),
    report("rep-002", "PRD-TP1-001", "Laporan Harian Produksi Tapioka 1 kg", "production", "produksi-tapioka-1kg", today, "Budi Santoso", "under_review", timestampAt(today, 8, 24), { productionTypeId: "tapioka-1kg", notes: "Laporan menunggu pemeriksaan." }),
    report("rep-003", "PRD-MZN-001", "Laporan Harian Produksi Maizena", "production", "produksi-maizena", today, "Agus Prasetyo", "approved", timestampAt(today, 8, 32), { productionTypeId: "maizena", notes: "Catatan shift pagi." }),
    report("rep-004", "GDG-BNG-001", "Pemakaian Benang", "warehouse", "pemakaian-benang", today, "Rina Marlina", "submitted", timestampAt(today, 9, 3), {
      machineUsage: Array.from({ length: 11 }, (_, index) => ({ machine: index + 1, openingStock: 10, added: 2, used: 3, remaining: 9 })),
    }),
    report("rep-005", "OPS-MTL-001", "Laporan Harian Plastik/Kardus Bekas", "operations", "laporan-plastik-kardus-bekas", yesterday, "Agus Prasetyo", "revision_requested", timestampAt(yesterday, 15, 10), {
      notes: "Mohon lengkapi catatan material.",
      materials: [{ itemName: "Kardus bekas", weightKg: 8.5, quantity: 4, quantityUnit: "bal" }],
    }),
    report("rep-006", "GDG-KRG-001", "Pemakaian Karung", "warehouse", "pemakaian-karung", yesterday, "Budi Santoso", "collected", timestampAt(yesterday, 14, 30)),
    report("rep-007", "OPS-HSK-001", "Laporan Petugas Kebersihan", "cleaning", "laporan-petugas-kebersihan", today, "Nur Aisyah", "submitted", timestampAt(today, 8, 5)),
    report("rep-008", "PRD-MZR-001", "Laporan Harian Produksi Maizena RK", "production", "produksi-maizena-rk", twoDaysAgo, "Dewi Lestari", "draft", timestampAt(twoDaysAgo, 16, 5), { productionTypeId: "maizena-rk", notes: "Draft catatan harian." }),
  ];

  return {
    employees: mockEmployeeRecords,
    terminals: attendanceTerminals,
    attendance: attendanceRecords,
    reports,
  };
}
