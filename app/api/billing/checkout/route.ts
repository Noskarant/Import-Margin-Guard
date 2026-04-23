import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/lib/auth';
import { findOrgForUser } from '@/lib/demo-store';
import { getSupabaseAdmin } from '@/lib/supabase';
import { BillingPlanKey, getBaseUrl, getBillingPlanConfig, getStripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const org = await findOrgForUser(userId);
    if (!org) return NextResponse.json({ error: 'Create organization first' }, { status: 400 });

    const body = await request.json();
    const plan = String(body.plan ?? '') as BillingPlanKey;
    if (!['starter', 'pro', 'pilot'].includes(plan)) {
      return NextResponse.json({ error: 'Unsupported billing plan' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const stripe = getStripe();
    const config = getBillingPlanConfig(plan);
    const baseUrl = getBaseUrl();

    const { data: orgRow, error: orgError } = await admin
      .from('organizations')
      .select('id, name, stripe_customer_id')
      .eq('id', org.id)
      .single();
    if (orgError) throw new Error(orgError.message);

    let customerId = orgRow.stripe_customer_id as string | null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        name: orgRow.name,
        metadata: { organizationId: org.id, userId },
      });
      customerId = customer.id;
      const { error: updateError } = await admin.from('organizations').update({ stripe_customer_id: customerId }).eq('id', org.id);
      if (updateError) throw new Error(updateError.message);
    }

    const session = await stripe.checkout.sessions.create({
      mode: config.mode,
      customer: customerId,
      line_items: [{ price: config.priceId, quantity: 1 }],
      success_url: `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/billing/cancel?plan=${plan}`,
      metadata: {
        organizationId: org.id,
        userId,
        billingPlan: config.planName,
      },
      subscription_data: config.mode === 'subscription' ? {
        metadata: {
          organizationId: org.id,
          userId,
          billingPlan: config.planName,
        },
      } : undefined,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if ((error as Error).message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
