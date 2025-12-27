'use client';

import { useState, useEffect } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import { FinancialSession } from '@/types/financial';
import { formatCurrency } from '@/hooks/useCalculations';

interface DashboardProps {
  onNavigate: (destination: 'new-analysis' | 'history' | 'report') => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const supabase = createSupabaseClient();
  const [stats, setStats] = useState({
    totalSessions: 0,
    fluxoCaixaCount: 0,
    balancoCount: 0,
    lastSaldo: 0,
    lastPatrimonio: 0,
  });
  const [recentSessions, setRecentSessions] = useState<FinancialSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Carregar todas as sessões
      const { data: sessions, error } = await supabase
        .from('financial_sessions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const allSessions = sessions || [];

      // Calcular estatísticas
      const fluxoSessions = allSessions.filter(s => s.module_type === 'fluxo-caixa');
      const balancoSessions = allSessions.filter(s => s.module_type === 'balanco-patrimonial');

      const lastFluxo = fluxoSessions[0];
      const lastBalanco = balancoSessions[0];

      setStats({
        totalSessions: allSessions.length,
        fluxoCaixaCount: fluxoSessions.length,
        balancoCount: balancoSessions.length,
        lastSaldo: lastFluxo?.data?.saldo || 0,
        lastPatrimonio: lastBalanco?.data?.patrimonioLiquido || 0,
      });

      setRecentSessions(allSessions.slice(0, 3));
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-secondary-900 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Visão geral das suas finanças
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon="📊"
            title="Total de Análises"
            value={stats.totalSessions.toString()}
            subtitle="análises criadas"
          />
          <StatCard
            icon="💰"
            title="Fluxo de Caixa"
            value={stats.fluxoCaixaCount.toString()}
            subtitle="análises de fluxo"
          />
          <StatCard
            icon="🏦"
            title="Balanço Patrimonial"
            value={stats.balancoCount.toString()}
            subtitle="análises de balanço"
          />
          <StatCard
            icon="💵"
            title="Último Saldo"
            value={formatCurrency(stats.lastSaldo)}
            subtitle="fluxo de caixa"
            valueColor={stats.lastSaldo >= 0 ? 'text-green-600' : 'text-red-600'}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-secondary-900 mb-4">
            Ações Rápidas
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => onNavigate('new-analysis')}
              className="p-6 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all transform hover:scale-105 active:scale-95 text-left"
            >
              <div className="text-4xl mb-3">➕</div>
              <h3 className="text-xl font-bold mb-2">Nova Análise</h3>
              <p className="text-primary-100">
                Criar nova análise financeira
              </p>
            </button>

            <button
              onClick={() => onNavigate('history')}
              className="p-6 bg-gradient-to-br from-secondary-700 to-secondary-800 text-white rounded-xl hover:from-secondary-800 hover:to-secondary-900 transition-all transform hover:scale-105 active:scale-95 text-left"
            >
              <div className="text-4xl mb-3">📋</div>
              <h3 className="text-xl font-bold mb-2">Ver Histórico</h3>
              <p className="text-gray-300">
                Acessar análises anteriores
              </p>
            </button>

            <button
              onClick={() => onNavigate('report')}
              className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 active:scale-95 text-left"
            >
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-xl font-bold mb-2">Relatório Anual</h3>
              <p className="text-blue-100">
                Ver gráficos e análises
              </p>
            </button>
          </div>
        </div>

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">
              Análises Recentes
            </h2>
            <div className="space-y-4">
              {recentSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <h3 className="font-bold text-secondary-900">
                      {session.session_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {session.module_type === 'fluxo-caixa' ? '💰 Fluxo de Caixa' : '🏦 Balanço Patrimonial'} •{' '}
                      {new Date(session.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    {session.module_type === 'fluxo-caixa' ? (
                      <span className={`font-bold ${(session.data.saldo || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(session.data.saldo || 0)}
                      </span>
                    ) : (
                      <span className={`font-bold ${(session.data.patrimonioLiquido || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(session.data.patrimonioLiquido || 0)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ 
  icon, 
  title, 
  value, 
  subtitle, 
  valueColor = 'text-secondary-900' 
}: { 
  icon: string; 
  title: string; 
  value: string; 
  subtitle: string; 
  valueColor?: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className={`text-2xl font-bold ${valueColor} mb-1`}>{value}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}
