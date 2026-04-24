import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { getSessionUserId } from '@/lib/auth';
import { findOrgForUser } from '@/lib/data-store';
import { getOrganizationBilling } from '@/lib/billing';

export default async function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const userId = await getSessionUserId();
  if (!userId) redirect('/sign-in');

  const org = await findOrgForUser(userId);
  if (!org) redirect('/onboarding');

  const billing = await getOrganizationBilling(org.id);
  if (!billing.isActive) redirect('/pricing?billing=required');

  return <AppShell>{children}</AppShell>;
}
