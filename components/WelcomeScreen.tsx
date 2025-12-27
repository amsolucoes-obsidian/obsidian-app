'use client';

import { useState, useEffect } from 'react';

interface WelcomeScreenProps {
  onStart: () => void;
}

/**
 * WelcomeScreen - Tela de Boas-vindas Premium
 * 
 * Design: Full-screen hero com obsidiana amplificada
 * - Imagem de obsidiana com fogo como background/hero
 * - Texto sobreposto com contraste perfeito
 * - Animação de entrada suave
 * - Botão de ação destacado
 */
export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    // Animar entrada
    const timer = setTimeout(() => setAnimateIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-secondary-900">
      {/* Background Image - Obsidiana com Fogo */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/obsidian-hero.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay gradient para melhor legibilidade */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70"></div>
      </div>

      {/* Content - Centered */}
      <div className={`relative z-10 text-center max-w-2xl mx-auto px-6 transition-all duration-1000 ${
        animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        
        {/* Title - Destaque Principal */}
        <h1 className="text-6xl md:text-7xl font-black text-white mb-6 tracking-tight drop-shadow-lg">
          OBSIDIAN
        </h1>

        {/* Subtitle - Tagline */}
        <p className="text-xl md:text-2xl text-primary-400 font-bold mb-4 drop-shadow-md">
          Seu Espelho Financeiro
        </p>

        {/* Description */}
        <p className="text-lg md:text-xl text-gray-100 leading-relaxed mb-10 drop-shadow-md max-w-xl mx-auto">
          Transforme o caos dos seus gastos em clareza cristalina. Controle total de suas finanças em um único lugar.
        </p>

        {/* CTA Button - Destaque */}
        <button
          onClick={onStart}
          className="px-10 py-4 bg-gradient-to-r from-primary-500 to-amber-600 text-white font-bold text-lg rounded-xl hover:from-primary-600 hover:to-amber-700 transition-all duration-300 shadow-2xl shadow-primary-500/50 hover:shadow-primary-500/75 transform hover:scale-105 active:scale-95 drop-shadow-lg touch-manipulation min-h-[48px]"
        >
          Vamos começar?
        </button>

        {/* Footer text */}
        <p className="mt-12 text-sm text-gray-300 tracking-widest uppercase drop-shadow-md">
          Seu controle financeiro começa aqui
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-gray-400 animate-bounce">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  );
}
