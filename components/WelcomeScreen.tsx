'use client';

import { useState, useEffect } from 'react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    // Animar entrada suave conforme planejado
    const timer = setTimeout(() => setAnimateIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-[#0a0a0a]">
      {/* Background Image - Ajustado para o caminho correto */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
        style={{
          backgroundImage: 'url(/images/hero-obsidian.png)', // Caminho verificado
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: animateIn ? 0.5 : 0 // Fade-in inicial do fundo
        }}
      >
        {/* Overlay gradient para Luxo e Legibilidade */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/60 via-[#0a0a0a]/40 to-[#0a0a0a]"></div>
      </div>

      {/* Content - Glassmorphism e Tipografia */}
      <div className={`relative z-10 text-center max-w-2xl mx-auto px-6 transition-all duration-1000 ${
        animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        
        {/* Logo Obsidian em Chamas - Adicionado para impacto visual */}
        <div className="mb-8 relative inline-block">
          <img 
            src="/images/obsidian-logo-fire.png" 
            alt="Obsidian Logo"
            className="w-32 h-32 md:w-44 md:h-44 mx-auto rounded-full border border-white/10 shadow-2xl"
          />
        </div>
        
        {/* Title - Estilo Poppins Bold */}
        <h1 className="text-6xl md:text-8xl font-black text-white mb-4 tracking-tighter drop-shadow-2xl font-poppins">
          OBSIDIAN
        </h1>

        {/* Subtitle - Cor Laranja Queimado #ff6b35 */}
        <p className="text-lg md:text-xl text-[#ff6b35] font-bold mb-6 tracking-[0.4em] uppercase drop-shadow-md">
          Seu Espelho Financeiro
        </p>

        {/* Description - Minimalismo Luxuoso */}
        <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-12 max-w-lg mx-auto font-inter">
          Transforme o caos dos seus gastos em clareza cristalina. Controle total de suas finanças em um único lugar.
        </p>

        {/* CTA Button - Cor Principal e Efeito de Hover */}
        <button
          onClick={onStart}
          className="group relative px-12 py-4 bg-white text-black font-black text-lg uppercase tracking-widest transition-all duration-300 hover:bg-[#ff6b35] hover:text-white shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[#ff6b35]/40 transform active:scale-95"
        >
          Vamos começar?
        </button>

        {/* Footer text - Hierarquia visual */}
        <p className="mt-16 text-xs text-gray-500 tracking-[0.3em] uppercase">
          Seu controle financeiro começa aqui
        </p>
      </div>

      {/* Scroll indicator - Estética minimalista */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-[#ff6b35]/50 animate-bounce">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  );
}