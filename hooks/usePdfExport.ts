import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
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

export function usePdfExport() {
  const exportFluxoCaixa = (year: number, chartData: ChartDataPoint[]) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(26, 26, 26);
    doc.text('OBSIDIAN', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('Seu Espelho Financeiro', 105, 28, { align: 'center' });
    
    // Title
    doc.setFontSize(16);
    doc.setTextColor(26, 26, 26);
    doc.text(`Relatório de Fluxo de Caixa - ${year}`, 105, 45, { align: 'center' });
    
    // Table
    const tableData = chartData.map((row, index) => [
      MONTHS[index],
      formatCurrency(row.entradas || 0),
      formatCurrency(row.saidas || 0),
      formatCurrency(row.saldo || 0),
    ]);
    
    autoTable(doc, {
      startY: 55,
      head: [['Mês', 'Entradas', 'Saídas', 'Saldo']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [255, 107, 53],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        1: { halign: 'right', textColor: [16, 185, 129] },
        2: { halign: 'right', textColor: [239, 68, 68] },
        3: { halign: 'right', fontStyle: 'bold' },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 3) {
          const value = chartData[data.row.index].saldo || 0;
          data.cell.styles.textColor = value >= 0 ? [16, 185, 129] : [239, 68, 68];
        }
      },
    });
    
    // Summary
    const totalEntradas = chartData.reduce((sum, d) => sum + (d.entradas || 0), 0);
    const totalSaidas = chartData.reduce((sum, d) => sum + (d.saidas || 0), 0);
    const saldoMedio = chartData.reduce((sum, d) => sum + (d.saldo || 0), 0) / 12;
    
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    
    doc.setFontSize(14);
    doc.setTextColor(26, 26, 26);
    doc.text('Resumo Anual', 14, finalY);
    
    doc.setFontSize(11);
    doc.setTextColor(16, 185, 129);
    doc.text(`Total de Entradas: ${formatCurrency(totalEntradas)}`, 14, finalY + 10);
    
    doc.setTextColor(239, 68, 68);
    doc.text(`Total de Saídas: ${formatCurrency(totalSaidas)}`, 14, finalY + 18);
    
    doc.setTextColor(255, 107, 53);
    doc.text(`Saldo Médio Mensal: ${formatCurrency(saldoMedio)}`, 14, finalY + 26);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 105, 285, { align: 'center' });
    
    // Save
    doc.save(`OBSIDIAN_FluxoCaixa_${year}.pdf`);
  };
  
  const exportBalanco = (year: number, chartData: ChartDataPoint[]) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(26, 26, 26);
    doc.text('OBSIDIAN', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('Seu Espelho Financeiro', 105, 28, { align: 'center' });
    
    // Title
    doc.setFontSize(16);
    doc.setTextColor(26, 26, 26);
    doc.text(`Relatório de Balanço Patrimonial - ${year}`, 105, 45, { align: 'center' });
    
    // Table
    const tableData = chartData.map((row, index) => [
      MONTHS[index],
      formatCurrency(row.ativos || 0),
      formatCurrency(row.passivos || 0),
      formatCurrency(row.patrimonio || 0),
    ]);
    
    autoTable(doc, {
      startY: 55,
      head: [['Mês', 'Ativos', 'Passivos', 'Patrimônio Líquido']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [255, 107, 53],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        1: { halign: 'right', textColor: [59, 130, 246] },
        2: { halign: 'right', textColor: [239, 68, 68] },
        3: { halign: 'right', fontStyle: 'bold' },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 3) {
          const value = chartData[data.row.index].patrimonio || 0;
          data.cell.styles.textColor = value >= 0 ? [16, 185, 129] : [239, 68, 68];
        }
      },
    });
    
    // Summary
    const ativosMedio = chartData.reduce((sum, d) => sum + (d.ativos || 0), 0) / 12;
    const passivosMedio = chartData.reduce((sum, d) => sum + (d.passivos || 0), 0) / 12;
    const patrimonioMedio = chartData.reduce((sum, d) => sum + (d.patrimonio || 0), 0) / 12;
    
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    
    doc.setFontSize(14);
    doc.setTextColor(26, 26, 26);
    doc.text('Resumo Anual', 14, finalY);
    
    doc.setFontSize(11);
    doc.setTextColor(59, 130, 246);
    doc.text(`Ativos Médios: ${formatCurrency(ativosMedio)}`, 14, finalY + 10);
    
    doc.setTextColor(239, 68, 68);
    doc.text(`Passivos Médios: ${formatCurrency(passivosMedio)}`, 14, finalY + 18);
    
    doc.setTextColor(255, 107, 53);
    doc.text(`Patrimônio Líquido Médio: ${formatCurrency(patrimonioMedio)}`, 14, finalY + 26);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 105, 285, { align: 'center' });
    
    // Save
    doc.save(`OBSIDIAN_BalancoPatrimonial_${year}.pdf`);
  };
  
  return {
    exportFluxoCaixa,
    exportBalanco,
  };
}
