/**
 * @file Navbar.tsx
 * @description Componente de cabeçalho e navegação global. 
 * Exibe o logotipo do Educampo à esquerda e um botão de menu (hamburger) à direita.
 * Ao ser clicado, revela um menu dropdown animado contendo atalhos rápidos
 * para Diagnóstico, Simulações e Configurações de Dados.
 */

"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X, BarChart2, Lightbulb, Settings } from 'lucide-react';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="relative z-50 bg-white shadow-sm">
      {/* Barra superior fixa */}
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto relative z-50 bg-white">
        <div className="flex items-center">
          {/* Logo/Banner Educampo no canto superior esquerdo */}
          <Image
            src="/banner_educampo.png"
            alt="Banner Educampo"
            width={150}
            height={40}
            className="object-contain"
            priority
          />
        </div>
        
        {/* Ícone Hamburger no canto superior direito */}
        <button
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isMenuOpen}
          className="p-2 text-[#003e7d] hover:bg-gray-100 rounded-md transition-colors"
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Menu dropdown animado (Desce do topo) */}
      <div
        className={`absolute top-full left-0 w-full bg-white shadow-md border-t border-gray-100 transition-all duration-300 ease-in-out origin-top ${
          isMenuOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-6">
          {/* Sessão 1: Diagnóstico */}
          <Link 
            href="/diagnostico" 
            onClick={() => setIsMenuOpen(false)} 
            className="group flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-[#f0f7ff] text-[#1973d3] rounded-lg group-hover:bg-[#1973d3] group-hover:text-white transition-colors">
              <BarChart2 size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Diagnóstico</h3>
              <p className="text-sm text-gray-500">Veja a análise detalhada de causas e efeitos da sua fazenda.</p>
            </div>
          </Link>

          {/* Sessão 2: Simulações */}
          <Link 
            href="/simulacao" 
            onClick={() => setIsMenuOpen(false)} 
            className="group flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-[#f0f7ff] text-[#1973d3] rounded-lg group-hover:bg-[#1973d3] group-hover:text-white transition-colors">
              <Lightbulb size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Simulações</h3>
              <p className="text-sm text-gray-500">Faça projeções e veja como pequenas mudanças afetam seus resultados.</p>
            </div>
          </Link>

          {/* Sessão 3: Configurações (Retorno ao formulário) */}
          <Link 
            href="/formulario" 
            onClick={() => setIsMenuOpen(false)} 
            className="group flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="p-2 bg-[#f0f7ff] text-[#1973d3] rounded-lg group-hover:bg-[#1973d3] group-hover:text-white transition-colors">
              <Settings size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Configurações</h3>
              <p className="text-sm text-gray-500">Edite as informações e métricas preenchidas sobre sua propriedade.</p>
            </div>
          </Link>
        </nav>
      </div>
    </header>
  );
}