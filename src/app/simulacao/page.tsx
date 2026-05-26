/**
 * @file src/app/simulacao/page.tsx
 * @description Dashboard de Simulação Interativa (What-If Analysis).
 * Permite ao produtor alterar variáveis em tempo real (Painel Esquerdo) e 
 * visualizar o impacto em 9 indicadores cruciais (Painel Central), comparando
 * contra linhas de base (Cenários: Inferior, Intermediário, Superior) sem custos de API.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { useFazendaStore } from '@/store/useFazendaStore';
import { TrendingUp, TrendingDown, Minus, Loader2, RotateCcw } from 'lucide-react';
import Link from 'next/link';

/**
 * @description Renderiza um gráfico de barra comparativo puro, sem dependências.
 * Calcula a escala proporcionalmente aos valores fornecidos para alinhar as barras.
 * @param titulo Título exibido acima das barras.
 * @param valorSimulado O valor resultante da simulação em tempo real.
 * @param valorReferencia O valor base para comparação do cenário.
 * @param unidade A unidade de medida (ex: Litros, R$).
 * @param inverterCores Se verdadeiro, barras menores ganham cores positivas (ex: CCS).
 */
const BarChartSimulacao = ({ 
  titulo, 
  valorSimulado, 
  valorReferencia, 
  unidade, 
  inverterCores = false 
}: { 
  titulo: string, valorSimulado: number, valorReferencia: number, unidade: string, inverterCores?: boolean 
}) => {
  /**
   * Encontra o teto para calcular a altura percentual lidando com possíveis valores negativos (ex: margem)
   */
  const maxVal = Math.max(Math.abs(valorSimulado), Math.abs(valorReferencia), 0.01); 
  const alturaSimulado = `${(Math.abs(valorSimulado) / maxVal) * 100}%`;
  const alturaReferencia = `${(Math.abs(valorReferencia) / maxVal) * 100}%`;

  /**
   * Lógica de cores: Verde (Melhor), Vermelho (Pior), Cinza (Igual)
   */
  let corBarraSimulada = 'bg-gray-400';
  let corTextoSimulado = 'text-gray-600';

  if (valorSimulado !== valorReferencia) {
    const isMelhor = inverterCores ? valorSimulado < valorReferencia : valorSimulado > valorReferencia;
    corBarraSimulada = isMelhor ? 'bg-green-500' : 'bg-red-500';
    corTextoSimulado = isMelhor ? 'text-green-600' : 'text-red-600';
  }


  /**
   * Cálculos do Indicador Percentual para o canto superior direito do componente.
   */
  const diff = valorSimulado - valorReferencia;
  const pct = Math.abs(valorReferencia) > 0 ? (diff / Math.abs(valorReferencia)) * 100 : 0;
  
  let indicatorColor = 'text-gray-500 bg-gray-100';
  let prefix = '';
  let Icon = Minus;

  if (diff > 0) {
    Icon = TrendingUp;
    prefix = '+';
    indicatorColor = inverterCores ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50';
  } else if (diff < 0) {
    Icon = TrendingDown;
    prefix = '-';
    indicatorColor = inverterCores ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50';
  }

  /**
   * Formatação para grandes números (K) e moedas/frações pequenas
   * @param num O número a ser formatado.
   * @returns A representação formatada em string do número fornecido.
   */
  const formatNumber = (num: number) => {
    if (Math.abs(num) >= 1000) {
      return num.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
    }
    return num.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-64">
      {/* Cabeçalho Flexbox Inteligente */}
      <div className="flex justify-between items-start gap-4 mb-4">
        <h3 className="text-sm font-bold text-gray-700 leading-tight">{titulo}</h3>
        {/* Badge Indicador de Diferença Percentual */}
        <div 
          className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${indicatorColor}`}
          title="Diferença em relação à referência"
        >
          <Icon size={12} strokeWidth={2.5} />
          <span>{prefix}{Math.abs(pct).toFixed(1)}%</span>
        </div>
      </div>
      
      {/* Container das Barras (Cresce de baixo para cima) */}
      <div className="flex-1 flex items-end justify-center gap-6 pb-2">
        {/* Barra Simulada (Em Tempo Real) */}
        <div className="flex flex-col items-center justify-end w-16 group h-full">
          <span className={`text-xs font-bold mb-1 ${corTextoSimulado}`}>
            {formatNumber(valorSimulado)}
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
          <span className="text-[10px] font-bold text-gray-500 mt-2 uppercase tracking-wider">Simulação</span>
        </div>

        {/* Barra de Referência (Educampo) */}
        <div className="flex flex-col items-center justify-end w-16 group h-full">
          <span className="text-xs text-gray-500 mb-1 font-medium">{formatNumber(valorReferencia)}</span>
          <div 
            className="w-full bg-primary rounded-t-sm transition-all duration-500 ease-out relative"
            style={{ height: alturaReferencia }}
          >
            {/* Tooltip Hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
              Referência Base
            </div>
          </div>
          <span className="text-[10px] font-bold text-primary mt-2 uppercase tracking-wider">Referência</span>
        </div>
      </div>
      
      {unidade && (
        <div className="text-center mt-2 pt-2 border-t border-gray-50">
          <span className="text-xs text-gray-500">{unidade}</span>
        </div>
      )}
    </div>
  );
};

/**
 * @description Tela interativa do Simulador de Cenários.
 * Mantém um estado local que herda a base da store do Zustand para permitir manipulações
 * descartáveis sem corromper o diagnóstico original do produtor.
 */
export default function SimulacaoPage() {
  const { dadosFazenda, resultadoSimulacao, setResultadoSimulacao } = useFazendaStore();
  
  /**
   * Estado local para a Simulação (não altera a store principal para não estragar o diagnóstico real do produtor).
   */
  const [simulacao, setSimulacao] = useState({
    total_vacas: dadosFazenda?.total_vacas || 100,
    vacas_lactacao: dadosFazenda?.vacas_lactacao || 85,
    producao_vaca: dadosFazenda?.producao_vaca || 30.0,
    preco_recebido: dadosFazenda?.preco_leite || 3.00,
    area_atividade: dadosFazenda?.area_atividade || 10.0,
    ccs: dadosFazenda?.ccs || 150,
    numero_trabalhadores: dadosFazenda?.mao_obra_total || 2,
    custo_concentrado: dadosFazenda?.preco_concentrado || 2.00,
  });

  /**
   * @description Restaura os valores da simulação para os originais do produtor.
   */
  const restaurarValoresOriginais = () => {
    if (dadosFazenda) {
      setSimulacao({
        total_vacas: dadosFazenda.total_vacas || 100,
        vacas_lactacao: dadosFazenda.vacas_lactacao || 85,
        producao_vaca: dadosFazenda.producao_vaca || 30.0,
        preco_recebido: dadosFazenda.preco_leite || 3.00,
        area_atividade: dadosFazenda.area_atividade || 10.0,
        ccs: dadosFazenda.ccs || 150,
        numero_trabalhadores: dadosFazenda.mao_obra_total || 2,
        custo_concentrado: dadosFazenda.preco_concentrado || 2.00,
      });
    }
  };

  const [isSimulando, setIsSimulando] = useState(false);
  const [cenarioAtivo, setCenarioAtivo] = useState<'inferior' | 'intermediario' | 'superior'>('intermediario');
  
  /**
   * Estado para a barreira do Rate Limiting que impede cliques em massa no botão de simulação.
   */
  const [tempoBloqueio, setTempoBloqueio] = useState(0);

  /**
   * Efeito que diminui o contador automaticamente a cada segundo quando acionado o bloqueio de taxa.
   */
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (tempoBloqueio > 0) {
      interval = setInterval(() => setTempoBloqueio((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [tempoBloqueio]);

  /**
   * @description Mescla as edições locais da simulação e solicita à API
   * externa a projeção avançada de custo (Machine Learning) e re-divisão dos quartis.
   */
  const executarSimulacao = async () => {
    if (!dadosFazenda) return;

    setIsSimulando(true);

    const payloadSimulacao = {
      dados_originais: {
        producao_vaca: dadosFazenda.producao_vaca,
        regiao_sebrae: dadosFazenda.regiao,
        sistema_producao: dadosFazenda.sistema_producao,
        vacas_lactacao: dadosFazenda.vacas_lactacao
      },
      dados_simulados: {
        area_atividade: simulacao.area_atividade,
        ccs: simulacao.ccs,
        custo_concentrado: simulacao.custo_concentrado,
        numero_trabalhadores: simulacao.numero_trabalhadores,
        preco_recebido: simulacao.preco_recebido,
        producao_vaca: simulacao.producao_vaca,
        total_vacas: simulacao.total_vacas,
        vacas_lactacao: simulacao.vacas_lactacao
      }
    };

    try {
      const response = await fetch('/api/simulacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadSimulacao),
      });

      /**
       * Intercepta o Rate Limit (429 Too Many Requests)
       */
      if (response.status === 429) {
        setTempoBloqueio(60);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setResultadoSimulacao(data);
      } else {
        console.error("Falha na simulação");
      }
    } catch (error) {
      console.error("Erro ao simular:", error);
    } finally {
      setIsSimulando(false);
    }
  };

  /**
   * @description Manipula a alteração dos inputs do tipo `range` injetando
   * valores numéricos válidos no estado da simulação.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSimulacao(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  /**
   * Parâmetros de segurança e limites de UI para o simulador divididos por cenário.
   */
  const defaultParams = {
    total_vacas: { min: 10, max: 500, step: 1, fronteiras_cenario: null as any },
    vacas_lactacao: { min: 0, max: 500, step: 1, fronteiras_cenario: null as any },
    producao_vaca: { min: 5, max: 60, step: 0.5, fronteiras_cenario: null as any },
    preco_recebido: { min: 1.0, max: 6.0, step: 0.05, fronteiras_cenario: null as any },
    ccs: { min: 50, max: 1000, step: 10, fronteiras_cenario: null as any },
    area_atividade: { min: 1, max: 1000, step: 0.5, fronteiras_cenario: null as any },
    custo_concentrado: { min: 0.5, max: 6.0, step: 0.05, fronteiras_cenario: null as any },
    numero_trabalhadores: { min: 1, max: 50, step: 1, fronteiras_cenario: null as any }
  };

  type ParamKey = keyof typeof defaultParams;

  const getParam = (chave: ParamKey) => {
    const painel = resultadoSimulacao?.parametros_painel;
    if (painel?.[chave]?.[cenarioAtivo]) {
      return painel[chave][cenarioAtivo];
    }
    return defaultParams[chave];
  };

  const pTotalVacas = getParam('total_vacas');
  const pVacasLactacao = getParam('vacas_lactacao');
  const pProducaoVaca = getParam('producao_vaca');
  const pPrecoRecebido = getParam('preco_recebido');
  const pCcs = getParam('ccs');
  const pAreaAtividade = getParam('area_atividade');
  const pCustoConcentrado = getParam('custo_concentrado');
  const pNumeroTrabalhadores = getParam('numero_trabalhadores');

  /**
   * Renderiza a etiqueta do campo com ícone de alerta caso o valor 
   * esteja fora da fronteira do cenário atual.
   */
  const renderLabel = (chave: ParamKey, titulo: string, valorFormatado: React.ReactNode, isFirstItem: boolean = false) => {
    const param = getParam(chave);
    let warning = null;
    if (param.fronteiras_cenario) {
      const val = simulacao[chave];
      if (val < param.fronteiras_cenario.limite_inferior) {
          warning = `Atenção: Simulação com valores atipicamente baixos para o grupo do cenário ${cenarioAtivo}.`;
      } else if (val > param.fronteiras_cenario.limite_superior) {
          warning = `Com este volume, os seus resultados aproximam-se de um cenário superior. Considere mudar o seu cenário base para uma comparação ideal.`;
      }
    }

    return (
      <label htmlFor={chave} className="text-sm font-semibold text-gray-700 flex justify-between items-center">
        <span className="flex items-center gap-1.5">
          {titulo}
          {warning && (
            <div className="relative flex items-center group cursor-help">
              <span className="text-yellow-500 text-sm leading-none" aria-label="Alerta">⚠️</span>
                      <div className={`absolute left-0 sm:left-1/2 sm:-translate-x-1/2 ${isFirstItem ? 'top-full mt-2' : 'bottom-full mb-2'} hidden group-hover:block w-48 p-2 bg-gray-800 text-white text-[10px] font-normal rounded shadow-lg z-50 text-center pointer-events-none`}>
                {warning}
                        <div className={`absolute left-4 sm:left-1/2 sm:-translate-x-1/2 border-4 border-transparent ${isFirstItem ? '-top-2 border-b-gray-800' : '-bottom-2 border-t-gray-800'}`}></div>
              </div>
            </div>
          )}
        </span>
        <span className="text-primary">{valorFormatado}</span>
      </label>
    );
  };

  /**
   * @description Determina a cor do slider baseado nas fronteiras do cenário.
   * Altera a cor de destaque (accent) caso o valor entre nas margens de transbordo (queda ou subida).
   * @param chave A chave do parâmetro que está sendo avaliado.
   * @returns A classe do Tailwind correspondente à cor da barra.
   */
  const getSliderColorClass = (chave: ParamKey) => {
    const param = getParam(chave);
    if (!param.fronteiras_cenario) return 'accent-primary';
    const val = simulacao[chave];
    if (val < param.fronteiras_cenario.limite_inferior || val > param.fronteiras_cenario.limite_superior) return 'accent-orange-500';
    return 'accent-primary';
  };

  /**
   * @description Função genérica para renderizar as sessões de gráficos.
   * Alimenta os gráficos comparativos diretamente da resposta do BFF.
   */
  const renderMetricCards = (metricas: any[]) => {
    return metricas.map((item: any) => {
      const valorSimulado = item.valor_produtor ?? 0;

      const cenarioRef = item.cenarios?.[cenarioAtivo];
      const valorReferencia = cenarioRef?.valor || 0;
      const inverter = item.direcao_otimizacao === 'menor_melhor';
      
      return (
        <div key={item.metrica} className="relative h-full">
          {isSimulando && (
            <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[2px] rounded-xl flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
          )}
          <BarChartSimulacao 
            titulo={item.titulo_grafico} 
            valorSimulado={valorSimulado}
            valorReferencia={valorReferencia}
            unidade=""
            inverterCores={inverter}
          />
        </div>
      );
    });
  };

  if (!dadosFazenda) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8">
        <div className="text-center text-red-500 font-bold text-2xl mb-4">Nenhum dado encontrado.</div>
        <p className="text-gray-600 mb-8 text-center max-w-md">Por favor, preencha o formulário inicial para gerar um diagnóstico antes de tentar simular cenários.</p>
        <Link href="/formulario" className="bg-primary hover:bg-[#003e7d] text-white font-bold py-3 px-8 rounded-lg shadow-md transition duration-200">
          Ir para Coleta de Dados
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* PAINEL ESQUERDO: CONTROLES (Inputs & Sliders) */}
        <aside className="w-full lg:w-80 flex-shrink-0 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col h-max sticky top-8">
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" /> Variáveis
              </h2>
              <p className="text-xs text-gray-500 mt-1">Ajuste os valores para simular.</p>
            </div>
            <button
              onClick={restaurarValoresOriginais}
              className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-full transition-colors"
              title="Restaurar valores originais"
            >
              <RotateCcw size={20} />
            </button>
          </div>

          <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            
            {/* Controle: Total de Vacas */}
            <div>
              {renderLabel('total_vacas', 'Total de Vacas', simulacao.total_vacas, true)}
              <input 
                id="total_vacas" name="total_vacas" type="range" 
                min={pTotalVacas.min} max={pTotalVacas.max} step={pTotalVacas.step} 
                value={simulacao.total_vacas} onChange={handleChange}
                className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2 transition-colors ${getSliderColorClass('total_vacas')}`}
              />
            </div>

            {/* Controle: Vacas em Lactação */}
            <div>
              {renderLabel('vacas_lactacao', 'Vacas em Lactação', simulacao.vacas_lactacao)}
              <input 
                id="vacas_lactacao" name="vacas_lactacao" type="range" 
                min={pVacasLactacao.min} max={simulacao.total_vacas} step={pVacasLactacao.step} 
                value={simulacao.vacas_lactacao} onChange={handleChange}
                className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2 transition-colors ${getSliderColorClass('vacas_lactacao')}`}
              />
            </div>

            {/* Controle: Produção por Vaca */}
            <div>
              {renderLabel('producao_vaca', 'Produção por Vaca', `${simulacao.producao_vaca} L`)}
              <input 
                id="producao_vaca" name="producao_vaca" type="range" 
                min={pProducaoVaca.min} max={pProducaoVaca.max} step={pProducaoVaca.step} 
                value={simulacao.producao_vaca} onChange={handleChange}
                className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2 transition-colors ${getSliderColorClass('producao_vaca')}`}
              />
            </div>

            {/* Controle: Preço do Leite */}
            <div>
              {renderLabel('preco_recebido', 'Preço do Leite', `R$ ${simulacao.preco_recebido.toFixed(2)}`)}
              <input 
                id="preco_recebido" name="preco_recebido" type="range" 
                min={pPrecoRecebido.min} max={pPrecoRecebido.max} step={pPrecoRecebido.step} 
                value={simulacao.preco_recebido} onChange={handleChange}
                className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2 transition-colors ${getSliderColorClass('preco_recebido')}`}
              />
            </div>

            {/* Controle: CCS */}
            <div>
              {renderLabel('ccs', 'CCS (x1000)', simulacao.ccs)}
              <input 
                id="ccs" name="ccs" type="range" 
                min={pCcs.min} max={pCcs.max} step={pCcs.step} 
                value={simulacao.ccs} onChange={handleChange}
                className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2 transition-colors ${getSliderColorClass('ccs')}`}
              />
            </div>

            {/* Controle: Área de Atividade */}
            <div>
              {renderLabel('area_atividade', 'Área (ha)', simulacao.area_atividade)}
              <input 
                id="area_atividade" name="area_atividade" type="range" 
                min={pAreaAtividade.min} max={pAreaAtividade.max} step={pAreaAtividade.step} 
                value={simulacao.area_atividade} onChange={handleChange}
                className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2 transition-colors ${getSliderColorClass('area_atividade')}`}
              />
            </div>

            {/* Controle: Custo do Concentrado */}
            <div>
              {renderLabel('custo_concentrado', 'Custo Concentrado', `R$ ${simulacao.custo_concentrado.toFixed(2)}`)}
              <input 
                id="custo_concentrado" name="custo_concentrado" type="range" 
                min={pCustoConcentrado.min} max={pCustoConcentrado.max} step={pCustoConcentrado.step} 
                value={simulacao.custo_concentrado} onChange={handleChange}
                className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2 transition-colors ${getSliderColorClass('custo_concentrado')}`}
              />
            </div>

            {/* Controle: Número de Trabalhadores */}
            <div>
              {renderLabel('numero_trabalhadores', 'Trabalhadores', simulacao.numero_trabalhadores)}
              <input 
                id="numero_trabalhadores" name="numero_trabalhadores" type="range" 
                min={pNumeroTrabalhadores.min} max={pNumeroTrabalhadores.max} step={pNumeroTrabalhadores.step} 
                value={simulacao.numero_trabalhadores} onChange={handleChange}
                className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2 transition-colors ${getSliderColorClass('numero_trabalhadores')}`}
              />
            </div>

            <button 
              onClick={executarSimulacao}
              disabled={isSimulando || tempoBloqueio > 0}
              className={`w-full py-3 mt-4 rounded-xl font-bold text-white transition-all shadow-md ${
                tempoBloqueio > 0 || isSimulando ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-[#003e7d]'
              }`}
            >
              {tempoBloqueio > 0 
                ? `Aguarde ${tempoBloqueio}s` 
                : isSimulando 
                  ? 'A Calcular...' 
                  : 'Analisar Cenário (ML)'}
            </button>
          </div>
        </aside>

        {/* PAINEL DIREITO: TABS E GRÁFICOS */}
        <section className="flex-1 flex flex-col">
          
          {/* Topo: Tabs de Cenário Educampo */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex gap-2 mb-6 w-max mx-auto">
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

          {isSimulando && !resultadoSimulacao?.simulacao ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col h-64 items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gray-50 opacity-50"></div>
                  <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                  <span className="text-sm font-bold text-gray-400">Projetando cenários...</span>
                </div>
              ))}
            </div>
          ) : resultadoSimulacao?.simulacao ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
              {renderMetricCards([
                ...resultadoSimulacao.simulacao.estaticas,
                ...resultadoSimulacao.simulacao.operacionais,
                ...resultadoSimulacao.simulacao.financeiras
              ])}
            </div>
          ) : (
             <div className="flex justify-center items-center h-64 text-gray-400">Aguardando dados...</div>
          )}
        </section>

      </main>
    </div>
  );
}