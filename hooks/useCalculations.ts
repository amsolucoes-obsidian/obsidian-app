import { FluxoCaixaData, BalancoPatrimonialData } from '@/types/financial';

export function calculateFluxoCaixa(data: FluxoCaixaData): FluxoCaixaData {
  const totalEntradas = 
    data.salario +
    data.receitasVendas +
    data.rendasExtras +
    data.outrasEntradas;

  const totalDespesasFixas =
    data.aluguel +
    data.condominio +
    data.energia +
    data.agua +
    data.internet +
    data.mensalidades;

  const totalDespesasVariaveis =
    data.supermercado +
    data.combustivel +
    data.saude +
    data.vestuario +
    data.lazer +
    data.outrasVariaveis;

  const totalSaidas = totalDespesasFixas + totalDespesasVariaveis;
  const saldo = totalEntradas - totalSaidas;

  return {
    ...data,
    totalEntradas,
    totalDespesasFixas,
    totalDespesasVariaveis,
    totalSaidas,
    saldo,
  };
}

export function calculateBalanco(data: BalancoPatrimonialData): BalancoPatrimonialData {
  const totalAtivosLiquidos =
    data.caixaBanco +
    data.investimentosLiquidos +
    data.contasReceber;

  const totalAtivosFixos =
    data.imoveis +
    data.veiculos +
    data.outrosAtivos;

  const totalAtivos = totalAtivosLiquidos + totalAtivosFixos;

  const totalPassivos =
    data.emprestimos +
    data.financiamentos +
    data.cartaoCredito +
    data.contasPagar +
    data.outrosPassivos;

  const patrimonioLiquido = totalAtivos - totalPassivos;

  return {
    ...data,
    totalAtivosLiquidos,
    totalAtivosFixos,
    totalAtivos,
    totalPassivos,
    patrimonioLiquido,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
