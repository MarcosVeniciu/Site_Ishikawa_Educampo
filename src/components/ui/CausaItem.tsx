/**
 * @file src/components/ui/CausaItem.tsx
 * @description Renderiza uma causa individual dentro do Diagrama de Ishikawa.
 * Inclui uma flag visual de severidade que, ao ser clicada, exibe a análise técnica.
 */

'use client';

import React, { useState } from 'react';
import { AlertCircle, Flag, X } from 'lucide-react';

/**
 * @description Estrutura de dados exigida para exibir a linha individual e a "flag".
 */
interface CausaItemProps {
  causa: string;
  pratica?: string;
  severidade?: string;
  analise?: string;
}

/**
 * @description Linha que compõe a espinha do Diagrama de Ishikawa.
 * Identifica a presença do nível de severidade e renderiza a bandeira (flag) que, 
 * ao ser clicada, aciona o modal contendo a análise técnica avançada gerada pela IA.
 */
export const CausaItem: React.FC<CausaItemProps> = ({ causa, pratica, severidade, analise }) => {
  const [mostrarAnalise, setMostrarAnalise] = useState(false);

  /**
   * @description Mapeia a palavra string de severidade para códigos de cores de 
   * Design System aplicadas no botão/flag.
   * @param sev Classificação de severidade textual vindo do backend.
   * @returns A classe de cores correspondente ou estilo cinza default.
   */
  const getSeveridadeColor = (sev?: string) => {
    const s = sev?.toLowerCase() || '';
    if (s.includes('alta') || s.includes('critica') || s.includes('critico')) return 'text-red-500 bg-red-50 hover:bg-red-100 border-red-200';
    if (s.includes('media') || s.includes('média') || s.includes('atencao') || s.includes('atenção')) return 'text-amber-500 bg-amber-50 hover:bg-amber-100 border-amber-200';
    if (s.includes('baixa') || s.includes('monitorar')) return 'text-blue-500 bg-blue-50 hover:bg-blue-100 border-blue-200';
    return 'text-gray-500 bg-gray-50 hover:bg-gray-100 border-gray-200';
  };

  const colorClass = getSeveridadeColor(severidade);

  return (
    <div className="relative flex flex-col gap-1 my-2">
      <div className="flex items-start justify-between gap-2 p-2 bg-white border border-gray-100 rounded-lg shadow-sm">
        <span className="text-sm text-gray-700 font-medium leading-tight">{causa}</span>
        
        {/* Flag de Severidade (Botão) */}
        {severidade && analise && (
          <button
            onClick={(e) => { e.stopPropagation(); setMostrarAnalise(true); }}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-xs font-bold transition-colors shrink-0 ${colorClass}`}
            title={`Severidade: ${severidade} - Clique para ver análise`}
          >
            <Flag size={12} strokeWidth={3} />
            <span className="hidden sm:inline capitalize">{severidade}</span>
          </button>
        )}
      </div>

      {/* Modal / Popover da Análise */}
      {mostrarAnalise && (
        <div className="absolute top-full right-0 z-50 mt-1 w-64 md:w-72 bg-white rounded-xl shadow-xl border border-gray-200 p-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
              <AlertCircle size={14} className={colorClass.split(' ')[0]} />
              Análise da Causa
            </h4>
            <button onClick={(e) => { e.stopPropagation(); setMostrarAnalise(false); }} className="text-gray-400 hover:text-red-500">
              <X size={16} />
            </button>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">{analise}</p>
          {pratica && (
            <div className="bg-blue-50 p-2 rounded border border-blue-100 text-xs text-blue-800">
              <span className="font-bold block mb-0.5">Ação Recomendada:</span>
              {pratica}
            </div>
          )}
        </div>
      )}
    </div>
  );
};