// lib/supabase.types.ts
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
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };

      financial_sessions: {
        Row: {
          id: string;
          user_id: string;
          // ✅ pode ser "name" OU "session_name" dependendo do seu banco
          name?: string;
          session_name?: string;

          // ✅ no seu app você usa month como number (1..12)
          month: number;

          year: number;

          // ✅ no seu app você usa 'fluxo-caixa' | 'balanco-patrimonial'
          module_type: string;

          data: any;

          // ✅ alguns lugares usam status, outros is_closed
          status?: 'draft' | 'completed' | 'archived';
          is_closed?: boolean;

          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, any>;
        Update: Record<string, any>;
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
        Insert: Record<string, any>;
        Update: Record<string, any>;
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
        Insert: Record<string, any>;
        Update: Record<string, any>;
      };
    };
  };
};
