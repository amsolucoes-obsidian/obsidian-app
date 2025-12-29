// lib/supabase.server.ts
import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabase.types';

function assertServerEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing (server)');
  if (!service) throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing (server)');
  return { url, service };
}

/**
 * Supabase admin (service role) — NUNCA importe em componentes "use client".
 * Use só em route handlers / server actions.
 */
export const createSupabaseAdmin = () => {
  const { url, service } = assertServerEnv();
  return createClient<Database>(url, service, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
};
