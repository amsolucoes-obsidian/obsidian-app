'use client';

import { useState, useEffect } from 'react';
import { FluxoCaixaData, FinancialSession } from '@/types/financial';
import { calculateFluxoCaixa, formatCurrency } from '@/hooks/useCalculations';
import { createSupabaseClient } from '@/lib/supabase.client';
import { toast } from 'sonner';

interface FluxoCaixaFormProps {
  onBack: () => void;
  editSession?: FinancialSession | null;
}

const INITIAL_DATA: FluxoCaixaData = {
  salario: 0,
  receitasVendas: 0,
  rendasExtras: 0,
  outrasEntradas: 0,
  aluguel: 0,
  condominio: 0,
  energia: 0,
  agua: 0,
  internet: 0,
  mensalidades: 0,
  supermercado: 0,
  combustivel: 0,
  saude: 0,
  vestuario: 0,
  lazer: 0,
  outrasVariaveis: 0,
};

export default function FluxoCaixaForm({ onBack, editSession }: FluxoCaixaFormProps) {
  const supabase = createSupabaseClient();
  const [data, setData] = useState<FluxoCaixaData>(
    editSession ? (editSession.data as FluxoCaixaData) : INITIAL_DATA
  );
  const [sessionName, setSessionName] = useState(editSession?.session_name || '');
  const [month, setMonth] = useState(editSession?.month || new Date().getMonth() + 1);
  const [year, setYear] = useState(editSession?.year || new Date().getFullYear());
  const [saving, setSaving] = useState(false);

  // Calcular totais automaticamente
  const calculated = calculateFluxoCaixa(data);

  const handleChange = (field: keyof FluxoCaixaData, value: string) => {
    const numValue = parseFloat(value) || 0;
    setData(prev => ({ ...prev, [field]: numValue }));
  };

  const handleSave = async () => {
    if (!sessionName.trim()) {
      toast.error('Digite um nome para a análise');
      return;
    }

    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Você precisa estar logado');
        return;
      }

      if (editSession) {
        // Atualizar sessão existente
        const { error } = await supabase
          .from('financial_sessions')
          .update({
            session_name: sessionName,
            month,
            year,
            data: calculated,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editSession.id);

        if (error) throw error;
        toast.success('Análise atualizada com sucesso!');
      } else {
        // Criar nova sessão
        const { error } = await supabase
          .from('financial_sessions')
          .insert({
            user_id: session.user.id,
            session_name: sessionName,
            module_type: 'fluxo-caixa',
            month,
            year,
            data: calculated,
            status: 'completed',
          });

        if (error) throw error;
        toast.success('Análise salva com sucesso!');
        
        // Limpar formulário apenas ao criar nova
        setData(INITIAL_DATA);
        setSessionName('');
      }
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar análise');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
          >
            ← Voltar
          </button>
          
          <h1 className="text-3xl font-bold text-secondary-900 mb-4">
            Fluxo de Caixa
          </h1>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Análise *
              </label>
              <input
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="Ex: Janeiro 2024"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mês
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2024, i).toLocaleDateString('pt-BR', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ano
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Entradas */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-primary-600 mb-4 border-b-2 border-primary-500 pb-2">
            💰 Entradas
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <InputField label="Salário" value={data.salario} onChange={(v) => handleChange('salario', v)} />
            <InputField label="Receitas de Vendas" value={data.receitasVendas} onChange={(v) => handleChange('receitasVendas', v)} />
            <InputField label="Rendas Extras" value={data.rendasExtras} onChange={(v) => handleChange('rendasExtras', v)} />
            <InputField label="Outras Entradas" value={data.outrasEntradas} onChange={(v) => handleChange('outrasEntradas', v)} />
          </div>

          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <p className="text-lg font-bold text-green-700">
              Total de Entradas: {formatCurrency(calculated.totalEntradas || 0)}
            </p>
          </div>
        </div>

        {/* Despesas Fixas */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-red-600 mb-4 border-b-2 border-red-500 pb-2">
            🏠 Despesas Fixas
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <InputField label="Aluguel/Financiamento" value={data.aluguel} onChange={(v) => handleChange('aluguel', v)} />
            <InputField label="Condomínio" value={data.condominio} onChange={(v) => handleChange('condominio', v)} />
            <InputField label="Energia Elétrica" value={data.energia} onChange={(v) => handleChange('energia', v)} />
            <InputField label="Água" value={data.agua} onChange={(v) => handleChange('agua', v)} />
            <InputField label="Internet" value={data.internet} onChange={(v) => handleChange('internet', v)} />
            <InputField label="Mensalidades" value={data.mensalidades} onChange={(v) => handleChange('mensalidades', v)} />
          </div>

          <div className="mt-4 p-4 bg-red-50 rounded-lg">
            <p className="text-lg font-bold text-red-700">
              Total de Despesas Fixas: {formatCurrency(calculated.totalDespesasFixas || 0)}
            </p>
          </div>
        </div>

        {/* Despesas Variáveis */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-orange-600 mb-4 border-b-2 border-orange-500 pb-2">
            🛒 Despesas Variáveis
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <InputField label="Supermercado/Alimentação" value={data.supermercado} onChange={(v) => handleChange('supermercado', v)} />
            <InputField label="Combustível/Transporte" value={data.combustivel} onChange={(v) => handleChange('combustivel', v)} />
            <InputField label="Saúde/Farmácia" value={data.saude} onChange={(v) => handleChange('saude', v)} />
            <InputField label="Vestuário" value={data.vestuario} onChange={(v) => handleChange('vestuario', v)} />
            <InputField label="Lazer/Entretenimento" value={data.lazer} onChange={(v) => handleChange('lazer', v)} />
            <InputField label="Outras Despesas" value={data.outrasVariaveis} onChange={(v) => handleChange('outrasVariaveis', v)} />
          </div>

          <div className="mt-4 p-4 bg-orange-50 rounded-lg">
            <p className="text-lg font-bold text-orange-700">
              Total de Despesas Variáveis: {formatCurrency(calculated.totalDespesasVariaveis || 0)}
            </p>
          </div>
        </div>

        {/* Resumo */}
        <div className="bg-gradient-to-br from-secondary-900 to-secondary-800 rounded-xl shadow-lg p-6 mb-6 text-white">
          <h2 className="text-2xl font-bold mb-4">📊 Resumo</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-lg">Total de Entradas:</span>
              <span className="text-xl font-bold text-green-300">{formatCurrency(calculated.totalEntradas || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg">Total de Saídas:</span>
              <span className="text-xl font-bold text-red-300">{formatCurrency(calculated.totalSaidas || 0)}</span>
            </div>
            <div className="h-px bg-white/20"></div>
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold">Saldo:</span>
              <span className={`text-2xl font-bold ${(calculated.saldo || 0) >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {formatCurrency(calculated.saldo || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Salvando...' : (editSession ? 'Atualizar Análise' : 'Salvar Análise')}
          </button>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange }: { label: string; value: number; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
        <input
          type="number"
          step="0.01"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="0,00"
        />
      </div>
    </div>
  );
}
