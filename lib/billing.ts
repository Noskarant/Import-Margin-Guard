import { getSupabaseAdmin } from '@/lib/supabase';

export type BillingPlan = 'starter' | 'pro' | 'team' | 'pilot' | 'free' | string;
export type BillingStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | string | null;

export type OrganizationBilling = {
  orgId: string;
  billingPlan: BillingPlan;
  billingStatus: BillingStatus;
  pilotExpiresAt?: string | null;
  isActive: boolean;
};

const STARTER_MONTHLY_ANALYSIS_LIMIT = 5;

function isPilotStillActive(pilotExpiresAt?: string | null) {
  return Boolean(pilotExpiresAt && new Date(pilotExpiresAt).getTime() > Date.now());
}

export async function getOrganizationBilling(orgId: string): Promise<OrganizationBilling> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from('organizations')
    .select('id, billing_plan, billing_status, pilot_expires_at')
    .eq('id', orgId)
    .single();

  if (error) throw new Error(error.message);

  const billingPlan = String(data.billing_plan ?? 'free');
  const billingStatus = data.billing_status ?? null;
  const pilotExpiresAt = data.pilot_expires_at ?? null;
  const isActive = billingStatus === 'active' || billingStatus === 'trialing' || (billingPlan === 'pilot' && isPilotStillActive(pilotExpiresAt));

  return {
    orgId: data.id,
    billingPlan,
    billingStatus,
    pilotExpiresAt,
    isActive,
  };
}

export async function requireActiveBilling(orgId: string) {
  const billing = await getOrganizationBilling(orgId);
  if (!billing.isActive) {
    const error = new Error('BILLING_REQUIRED');
    error.name = 'BILLING_REQUIRED';
    throw error;
  }
  return billing;
}

export async function countAnalysesCreatedThisMonth(orgId: string) {
  const admin = getSupabaseAdmin();
  const start = new Date();
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);

  const { count, error } = await admin
    .from('analyses')
    .select('id', { count: 'exact', head: true })
    .eq('organization_id', orgId)
    .gte('created_at', start.toISOString());

  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function enforceStarterAnalysisLimit(orgId: string) {
  const billing = await getOrganizationBilling(orgId);
  if (billing.billingPlan !== 'starter') return { billing, used: null, limit: null };

  const used = await countAnalysesCreatedThisMonth(orgId);
  if (used >= STARTER_MONTHLY_ANALYSIS_LIMIT) {
    const error = new Error('STARTER_ANALYSIS_LIMIT_REACHED');
    error.name = 'STARTER_ANALYSIS_LIMIT_REACHED';
    throw error;
  }

  return { billing, used, limit: STARTER_MONTHLY_ANALYSIS_LIMIT };
}

export { STARTER_MONTHLY_ANALYSIS_LIMIT };
