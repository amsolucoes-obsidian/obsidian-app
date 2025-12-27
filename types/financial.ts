export interface FluxoCaixaData {
  // Entradas
  salario: number;
  receitasVendas: number;
  rendasExtras: number;
  outrasEntradas: number;
  
  // Despesas Fixas
  aluguel: number;
  condominio: number;
  energia: number;
  agua: number;
  internet: number;
  mensalidades: number;
  
  // Despesas Variáveis
  supermercado: number;
  combustivel: number;
  saude: number;
  vestuario: number;
  lazer: number;
  outrasVariaveis: number;
  
  // Calculados
  totalEntradas?: number;
  totalDespesasFixas?: number;
  totalDespesasVariaveis?: number;
  totalSaidas?: number;
  saldo?: number;
}

export interface BalancoPatrimonialData {
  // Ativos Líquidos
  caixaBanco: number;
  investimentosLiquidos: number;
  contasReceber: number;
  
  // Ativos Fixos
  imoveis: number;
  veiculos: number;
  outrosAtivos: number;
  
  // Passivos
  emprestimos: number;
  financiamentos: number;
  cartaoCredito: number;
  contasPagar: number;
  outrosPassivos: number;
  
  // Calculados
  totalAtivosLiquidos?: number;
  totalAtivosFixos?: number;
  totalAtivos?: number;
  totalPassivos?: number;
  patrimonioLiquido?: number;
}

export interface FinancialSession {
  id: string;
  user_id: string;
  session_name: string;
  module_type: 'fluxo-caixa' | 'balanco-patrimonial';
  month: number;
  year: number;
  data: FluxoCaixaData | BalancoPatrimonialData;
  status: 'draft' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}
