'use client';

import React from 'react';

/**
 * DashboardLayoutSkeleton - Versão Ultra-rápida sem dependências externas
 * Substitui o componente de UI por divs animadas com Tailwind CSS
 */
export function DashboardLayoutSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-10 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between gap-6 border-l-4 border-white/5 pl-6">
        <div className="space-y-3">
          <div className="h-10 w-48 bg-white/5 rounded"></div>
          <div className="h-4 w-64 bg-white/5 rounded"></div>
        </div>
        <div className="h-14 w-40 bg-white/5 rounded"></div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-[#111] border border-white/5 rounded-none p-6">
            <div className="h-8 w-8 bg-white/5 rounded mb-4"></div>
            <div className="h-4 w-20 bg-white/5 rounded mb-2"></div>
            <div className="h-8 w-16 bg-white/5 rounded"></div>
          </div>
        ))}
      </div>

      {/* Action Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-64 bg-[#111] border border-white/5 rounded-none"></div>
        <div className="h-64 bg-[#111] border border-white/5 rounded-none"></div>
      </div>
    </div>
  );
}