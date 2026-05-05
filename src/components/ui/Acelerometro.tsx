/**
 * @file src/components/ui/Acelerometro.tsx
 * @description Componente visual de velocímetro (Gauge Chart) construído em puro SVG.
 * Recebe o status do indicador e rotaciona o ponteiro com uma animação fluida.
 */

import React from 'react';

interface AcelerometroProps {
  status: 'bom' | 'alerta' | 'crítico' | string;
}

export const Acelerometro: React.FC<AcelerometroProps> = ({ status = '' }) => {
  // Define a rotação do ponteiro com base no status
  // 0 graus aponta para cima (Amarelo). -60 para a esquerda (Vermelho), +60 para a direita (Verde).
  let rotation = 0;
  const lowerStatus = status?.toLowerCase() || '';
  
  if (lowerStatus === 'crítico' || lowerStatus === 'critico') rotation = -60;
  if (lowerStatus === 'alerta' || lowerStatus === 'regular') rotation = 0;
  if (lowerStatus === 'bom') rotation = 60;

  return (
    <div className="relative w-48 h-28 flex flex-col items-center justify-end overflow-hidden">
      <svg viewBox="0 0 200 110" className="w-full h-full drop-shadow-sm">
        {/* Zona Vermelha (Crítico) - 180° a 120° */}
        <path d="M 20 100 A 80 80 0 0 1 60 30.71" fill="none" className="stroke-danger" strokeWidth="18" strokeLinecap="round" />
        
        {/* Zona Amarela (Alerta) - 120° a 60° */}
        <path d="M 60 30.71 A 80 80 0 0 1 140 30.71" fill="none" className="stroke-warning" strokeWidth="18" />
        
        {/* Zona Verde (Bom) - 60° a 0° */}
        <path d="M 140 30.71 A 80 80 0 0 1 180 100" fill="none" className="stroke-success" strokeWidth="18" strokeLinecap="round" />

        {/* Ponteiro (Agulha) com animação */}
        <g 
          style={{ 
            transform: `rotate(${rotation}deg)`, 
            transformOrigin: '100px 100px',
            transition: 'transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)' // Efeito de mola suave
          }}
        >
          {/* Corpo da Agulha */}
          <path d="M 96 100 L 100 25 L 104 100 Z" fill="#374151" />
          {/* Base Redonda da Agulha */}
          <circle cx="100" cy="100" r="10" fill="#1f2937" />
          <circle cx="100" cy="100" r="4" fill="#ffffff" />
        </g>
      </svg>
      
      {/* Texto do Status logo abaixo do centro */}
      <span className={`mt-1 text-sm font-black uppercase tracking-wider ${
        lowerStatus === 'crítico' || lowerStatus === 'critico' ? 'text-danger' :
        lowerStatus === 'alerta' || lowerStatus === 'regular' ? 'text-warning' : 'text-success'
      }`}>
        {status}
      </span>
    </div>
  );
};