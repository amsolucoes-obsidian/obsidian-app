'use client';

import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase.client';

export default function SubscriptionBlockedScreen() {
  const router = useRouter();
  const supabase = createSupabaseClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleRenew = () => {
    // Redireciona para página de checkout da Hotmart
    const checkoutUrl = process.env.NEXT_PUBLIC_HOTMART_CHECKOUT_URL;
    if (checkoutUrl) {
      window.open(checkoutUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900 flex items-center justify-center px-4">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/obsidian-bg.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-secondary-900 via-transparent to-secondary-900"></div>
      </div>

      {/* Card de Bloqueio */}
      <div className="relative z-10 max-w-lg w-full">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-10 border border-white/20 shadow-2xl text-center">
          {/* Ícone de Bloqueio */}
          <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-white mb-4">
            Acesso bloqueado
          </h1>

          {/* Texto (copy pronta do prompt) */}
          <p className="text-lg text-gray-300 mb-8 leading-relaxed">
            Sua assinatura anual está inativa ou expirada. Para continuar usando o OBSIDIAN, renove sua assinatura.
          </p>

          {/* Botões */}
          <div className="space-y-4">
            <button
              onClick={handleRenew}
              className="w-full btn-primary touch-target text-lg"
            >
              Renovar assinatura
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full px-6 py-3 border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-all touch-target"
            >
              Sair
            </button>
          </div>

          {/* Informação adicional */}
          <p className="mt-8 text-sm text-gray-400">
            Dúvidas? Entre em contato com o suporte.
          </p>
        </div>
      </div>
    </div>
  );
}
