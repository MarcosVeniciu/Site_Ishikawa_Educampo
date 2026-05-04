/**
 * @file src/components/ui/SplitScreenLayout.tsx
 * @description Componente de layout estrutural que gerencia a responsividade e a identidade visual da marca.
 * * * COMO ESTE CÓDIGO FUNCIONA:
 * 1. Composição de Interface: Utiliza o padrão 'children' do React para injetar conteúdos dinâmicos.
 * 2. Responsividade: Implementa split-screen (50/50) apenas em 'lg'. Oculta a barra lateral em telas pequenas.
 * 3. Identidade Visual: Aplica o gradiente institucional (#003e7d a #1973d3) via Tailwind v4.
 * 4. Gestão de Assets: Serve logos da pasta /public de forma otimizada.
 */

import Image from 'next/image';
import React, { ReactNode } from 'react';

interface SplitScreenLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function SplitScreenLayout({ title, subtitle, children }: SplitScreenLayoutProps) {
  return (
    <div className="min-h-screen flex w-full font-sans bg-fundo">
      
      {/* LADO ESQUERDO: Branding Institucional (Somente Desktop) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary to-primary-light flex-col justify-between p-12 text-white relative overflow-hidden">
        <div className="flex items-center space-x-3 z-10">
          <div className="w-10 h-10 relative">
            <Image 
              src="/logo_educampo.png" 
              alt="Educampo Logo" 
              fill 
              className="object-contain" 
              priority 
            />
          </div>
          <span className="text-xl font-medium tracking-wide">Educampo | DX Leite</span>
        </div>

        <div className="max-w-xl z-10">
          <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
            Diagnóstico inteligente para sua fazenda leiteira
          </h1>
          <p className="text-blue-100 text-lg mb-8 leading-relaxed max-w-md">
            Análise sequencial de indicadores chave, benchmarking regional e plano de ação consolidado.
          </p>
          <div className="flex flex-wrap gap-3">
            {['Contagem de Células Somáticas', 'Produção Média Diária por Vaca', 'Produção por Área', 'Produção por Funcionário', 'Preço do Leite'].map((pill) => (
              <span key={pill} className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium backdrop-blur-sm shadow-sm">
                {pill}
              </span>
            ))}
          </div>
        </div>

        <div className="text-sm text-blue-200/80 z-10">© 2026 Educampo SEBRAE</div>
        
        {/* Efeito visual de luz ao fundo */}
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-white opacity-5 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* LADO DIREITO: Área do Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          
          <div className="text-center mb-10">
            {/* Logo visível apenas no Mobile */}
            <div className="relative mx-auto mb-8 h-20 w-20 lg:hidden">
               <Image 
                 src="/logo_educampo.png" 
                 alt="Educampo Logo" 
                 fill 
                 className="object-contain" 
                 priority 
               />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{title}</h2>
            {subtitle && <p className="text-gray-500 text-sm sm:text-base">{subtitle}</p>}
          </div>

          {children}

        </div>
      </div>
    </div>
  );
}