/**
 * @file src/components/ui/ImpactFactorBar.tsx
 * @description Componente visual para exibir os Fatores de Impacto de um indicador,
 * apresentando uma barra linear colorida e um marcador indicando a posição do valor atual do produtor.
 */

import React from 'react';
import { ImpactThresholds } from '../../types/diagnostico';

interface ImpactFactorBarProps {
  label: string;
  valor?: number | string;
  unidade?: string;
  thresholds: ImpactThresholds;
}

export function ImpactFactorBar({ label, valor, unidade, thresholds }: ImpactFactorBarProps) {
  // Tenta extrair o valor e unidade das props ou do objeto thresholds
  const rawValor = valor !== undefined ? valor : thresholds?.valor;
  const numValor = Number(rawValor) || 0;
  const displayUnidade = unidade || thresholds?.unidade || '';

  const bomStr = thresholds?.bom || '';
  const criticoStr = thresholds?.critico || '';
  const isLowerBetter = bomStr.includes('<') || criticoStr.includes('>');

  // Extrair números das strings de limites para calcular a amplitude e extremos
  const allThresholdsStr = `${bomStr} ${thresholds?.regular || ''} ${criticoStr}`;
  const numbers = allThresholdsStr.match(/-?\d+(\.\d+)?/g)?.map(Number) || [];
  const uniqueNumbers = Array.from(new Set(numbers)).sort((a, b) => a - b);

  let minBound = uniqueNumbers.length > 0 ? uniqueNumbers[0] : 0;
  let maxBound = uniqueNumbers.length > 1 ? uniqueNumbers[uniqueNumbers.length - 1] : 100;

  // Prevenir divisão por zero caso a escala extraia os mesmos números ou vazios
  if (minBound === maxBound) {
    minBound = minBound > 0 ? minBound * 0.5 : 0;
    maxBound = maxBound > 0 ? maxBound * 1.5 : 100;
  }

  const diff = maxBound - minBound;
  // Expande a escala visual levemente (10% de cada lado) para os extremos não ficarem "esmagados"
  const displayMin = minBound - diff * 0.1;
  const displayMax = maxBound + diff * 0.1;
  const totalRange = displayMax - displayMin;

  let percentage = ((numValor - displayMin) / totalRange) * 100;
  // Garantir que a seta fique contida nos limites de 0% e 100% da barra
  percentage = Math.max(0, Math.min(100, percentage));

  // Lógica de cores baseada na inteligência de "maior é melhor" ou "menor é melhor"
  const colorBom = 'bg-green-500';
  const colorRegular = 'bg-amber-400';
  const colorCritico = 'bg-red-500';

  const leftColor = isLowerBetter ? colorBom : colorCritico;
  const rightColor = isLowerBetter ? colorCritico : colorBom;

  // Melhorar a formatação do label (remover underlines e capitalizar)
  const displayLabel = label.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="flex flex-col w-full mb-6 font-sans">
      <div className="flex justify-between items-end mb-2">
        <span className="text-sm font-semibold text-gray-700">{displayLabel}</span>
        <span className="text-sm font-bold text-gray-900">
          {rawValor !== undefined ? numValor : '--'} <span className="text-xs text-gray-500 font-normal">{displayUnidade}</span>
        </span>
      </div>

      {/* Barra Linear Segmentada (3 Cores) */}
      <div className="relative h-2 w-full rounded-full flex overflow-hidden shadow-inner">
        <div className={`h-full flex-1 ${leftColor}`}></div>
        <div className={`h-full flex-1 ${colorRegular}`}></div>
        <div className={`h-full flex-1 ${rightColor}`}></div>
      </div>

      {/* Marcador do Valor (Seta/Triângulo Deslizante) */}
      <div className="relative w-full h-2 mt-1">
        <div 
          className="absolute top-0 -ml-1.5 transition-all duration-1000 ease-out" 
          style={{ left: `${percentage}%` }}
        >
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-gray-800"></div>
        </div>
      </div>
    </div>
  );
}