'use client';

import React, { useState, useMemo } from 'react';
import { ArrowLeft, Save, Plus, Trash2, Wallet, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

interface FluxoCaixaFormProps {
  onBack: () => void;
  editSession?: any;
}

export default function FluxoCaixaForm({ onBack, editSession }: FluxoCaixaFormProps) {
  // Estado inicial focado em performance
  const [entries, setEntries] = useState(editSession?.data?.entries || [
    { id: '1', description: '', value: 0, type: 'income' }
  ]);

  // Cálculos memorizados para evitar lentidão ao digitar
  const totals = useMemo(() => {
    const income = entries
      .filter((e: any) => e.type === 'income')
      .reduce((acc: number, cur: any) => acc + Number(cur.value), 0);
    const expense = entries
      .filter((e: any) => e.type === 'expense')
      .reduce((acc: number, cur: any) => acc + Number(cur.value), 0);
    return { income, expense, balance: income - expense };
  }, [entries]);

  const addRow = (type: 'income' | 'expense') => {
    setEntries([...entries, { id: Date.now().toString(), description: '', value: 0, type }]);
  };

  const updateRow = (id: string, field: string, value: any) => {
    setEntries(entries.map((e: any) => e.id === id ? { ...e, [field]: value } : e));
  };

  const deleteRow = (id: string) => {
    setEntries(entries.filter((e: any) => e.id !== id));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Fixo e Responsivo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-[#ff6b35] transition-colors uppercase text-xs font-bold tracking-widest">
          <ArrowLeft size={16} /> Voltar ao Painel
        </button>
        <div className="flex gap-3">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#ff6b35] text-white px-8 py-3 font-black uppercase tracking-widest text-sm hover:bg-[#e85a2a] transition-all">
            <Save size={18} /> Salvar Análise
          </button>
        </div>
      </div>

      {/* Resumo de Calculos em Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111] p-6 border-l-2 border-emerald-500">
          <p className="text-xs text-slate-500 uppercase font-bold mb-1">Entradas</p>
          <p className="text-2xl font-black text-white">R$ {totals.income.toLocaleString('pt-BR')}</p>
        </div>
        <div className="bg-[#111] p-6 border-l-2 border-red-500">
          <p className="text-xs text-slate-500 uppercase font-bold mb-1">Saídas</p>
          <p className="text-2xl font-black text-white">R$ {totals.expense.toLocaleString('pt-BR')}</p>
        </div>
        <div className="bg-[#111] p-6 border-l-2 border-[#ff6b35]">
          <p className="text-xs text-slate-500 uppercase font-bold mb-1">Saldo Líquido</p>
          <p className="text-2xl font-black text-[#ff6b35]">R$ {totals.balance.toLocaleString('pt-BR')}</p>
        </div>
      </div>

      {/* Seção de Lançamentos Responsiva */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Coluna de Entradas */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-2">
              <ArrowUpCircle className="text-emerald-500" /> Receitas
            </h3>
            <button onClick={() => addRow('income')} className="p-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all">
              <Plus size={20} />
            </button>
          </div>
          {entries.filter((e:any) => e.type === 'income').map((entry:any) => (
            <div key={entry.id} className="flex gap-2 animate-in slide-in-from-left-2 duration-300">
              <input 
                type="text" 
                placeholder="Descrição"
                value={entry.description}
                onChange={(e) => updateRow(entry.id, 'description', e.target.value)}
                className="flex-1 bg-[#111] border border-white/5 p-3 text-sm focus:border-emerald-500 outline-none transition-all"
              />
              <input 
                type="number" 
                placeholder="Valor"
                value={entry.value || ''}
                onChange={(e) => updateRow(entry.id, 'value', e.target.value)}
                className="w-24 md:w-32 bg-[#111] border border-white/5 p-3 text-sm focus:border-emerald-500 outline-none transition-all text-right"
              />
              <button onClick={() => deleteRow(entry.id)} className="p-3 text-slate-600 hover:text-red-500 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </section>

        {/* Coluna de Saídas */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-2">
              <ArrowDownCircle className="text-red-500" /> Despesas
            </h3>
            <button onClick={() => addRow('expense')} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all">
              <Plus size={20} />
            </button>
          </div>
          {entries.filter((e:any) => e.type === 'expense').map((entry:any) => (
            <div key={entry.id} className="flex gap-2 animate-in slide-in-from-right-2 duration-300">
              <input 
                type="text" 
                placeholder="Descrição"
                value={entry.description}
                onChange={(e) => updateRow(entry.id, 'description', e.target.value)}
                className="flex-1 bg-[#111] border border-white/5 p-3 text-sm focus:border-red-500 outline-none transition-all"
              />
              <input 
                type="number" 
                placeholder="Valor"
                value={entry.value || ''}
                onChange={(e) => updateRow(entry.id, 'value', e.target.value)}
                className="w-24 md:w-32 bg-[#111] border border-white/5 p-3 text-sm focus:border-red-500 outline-none transition-all text-right"
              />
              <button onClick={() => deleteRow(entry.id)} className="p-3 text-slate-600 hover:text-red-500 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </section>

      </div>
    </div>
  );
}