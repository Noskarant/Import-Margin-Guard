import { createClient } from '@supabase/supabase-js';

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export function getSupabaseAdmin() {
  return createClient(requiredEnv('NEXT_PUBLIC_SUPABASE_URL'), requiredEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function getSupabasePublic() {
  return createClient(requiredEnv('NEXT_PUBLIC_SUPABASE_URL'), requiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
