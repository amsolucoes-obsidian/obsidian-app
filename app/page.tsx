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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Se não houver sessão, redireciona para a nova página de login
      if (!session) {
        router.push('/login');
        return;
      }

      setUser(session.user);

      // ✅ Verifica status da assinatura via API client-safe com casting para evitar erro 'never'
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
      } else {
        // Se a assinatura não estiver ativa, o estado permanece 'loading' 
        // mas o componente SubscriptionBlockedScreen será renderizado abaixo
        setLoading(false);
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
      <div className="min-h-screen bg-secondary-