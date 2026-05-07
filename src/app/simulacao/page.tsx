/**
 * @file src/app/simulacao/page.tsx
 * @description Dashboard de Simulação Interativa (What-If Analysis).
 * Permite ao produtor alterar variáveis em tempo real (Painel Esquerdo) e 
 * visualizar o impacto em 9 indicadores cruciais (Painel Central), comparando
 * contra linhas de base (Cenários: Inferior, Intermediário, Superior) sem custos de API.
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { useFazendaStore } from '@/store/useFazendaStore';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// --- COMPONENTE DE GRÁFICO PURO (SEM BIBLIOTECAS) ---
const BarChartSimulacao = ({ 
  titulo, 
  valorSimulado, 
  valorReferencia, 
  unidade, 
  inverterCores = false // Ex: Para CCS, menor é melhor (inverter = true)
}: { 
  titulo: string, valorSimulado: number, valorReferencia: number, unidade: string, inverterCores?: boolean 
}) => {
  // Encontra o teto para calcular a altura percentual (100% da barra)
  const maxVal = Math.max(valorSimulado, valorReferencia, 1); 
  const alturaSimulado = `${(valorSimulado / maxVal) * 100}%`;
  const alturaReferencia = `${(valorReferencia / maxVal) * 100}%`;

  // Lógica de cores: Se for maior que a referência, é verde? (Depende do inverterCores)
  const isMelhor = inverterCores ? valorSimulado <= valorReferencia : valorSimulado >= valorReferencia;
  const corBarraSimulada = isMelhor ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col h-64">
      <h3 className="text-sm font-bold text-gray-700 text-center mb-4">{titulo}</h3>
      
      {/* Container das Barras (Cresce de baixo para cima) */}
      <div className="flex-1 flex items-end justify-center gap-6 pb-2">
        {/* Barra de Referência (Educampo) */}
        <div className="flex flex-col items-center w-16 group">
          <span className="text-xs text-gray-500 mb-1 font-medium">{valorReferencia.toLocaleString('pt-BR')}</span>
          <div 
            className="w-full bg-slate-300 rounded-t-sm transition-all duration-500 ease-out relative"
            style={{ height: alturaReferencia }}
          >
            {/* Tooltip Hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
              Referência Base
            </div>
          </div>
          <span className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-wider">Ref</span>
        </div>

        {/* Barra Simulada (Em Tempo Real) */}
        <div className="flex flex-col items-center w-16 group">
          <span className={`text-xs font-bold mb-1 ${isMelhor ? 'text-green-600' : 'text-red-600'}`}>
            {valorSimulado.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}
          </span>
          <div 
            className={`w-full ${corBarraSimulada} rounded-t-sm transition-all duration-300 ease-out relative shadow-sm`}
            style={{ height: alturaSimulado }}
          >
             {/* Tooltip Hover */}
             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
              Valor Simulado
            </div>
          </div>
          <span className="text-[10px] font-bold text-primary mt-2 uppercase tracking-wider">Sim</span>
        </div>
      </div>
      
      <div className="text-center mt-2 pt-2 border-t border-gray-50">
        <span className="text-xs text-gray-500">{unidade}</span>
      </div>
    </div>
  );
};

