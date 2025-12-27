# 🔄 Migração OBSIDIAN - Fase 2

## ✅ O Que Já Foi Migrado (Fase 1)

### Componentes:
- [x] WelcomeScreen (tela de boas-vindas)
- [x] ModuleSelector (escolha de módulo)
- [x] Estrutura base do app

### Funcionalidades:
- [x] Autenticação email/senha
- [x] Sistema de assinatura Hotmart
- [x] Webhook Hotmart
- [x] Banco de dados Supabase
- [x] PWA configurado

---

## 📋 Próxima Fase: Componentes Restantes

### Componentes a Migrar:

**Formulários (Prioridade Alta):**
1. [ ] FluxoCaixaForm
   - Formulário completo de entrada de dados
   - Categorias de receitas e despesas
   - Cálculos automáticos
   
2. [ ] BalancoPatrimonialForm
   - Formulário de ativos e passivos
   - Categorias patrimoniais
   - Cálculo de patrimônio líquido

3. [ ] InitialForm
   - Formulário inicial de configuração
   - Saldo inicial

**Relatórios e Visualizações (Prioridade Alta):**
4. [ ] ConsolidatedReport
   - Relatório consolidado anual
   - Gráficos de evolução mensal (Recharts)
   - Tabelas detalhadas
   - Toggle gráficos/tabelas

5. [ ] SessionHistory
   - Histórico de análises
   - Filtros (status, mês)
   - Botão deletar com modal
   - Busca

6. [ ] Dashboard
   - Visão geral
   - Métricas principais
   - Acesso rápido

**Funcionalidades Auxiliares (Prioridade Média):**
7. [ ] CategorySettings
   - Configuração de categorias personalizadas
   - CRUD de categorias

8. [ ] ChartOfAccounts
   - Plano de contas
   - Categorias padrão

9. [ ] MonthlyHistory
   - Histórico mensal
   - Comparação entre meses

10. [ ] TransactionList
    - Lista de transações
    - Filtros e ordenação

**Componentes de UI (Prioridade Baixa):**
11. [ ] SplashScreen
    - Tela de carregamento inicial

---

## 🔧 Hooks a Migrar

**Cálculos e Lógica (Prioridade Alta):**
1. [ ] useCalculations
   - Cálculos financeiros
   - Totalizações
   - Saldos

2. [ ] useComposition
   - Composição de dados
   - Agregações

**Exportação (Prioridade Alta):**
3. [ ] usePdfExport
   - Exportar relatório para PDF

4. [ ] useExcelExport
   - Exportar para Excel

5. [ ] useMonthlyPdfExport
   - PDF mensal

6. [ ] useMonthlyExcelExport
   - Excel mensal

**Sincronização (Prioridade Média):**
7. [ ] useSyncedSessions
   - Adaptar para Supabase Realtime
   - Substituir tRPC por Supabase

8. [ ] useOfflineQueue
   - Fila offline
   - Sincronização quando reconectar

**Utilitários (Prioridade Baixa):**
9. [ ] useLocalStorage
   - Adaptar para Supabase
   - Cache local

10. [ ] usePersistFn
    - Persistência de funções

---

## 🎯 Estratégia de Migração

### 1. Adaptações Necessárias

**tRPC → Supabase:**
```typescript
// ANTES (tRPC)
const { data } = trpc.sessions.getAll.useQuery();

// DEPOIS (Supabase)
const { data } = await supabase
  .from('financial_sessions')
  .select('*')
  .eq('user_id', userId);
```

**localStorage → Supabase:**
```typescript
// ANTES (localStorage)
const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');

// DEPOIS (Supabase)
const { data: sessions } = await supabase
  .from('financial_sessions')
  .select('*')
  .eq('user_id', userId);
```

### 2. Schema do Banco

Já está criado! Tabela `financial_sessions`:
```sql
CREATE TABLE financial_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_name TEXT NOT NULL,
  module_type TEXT NOT NULL, -- 'fluxo-caixa' ou 'balanco-patrimonial'
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  data JSONB NOT NULL, -- Dados completos do formulário
  status TEXT DEFAULT 'draft', -- 'draft', 'completed', 'archived'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. Sincronização Automática

Supabase Realtime já está configurado! Para ouvir mudanças:

```typescript
// Ouvir mudanças em tempo real
const channel = supabase
  .channel('financial_sessions_changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'financial_sessions',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('Mudança detectada:', payload);
      // Atualizar estado local
    }
  )
  .subscribe();
```

---

## 📦 Estrutura de Dados

### FluxoCaixaForm Data:
```typescript
interface FluxoCaixaData {
  // Entradas
  receitas: {
    salario: number;
    freelance: number;
    investimentos: number;
    outros: number;
  };
  
  // Saídas
  despesas: {
    moradia: number;
    alimentacao: number;
    transporte: number;
    saude: number;
    educacao: number;
    lazer: number;
    outros: number;
  };
  
  // Calculados
  totalEntradas: number;
  totalSaidas: number;
  saldo: number;
}
```

### BalancoPatrimonialData:
```typescript
interface BalancoData {
  // Ativos
  ativosLiquidos: {
    caixaBanco: number;
    investimentos: number;
    contasReceber: number;
  };
  
  ativosFixos: {
    imoveis: number;
    veiculos: number;
    outros: number;
  };
  
  // Passivos
  passivos: {
    emprestimos: number;
    financiamentos: number;
    cartaoCredito: number;
    contasPagar: number;
  };
  
  // Calculados
  totalAtivos: number;
  totalPassivos: number;
  patrimonioLiquido: number;
}
```

---

## 🚀 Como Continuar a Migração

### Opção A: Eu Migro (Recomendado)
1. Você testa a Fase 1 (WelcomeScreen + ModuleSelector)
2. Confirma que está funcionando
3. Eu migro os formulários e relatórios (Fase 2)
4. Você testa novamente
5. Eu migro exportação e funcionalidades avançadas (Fase 3)

### Opção B: Você Migra
1. Copie componentes de `/home/ubuntu/obsidian-app/client/src/components/obsidian/`
2. Cole em `/home/ubuntu/obsidian-nextjs/components/`
3. Adapte imports:
   - Adicione `'use client'` no topo
   - Troque `trpc` por `supabase`
   - Troque `localStorage` por queries Supabase
4. Teste cada componente

---

## 📝 Checklist de Teste (Fase 1)

- [ ] Extrair ZIP atualizado
- [ ] Instalar dependências (`pnpm install`)
- [ ] Configurar Supabase (`.env.local`)
- [ ] Rodar servidor (`pnpm dev`)
- [ ] Criar conta e fazer login
- [ ] Ver WelcomeScreen
- [ ] Clicar em "Vamos começar?"
- [ ] Ver ModuleSelector
- [ ] Clicar em "Fluxo de Caixa" (ver placeholder)
- [ ] Clicar em "Balanço Patrimonial" (ver placeholder)
- [ ] Voltar para seleção de módulos

---

## 🎯 Próxima Sessão

**Quando estiver pronto para continuar:**
1. Confirme que a Fase 1 está funcionando
2. Me avise que quer continuar
3. Vou migrar FluxoCaixaForm e BalancoPatrimonialForm completos
4. Depois migro ConsolidatedReport com gráficos
5. Por último, exportação PDF/Excel

**Estimativa Fase 2:** 4-6 horas de trabalho

---

**Status Atual:** ✅ Fase 1 Concluída - Pronto para Teste
