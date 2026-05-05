/**
 * @file src/app/diagnostico/page.tsx
 * @description Tela de Diagnóstico revisada. Adicionado tratamento de chaves
 * e logs de depuração para garantir a renderização do conteúdo.
 */

'use client';
import React, { useState } from 'react';
import { useFazendaStore } from '../../store/useFazendaStore';
import { IshikawaDiagram } from '../../components/ui/IshikawaDiagram';
import { Acelerometro } from '../../components/ui/Acelerometro';
import { Navbar } from '../../components/ui/Navbar';

const TABS = [
  { id: 'ccs', label: 'CCS' },
  { id: 'producao_vaca', label: 'Produção Média Diária por Vaca' },
  { id: 'producao_area', label: 'Produção por Área' },
  { id: 'producao_funcionario', label: 'Produção por Funcionário' },
  { id: 'preco_leite', label: 'Preço do Leite' },
];

export default function DiagnosticoPage() {
  // 1. Tente buscar por 'diagnostico' ou 'diagnosticoIA' para garantir compatibilidade
  const store = useFazendaStore() as any;
  const diagnosticoIA = store.diagnostico || store.diagnosticoIA;
  const dadosFazenda = store.dadosFazenda || {}; // Para recuperar o valor_atual
  
  const [activeTab, setActiveTab] = useState(TABS[0].id);

  if (!diagnosticoIA || Object.keys(diagnosticoIA).length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center p-8 bg-white rounded-xl shadow-md max-w-md border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Nenhum diagnóstico encontrado</h2>
            <p className="text-gray-600">Certifique-se de que o formulário foi enviado com sucesso.</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Acesso seguro suportando tanto o JSON real da API quanto o Mock dos testes
  const rawData = diagnosticoIA.indicadores?.[activeTab] || diagnosticoIA[activeTab];

  // 3. Adapter (Padrão de Projeto): Converte a estrutura real da API para o formato que a UI e os Testes esperam
  const processarDados = (data: any, tabId: string) => {
    if (!data) return null;

    // Se já estiver no formato do Mock de Testes (TDD), não precisamos converter
    if (data.ishikawa && data.ranking) return data;

    // Transforma o array "causas" da API real no objeto agrupado do diagrama
    const ishikawa: any = { mao_de_obra: [], maquina: [], meio_ambiente: [], metodo: [], medida: [], material: [] };
    const praticas: string[] = [];

    if (data.causas && Array.isArray(data.causas)) {
      data.causas.forEach((item: any) => {
        const pilar = (item.pilar || '').toLowerCase();
        const causaObj = { causa: item.causa, pratica: item.pratica };
        
        if (pilar.includes('obra')) ishikawa.mao_de_obra.push(causaObj);
        else if (pilar.includes('maquina') || pilar.includes('máquina')) ishikawa.maquina.push(causaObj);
        else if (pilar.includes('ambiente')) ishikawa.meio_ambiente.push(causaObj);
        else if (pilar.includes('metodo') || pilar.includes('método')) ishikawa.metodo.push(causaObj);
        else if (pilar.includes('medida') || pilar.includes('medição') || pilar.includes('medicao')) ishikawa.medida.push(causaObj);
        else if (pilar.includes('material')) ishikawa.material.push(causaObj);

        if (item.pratica && !praticas.includes(item.pratica)) {
          praticas.push(item.pratica);
        }
      });
    }

    return {
      ...data,
      valor_atual: dadosFazenda[tabId] || '--', // Recupera o valor preenchido no formulário
      ishikawa,
      ranking: praticas.slice(0, 5) // Pega as 5 primeiras práticas como as top prioridades
    };
  };

  const processedData = processarDados(rawData, activeTab);

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col">
      <Navbar />
      <div className="p-4 md:p-8 flex-1">
        <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navegação de Indicadores */}
        <div className="flex flex-wrap gap-2 border-b border-gray-300 pb-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-t-lg font-semibold text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-[#1973d3] text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-transparent border-b-0'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {processedData && (
          <div className="animate-in fade-in duration-500">
            {/* 2. Painel de Diagnóstico do Indicador (Centro) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              
              {/* Status (Acelerômetro) */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[200px]">
                <span className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Status</span>
                <Acelerometro status={processedData.status || ''} />
              </div>

              {/* Textos da Análise (Centro - Ocupa 2 colunas) */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 md:col-span-2 flex flex-col justify-center">
                <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 p-1 rounded-md text-xs">IA</span>
                  Análise Estratégica
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                  {processedData.textos_analise}
                </p>
              </div>

              {/* Valor Atual */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                <span className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-3">Valor Atual</span>
                <div className="text-4xl font-black text-[#003e7d]">
                  {processedData.valor_atual}
                </div>
              </div>
            </div>

            {/* 3. Cards do Diagrama Ishikawa (Inferior) */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                Mapeamento de Causas (Ishikawa)
              </h2>
              <IshikawaDiagram data={processedData.ishikawa} />
            </div>

            {/* 4. Ranking de Prioridade (Rodapé) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-[#003e7d] mb-4">Plano de Ação - Top Prioridades</h2>
              {processedData.ranking && processedData.ranking.length > 0 ? (
                <ol className="space-y-3">
                  {processedData.ranking.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-gray-800 font-medium">{item}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-gray-500 italic text-sm">Nenhuma ação prioritária definida neste pilar.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}