
export interface Staff {
  id: string;
  name: string;
  role: string;
  salary: number;
  advance: number;
  present: number;
  otHours: number;
  otRate: number;
}

export interface Thread {
  id: string;
  sn: number;
  code: string;
  name: string;
  stock: number;
  out: number;
}

export interface ProductionEntry {
  mc: string;
  op: string;
  ds: string;
  stitch: number;
  qty: number;
  prc: number;
}

export interface HistoryRecord {
  id: number;
  date: string;
  timestamp: string;
  totalQty: number;
  totalTk: number;
  dayData: ProductionEntry[];
  nightData: ProductionEntry[];
  daySummary: { qty: number; tk: number };
  nightSummary: { qty: number; tk: number };
}

export interface Transaction {
  id: string;
  date: string;
  name: string;
  amount: number;
  type: 'earn' | 'expense';
}

export enum Tab {
  Home = 'home',
  Production = 'production',
  Attendance = 'present',
  Salary = 'salary',
  Thread = 'thread',
  Finance = 'finance'
}
