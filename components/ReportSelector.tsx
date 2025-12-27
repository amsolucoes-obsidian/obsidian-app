'use client';

import { useState } from 'react';

interface ReportSelectorProps {
  onSelect: (year: number, moduleType: 'fluxo-caixa' | 'balanco-patrimonial') => void;
  onBack: () => void;
}

export default function ReportSelector({ onSelect, onBack }: ReportSelectorProps) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [moduleType, setModuleType] = useState<'fluxo-caixa' | 'balanco-patrimonial'>('fluxo-caixa');

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900 mb-6 flex items-center gap-2"
          >
            ← Voltar
          </button>

          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Relatório Consolidado
          </h1>
          <p className="text-gray-600 mb-8">
            Selecione o ano e o módulo para visualizar o relatório
          </p>

          {/* Seletor de Ano */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Ano
            </label>
            <div className="grid grid-cols-5 gap-3">
              {years.map((y) => (
                <button
                  key={y}
                  onClick={() => setYear(y)}
                  className={`py-3 px-4 rounded-lg font-medium transition-all ${
                    year === y
                      ? 'bg-primary-500 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          {/* Seletor de Módulo */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Módulo
            </label>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => setModuleType('fluxo-caixa')}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  moduleType === 'fluxo-caixa'
                    ? 'border-primary-500 bg-primary-50 shadow-lg scale-105'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-4xl mb-3">💰</div>
                <h3 className="text-lg font-bold text-secondary-900 mb-1">
                  Fluxo de Caixa
                </h3>
                <p className="text-sm text-gray-600">
                  Entradas, saídas e saldo mensal
                </p>
              </button>

              <button
                onClick={() => setModuleType('balanco-patrimonial')}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  moduleType === 'balanco-patrimonial'
                    ? 'border-primary-500 bg-primary-50 shadow-lg scale-105'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-4xl mb-3">🏦</div>
                <h3 className="text-lg font-bold text-secondary-900 mb-1">
                  Balanço Patrimonial
                </h3>
                <p className="text-sm text-gray-600">
                  Ativos, passivos e patrimônio
                </p>
              </button>
            </div>
          </div>

          {/* Botão Gerar */}
          <button
            onClick={() => onSelect(year, moduleType)}
            className="w-full py-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-bold text-lg shadow-lg hover:shadow-xl"
          >
            📊 Gerar Relatório {year}
          </button>
        </div>
      </div>
    </div>
  );
}
