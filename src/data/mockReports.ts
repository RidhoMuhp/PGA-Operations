import { Report } from "@/types/report";

export const mockReports: Report[] = [
  { id:"1", reportNumber:"PRD-2026-1123-001", reportName:"Laporan Produksi Maizena", department:"Produksi", reportDate:"2026-11-23", submittedBy:"Siti Rahmawati", status:"under_review", createdAt:"2026-11-23 07:42" },
  { id:"2", reportNumber:"GDG-2026-1123-004", reportName:"Serah Terima Hasil Produksi", department:"Gudang", reportDate:"2026-11-23", submittedBy:"Budi Santoso", status:"submitted", createdAt:"2026-11-23 08:15" },
  { id:"3", reportNumber:"OPS-2026-1123-002", reportName:"Laporan Harian Plastik/Kardus Bekas", department:"Operasional", reportDate:"2026-11-23", submittedBy:"Agus Prasetyo", status:"approved", createdAt:"2026-11-23 09:03" },
  { id:"4", reportNumber:"ABS-2026-1123-006", reportName:"Laporan Staff Gudang", department:"Absensi", reportDate:"2026-11-23", submittedBy:"Dewi Lestari", status:"submitted", createdAt:"2026-11-23 09:20" },
  { id:"5", reportNumber:"PRD-2026-1122-018", reportName:"Produksi Tapioka 2 kg", department:"Produksi", reportDate:"2026-11-22", submittedBy:"Hendra Wijaya", status:"revision_requested", createdAt:"2026-11-22 16:35" },
  { id:"6", reportNumber:"GDG-2026-1122-011", reportName:"Pemakaian Karung", department:"Gudang", reportDate:"2026-11-22", submittedBy:"Rina Marlina", status:"collected", createdAt:"2026-11-22 14:10" },
  { id:"7", reportNumber:"OPS-2026-1121-003", reportName:"Laporan Harian Plastik/Kardus Bekas", department:"Operasional", reportDate:"2026-11-21", submittedBy:"Agus Prasetyo", status:"approved", createdAt:"2026-11-21 15:48" },
  { id:"8", reportNumber:"ABS-2026-1121-008", reportName:"Laporan Petugas Kebersihan", department:"Absensi", reportDate:"2026-11-21", submittedBy:"Nur Aisyah", status:"draft", createdAt:"2026-11-21 17:05" },
];
