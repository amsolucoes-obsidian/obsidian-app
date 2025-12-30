import { createClient } from '@supabase/supabase-js';

/**
 * Cria um cliente do Supabase com privilégios de administrador (Service Role).
 * Deve ser usado APENAS em arquivos .server.ts ou API Routes.
 */
export function createSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('As variáveis de ambiente do Supabase Admin estão faltando.');
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}