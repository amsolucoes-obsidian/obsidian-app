'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase.client';
import { getSubscriptionStatusClient } from '@/lib/subscription';

// Imports de Componentes
import SubscriptionBlockedScreen from '@/components/SubscriptionBlockedScreen';
import WelcomeScreen from '@/components/WelcomeScreen';
import ModuleSelector from '@/components/ModuleSelector';
import FluxoCaixaForm from '@/components/FluxoCaixaForm';
import BalancoPatrimonialForm from '@/components/BalancoPatrimonialForm';
import Dashboard from '@/components/Dashboard';
import SessionHistory from '@/components/SessionHistory';
import ConsolidatedReport from '@/components/ConsolidatedReport';
import ReportSelector from '@/components/ReportSelector';
import { DashboardLayoutSkeleton } from '@/components/DashboardLayoutSkeleton';

export default function AppPage() {
  const router = useRouter();
  const supabase = createSupabaseClient();

  const [loading, setLoading] = useState(true);
  const [isSubscriptionActive, setIsSubscriptionActive] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [appState, setAppState] = useState<string>('loading');
  const [editSession, setEditSession] = useState<any>(null);
  const [reportConfig, setReportConfig] = useState({
    year: new Date().getFullYear(),
    moduleType: 'fluxo-caixa' as 'fluxo-caixa' | 'balanco-patrimonial'
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }
      
      setUser(session.user);

      // Verificação de assinatura com tratamento de tipo para evitar erros de build
      const status = await getSubscriptionStatusClient(session.user.id);
      const isActive = Boolean((status as any)?.isActive);
      setIsSubscriptionActive(isActive);

      if (isActive) {
        const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
        setAppState(hasSeenWelcome ? 'dashboard' : 'welcome');
      }
    } catch (error) {
      console.error("Erro na autenticação:", error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  // Estado de carregamento otimizado com Skeleton
  if (loading) return <DashboardLayoutSkeleton />;

  // Tela de bloqueio por falta de assinatura ativa no banco de dados
  if (user && !isSubscriptionActive) return <SubscriptionBlockedScreen />;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#ff6b35]/30">
      {/* Camada de Gradiente Fixa para manter a performance visual */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#0f172a] to-[#0a0a0a] -z-10" />

      {/* Container Responsivo ajustado para Mobile-First */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-10 transition-all duration-500">
        
        <Suspense fallback={<DashboardLayoutSkeleton />}>
          {appState === 'welcome' && (
            <WelcomeScreen onStart={() => {
              localStorage.setItem('hasSeenWelcome', 'true');
              setAppState('dashboard');
            }} />
          )}

          {appState === 'dashboard' && (
            <Dashboard onNavigate={(dest: any) => {
              if (dest === 'new-analysis') setAppState('module-selector');
              else if (dest === 'history') setAppState('history');
              else setAppState('report-selector');
            }} />
          )}

          {appState === 'module-selector' && (
            <ModuleSelector onSelectModule={(mod: any) => setAppState(mod)} />
          )}

          {appState === 'fluxo-caixa' && (
            <FluxoCaixaForm 
              onBack={() => {
                setEditSession(null);
                setAppState('dashboard');
              }} 
              editSession={editSession} 
            />
          )}

          {appState === 'balanco-patrimonial' && (
            <BalancoPatrimonialForm 
              onBack={() => {
                setEditSession(null);
                setAppState('dashboard');
              }} 
              editSession={editSession} 
            />
          )}

          {appState === 'history' && (
            <SessionHistory 
              onBack={() => setAppState('dashboard')}
              onEdit={(session: any) => {
                setEditSession(session);
                setAppState(session.module_type);
              }}
            />
          )}

          {appState === 'report-selector' && (
            <ReportSelector 
              onBack={() => setAppState('dashboard')}
              onSelect={(year, type) => {
                setReportConfig({ year, moduleType: type });
                setAppState('report');
              }}
            />
          )}

          {appState === 'report' && (
            <ConsolidatedReport 
              year={reportConfig.year}
              moduleType={reportConfig.moduleType}
              onBack={() => setAppState('dashboard')}
            />
          )}
        </Suspense>
      </div>
    </main>
  );
}