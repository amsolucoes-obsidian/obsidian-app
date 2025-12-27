-- =====================================================
-- OBSIDIAN - Supabase Database Schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. SUBSCRIPTIONS TABLE (Controle de Assinatura Hotmart)
-- =====================================================
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
  plan TEXT NOT NULL DEFAULT 'annual',
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  hotmart_subscription_id TEXT,
  hotmart_purchase_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Um usuário pode ter apenas uma assinatura ativa
  UNIQUE(user_id)
);

-- Index para busca rápida por user_id
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);

-- Index para busca por status
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

-- Index para busca por hotmart IDs
CREATE INDEX idx_subscriptions_hotmart_ids ON public.subscriptions(hotmart_subscription_id, hotmart_purchase_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. HOTMART_EVENTS TABLE (Log de Webhooks)
-- =====================================================
CREATE TABLE public.hotmart_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  hotmart_subscription_id TEXT,
  hotmart_purchase_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index para busca por tipo de evento
CREATE INDEX idx_hotmart_events_type ON public.hotmart_events(event_type);

-- Index para busca por processed
CREATE INDEX idx_hotmart_events_processed ON public.hotmart_events(processed);

-- Index para busca por hotmart IDs
CREATE INDEX idx_hotmart_events_hotmart_ids ON public.hotmart_events(hotmart_subscription_id, hotmart_purchase_id);

-- =====================================================
-- 3. FINANCIAL_SESSIONS TABLE (Análises Financeiras)
-- =====================================================
CREATE TABLE public.financial_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  month TEXT NOT NULL CHECK (month ~ '^(0[1-9]|1[0-2])$'),
  year INTEGER NOT NULL CHECK (year >= 2000 AND year <= 2100),
  module_type TEXT NOT NULL CHECK (module_type IN ('fluxo_caixa', 'balanco_patrimonial')),
  data JSONB NOT NULL,
  is_closed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index para busca rápida por user_id
CREATE INDEX idx_financial_sessions_user_id ON public.financial_sessions(user_id);

-- Index para busca por módulo
CREATE INDEX idx_financial_sessions_module ON public.financial_sessions(module_type);

-- Index para busca por ano/mês
CREATE INDEX idx_financial_sessions_year_month ON public.financial_sessions(year, month);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_financial_sessions_updated_at
BEFORE UPDATE ON public.financial_sessions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. USER_SETTINGS TABLE (Configurações do Usuário)
-- =====================================================
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  custom_categories JSONB,
  preferences JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Index para busca rápida por user_id
CREATE INDEX idx_user_settings_user_id ON public.user_settings(user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotmart_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES: SUBSCRIPTIONS
-- =====================================================

-- Usuário pode ler apenas sua própria assinatura
CREATE POLICY "Users can read own subscription"
ON public.subscriptions
FOR SELECT
USING (auth.uid() = user_id);

-- Usuário pode inserir apenas sua própria assinatura
CREATE POLICY "Users can insert own subscription"
ON public.subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Usuário pode atualizar apenas sua própria assinatura
CREATE POLICY "Users can update own subscription"
ON public.subscriptions
FOR UPDATE
USING (auth.uid() = user_id);

-- Service role pode fazer tudo (para webhooks)
CREATE POLICY "Service role can do everything on subscriptions"
ON public.subscriptions
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- RLS POLICIES: HOTMART_EVENTS
-- =====================================================

-- Apenas service role pode acessar eventos (webhooks)
CREATE POLICY "Only service role can access hotmart_events"
ON public.hotmart_events
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- RLS POLICIES: FINANCIAL_SESSIONS
-- =====================================================

-- Usuário pode ler apenas suas próprias sessões
CREATE POLICY "Users can read own sessions"
ON public.financial_sessions
FOR SELECT
USING (auth.uid() = user_id);

-- Usuário pode inserir apenas suas próprias sessões
CREATE POLICY "Users can insert own sessions"
ON public.financial_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Usuário pode atualizar apenas suas próprias sessões
CREATE POLICY "Users can update own sessions"
ON public.financial_sessions
FOR UPDATE
USING (auth.uid() = user_id);

-- Usuário pode deletar apenas suas próprias sessões
CREATE POLICY "Users can delete own sessions"
ON public.financial_sessions
FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- RLS POLICIES: USER_SETTINGS
-- =====================================================

-- Usuário pode ler apenas suas próprias configurações
CREATE POLICY "Users can read own settings"
ON public.user_settings
FOR SELECT
USING (auth.uid() = user_id);

-- Usuário pode inserir apenas suas próprias configurações
CREATE POLICY "Users can insert own settings"
ON public.user_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Usuário pode atualizar apenas suas próprias configurações
CREATE POLICY "Users can update own settings"
ON public.user_settings
FOR UPDATE
USING (auth.uid() = user_id);

-- =====================================================
-- 6. HELPER FUNCTIONS
-- =====================================================

-- Função para verificar se assinatura está ativa
CREATE OR REPLACE FUNCTION public.is_subscription_active(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_subscription RECORD;
BEGIN
  SELECT status, expires_at
  INTO v_subscription
  FROM public.subscriptions
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  RETURN v_subscription.status = 'active' 
    AND v_subscription.expires_at >= NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar assinatura inicial ao cadastrar usuário
CREATE OR REPLACE FUNCTION public.create_initial_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, status, plan)
  VALUES (NEW.id, 'inactive', 'annual');
  
  INSERT INTO public.user_settings (user_id, custom_categories, preferences)
  VALUES (NEW.id, '{}'::jsonb, '{}'::jsonb);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar assinatura ao cadastrar usuário
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.create_initial_subscription();

-- =====================================================
-- 7. INITIAL DATA / SEED (Opcional)
-- =====================================================

-- Você pode adicionar dados iniciais aqui se necessário
-- Por exemplo, categorias padrão, etc.

-- =====================================================
-- FIM DO SCHEMA
-- =====================================================
