'use client';

interface ModuleSelectorProps {
  onSelectModule: (module: 'fluxo-caixa' | 'balanco-patrimonial') => void;
}

export default function ModuleSelector({ onSelectModule }: ModuleSelectorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900 flex items-center justify-center px-4 py-8">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-secondary-900 via-transparent to-secondary-900"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Escolha seu módulo
          </h1>
          <p className="text-gray-300 text-lg">
            Selecione o tipo de análise financeira que deseja realizar
          </p>
        </div>

        {/* Module Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Fluxo de Caixa */}
          <button
            onClick={() => onSelectModule('fluxo-caixa')}
            className="group bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:border-primary-500 transition-all duration-300 hover:scale-105 active:scale-95 text-left touch-manipulation"
          >
            <div className="w-16 h-16 bg-primary-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-3">
              Fluxo de Caixa
            </h2>
            
            <p className="text-gray-300 leading-relaxed">
              Analise entradas e saídas de dinheiro. Controle receitas, despesas e investigue seu saldo mensal.
            </p>
          </button>

          {/* Balanço Patrimonial */}
          <button
            onClick={() => onSelectModule('balanco-patrimonial')}
            className="group bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:border-primary-500 transition-all duration-300 hover:scale-105 active:scale-95 text-left touch-manipulation"
          >
            <div className="w-16 h-16 bg-primary-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-3">
              Balanço Patrimonial
            </h2>
            
            <p className="text-gray-300 leading-relaxed">
              Mapeie seu patrimônio completo. Registre ativos, passivos e calcule seu patrimônio líquido.
            </p>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm">
            Você pode alternar entre os módulos a qualquer momento
          </p>
        </div>
      </div>
    </div>
  );
}
