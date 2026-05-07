/**
 * @file src/components/ui/IshikawaDiagram.tsx
 * @description Componente visual que renderiza os pilares do Diagrama de Ishikawa.
 * Em vez de um gráfico complexo, utiliza um design de grid com 6 cards responsivos,
 * facilitando a leitura em dispositivos móveis e desktops. Apresenta também um Modal 
 * interativo para detalhamento das práticas recomendadas.
 */

import React, { useState } from 'react';
import { IshikawaItem, IshikawaCategorias } from '../../types/diagnostico';

interface IshikawaProps {
  data: IshikawaCategorias;
}

export const IshikawaDiagram: React.FC<IshikawaProps> = ({ data }) => {
  const [selectedCategory, setSelectedCategory] = useState<{ id: string, title: string, items: IshikawaItem[] } | null>(null);

  const categories = [
    { id: 'mao_de_obra', title: 'Mão de Obra', items: data?.mao_de_obra || [] },
    { id: 'maquina', title: 'Máquina', items: data?.maquina || [] },
    { id: 'meio_ambiente', title: 'Meio Ambiente', items: data?.meio_ambiente || [] },
    { id: 'metodo', title: 'Método', items: data?.metodo || [] },
    { id: 'medida', title: 'Medida', items: data?.medida || [] },
    { id: 'material', title: 'Material', items: data?.material || [] },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div 
            key={cat.id} 
            className="p-5 border border-gray-200 rounded-xl shadow-sm bg-white hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedCategory(cat)}
            title="Clique para ver os detalhes e práticas recomendadas"
          >
            <h3 className="font-bold text-lg mb-3 text-primary border-b border-gray-100 pb-2">{cat.title}</h3>
            <ul className="list-disc pl-5 space-y-1">
              {cat.items.length > 0 ? (
                cat.items.map((item, idx) => (
                  <li key={idx} className="text-gray-700 text-sm">{item.causa}</li>
                ))
              ) : (
                <li className="text-gray-400 text-sm italic">Nenhuma causa associada</li>
              )}
            </ul>
          </div>
        ))}
      </div>

      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedCategory(null)}>
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-primary">{selectedCategory.title}</h2>
              <button 
                onClick={() => setSelectedCategory(null)}
                className="text-gray-500 hover:text-gray-800 transition-colors p-1"
                title="Fechar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {selectedCategory.items.length > 0 ? (
                <div className="space-y-4">
                  {selectedCategory.items.map((item, idx) => (
                    <div key={idx} className={`pb-4 ${idx !== selectedCategory.items.length - 1 ? 'border-b border-gray-100' : ''}`}>
                      <p className="font-semibold text-gray-800 text-base mb-2">
                        {item.causa}
                      </p>
                      {item.pratica && (
                        <div className="pl-4 border-l-2 border-primary-light">
                          <span className="font-semibold text-primary text-sm block mb-1">Prática Recomendada:</span>
                          <p className="text-sm text-gray-700">{item.pratica}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic text-center py-8">Nenhuma causa associada a este pilar.</p>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 text-right bg-fundo rounded-b-xl">
              <button 
                onClick={() => setSelectedCategory(null)}
                className="bg-primary hover:opacity-90 text-white px-6 py-2 rounded-lg transition-colors font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
