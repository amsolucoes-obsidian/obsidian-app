import * as XLSX from 'xlsx';
import { formatCurrency } from './useCalculations';

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

interface ChartDataPoint {
  month: string;
  entradas?: number;
  saidas?: number;
  saldo?: number;
  ativos?: number;
  passivos?: number;
  patrimonio?: number;
}

export function useExcelExport() {
  const exportFluxoCaixa = (year: number, chartData: ChartDataPoint[]) => {
    const workbook = XLSX.utils.book_new();
    
    // Aba 1: Dados Mensais
    const monthlyData = chartData.map((row, index) => ({
      'Mês': MONTHS[index],
      'Entradas': row.entradas || 0,
      'Saídas': row.saidas || 0,
      'Saldo': row.saldo || 0,
    }));
    
    const ws1 = XLSX.utils.json_to_sheet(monthlyData);
    XLSX.utils.book_append_sheet(workbook, ws1, 'Dados Mensais');
    
    // Aba 2: Resumo
    const totalEntradas = chartData.reduce((sum, d) => sum + (d.entradas || 0), 0);
    const totalSaidas = chartData.reduce((sum, d) => sum + (d.saidas || 0), 0);
    const saldoMedio = chartData.reduce((sum, d) => sum + (d.saldo || 0), 0) / 12;
    
    const summaryData = [
      { 'Indicador': 'Total de Entradas', 'Valor': totalEntradas },
      { 'Indicador': 'Total de Saídas', 'Valor': totalSaidas },
      { 'Indicador': 'Saldo Médio Mensal', 'Valor': saldoMedio },
    ];
    
    const ws2 = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, ws2, 'Resumo');
    
    // Save
    XLSX.writeFile(workbook, `OBSIDIAN_FluxoCaixa_${year}.xlsx`);
  };
  
  const exportBalanco = (year: number, chartData: ChartDataPoint[]) => {
    const workbook = XLSX.utils.book_new();
    
    // Aba 1: Dados Mensais
    const monthlyData = chartData.map((row, index) => ({
      'Mês': MONTHS[index],
      'Ativos': row.ativos || 0,
      'Passivos': row.passivos || 0,
      'Patrimônio Líquido': row.patrimonio || 0,
    }));
    
    const ws1 = XLSX.utils.json_to_sheet(monthlyData);
    XLSX.utils.book_append_sheet(workbook, ws1, 'Dados Mensais');
    
    // Aba 2: Resumo
    const ativosMedio = chartData.reduce((sum, d) => sum + (d.ativos || 0), 0) / 12;
    const passivosMedio = chartData.reduce((sum, d) => sum + (d.passivos || 0), 0) / 12;
    const patrimonioMedio = chartData.reduce((sum, d) => sum + (d.patrimonio || 0), 0) / 12;
    
    const summaryData = [
      { 'Indicador': 'Ativos Médios', 'Valor': ativosMedio },
      { 'Indicador': 'Passivos Médios', 'Valor': passivosMedio },
      { 'Indicador': 'Patrimônio Líquido Médio', 'Valor': patrimonioMedio },
    ];
    
    const ws2 = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, ws2, 'Resumo');
    
    // Save
    XLSX.writeFile(workbook, `OBSIDIAN_BalancoPatrimonial_${year}.xlsx`);
  };
  
  return {
    exportFluxoCaixa,
    exportBalanco,
  };
}
