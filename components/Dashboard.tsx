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
  const stats = [
    { label: 'Total de Análises', value: '12', icon: BarChart3, color: 'text-[#ff6b35]' },
    { label: 'Fluxo de Caixa', value: '8', icon: Wallet, color: 'text-[#ff6b35]' },
    { label: 'Balanço Patrimonial', value: '4', icon: Building2, color: 'text-[#ff6b35]' },
    { label: 'Último Saldo', value: 'R$ 14.250', icon: TrendingUp, color: 'text-emerald-400' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-l-4 border-[#ff6b35] pl-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase font-poppins">
            Dashboard
          </h1>
          <p className="text-slate-500 mt-2 font-inter uppercase tracking-widest text-xs md:text-sm">
            Seu controle financeiro começa aqui
          </p>
        </div>
        
        <button 
          onClick={() => onNavigate('new-analysis')}
          className="flex items-center justify-center gap-3 bg-white hover:bg-[#ff6b35] text-black hover:text-white px-8 py-4 font-black transition-all duration-300 uppercase tracking-widest text-sm active:scale-95 shadow-xl"
        >
          <PlusCircle size={20} />
          Nova Análise
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="bg-[#111] border border-white/5 p-6 md:p-8 hover:border-[#ff6b35]/30 transition-all duration-500 group relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className={`p-4 bg-white/5 ${stat.color} transition-colors duration-500 group-hover:bg-[#ff6b35]/10`}>
                <stat.icon size={28} />
              </div>
              <ArrowUpRight className="text-slate-700 group-hover:text-[#ff6b35] transition-colors" size={20} />
            </div>
            
            <div className="relative z-10">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">{stat.label}</p>
              <p className="text-3xl md:text-4xl font-black text-white mt-2 tracking-tighter">
                {stat.value}
              </p>
            </div>

            <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
               <stat.icon size={120} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <button 
          onClick={() => onNavigate('history')}
          className="group relative overflow-hidden bg-[#111] border border-white/5 p-8 md:p-12 text-left transition-all duration-500 hover:border-[#ff6b35]/50"
        >
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/5 flex items-center justify-center text-white mb-8 group-hover:bg-[#ff6b35] transition-all duration-500">
              <History size={32} />
            </div>
            <h3 className="text-2xl font-black text-white mb-3 tracking-tight uppercase font-poppins">Histórico</h3>
            <p className="text-slate-500 leading-relaxed font-inter text-sm md:text-base max-w-xs">
              Acesse lançamentos passados e monitore sua evolução financeira.
            </p>
          </div>
        </button>

        <button 
          onClick={() => onNavigate('report')}
          className="group relative overflow-hidden bg-[#111] border border-white/5 p-8 md:p-12 text-left transition-all duration-500 hover:border-[#ff6b35]/50"
        >
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/5 flex items-center justify-center text-white mb-8 group-hover:bg-[#ff6b35] transition-all duration-500">
              <BarChart3 size={32} />
            </div>
            <h3 className="text-2xl font-black text-white mb-3 tracking-tight uppercase font-poppins">Relatórios</h3>
            <p className="text-slate-500 leading-relaxed font-inter text-sm md:text-base max-w-xs">
              Visualize métricas detalhadas e gráficos anuais do seu patrimônio.
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;