import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJson<T>(filename: string, defaultValue: T): T {
  ensureDir();
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return defaultValue;
  }
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return defaultValue;
  }
}

function writeJson<T>(filename: string, data: T): void {
  ensureDir();
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ── Institutes ────────────────────────────────────────────────────────────────

export interface Institute {
  id: string;
  name: string;
  createdAt: string;
}

const DEFAULT_INSTITUTES: Institute[] = [
  { id: 'ufr-sante', name: 'UFR Santé - Université de Thiès', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'isa', name: 'ISA - Institut Supérieur des Arts', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'esp-thies', name: 'ESP Thiès - École Supérieure Polytechnique', createdAt: '2024-01-01T00:00:00.000Z' },
];

export function getInstitutes(): Institute[] {
  return readJson<Institute[]>('institutes.json', DEFAULT_INSTITUTES);
}

export function saveInstitutes(institutes: Institute[]): void {
  writeJson('institutes.json', institutes);
}

// ── Orders ────────────────────────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'processing' | 'ready' | 'delivered';
export type AdminRole = 'admin1' | 'admin2' | 'superadmin';

export interface StoredOrder {
  id: string;
  orderNumber: string;
  document: {
    name: string;
    pageCount: number;
    hasIssues: boolean;
    savedFileName?: string;
  };
  client: { name: string; phone: string } | null;
  correctionService: boolean;
  finishing: string | null;
  delivery: string | null;
  selectedInstitute: string | null;
  copies?: number;
  totalPrice: number;
  status: OrderStatus;
  assignedTo: 'admin1' | 'admin2' | null;
  createdAt: string;
}

export function getOrders(): StoredOrder[] {
  return readJson<StoredOrder[]>('orders.json', []);
}

export function saveOrders(orders: StoredOrder[]): void {
  writeJson('orders.json', orders);
}
