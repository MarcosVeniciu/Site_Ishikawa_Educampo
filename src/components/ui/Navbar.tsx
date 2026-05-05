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
    <header className="relative z-50">
      {/* Barra superior fixa */}
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto relative z-50">
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
          className="p-2 text-primary hover:bg-fundo rounded-md transition-colors"
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Menu Dropdown Expandido */}
      {isMenuOpen && (
        <div className="absolute right-6 top-20 w-56 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden flex flex-col py-2 transition-all">
          
          {/* Sessão 1: Diagnóstico (Azul Principal) */}
          <Link 
            href="/dashboard" 
            onClick={() => setIsMenuOpen(false)} 
            className="group flex items-center gap-3 px-4 py-3 hover:bg-fundo transition-colors"
          >
            <div className="p-2 bg-primary/10 text-primary-light rounded-lg group-hover:bg-primary-light group-hover:text-white transition-colors">
              <BarChart2 size={20} />
            </div>
            <span className="text-base font-medium text-gray-700 group-hover:text-gray-900">
              Diagnóstico
            </span>
          </Link>

          {/* Sessão 2: Simulações (Âmbar/Laranja) */}
          <Link 
            href="/simulacao" 
            onClick={() => setIsMenuOpen(false)} 
            className="group flex items-center gap-3 px-4 py-3 hover:bg-fundo transition-colors"
          >
            <div className="p-2 bg-secondary/10 text-secondary rounded-lg group-hover:bg-secondary group-hover:text-white transition-colors">
              <Lightbulb size={20} />
            </div>
            <span className="text-base font-medium text-gray-700 group-hover:text-gray-900">
              Simulações
            </span>
          </Link>

          {/* Sessão 3: Configurações (Slate/Cinza) */}
          <Link 
            href="/formulario" 
            onClick={() => setIsMenuOpen(false)} 
            className="group flex items-center gap-3 px-4 py-3 hover:bg-fundo transition-colors"
          >
            <div className="p-2 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-slate-500 group-hover:text-white transition-colors">
              <Settings size={20} />
            </div>
            <span className="text-base font-medium text-gray-700 group-hover:text-gray-900">
              Configurações
            </span>
          </Link>

        </div>
      )}
    </header>
  );
}