import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getStripe } from '@/lib/stripe';

function getWebhookSecret() {
  const value = process.env.STRIPE_WEBHOOK_SECRET;
  if (!value) throw new Error('Missing environment variable: STRIPE_WEBHOOK_SECRET');
  return value;
}

async function updateOrganizationBilling(params: {
  organizationId: string;
  billingPlan?: string | null;
  billingStatus?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  pilotExpiresAt?: string | null;
}) {
  const admin = getSupabaseAdmin();
  const payload: Record<string, string | null> = {};
  if (params.billingPlan !== undefined) payload.billing_plan = params.billingPlan;
  if (params.billingStatus !== undefined) payload.billing_status = params.billingStatus;
  if (params.stripeCustomerId !== undefined) payload.stripe_customer_id = params.stripeCustomerId;
  if (params.stripeSubscriptionId !== undefined) payload.stripe_subscription_id = params.stripeSubscriptionId;
  if (params.pilotExpiresAt !== undefined) payload.pilot_expires_at = params.pilotExpiresAt;
  const { error } = await admin.from('organizations').update(payload).eq('id', params.organizationId);
  if (error) throw new Error(error.message);
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const signature = request.headers.get('stripe-signature');
    if (!signature) return NextResponse.json({ error: 'Missing stripe signature' }, { status: 400 });

    const body = await request.text();
    const event = stripe.webhooks.constructEvent(body, signature, getWebhookSecret());

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const organizationId = session.metadata?.organizationId;
      const billingPlan = session.metadata?.billingPlan;
      if (organizationId) {
        const baseUpdate = {
          organizationId,
          billingPlan: billingPlan ?? null,
          billingStatus: session.payment_status === 'paid' ? 'active' : session.payment_status,
          stripeCustomerId: typeof session.customer === 'string' ? session.customer : null,
          stripeSubscriptionId: typeof session.subscription === 'string' ? session.subscription : null,
        };
        if (billingPlan === 'pilot') {
          const expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + 3);
          await updateOrganizationBilling({ ...baseUpdate, pilotExpiresAt: expiresAt.toISOString() });
        } else {
          await updateOrganizationBilling(baseUpdate);
        }
      }
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created') {
      const subscription = event.data.object as Stripe.Subscription;
      const organizationId = subscription.metadata.organizationId;
      const billingPlan = subscription.metadata.billingPlan;
      if (organizationId) {
        await updateOrganizationBilling({
          organizationId,
          billingPlan: billingPlan ?? null,
          billingStatus: subscription.status,
          stripeCustomerId: typeof subscription.customer === 'string' ? subscription.customer : null,
          stripeSubscriptionId: subscription.id,
        });
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      const organizationId = subscription.metadata.organizationId;
      if (organizationId) {
        await updateOrganizationBilling({
          organizationId,
          billingStatus: 'canceled',
          stripeSubscriptionId: subscription.id,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
