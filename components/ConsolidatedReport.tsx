'use client';

import { useState, useEffect } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import { FinancialSession, FluxoCaixaData, BalancoPatrimonialData } from '@/types/financial';
import { formatCurrency } from '@/hooks/useCalculations';
import { usePdfExport } from '@/hooks/usePdfExport';
import { useExcelExport } from '@/hooks/useExcelExport';
import { toast } from 'sonner';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ConsolidatedReportProps {
  onBack: () => void;
  year: number;
  moduleType: 'fluxo-caixa' | 'balanco-patrimonial';
}

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function ConsolidatedReport({ onBack, year, moduleType }: ConsolidatedReportProps) {
  const supabase = createSupabaseClient();
  const [sessions, setSessions] = useState<FinancialSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCharts, setShowCharts] = useState(true);
  
  const { exportFluxoCaixa: exportPdfFluxo, exportBalanco: exportPdfBalanco } = usePdfExport();
  const { exportFluxoCaixa: exportExcelFluxo, exportBalanco: exportExcelBalanco } = useExcelExport();

  useEffect(() => {
    loadSessions();
  }, [year, moduleType]);

  const loadSessions = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('financial_sessions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('module_type', moduleType)
        .eq('year', year)
        .order('month', { ascending: true });

      if (error) throw error;

      setSessions(data || []);
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  // Preparar dados para gráficos
  const chartData = MONTHS.map((month, index) => {
    const session = sessions.find(s => s.month === index + 1);
    
    if (moduleType === 'fluxo-caixa') {
      const data = session?.data as FluxoCaixaData | undefined;
      return {
        month,
        entradas: data?.totalEntradas || 0,
        saidas: data?.totalSaidas || 0,
        saldo: data?.saldo || 0,
      };
    } else {
      const data = session?.data as BalancoPatrimonialData | undefined;
      return {
        month,
        ativos: data?.totalAtivos || 0,
        passivos: data?.totalPassivos || 0,
        patrimonio: data?.patrimonioLiquido || 0,
      };
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando relatório...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
          >
            ← Voltar
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-secondary-900 mb-2">
                Relatório Consolidado {year}
              </h1>
              <p className="text-gray-600">
                {moduleType === 'fluxo-caixa' ? 'Fluxo de Caixa' : 'Balanço Patrimonial'}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCharts(!showCharts)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                {showCharts ? '📊 Ver Tabelas' : '📈 Ver Gráficos'}
              </button>
              <button
                onClick={() => {
                  try {
                    if (moduleType === 'fluxo-caixa') {
                      exportPdfFluxo(year, chartData);
                    } else {
                      exportPdfBalanco(year, chartData);
                    }
                    toast.success('PDF exportado com sucesso!');
                  } catch (error) {
                    console.error('Erro ao exportar PDF:', error);
                    toast.error('Erro ao exportar PDF');
                  }
                }}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
              >
                📥 Exportar PDF
              </button>
              <button
                onClick={() => {
                  try {
                    if (moduleType === 'fluxo-caixa') {
                      exportExcelFluxo(year, chartData);
                    } else {
                      exportExcelBalanco(year, chartData);
                    }
                    toast.success('Excel exportado com sucesso!');
                  } catch (error) {
                    console.error('Erro ao exportar Excel:', error);
                    toast.error('Erro ao exportar Excel');
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                📊 Exportar Excel
              </button>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        {showCharts ? (
          // Gráficos
          <div className="space-y-6">
            {moduleType === 'fluxo-caixa' ? (
              <>
                {/* Gráfico de Saldo */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-secondary-900 mb-4">
                    Evolução do Saldo Mensal
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value: any) => formatCurrency(value)} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="saldo" 
                        stroke="#ff6b35" 
                        strokeWidth={3}
                        name="Saldo"
                        dot={{ fill: '#ff6b35', r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Gráfico de Entradas vs Saídas */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-secondary-900 mb-4">
                    Entradas vs Saídas Mensais
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value: any) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="entradas" fill="#10b981" name="Entradas" />
                      <Bar dataKey="saidas" fill="#ef4444" name="Saídas" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <>
                {/* Gráfico de Patrimônio Líquido */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-secondary-900 mb-4">
                    Evolução do Patrimônio Líquido
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value: any) => formatCurrency(value)} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="patrimonio" 
                        stroke="#ff6b35" 
                        strokeWidth={3}
                        name="Patrimônio Líquido"
                        dot={{ fill: '#ff6b35', r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Gráfico de Ativos vs Passivos */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-secondary-900 mb-4">
                    Ativos vs Passivos Mensais
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value: any) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="ativos" fill="#3b82f6" name="Ativos" />
                      <Bar dataKey="passivos" fill="#ef4444" name="Passivos" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        ) : (
          // Tabelas
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-secondary-900 mb-4">
              Tabela Detalhada - {year}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 px-4 font-bold text-gray-700">Mês</th>
                    {moduleType === 'fluxo-caixa' ? (
                      <>
                        <th className="text-right py-3 px-4 font-bold text-gray-700">Entradas</th>
                        <th className="text-right py-3 px-4 font-bold text-gray-700">Saídas</th>
                        <th className="text-right py-3 px-4 font-bold text-gray-700">Saldo</th>
                      </>
                    ) : (
                      <>
                        <th className="text-right py-3 px-4 font-bold text-gray-700">Ativos</th>
                        <th className="text-right py-3 px-4 font-bold text-gray-700">Passivos</th>
                        <th className="text-right py-3 px-4 font-bold text-gray-700">Patrimônio</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((row, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{row.month}</td>
                      {moduleType === 'fluxo-caixa' ? (
                        <>
                          <td className="text-right py-3 px-4 text-green-600 font-medium">
                            {formatCurrency(row.entradas ?? 0)}
                          </td>
                          <td className="text-right py-3 px-4 text-red-600 font-medium">
                            {formatCurrency(row.saidas ?? 0)}
                          </td>
                          <td className={`text-right py-3 px-4 font-bold ${row.saldo ?? 0) >= 0 ? 'text-green-600' : 'text-red-600}`}>
                            {formatCurrency(row.saldo ?? 0)}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="text-right py-3 px-4 text-blue-600 font-medium">
                            {formatCurrency(row.ativos)}
                          </td>
                          <td className="text-right py-3 px-4 text-red-600 font-medium">
                            {formatCurrency(row.passivos)}
                          </td>
                          <td className={`text-right py-3 px-4 font-bold ${row.patrimonio >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(row.patrimonio)}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Resumo Anual */}
        <div className="bg-gradient-to-br from-secondary-900 to-secondary-800 rounded-xl shadow-lg p-6 text-white mt-6">
          <h2 className="text-2xl font-bold mb-4">📊 Resumo Anual {year}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {moduleType === 'fluxo-caixa' ? (
              <>
                <div>
                  <p className="text-sm text-gray-300 mb-1">Total de Entradas</p>
                  <p className="text-2xl font-bold text-green-300">
                    {formatCurrency(chartData.reduce((sum, d) => sum + d.entradas, 0))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-300 mb-1">Total de Saídas</p>
                  <p className="text-2xl font-bold text-red-300">
                    {formatCurrency(chartData.reduce((sum, d) => sum + d.saidas, 0))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-300 mb-1">Saldo Médio</p>
                  <p className="text-2xl font-bold text-primary-300">
                    {formatCurrency(chartData.reduce((sum, d) => sum + d.saldo, 0) / 12)}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm text-gray-300 mb-1">Ativos Médios</p>
                  <p className="text-2xl font-bold text-blue-300">
                    {formatCurrency(chartData.reduce((sum, d) => sum + d.ativos, 0) / 12)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-300 mb-1">Passivos Médios</p>
                  <p className="text-2xl font-bold text-red-300">
                    {formatCurrency(chartData.reduce((sum, d) => sum + d.passivos, 0) / 12)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-300 mb-1">Patrimônio Médio</p>
                  <p className="text-2xl font-bold text-primary-300">
                    {formatCurrency(chartData.reduce((sum, d) => sum + d.patrimonio, 0) / 12)}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
