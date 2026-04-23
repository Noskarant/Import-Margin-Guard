import Stripe from 'stripe';

export type BillingPlanKey = 'starter' | 'pro' | 'pilot';

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export function getStripe() {
  return new Stripe(requiredEnv('STRIPE_SECRET_KEY'));
}

export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

export function getBillingPlanConfig(plan: BillingPlanKey) {
  switch (plan) {
    case 'starter':
      return {
        mode: 'subscription' as const,
        priceId: requiredEnv('STRIPE_PRICE_STARTER_MONTHLY'),
        planName: 'starter',
      };
    case 'pro':
      return {
        mode: 'subscription' as const,
        priceId: requiredEnv('STRIPE_PRICE_PRO_MONTHLY'),
        planName: 'pro',
      };
    case 'pilot':
      return {
        mode: 'payment' as const,
        priceId: requiredEnv('STRIPE_PRICE_PILOT_ONE_SHOT'),
        planName: 'pilot',
      };
    default:
      throw new Error('Unsupported billing plan');
  }
}
