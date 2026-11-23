import { ReportStatus } from "@/types/report";

const styles: Record<ReportStatus,string> = {
  draft:"bg-slate-100 text-slate-600",
  submitted:"bg-blue-50 text-blue-700",
  under_review:"bg-amber-50 text-amber-700",
  revision_requested:"bg-red-50 text-red-700",
  approved:"bg-emerald-50 text-emerald-700",
  collected:"bg-violet-50 text-violet-700",
};
const labels: Record<ReportStatus,string> = {
  draft:"Draft",submitted:"Submitted",under_review:"Under Review",revision_requested:"Revision Requested",approved:"Approved",collected:"Collected",
};
export default function ReportStatusBadge({ status }: { status: ReportStatus }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>{labels[status]}</span>;
}
