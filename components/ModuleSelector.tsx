'use client';

interface ModuleSelectorProps {
  onSelectModule: (module: 'fluxo-caixa' | 'balanco-patrimonial') => void;
}

export default function ModuleSelector({ onSelectModule }: ModuleSelectorProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background Decorativo sutil */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl">
        {/* Title - Estilo Manus Luxo */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tighter font-poppins">
            ESCOLHA SEU MÓDULO
          </h1>
          <div className="w-24 h-1 bg-[#ff6b35] mx-auto mb-6"></div>
          <p className="text-gray-400 text-lg md:text-xl font-inter uppercase tracking-widest">
            A clareza financeira começa com a escolha certa
          </p>
        </div>

        {/* Module Cards - Grid imersivo com imagens hero */}
        <div className="grid md:grid-cols-2 gap-10">
          
          {/* Fluxo de Caixa */}
          <button
            onClick={() => onSelectModule('fluxo-caixa')}
            className="group relative h-[450px] overflow-hidden border border-white/5 hover:border-[#ff6b35]/40 transition-all duration-500 shadow-2xl text-left"
          >
            {/* Imagem de Fundo */}
            <img 
              src="/images/fluxo-caixa-hero.png" 
              alt="Fluxo de Caixa Hero"
              className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale group-hover:grayscale-0 group-hover:scale-105 group-hover:opacity-60 transition-all duration-1000"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent"></div>
            
            <div className="absolute bottom-10 left-10 right-10 z-20">
              <div className="w-12 h-1 bg-[#ff6b35] mb-6 group-hover:w-20 transition-all duration-500"></div>
              <h2 className="text-4xl font-black text-white mb-3 tracking-tight font-poppins">
                Fluxo de Caixa
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed max-w-sm font-inter">
                Domine suas entradas e saídas. Controle receitas e investigue seu saldo mensal com precisão absoluta.
              </p>
            </div>
          </button>

          {/* Balanço Patrimonial */}
          <button
            onClick={() => onSelectModule('balanco-patrimonial')}
            className="group relative h-[450px] overflow-hidden border border-white/5 hover:border-[#ff6b35]/40 transition-all duration-500 shadow-2xl text-left"
          >
            {/* Imagem de Fundo */}
            <img 
              src="/images/balanco-patrimonial-hero.png" 
              alt="Balanço Patrimonial Hero"
              className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale group-hover:grayscale-0 group-hover:scale-105 group-hover:opacity-60 transition-all duration-1000"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent"></div>
            
            <div className="absolute bottom-10 left-10 right-10 z-20">
              <div className="w-12 h-1 bg-[#ff6b35] mb-6 group-hover:w-20 transition-all duration-500"></div>
              <h2 className="text-4xl font-black text-white mb-3 tracking-tight font-poppins">
                Balanço Patrimonial
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed max-w-sm font-inter">
                Mapeie seu império. Registre ativos, passivos e visualize seu patrimônio líquido cristalino.
              </p>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 text-sm uppercase tracking-[0.3em] font-inter">
            OBSIDIAN • SEU ESPELHO FINANCEIRO
          </p>
        </div>
      </div>
    </div>
  );
}