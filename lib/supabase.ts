import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// ===============================
// Client-side (Browser)
// ===============================
// Usa SEMPRE anon key (NEXT_PUBLIC_*)
// Aceita também NEXT_PUBLIC_SUPABASE_KEY (fallback), caso seu projeto antigo use esse nome.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_KEY;

function assertEnv() {
  if (!supabaseUrl) throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing');
  if (!supabaseAnonKey)
    throw new Error('Supabase anon key is missing. Use NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

/**
 * Client Supabase para componentes client (useState/useEffect).
 * Mantém compatível com auth-helpers.
 */
export const createSupabaseClient = () => {
  // garante erro claro se env estiver faltando
  assertEnv();

  // auth-helpers usa as env do Next por baixo.
  // Só que se estiver faltando, dá "supabaseKey is required".
  // Por isso o assert acima.
  return createClientComponentClient<Database>();
};

// ===============================
// Server-side (Service role)
// ===============================
// NÃO exporte isso se este arquivo for importado em componentes client.
// Use SOMENTE em route handlers/server actions/import server-only.
export const createSupabaseAdmin = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing (server)');
  if (!serviceRoleKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing (server)');

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
};

// ===============================
// Types
// ===============================
export type Database = {
  public: {
    Tables: {
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          status: 'active' | 'inactive';
          plan: string;
          starts_at: string | null;
          expires_at: string | null;
          hotmart_subscription_id: string | null;
          hotmart_purchase_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['subscriptions']['Row'],
          'id' | 'created_at' | 'updated_at'
        >;
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>;
      };

      financial_sessions: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          month: string;
          year: number;
          module_type: 'fluxo_caixa' | 'balanco_patrimonial';
          data: any;
          is_closed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['financial_sessions']['Row'],
          'id' | 'created_at' | 'updated_at'
        >;
        Update: Partial<Database['public']['Tables']['financial_sessions']['Insert']>;
      };

      user_settings: {
        Row: {
          id: string;
          user_id: string;
          custom_categories: any;
          preferences: any;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['user_settings']['Row'],
          'id' | 'created_at' | 'updated_at'
        >;
        Update: Partial<Database['public']['Tables']['user_settings']['Insert']>;
      };

      hotmart_events: {
        Row: {
          id: string;
          event_type: string;
          event_data: any;
          hotmart_subscription_id: string | null;
          hotmart_purchase_id: string | null;
          user_id: string | null;
          processed: boolean;
          processed_at: string | null;
          error_message: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['hotmart_events']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['hotmart_events']['Insert']>;
      };
    };
  };
};
