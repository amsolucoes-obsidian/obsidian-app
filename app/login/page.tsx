'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase.client';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

export default function LoginPage() {
  const supabase = createSupabaseClient();
  const router = useRouter();

  useEffect(() => {
    // Se o usuário já estiver logado, manda direto para a Home
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/');
      }
    };
    checkUser();
  }, [router, supabase]);

  return (
    <div className="min-h-screen bg-secondary-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-center text-secondary-900 mb-8">
          OBSIDIAN
        </h1>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          theme="light"
          providers={[]}
          localization={{
            variables: {
              sign_in: {
                email_label: 'E-mail',
                password_label: 'Senha',
                button_label: 'Entrar',
              },
            },
          }}
        />
      </div>
    </div>
  );
}