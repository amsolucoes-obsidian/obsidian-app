'use client';

import React from 'react';
import { 
  PlusCircle, 
  History, 
  BarChart3, 
  TrendingUp, 
  Wallet, 
  Building2, 
  ArrowUpRight 
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (destination: 'new-analysis' | 'history' | 'report') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  // Dados fictícios para o layout (serão substituídos pelos do Supabase)
  const stats = [
    { label: 'Total de Análises', value: '12', icon: BarChart3, color: 'text-blue-400' },
    { label: 'Fluxo de Caixa', value: '8', icon: Wallet, color: 'text-emerald-400' },
    { label: 'Balanço Patrimonial', value: '4', icon: Building2, color: 'text-purple-400' },
    { label: 'Último Saldo', value: 'R$ 14.250', icon: TrendingUp, color: 'text-blue-400' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Dashboard</h1>
          <p className="text-slate-400 mt-1">Bem-vindo ao seu controle financeiro Obsidian.</p>
        </div>
        <button 
          onClick={() => onNavigate('new-analysis')}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95"
        >
          <PlusCircle size={20} />
          Nova Análise
        </button>
      </div>

      {/* Grid de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl hover:bg-slate-800 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-slate-900/50 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <ArrowUpRight className="text-slate-600 group-hover:text-slate-400 transition-colors" size={18} />
            </div>
            <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Ações Rápidas / Seções Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button 
          onClick={() => onNavigate('history')}
          className="group relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-8 rounded-3xl text-left transition-all hover:border-blue-500/50"
        >
          <div className="relative z-10">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
              <History size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Histórico de Análises</h3>
            <p className="text-slate-400 leading-relaxed">Acesse todos os seus lançamentos passados e acompanhe a evolução financeira.</p>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <History size={120} />
          </div>
        </button>

        <button 
          onClick={() => onNavigate('report')}
          className="group relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-8 rounded-3xl text-left transition-all hover:border-emerald-500/50"
        >
          <div className="relative z-10">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform">
              <BarChart3 size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Relatórios Consolidados</h3>
            <p className="text-slate-400 leading-relaxed">Visualize gráficos anuais e métricas detalhadas do seu balanço patrimonial.</p>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <BarChart3 size={120} />
          </div>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;