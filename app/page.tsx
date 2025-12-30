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

type AppState =
  | 'loading'
  | 'welcome'
  | 'dashboard'
  | 'module-selector'
  | 'fluxo-caixa'
  | 'balanco-patrimonial'
  | 'history'
  | 'report-selector'
  | 'report';

interface ReportConfig {
  year: number;
  moduleType: 'fluxo-caixa' | 'balanco-patrimonial';
}

export default function AppPage() {
  const router = useRouter();
  const supabase = createSupabaseClient();

  const [loading, setLoading] = useState(true);
  const [isSubscriptionActive, setIsSubscriptionActive] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [appState, setAppState] = useState<AppState>('loading');
  const [showWelcome, setShowWelcome] = useState(true);
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    year: new Date().getFullYear(),
    moduleType: 'fluxo-caixa',
  });
  const [editSession, setEditSession] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      // Se não estiver logado, manda para a página de login que criamos
      if (!session) {
        router.push('/login');
        return;
      }

      setUser(session.user);

      // ✅ Verifica status da assinatura com casting 'as any' para evitar erro de build
      const status = await getSubscriptionStatusClient(session.user.id);
      const statusAny = status as any;
      const isActive = Boolean(statusAny?.isActive);

      setIsSubscriptionActive(isActive);

      if (isActive) {
        const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
        if (hasSeenWelcome) {
          setShowWelcome(false);
          setAppState('dashboard');
        } else {
          setAppState('welcome');
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setShowWelcome(false);
    setAppState('dashboard');
  };

  const handleDashboardNavigate = (destination: 'new-analysis' | 'history' | 'report') => {
    if (destination === 'new-analysis') {
      setAppState('module-selector');
    } else if (destination === 'history') {
      setAppState('history');
    } else {
      setAppState('report-selector');
    }
  };

  const handleReportSelect = (year: number, moduleType: 'fluxo-caixa' | 'balanco-patrimonial') => {
    setReportConfig({ year, moduleType });
    setAppState('report');
  };

  const handleSelectModule = (module: 'fluxo-caixa' | 'balanco-patrimonial') => {
    setAppState(module);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Carregando Obsidian...</p>
        </div>
      </div>
    );
  }

  // Se o usuário está logado mas a assinatura está inativa (Hotmart não confirmou)
  if (user && !isSubscriptionActive) {
    return <SubscriptionBlockedScreen />;
  }

  // Máquina de estados para renderizar o componente correto
  switch (appState) {
    case 'welcome':
      return <WelcomeScreen onStart={handleStart} />;
    case 'dashboard':
      return <Dashboard onNavigate={handleDashboardNavigate} />;
    case 'module-selector':
      return <ModuleSelector onSelectModule={handleSelectModule} />;
    case 'fluxo-caixa':
      return (
        <FluxoCaixaForm
          onBack={() => {
            setEditSession(null);
            setAppState('dashboard');
          }}
          editSession={editSession}
        />
      );
    case 'balanco-patrimonial':
      return (
        <BalancoPatrimonialForm
          onBack={() => {
            setEditSession(null);
            setAppState('dashboard');
          }}
          editSession={editSession}
        />
      );
    case 'history':
      return (
        <SessionHistory
          onBack={() => setAppState('dashboard')}
          onEdit={(session) => {
            setEditSession(session);
            const s = session as any;
            setAppState(s.module_type === 'fluxo-caixa' ? 'fluxo-caixa' : 'balanco-patrimonial');
          }}
        />
      );
    case 'report-selector':
      return <ReportSelector onSelect={handleReportSelect} onBack={() => setAppState('dashboard')} />;
    case 'report':
      return (
        <ConsolidatedReport
          year={reportConfig.year}
          moduleType={reportConfig.moduleType}
          onBack={() => setAppState('dashboard')}
        />
      );
    default:
      return null;
  }
}