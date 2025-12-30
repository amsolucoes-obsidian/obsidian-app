'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase.client';
import { getSubscriptionStatusClient } from '@/lib/subscription';
import SubscriptionBlockedScreen from '@/components/SubscriptionBlockedScreen';
import WelcomeScreen from '@/components/WelcomeScreen';
import ModuleSelector from '@/components/ModuleSelector';
import FluxoCaixaForm from '@/components/FluxoCaixaForm';
import BalancoPatrimonialForm from '@/components/BalancoPatrimonialForm';
import Dashboard from '@/components/Dashboard';
import SessionHistory from '@/components/SessionHistory';
import ConsolidatedReport from '@/components/ConsolidatedReport';
import ReportSelector from '@/components/ReportSelector';

export default function AppPage() {
  const router = useRouter();
  const supabase = createSupabaseClient();

  const [loading, setLoading] = useState(true);
  const [isSubscriptionActive, setIsSubscriptionActive] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [appState, setAppState] = useState<string>('loading');
  const [showWelcome, setShowWelcome] = useState(true);
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

      const status = await getSubscriptionStatusClient(session.user.id);
      const isActive = (status as any)?.isActive;
      setIsSubscriptionActive(isActive);

      if (isActive) {
        const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
        setAppState(hasSeenWelcome ? 'dashboard' : 'welcome');
      }
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white font-sans">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-blue-400 font-medium">Carregando Obsidian...</p>
      </div>
    </div>
  );

  if (user && !isSubscriptionActive) return <SubscriptionBlockedScreen />;

  // RENDERIZAÇÃO COM O DESIGN MANUS (GRADIENTES E LAYOUT)
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] text-white font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            onBack={() => setAppState('dashboard')} 
            editSession={editSession} 
          />
        )}

        {appState === 'balanco-patrimonial' && (
          <BalancoPatrimonialForm 
            onBack={() => setAppState('dashboard')} 
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
      </div>
    </main>
  );
}