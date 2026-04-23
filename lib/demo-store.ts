import { randomUUID } from 'node:crypto';
import { getSupabaseAdmin, getSupabasePublic } from '@/lib/supabase';
import type { CostAllocationMethod } from '@/features/scenarios/lib/calculate';

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
  weightKg?: number;
  volumeM3?: number;
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
  reportingCurrency: string;
  exchangeRate: number;
  costAllocationMethod: CostAllocationMethod;
  incotermOverride?: string;
  originCost: number;
  mainFreightCost: number;
  insuranceCost: number;
  destinationCost: number;
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

export type DemoSavedMapping = {
  id: string;
  orgId: string;
  headers: string[];
  mapping: Record<string, string>;
  createdAt: string;
  updatedAt: string;
};

type DemoDb = {
  users: DemoUser[];
  organizations: DemoOrg[];
  imports: DemoImport[];
  analyses: DemoAnalysis[];
  savedMappings: DemoSavedMapping[];
};

const initialDb: DemoDb = { users: [], organizations: [], imports: [], analyses: [], savedMappings: [] };

function normalizeHeader(value: string) {
  return value.trim().toLowerCase();
}

function normalizeHeaderSet(headers: string[]) {
  return [...headers].map(normalizeHeader).sort();
}

function sameHeaderSignature(a: string[], b: string[]) {
  const aa = normalizeHeaderSet(a);
  const bb = normalizeHeaderSet(b);
  return aa.length === bb.length && aa.every((item, index) => item === bb[index]);
}

function mapOrgRow(row: any): DemoOrg {
  return {
    id: row.id,
    name: row.name,
    country: row.country_code ?? 'FR',
    currency: row.default_currency ?? 'EUR',
    ownerUserId: row.created_by,
    createdAt: row.created_at,
  };
}

function mapImportRow(row: any): DemoImport {
  return {
    id: row.id,
    orgId: row.organization_id,
    uploadedBy: row.uploaded_by,
    fileName: row.file_name,
    headers: Array.isArray(row.raw_header) ? row.raw_header : [],
    previewRows: Array.isArray(row.preview_rows) ? row.preview_rows : [],
    mappedRows: Array.isArray(row.mapped_rows) ? row.mapped_rows : [],
    status: row.status === 'mapped' ? 'mapped' : 'uploaded',
    createdAt: row.created_at,
  };
}

function mapScenarioRow(row: any): DemoScenario {
  const overrides = row.assumption_overrides ?? {};
  return {
    id: row.id,
    name: row.name,
    isBaseline: Boolean(row.is_baseline),
    notes: overrides.notes ?? '',
    purchasePriceMultiplier: Number(overrides.purchasePriceMultiplier ?? 1),
    transportMultiplier: Number(overrides.transportMultiplier ?? 1),
    ancillaryMultiplier: Number(overrides.ancillaryMultiplier ?? 1),
    dutyRateOverride: overrides.dutyRateOverride == null ? undefined : Number(overrides.dutyRateOverride),
    reportingCurrency: String(overrides.reportingCurrency ?? 'EUR').toUpperCase(),
    exchangeRate: Number(overrides.exchangeRate ?? 1),
    costAllocationMethod: (overrides.costAllocationMethod ?? 'manual') as CostAllocationMethod,
    incotermOverride: overrides.incotermOverride ? String(overrides.incotermOverride).toUpperCase() : undefined,
    originCost: Number(overrides.originCost ?? 0),
    mainFreightCost: Number(overrides.mainFreightCost ?? 0),
    insuranceCost: Number(overrides.insuranceCost ?? 0),
    destinationCost: Number(overrides.destinationCost ?? 0),
  };
}

function mapAnalysisRow(row: any, scenarioRows: any[]): DemoAnalysis {
  return {
    id: row.id,
    orgId: row.organization_id,
    importId: row.import_id,
    title: row.title,
    status: row.status === 'saved' || row.status === 'finalized' ? 'saved' : 'draft',
    scenarios: scenarioRows.map(mapScenarioRow),
    updatedAt: row.updated_at,
    createdBy: row.created_by,
  };
}

export async function readDb(): Promise<DemoDb> {
  return initialDb;
}

export async function writeDb(_: DemoDb): Promise<void> {
  return;
}

export async function createUser(email: string, password: string) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw new Error(error.message);
  return { id: data.user.id, email: data.user.email ?? email, password: '', createdAt: data.user.created_at } satisfies DemoUser;
}

export async function authenticate(email: string, password: string) {
  const client = getSupabasePublic();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.user) return null;
  await client.auth.signOut();
  return { id: data.user.id, email: data.user.email ?? email, password: '', createdAt: data.user.created_at } satisfies DemoUser;
}

