// lib/supabase.client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from './supabase.types';

function assertClientEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_KEY;

  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing');
  if (!anon)
    throw new Error(
      'Supabase anon key is missing. Set NEXT_PUBLIC_SUPABASE_ANON_KEY on Vercel.'
    );
}

/**
 * Supabase client para Browser (componentes com "use client").
 * Usa anon key via env NEXT_PUBLIC_*.
 */
export const createSupabaseClient = () => {
  assertClientEnv();
  return createClientComponentClient<Database>();
};
