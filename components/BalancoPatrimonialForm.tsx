'use client';

import { useState } from 'react';
import { BalancoPatrimonialData, FinancialSession } from '@/types/financial';
import { calculateBalanco, formatCurrency } from '@/hooks/useCalculations';
import { createSupabaseClient } from '@/lib/supabase.client';
import { toast } from 'sonner';

interface BalancoPatrimonialFormProps {
  onBack: () => void;
  editSession?: FinancialSession | null;
}

const INITIAL_DATA: BalancoPatrimonialData = {
  caixaBanco: 0,
  investimentosLiquidos: 0,
  contasReceber: 0,
  imoveis: 0,
  veiculos: 0,
  outrosAtivos: 0,
  emprestimos: 0,
  financiamentos: 0,
  cartaoCredito: 0,
  contasPagar: 0,
  outrosPassivos: 0,
};

function toMonthString(m: number) {
  const n = Number(m) || 1;
  return String(n).padStart(2, '0');
}

function fromMonthValue(value: any) {
  const n = typeof value === 'string' ? parseInt(value, 10) : Number(value);
  return Number.isFinite(n) && n >= 1 && n <= 12 ? n : new Date().getMonth() + 1;
}

export default function BalancoPatrimonialForm({ onBack, editSession }: BalancoPatrimonialFormProps) {
  const supabase = createSupabaseClient();

  const [data, setData] = useState<BalancoPatrimonialData>(
    editSession ? ((editSession as any).data as BalancoPatrimonialData) : INITIAL_DATA
  );

  const [sessionName, setSessionName] = useState(
    (editSession as any)?.session_name || (editSession as any)?.name || ''
  );

  const [month, setMonth] = useState(fromMonthValue((editSession as any)?.month));
  const [year, setYear] = useState((editSession as any)?.year || new Date().getFullYear());
  const [saving, setSaving] = useState(false);

  const calculated = calculateBalanco(data);

  const handleChange = (field: keyof BalancoPatrimonialData, value: string) => {
    const numValue = parseFloat(value) || 0;
    setData((prev) => ({ ...prev, [field]: numValue }));
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

      // ✅ Casting agressivo para 'any' para evitar erro de build 'never'
      const table = (supabase.from('financial_sessions') as any);

      const payload = {
        session_name: sessionName,
        month: month, // Usando número para manter padrão com Fluxo de Caixa
        year: year,
        module_type: 'balanco-patrimonial',
        data: calculated,
        updated_at: new Date().toISOString(),
      };

      if (editSession) {
        const { error } = await table
          .update(payload as any)
          .eq('id', (editSession as any).id);

        if (error) throw error;
        toast.success('Análise atualizada com sucesso!');
      } else {
        const { error } = await table.insert({
          ...payload,
          user_id: session.user.id,
          status: 'completed',
        } as any);

        if (error) throw error;
        toast.success('Análise salva com sucesso!');

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
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <button onClick={onBack} className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2">
            ← Voltar
          </button>

          <h1 className="text-3xl font-bold text-secondary-900 mb-4">Balanço Patrimonial</h1>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Análise *</label>
              <input
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="Ex: Patrimônio Janeiro 2024"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mês</label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value, 10))}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Ano</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value, 10))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-green-600 mb-4 border-b-2 border-green-500 pb-2">💵 Ativos Líquidos</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <InputField label="Caixa e Banco" value={data.caixaBanco} onChange={(v) => handleChange('caixaBanco', v)} />
            <InputField label="Investimentos Líquidos" value={data.investimentosLiquidos} onChange={(v) => handleChange('investimentosLiquidos', v)} />
            <InputField label="Contas a Receber" value={data.contasReceber} onChange={(v) => handleChange('contasReceber', v)} />
          </div>
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <p className="text-lg font-bold text-green-700">Total de Ativos Líquidos: {formatCurrency(calculated.totalAtivosLiquidos || 0)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-blue-600 mb-4 border-b-2 border-blue-500 pb-2">🏠 Ativos Fixos</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <InputField label="Imóveis" value={data.imoveis} onChange={(v) => handleChange('imoveis', v)} />
            <InputField label="Veículos" value={data.veiculos} onChange={(v) => handleChange('veiculos', v)} />
            <InputField label="Outros Ativos" value={data.outrosAtivos} onChange={(v) => handleChange('outrosAtivos', v)} />
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-lg font-bold text-blue-700">Total de Ativos Fixos: {formatCurrency(calculated.totalAtivosFixos || 0)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-red-600 mb-4 border-b-2 border-red-500 pb-2">💳 Passivos (Dívidas)</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <InputField label="Empréstimos" value={data.emprestimos} onChange={(v) => handleChange('emprestimos', v)} />
            <InputField label="Financiamentos" value={data.financiamentos} onChange={(v) => handleChange('financiamentos', v)} />
            <InputField label="Cartão de Crédito" value={data.cartaoCredito} onChange={(v) => handleChange('cartaoCredito', v)} />
            <InputField label="Contas a Pagar" value={data.contasPagar} onChange={(v) => handleChange('contasPagar', v)} />
            <InputField label="Outros Passivos" value={data.outrosPassivos} onChange={(v) => handleChange('outrosPassivos', v)} />
          </div>
          <div className="mt-4 p-4 bg-red-50 rounded-lg">
            <p className="text-lg font-bold text-red-700">Total de Passivos: {formatCurrency(calculated.totalPassivos || 0)}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-secondary-900 to-secondary-800 rounded-xl shadow-lg p-6 mb-6 text-white">
          <h2 className="text-2xl font-bold mb-4">📊 Resumo Patrimonial</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-lg">Total de Ativos:</span>
              <span className="text-xl font-bold text-green-300">{formatCurrency(calculated.totalAtivos || 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg">Total de Passivos:</span>
              <span className="text-xl font-bold text-red-300">{formatCurrency(calculated.totalPassivos || 0)}</span>
            </div>
            <div className="h-px bg-white/20"></div>
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold">Patrimônio Líquido:</span>
              <span className={`text-2xl font-bold ${(calculated.patrimonioLiquido || 0) >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {formatCurrency(calculated.patrimonioLiquido || 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={onBack} className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? 'Salvando...' : editSession ? 'Atualizar Análise' : 'Salvar Análise'}
          </button>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange }: { label: string; value: number; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
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