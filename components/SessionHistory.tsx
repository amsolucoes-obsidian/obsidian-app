'use client';

import { useState, useEffect, useMemo } from 'react';
import { createSupabaseClient } from '@/lib/supabase.client';
import { FinancialSession, FluxoCaixaData, BalancoPatrimonialData } from '@/types/financial';
import { formatCurrency } from '@/hooks/useCalculations';
import { toast } from 'sonner';

interface SessionHistoryProps {
  onBack: () => void;
  onViewSession?: (session: FinancialSession) => void;
  onEdit?: (session: FinancialSession) => void;
}

export default function SessionHistory({ onBack, onViewSession, onEdit }: SessionHistoryProps) {
  const supabase = createSupabaseClient();

  const [sessions, setSessions] = useState<FinancialSession[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterModule, setFilterModule] = useState<'all' | 'fluxo-caixa' | 'balanco-patrimonial'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'completed' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterModule, filterStatus]);

  const loadSessions = async () => {
    try {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      // ✅ evita travar loading se não estiver logado
      if (!session) {
        setSessions([]);
        return;
      }

      let query = supabase
        .from('financial_sessions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (filterModule !== 'all') query = query.eq('module_type', filterModule);
      if (filterStatus !== 'all') query = query.eq('status', filterStatus);

      const { data, error } = await query;

      if (error) throw error;

      setSessions((data as FinancialSession[]) || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast.error('Erro ao carregar histórico');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('financial_sessions').delete().eq('id', id);

      if (error) throw error;

      toast.success('Análise deletada com sucesso!');
      setDeleteConfirm(null);
      loadSessions();
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toast.error('Erro ao deletar análise');
    }
  };

  const getModuleName = (type: string) => {
    return type === 'fluxo-caixa' ? 'Fluxo de Caixa' : 'Balanço Patrimonial';
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      draft: 'Rascunho',
      completed: 'Concluído',
      archived: 'Arquivado',
    };

    const key = status as keyof typeof styles;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[key] ?? styles.archived}`}>
        {labels[key] ?? 'Arquivado'}
      </span>
    );
  };

  // ✅ Corrigido: cast correto do session.data
  const getSummary = (session: FinancialSession) => {
    if (session.module_type === 'fluxo-caixa') {
      const data = session.data as FluxoCaixaData | undefined;
      const saldo = data?.saldo ?? 0;

      return (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Saldo:</span>
          <span className={`font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(saldo)}
          </span>
        </div>
      );
    }

    const data = session.data as BalancoPatrimonialData | undefined;
    const patrimonio = data?.patrimonioLiquido ?? 0;

    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Patrimônio:</span>
        <span className={`font-bold ${patrimonio >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(patrimonio)}
        </span>
      </div>
    );
  };

  // ✅ evita duplicar filter+map em vários lugares
  const filteredSessions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sessions;

    return sessions.filter((s) => (s.session_name || '').toLowerCase().includes(q));
  }, [sessions, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando histórico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <button onClick={onBack} className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2">
            ← Voltar
          </button>

          <h1 className="text-3xl font-bold text-secondary-900 mb-6">Histórico de Análises</h1>

          {/* Busca */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filtros */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Módulo</label>
              <select
                value={filterModule}
                onChange={(e) => setFilterModule(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="fluxo-caixa">Fluxo de Caixa</option>
                <option value="balanco-patrimonial">Balanço Patrimonial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="completed">Concluídos</option>
                <option value="draft">Rascunhos</option>
                <option value="archived">Arquivados</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Sessões */}
        {filteredSessions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhuma análise encontrada</h3>
            <p className="text-gray-600 mb-6">Comece criando sua primeira análise financeira</p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
            >
              Criar Nova Análise
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSessions.map((session) => (
              <div key={session.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-secondary-900">{session.session_name}</h3>
                      {getStatusBadge(session.status)}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        {/* ✅ Corrigido: usa session.year no Date */}
                        📅{' '}
                        {new Date(session.year, session.month - 1, 1).toLocaleDateString('pt-BR', {
                          month: 'long',
                        })}{' '}
                        {session.year}
                      </span>

                      <span className="flex items-center gap-1">📊 {getModuleName(session.module_type)}</span>

                      <span className="flex items-center gap-1">
                        🕒 {new Date(session.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    {getSummary(session)}
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(session)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        ✏️ Editar
                      </button>
                    )}

                    {onViewSession && (
                      <button
                        onClick={() => onViewSession(session)}
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
                      >
                        Ver Detalhes
                      </button>
                    )}

                    {deleteConfirm === session.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(session.id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(session.id)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                      >
                        Deletar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
