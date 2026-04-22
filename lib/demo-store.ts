import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

export type DemoUser = { id: string; email: string; password: string; createdAt: string };
export type DemoOrg = { id: string; name: string; country: string; currency: string; ownerUserId: string; createdAt: string };
export type DemoImportRow = {
  rowIndex: number;
  sku: string;
  supplier: string;
  country: string;
  unitPurchasePrice: number;
  quantity: number;
  currency: string;
  transportCost: number;
  dutyRate: number;
  incoterm: string;
  ancillaryFees: number;
  salesPrice?: number;
};
export type DemoImport = {
  id: string;
  orgId: string;
  uploadedBy: string;
  fileName: string;
  headers: string[];
  previewRows: Record<string, string>[];
  mappedRows: DemoImportRow[];
  status: 'uploaded' | 'mapped';
  createdAt: string;
};
export type DemoScenario = {
  id: string;
  name: string;
  isBaseline: boolean;
  notes?: string;
  purchasePriceMultiplier: number;
  transportMultiplier: number;
  dutyRateOverride?: number;
  ancillaryMultiplier: number;
};
export type DemoAnalysis = {
  id: string;
  orgId: string;
  importId: string;
  title: string;
  status: 'draft' | 'saved';
  scenarios: DemoScenario[];
  updatedAt: string;
  createdBy: string;
};

type DemoDb = {
  users: DemoUser[];
  organizations: DemoOrg[];
  imports: DemoImport[];
  analyses: DemoAnalysis[];
};

const DB_PATH = path.join(process.cwd(), 'data', 'demo-db.json');

const initialDb: DemoDb = { users: [], organizations: [], imports: [], analyses: [] };

async function ensureDb() {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify(initialDb, null, 2), 'utf-8');
  }
}

export async function readDb(): Promise<DemoDb> {
  await ensureDb();
  const content = await fs.readFile(DB_PATH, 'utf-8');
  return JSON.parse(content) as DemoDb;
}

export async function writeDb(db: DemoDb): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

export async function createUser(email: string, password: string) {
  const db = await readDb();
  if (db.users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('Email already exists');
  }
  const user: DemoUser = { id: randomUUID(), email, password, createdAt: new Date().toISOString() };
  db.users.push(user);
  await writeDb(db);
  return user;
}

export async function authenticate(email: string, password: string) {
  const db = await readDb();
  return db.users.find((user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password);
}

export async function createOrganization(input: { name: string; country: string; currency: string; ownerUserId: string }) {
  const db = await readDb();
  const org: DemoOrg = { id: randomUUID(), name: input.name, country: input.country, currency: input.currency, ownerUserId: input.ownerUserId, createdAt: new Date().toISOString() };
  db.organizations.push(org);
  await writeDb(db);
  return org;
}

export async function findOrgForUser(userId: string) {
  const db = await readDb();
  return db.organizations.find((org) => org.ownerUserId === userId);
}

export async function getOrganization(orgId: string) {
  const db = await readDb();
  return db.organizations.find((org) => org.id === orgId);
}

export async function createImport(input: Omit<DemoImport, 'id' | 'createdAt' | 'mappedRows' | 'status'>) {
  const db = await readDb();
  const record: DemoImport = {
    ...input,
    id: randomUUID(),
    mappedRows: [],
    status: 'uploaded',
    createdAt: new Date().toISOString(),
  };
  db.imports.push(record);
  await writeDb(db);
  return record;
}

export async function getImport(importId: string) {
  const db = await readDb();
  return db.imports.find((item) => item.id === importId);
}

export async function commitImport(importId: string, rows: DemoImportRow[]) {
  const db = await readDb();
  const record = db.imports.find((item) => item.id === importId);
  if (!record) throw new Error('Import not found');
  record.mappedRows = rows;
  record.status = 'mapped';
  await writeDb(db);
  return record;
}

export async function createAnalysis(input: { orgId: string; importId: string; title: string; createdBy: string }) {
  const db = await readDb();
  const scenarios: DemoScenario[] = [
    {
      id: randomUUID(),
      name: 'Baseline',
      isBaseline: true,
      notes: 'Current reference assumptions',
      purchasePriceMultiplier: 1,
      transportMultiplier: 1,
      ancillaryMultiplier: 1,
    },
    {
      id: randomUUID(),
      name: 'Scenario B',
      isBaseline: false,
      notes: 'Alternative sourcing assumptions',
      purchasePriceMultiplier: 1,
      transportMultiplier: 1,
      ancillaryMultiplier: 1,
    },
  ];
  const analysis: DemoAnalysis = {
    id: randomUUID(),
    orgId: input.orgId,
    importId: input.importId,
    title: input.title,
    status: 'draft',
    scenarios,
    updatedAt: new Date().toISOString(),
    createdBy: input.createdBy,
  };
  db.analyses.push(analysis);
  await writeDb(db);
  return analysis;
}

export async function listAnalyses(orgId: string) {
  const db = await readDb();
  return db.analyses.filter((analysis) => analysis.orgId === orgId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getAnalysis(analysisId: string) {
  const db = await readDb();
  return db.analyses.find((analysis) => analysis.id === analysisId);
}

export async function saveAnalysis(analysisId: string, updater: (analysis: DemoAnalysis) => void) {
  const db = await readDb();
  const analysis = db.analyses.find((item) => item.id === analysisId);
  if (!analysis) throw new Error('Analysis not found');
  updater(analysis);
  analysis.updatedAt = new Date().toISOString();
  await writeDb(db);
  return analysis;
}
