'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createSupabaseClient } from '@/lib/supabase';
import { toast } from 'sonner';

export default function EsqueciSenhaPage() {
  const supabase = createSupabaseClient();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      });

      if (error) {
        throw error;
      }

      setEmailSent(true);
      toast.success('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast.error(error.message || 'Erro ao enviar e-mail de recuperação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900 flex items-center justify-center px-4">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/obsidian-bg.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-secondary-900 via-transparent to-secondary-900"></div>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-white mb-2">OBSIDIAN</h1>
            <p className="text-primary-500 font-semibold">Seu Espelho Financeiro</p>
          </Link>
        </div>

        {/* Formulário */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
          {!emailSent ? (
            <>
              <h2 className="text-2xl font-bold text-white mb-4 text-center">
                Esqueceu sua senha?
              </h2>
              <p className="text-gray-300 text-center mb-6">
                Digite seu e-mail e enviaremos um link para redefinir sua senha.
              </p>

              <form onSubmit={handleResetPassword} className="space-y-5">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-white font-medium mb-2">
                    E-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input-field bg-white/90 text-secondary-900 placeholder-gray-500"
                    placeholder="seu@email.com"
                    autoComplete="email"
                  />
                </div>

                {/* Botão Enviar */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary touch-target disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Enviando...' : 'Enviar link de recuperação'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  E-mail enviado!
                </h2>
                <p className="text-gray-300 mb-6">
                  Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
                </p>
                <Link href="/login" className="btn-primary inline-block">
                  Voltar para login
                </Link>
              </div>
            </>
          )}

          {/* Link para Login */}
          {!emailSent && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-gray-300">
                  Lembrou sua senha?{' '}
                  <Link
                    href="/login"
                    className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
                  >
                    Entrar
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>

        {/* Voltar */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← Voltar para início
          </Link>
        </div>
      </div>
    </div>
  );
}