export async function createOrganization(input: { name: string; country: string; currency: string; ownerUserId: string }) {
  const admin = getSupabaseAdmin();
  const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || `org-${randomUUID().slice(0, 8)}`;
  const { data: orgRow, error: orgError } = await admin.from('organizations').insert({
    name: input.name,
    slug,
    country_code: input.country,
    default_currency: input.currency,
    default_locale: input.country === 'FR' ? 'fr-FR' : 'en-US',
    created_by: input.ownerUserId,
  }).select('*').single();
  if (orgError) throw new Error(orgError.message);
  const { error: memberError } = await admin.from('organization_members').insert({
    organization_id: orgRow.id,
    user_id: input.ownerUserId,
    role: 'owner',
    status: 'active',
    invited_by: input.ownerUserId,
  });
  if (memberError) throw new Error(memberError.message);
  return mapOrgRow(orgRow);
}

export async function findOrgForUser(userId: string) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.from('organization_members').select('organization_id, organizations(*)').eq('user_id', userId).eq('status', 'active').limit(1).maybeSingle();
  if (error) throw new Error(error.message);
  return data?.organizations ? mapOrgRow(data.organizations) : undefined;
}

export async function getOrganization(orgId: string) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.from('organizations').select('*').eq('id', orgId).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapOrgRow(data) : undefined;
}

export async function createImport(input: Omit<DemoImport, 'id' | 'createdAt' | 'mappedRows' | 'status'>) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.from('imports').insert({
    organization_id: input.orgId,
    uploaded_by: input.uploadedBy,
    file_name: input.fileName,
    file_path: '',
    file_type: 'text/csv',
    file_size_bytes: 0,
    status: 'uploaded',
    raw_header: input.headers,
    preview_rows: input.previewRows,
    mapped_rows: [],
  }).select('*').single();
  if (error) throw new Error(error.message);
  return mapImportRow(data);
}

export async function getImport(importId: string) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.from('imports').select('*').eq('id', importId).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapImportRow(data) : undefined;
}

export async function commitImport(importId: string, rows: DemoImportRow[]) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.from('imports').update({ mapped_rows: rows, status: 'mapped' }).eq('id', importId).select('*').single();
  if (error) throw new Error(error.message);
  return mapImportRow(data);
}

export async function saveOrgMapping(input: { orgId: string; headers: string[]; mapping: Record<string, string> }) {
  const admin = getSupabaseAdmin();
  const { data: existingRows, error: existingError } = await admin.from('saved_mappings').select('*').eq('organization_id', input.orgId);
  if (existingError) throw new Error(existingError.message);
  const existing = (existingRows ?? []).find((item: any) => sameHeaderSignature(item.headers ?? [], input.headers));
  if (existing) {
    const { data, error } = await admin.from('saved_mappings').update({ headers: input.headers, mapping: input.mapping, updated_at: new Date().toISOString() }).eq('id', existing.id).select('*').single();
    if (error) throw new Error(error.message);
    return { id: data.id, orgId: data.organization_id, headers: data.headers, mapping: data.mapping, createdAt: data.created_at, updatedAt: data.updated_at } satisfies DemoSavedMapping;
  }
  const { data, error } = await admin.from('saved_mappings').insert({ organization_id: input.orgId, headers: input.headers, mapping: input.mapping }).select('*').single();
  if (error) throw new Error(error.message);
  return { id: data.id, orgId: data.organization_id, headers: data.headers, mapping: data.mapping, createdAt: data.created_at, updatedAt: data.updated_at } satisfies DemoSavedMapping;
}

export async function findSavedMappingForImport(orgId: string, headers: string[]) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.from('saved_mappings').select('*').eq('organization_id', orgId).order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  const normalizedCurrentHeaders = new Set(headers.map(normalizeHeader));
  const candidates = (data ?? []).map((item: any) => ({
    item,
    score: Object.entries(item.mapping ?? {}).filter(([, sourceHeader]) => normalizedCurrentHeaders.has(normalizeHeader(String(sourceHeader)))).length,
  })).filter((entry) => entry.score > 0).sort((a, b) => b.score - a.score);
  const best = candidates[0]?.item;
  return best ? { id: best.id, orgId: best.organization_id, headers: best.headers, mapping: best.mapping, createdAt: best.created_at, updatedAt: best.updated_at } : undefined;
}

