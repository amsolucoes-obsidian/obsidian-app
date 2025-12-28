'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { createSupabaseClient } from '@/lib/supabase';

export default function HomePage() {
  const router = useRouter();
  const supabase = createSupabaseClient();

  useEffect(() => {
    // Verifica se já está autenticado
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/app');
      }
    });
  }, [router, supabase]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900 flex items-center justify-center px-4">
      {/* Background com efeito de fogo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/obsidian-bg.jpg')] bg-cover bg-center opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-secondary-900 via-transparent to-secondary-900"></div>
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 max-w-2xl w-full text-center">
        {/* Logo/Ícone OBSIDIAN */}
        <div className="mb-8 flex justify-center">
          <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center shadow-obsidian">
            <svg
              className="w-20 h-20 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
        </div>

        {/* Título */}
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
          OBSIDIAN
        </h1>
        <p className="text-2xl md:text-3xl text-primary-500 font-semibold mb-8">
          Seu Espelho Financeiro
        </p>

        {/* Texto de boas-vindas (obrigatório do prompt) */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-10 border border-white/20">
          <p className="text-xl md:text-2xl text-white leading-relaxed">
            Olá! Sou a <span className="text-primary-500 font-bold">OBSIDIAN</span>, seu espelho financeiro. 
            Vou transformar o caos dos seus gastos em clareza cristalina. 
            <span className="block mt-4 text-primary-400 font-semibold">Vamos começar?</span>
          </p>
        </div>

        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/login')}
            className="px-8 py-4 bg-white text-secondary-900 font-bold text-lg rounded-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Entrar
          </button>
          <button
            onClick={() => router.push('/cadastro')}
            className="px-8 py-4 bg-primary-500 text-white font-bold text-lg rounded-lg hover:bg-primary-600 transition-all shadow-obsidian hover:shadow-xl transform hover:-translate-y-1"
          >
            Criar conta
          </button>
        </div>

        {/* Rodapé */}
        <p className="mt-12 text-gray-400 text-sm">
          Controle total de suas finanças em um único lugar
        </p>
      </div>
    </div>
  );
}
