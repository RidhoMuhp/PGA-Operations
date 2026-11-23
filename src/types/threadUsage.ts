import { Report } from "@/types/report";

export interface MachineThreadUsage {
  machine: number;
  openingStock: number;
  added: number;
  used: number;
  remaining: number;
}

export interface ThreadUsageReport extends Report {
  machineUsage: MachineThreadUsage[];
}