export async function createAnalysis(input: { orgId: string; importId: string; title: string; createdBy: string }) {
  const admin = getSupabaseAdmin();
  const { data: analysisRow, error: analysisError } = await admin.from('analyses').insert({
    organization_id: input.orgId,
    import_id: input.importId,
    title: input.title,
    status: 'draft',
    created_by: input.createdBy,
    updated_by: input.createdBy,
  }).select('*').single();
  if (analysisError) throw new Error(analysisError.message);
  const baselineDefaults = {
    notes: 'Current reference assumptions',
    purchasePriceMultiplier: 1,
    transportMultiplier: 1,
    ancillaryMultiplier: 1,
    reportingCurrency: 'EUR',
    exchangeRate: 1,
    costAllocationMethod: 'manual',
    originCost: 0,
    mainFreightCost: 0,
    insuranceCost: 0,
    destinationCost: 0,
  };
  const scenarioBDefaults = {
    notes: 'Alternative sourcing assumptions',
    purchasePriceMultiplier: 1,
    transportMultiplier: 1,
    ancillaryMultiplier: 1,
    reportingCurrency: 'EUR',
    exchangeRate: 1,
    costAllocationMethod: 'manual',
    originCost: 0,
    mainFreightCost: 0,
    insuranceCost: 0,
    destinationCost: 0,
  };
  const scenariosPayload = [
    { id: randomUUID(), analysis_id: analysisRow.id, name: 'Baseline', is_baseline: true, rank_order: 0, created_by: input.createdBy, assumption_overrides: baselineDefaults },
    { id: randomUUID(), analysis_id: analysisRow.id, name: 'Scenario B', is_baseline: false, rank_order: 1, created_by: input.createdBy, assumption_overrides: scenarioBDefaults },
  ];
  const { data: scenarioRows, error: scenarioError } = await admin.from('scenarios').insert(scenariosPayload).select('*');
  if (scenarioError) throw new Error(scenarioError.message);
  return mapAnalysisRow(analysisRow, scenarioRows ?? []);
}

export async function listAnalyses(orgId: string) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.from('analyses').select('*').eq('organization_id', orgId).order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row: any) => ({ id: row.id, orgId: row.organization_id, importId: row.import_id, title: row.title, status: row.status === 'saved' || row.status === 'finalized' ? 'saved' : 'draft', scenarios: [], updatedAt: row.updated_at, createdBy: row.created_by })) satisfies DemoAnalysis[];
}

export async function getAnalysis(analysisId: string) {
  const admin = getSupabaseAdmin();
  const { data: analysisRow, error: analysisError } = await admin.from('analyses').select('*').eq('id', analysisId).maybeSingle();
  if (analysisError) throw new Error(analysisError.message);
  if (!analysisRow) return undefined;
  const { data: scenarioRows, error: scenarioError } = await admin.from('scenarios').select('*').eq('analysis_id', analysisId).order('rank_order', { ascending: true });
  if (scenarioError) throw new Error(scenarioError.message);
  return mapAnalysisRow(analysisRow, scenarioRows ?? []);
}

export async function saveAnalysis(analysisId: string, updater: (analysis: DemoAnalysis) => void) {
  const admin = getSupabaseAdmin();
  const existing = await getAnalysis(analysisId);
  if (!existing) throw new Error('Analysis not found');
  updater(existing);
  const { error: analysisError } = await admin.from('analyses').update({ title: existing.title, status: existing.status === 'saved' ? 'saved' : 'draft', updated_at: new Date().toISOString(), updated_by: existing.createdBy }).eq('id', analysisId);
  if (analysisError) throw new Error(analysisError.message);
  const { error: deleteError } = await admin.from('scenarios').delete().eq('analysis_id', analysisId);
  if (deleteError) throw new Error(deleteError.message);
  const scenarioPayload = existing.scenarios.map((scenario, index) => ({
    id: scenario.id,
    analysis_id: analysisId,
    name: scenario.name,
    is_baseline: scenario.isBaseline,
    rank_order: index,
    created_by: existing.createdBy,
    assumption_overrides: {
      notes: scenario.notes ?? '',
      purchasePriceMultiplier: scenario.purchasePriceMultiplier,
      transportMultiplier: scenario.transportMultiplier,
      ancillaryMultiplier: scenario.ancillaryMultiplier,
      dutyRateOverride: scenario.dutyRateOverride ?? null,
      reportingCurrency: scenario.reportingCurrency,
      exchangeRate: scenario.exchangeRate,
      costAllocationMethod: scenario.costAllocationMethod,
      incotermOverride: scenario.incotermOverride ?? null,
      originCost: scenario.originCost,
      mainFreightCost: scenario.mainFreightCost,
      insuranceCost: scenario.insuranceCost,
      destinationCost: scenario.destinationCost,
    },
  }));
  const { data: scenarioRows, error: insertError } = await admin.from('scenarios').insert(scenarioPayload).select('*');
  if (insertError) throw new Error(insertError.message);
  const refreshed = await admin.from('analyses').select('*').eq('id', analysisId).single();
  if (refreshed.error) throw new Error(refreshed.error.message);
  return mapAnalysisRow(refreshed.data, scenarioRows ?? []);
}
