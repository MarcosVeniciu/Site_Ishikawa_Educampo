/**
 * @file src/app/layout.tsx
 * @description Layout raiz (Root Layout) obrigatório do Next.js App Router.
 * * COMO ESTE CÓDIGO FUNCIONA:
 * 1. Injeção de CSS Global: Importa o 'globals.css' logo na primeira linha. É isso que 
 * ativa o motor do Tailwind CSS v4 e aplica as cores, gradientes e responsividade em todas as telas.
 * 2. Estrutura Base: Fornece as tags fundamentais do HTML (<html> e <body>) que envolvem 
 * todas as páginas da aplicação.
 * 3. Metadados: Define o título e a descrição padrão do site que aparecerão na aba do navegador.
 */

import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Educampo | DX Leite',
  description: 'Diagnóstico inteligente para sua fazenda leiteira.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased bg-fundo-alt text-slate-900">
        {/* O 'children' aqui será substituído pelo conteúdo das suas páginas (ex: page.tsx do login) */}
        {children}
      </body>
    </html>
  );
}