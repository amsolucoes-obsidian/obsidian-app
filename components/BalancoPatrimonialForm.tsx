'use client';

import React, { useState, useMemo } from 'react';
import { ArrowLeft, Save, Plus, Trash2, Building2, Landmark, CreditCard, PieChart } from 'lucide-react';

interface BalancoPatrimonialFormProps {
  onBack: () => void;
  editSession?: any;
}

export default function BalancoPatrimonialForm({ onBack, editSession }: BalancoPatrimonialFormProps) {
  // Estado inicial estruturado para Ativos e Passivos
  const [items, setItems] = useState(editSession?.data?.items || [
    { id: '1', description: 'Conta Corrente', value: 0, type: 'asset' },
    { id: '2', description: 'Empréstimos', value: 0, type: 'liability' }
  ]);

  // Cálculos de Patrimônio Líquido com useMemo para máxima performance
  const totals = useMemo(() => {
    const assets = items
      .filter((i: any) => i.type === 'asset')
      .reduce((acc: number, cur: any) => acc + Number(cur.value), 0);
    const liabilities = items
      .filter((i: any) => i.type === 'liability')
      .reduce((acc: number, cur: any) => acc + Number(cur.value), 0);
    return { assets, liabilities, netWorth: assets - liabilities };
  }, [items]);

  const addItem = (type: 'asset' | 'liability') => {
    setItems([...items, { id: Date.now().toString(), description: '', value: 0, type }]);
  };

  const updateItem = (id: string, field: string, value: any) => {
    setItems(items.map((i: any) => i.id === id ? { ...i, [field]: value } : i));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter((i: any) => i.id !== id));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header com branding Obsidian */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-[#ff6b35] transition-colors uppercase text-xs font-bold tracking-widest">
          <ArrowLeft size={16} /> Voltar
        </button>
        <h2 className="text-xl font-black text-white uppercase tracking-tighter hidden md:block">
          Balanço Patrimonial
        </h2>
        <button className="bg-white text-black hover:bg-[#ff6b35] hover:text-white px-8 py-3 font-black uppercase tracking-widest text-sm transition-all shadow-lg">
          <Save size={18} className="inline mr-2" /> Salvar
        </button>
      </div>

      {/* Grid de Resumo Patrimonial */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#111] p-8 border-t-2 border-emerald-500">
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <Landmark size={18} />
            <p className="text-xs uppercase font-bold tracking-widest">Total Ativos</p>
          </div>
          <p className="text-3xl font-black text-white">R$ {totals.assets.toLocaleString('pt-BR')}</p>
        </div>
        
        <div className="bg-[#111] p-8 border-t-2 border-red-500">
          <div className="flex items-center gap-2 text-red-500 mb-2">
            <CreditCard size={18} />
            <p className="text-xs uppercase font-bold tracking-widest">Total Passivos</p>
          </div>
          <p className="text-3xl font-black text-white">R$ {totals.liabilities.toLocaleString('pt-BR')}</p>
        </div>

        <div className="bg-[#111] p-8 border-t-2 border-[#ff6b35]">
          <div className="flex items-center gap-2 text-[#ff6b35] mb-2">
            <PieChart size={18} />
            <p className="text-xs uppercase font-bold tracking-widest">Patrimônio Líquido</p>
          </div>
          <p className="text-3xl font-black text-[#ff6b35]">R$ {totals.netWorth.toLocaleString('pt-BR')}</p>
        </div>
      </div>

      {/* Editor de Itens Patrimoniais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Ativos */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 className="text-lg font-black text-white uppercase">Meus Ativos</h3>
            <button onClick={() => addItem('asset')} className="text-[#ff6b35] hover:scale-110 transition-transform">
              <Plus size={24} />
            </button>
          </div>
          <div className="space-y-3">
            {items.filter((i:any) => i.type === 'asset').map((item:any) => (
              <div key={item.id} className="flex gap-3 group">
                <input 
                  type="text" 
                  placeholder="Ex: Imóvel, Ações..."
                  value={item.description}
                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                  className="flex-1 bg-[#111] border border-white/5 p-4 text-sm focus:border-emerald-500 outline-none transition-all text-white"
                />
                <input 
                  type="number" 
                  placeholder="0,00"
                  value={item.value || ''}
                  onChange={(e) => updateItem(item.id, 'value', e.target.value)}
                  className="w-32 bg-[#111] border border-white/5 p-4 text-sm focus:border-emerald-500 outline-none transition-all text-right font-bold text-emerald-400"
                />
                <button onClick={() => deleteItem(item.id)} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-500 transition-all">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Passivos */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-2