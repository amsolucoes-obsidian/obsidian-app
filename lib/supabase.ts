import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Supabase Client (Server-side)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Supabase Client (Client-side)
export const createSupabaseClient = () => {
  return createClientComponentClient();
};

// Types
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
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at' | 'updated_at'>;
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
        Insert: Omit<Database['public']['Tables']['financial_sessions']['Row'], 'id' | 'created_at' | 'updated_at'>;
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
        Insert: Omit<Database['public']['Tables']['user_settings']['Row'], 'id' | 'created_at' | 'updated_at'>;
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
