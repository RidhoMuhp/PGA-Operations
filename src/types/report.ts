export type ReportStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "revision_requested"
  | "approved"
  | "collected";

export interface Report {
  id: string;
  reportNumber: string;
  reportName: string;
  department: "Produksi" | "Gudang" | "Operasional" | "Absensi" | "Kebersihan";
  reportDate: string;
  submittedBy: string;
  status: ReportStatus;
  createdAt: string;
  notes?: string;
}