// --- PÁGINA PRINCIPAL DE SIMULAÇÃO ---
export default function SimulacaoPage() {
  const { dadosFazenda } = useFazendaStore();
  
  // Estado local para a Simulação (não altera a store principal para não estragar o diagnóstico real)
  const [simulacao, setSimulacao] = useState({
    total_vacas: dadosFazenda?.total_vacas || 100,
    vacas_lactacao: dadosFazenda?.vacas_lactacao || 85,
    producao_vaca: dadosFazenda?.producao_vaca || 30.0,
    preco_leite: dadosFazenda?.preco_leite || 3.00,
    area_atividade: dadosFazenda?.area_atividade || 10.0,
    ccs: dadosFazenda?.ccs || 150,
  });

  const [cenarioAtivo, setCenarioAtivo] = useState<'inferior' | 'intermediario' | 'superior'>('intermediario');

  // Valores de referência do Educampo (Mockados temporariamente para a simulação funcionar de imediato)
  // Numa etapa futura, isso pode vir direto de `diagnosticoIA.cenarios`
  const referencias = {
    inferior:      { producao: 15.0, preco: 2.50, area: 15, ccs: 400 },
    intermediario: { producao: 25.0, preco: 2.80, area: 10, ccs: 250 },
    superior:      { producao: 35.0, preco: 3.20, area: 8,  ccs: 100 },
  };

  // 🧮 MOTOR DE CÁLCULO LOCAL (Executa a cada movimento do slider)
  const calculos = useMemo(() => {
    const pDiariaSim = simulacao.vacas_lactacao * simulacao.producao_vaca;
    const pDiariaRef = simulacao.vacas_lactacao * referencias[cenarioAtivo].producao; // Usando vacas da fazenda como base

    return {
      producao_diaria: pDiariaSim,
      producao_diaria_ref: pDiariaRef,
      
      receita_bruta: pDiariaSim * simulacao.preco_leite,
      receita_bruta_ref: pDiariaRef * referencias[cenarioAtivo].preco,
      
      prod_area: (pDiariaSim * 365) / simulacao.area_atividade,
      prod_area_ref: (pDiariaRef * 365) / referencias[cenarioAtivo].area,
      
      taxa_lactacao: (simulacao.vacas_lactacao / simulacao.total_vacas) * 100,
      taxa_lactacao_ref: 83, // Referência fixa da literatura
    };
  }, [simulacao, cenarioAtivo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSimulacao(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  if (!dadosFazenda) {
    return <div className="p-8 text-center text-red-500 font-bold">Sem dados para simular.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* PAINEL ESQUERDO: CONTROLES (Inputs & Sliders) */}
        <aside className="w-full lg:w-80 flex-shrink-0 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col h-max sticky top-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Variáveis
            </h2>
            <p className="text-xs text-gray-500 mt-1">Ajuste os valores para simular.</p>
          </div>

          <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            
            {/* Controle: Total de Vacas */}
            <div>
              <label htmlFor="total_vacas" className="text-sm font-semibold text-gray-700 flex justify-between">
                Total de Vacas <span className="text-primary">{simulacao.total_vacas}</span>
              </label>
              <input 
                id="total_vacas" name="total_vacas" type="range" 
                min="10" max="500" step="1" 
                value={simulacao.total_vacas} onChange={handleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2 accent-primary"
              />
            </div>

            {/* Controle: Vacas em Lactação */}
            <div>
              <label htmlFor="vacas_lactacao" className="text-sm font-semibold text-gray-700 flex justify-between">
                Vacas em Lactação <span className="text-primary">{simulacao.vacas_lactacao}</span>
              </label>
              <input 
                id="vacas_lactacao" name="vacas_lactacao" type="range" 
                min="0" max={simulacao.total_vacas} step="1" 
                value={simulacao.vacas_lactacao} onChange={handleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2 accent-primary"
              />
            </div>

            {/* Controle: Produção por Vaca */}
            <div>
              <label htmlFor="producao_vaca" className="text-sm font-semibold text-gray-700 flex justify-between">
                Produção por Vaca <span className="text-primary">{simulacao.producao_vaca} L</span>
              </label>
              <input 
                id="producao_vaca" name="producao_vaca" type="range" 
                min="5" max="50" step="0.5" 
                value={simulacao.producao_vaca} onChange={handleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2 accent-primary"
              />
            </div>

            {/* Controle: Preço do Leite */}
            <div>
              <label htmlFor="preco_leite" className="text-sm font-semibold text-gray-700 flex justify-between">
                Preço do Leite <span className="text-primary">R$ {simulacao.preco_leite.toFixed(2)}</span>
              </label>
              <input 
                id="preco_leite" name="preco_leite" type="range" 
                min="1.5" max="5.0" step="0.05" 
                value={simulacao.preco_leite} onChange={handleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2 accent-primary"
              />
            </div>

            {/* Controle: CCS */}
            <div>
              <label htmlFor="ccs" className="text-sm font-semibold text-gray-700 flex justify-between">
                CCS (x1000) <span className="text-primary">{simulacao.ccs}</span>
              </label>
              <input 
                id="ccs" name="ccs" type="range" 
                min="50" max="1000" step="10" 
                value={simulacao.ccs} onChange={handleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2 accent-primary"
              />
            </div>
          </div>
        </aside>

        {/* PAINEL DIREITO: TABS E GRÁFICOS */}
        <section className="flex-1 flex flex-col">
          
          {/* Topo: Tabs de Cenário Educampo */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex gap-2 mb-6 w-max mx-auto md:mx-0">
            {(['inferior', 'intermediario', 'superior'] as const).map(cenario => (
              <button
                key={cenario}
                onClick={() => setCenarioAtivo(cenario)}
                className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all duration-300 ${
                  cenarioAtivo === cenario 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {cenario}
              </button>
            ))}
          </div>

          {/* GRID 3x3: 9 Gráficos Comparativos */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            
            <BarChartSimulacao 
              titulo="Produção Diária" 
              valorSimulado={calculos.producao_diaria} 
              valorReferencia={calculos.producao_diaria_ref} 
              unidade="Litros / Dia" 
            />
            
            <BarChartSimulacao 
              titulo="Prod. Vaca / Dia" 
              valorSimulado={simulacao.producao_vaca} 
              valorReferencia={referencias[cenarioAtivo].producao} 
              unidade="L / Vaca / Dia" 
            />

            <BarChartSimulacao 
              titulo="Receita Bruta Diária" 
              valorSimulado={calculos.receita_bruta} 
              valorReferencia={calculos.receita_bruta_ref} 
              unidade="R$ / Dia" 
            />

            <BarChartSimulacao 
              titulo="Taxa de Lactação" 
              valorSimulado={calculos.taxa_lactacao} 
              valorReferencia={calculos.taxa_lactacao_ref} 
              unidade="% do Rebanho" 
            />

            <BarChartSimulacao 
              titulo="Prod. por Área" 
              valorSimulado={calculos.prod_area} 
              valorReferencia={calculos.prod_area_ref} 
              unidade="L / ha / ano" 
            />

            <BarChartSimulacao 
              titulo="Preço Recebido" 
              valorSimulado={simulacao.preco_leite} 
              valorReferencia={referencias[cenarioAtivo].preco} 
              unidade="R$ / Litro" 
            />

            <BarChartSimulacao 
              titulo="Qualidade (CCS)" 
              valorSimulado={simulacao.ccs} 
              valorReferencia={referencias[cenarioAtivo].ccs} 
              unidade="CCS x1000" 
              inverterCores={true} /* CCS menor é melhor */
            />

            <BarChartSimulacao 
              titulo="Área de Atividade" 
              valorSimulado={simulacao.area_atividade} 
              valorReferencia={referencias[cenarioAtivo].area} 
              unidade="Hectares (ha)" 
              inverterCores={true} /* Depende da estratégia, usando menor=melhor para eficiência temporal */
            />

            {/* O 9º Gráfico pode ser uma métrica sintética como Eficiência Financeira */}
            <div className="bg-gradient-to-br from-[#003e7d] to-[#1973d3] p-6 rounded-xl shadow-md text-white flex flex-col justify-center items-center h-64 text-center">
              <h3 className="text-lg font-bold mb-2">Simulação Ativa</h3>
              <p className="text-blue-100 text-sm mb-4">Cenário Base: {cenarioAtivo.toUpperCase()}</p>
              <div className="text-4xl font-black mb-1">
                R$ {calculos.receita_bruta.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </div>
              <p className="text-xs text-blue-200">Receita Bruta Estimada por Dia</p>
            </div>

          </div>
        </section>

      </main>
    </div>
  );
}