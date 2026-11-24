import { Report } from "@/types/report";

export interface WasteMaterialItem {
  itemName: string;
  weightKg: number;
  quantity: number;
  quantityUnit: "kg" | "bal";
}

export interface WasteMaterialReport extends Report {
  materials: WasteMaterialItem[];
}

export interface WasteMaterialSubmission {
  reportDate: string;
  submittedBy: string;
  department: "Produksi" | "Gudang" | "Operasional";
  status: "draft" | "submitted";
  notes: string;
  materials: WasteMaterialItem[];
}
