// lib/supabase.server.ts
import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabase.types';

function assertServerEnv() {
  // server pode usar SUPABASE_URL (fallback) ou NEXT_PUBLIC_SUPABASE_URL
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error(
      'Supabase URL is missing (server). Set SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL in your environment.'
    );
  }

  if (!service) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is missing (server). Add it in Vercel env vars (Server only).'
    );
  }

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
