/**
 * @file src/types/diagnostico.ts
 * @description Definições de tipos centralizadas para o ecossistema de Diagnóstico.
 * Garante a integridade dos dados entre a resposta da IA (BFF), o Zustand e a Interface.
 */

export type StatusComparacao = 'positivo' | 'neutro' | 'negativo' | 'alerta';
export type SeveridadeCausa = 'critica' | 'atencao' | 'monitorar' | 'neutra';

export interface BenchmarkingCardData {
  titulo: string;
  valor_produtor: number | string;
  valor_referencia?: number | string;
  unidade?: string;
  status_comparacao?: StatusComparacao;
  mensagem_curta?: string;
  mensagem_detalhada: string;
}

export interface IshikawaItem {
  causa: string;
  pratica?: string;
  severidade?: SeveridadeCausa; // Adicionado para exibir as bolinhas coloridas (UX)
  analise?: string;             // Adicionado para tooltip/justificativa no Modal
}

export interface IshikawaCategorias {
  mao_de_obra: IshikawaItem[];
  maquina: IshikawaItem[];
  meio_ambiente: IshikawaItem[];
  metodo: IshikawaItem[];
  medida: IshikawaItem[];
  material: IshikawaItem[];
}

export interface ImpactThresholds {
  bom?: string;
  regular?: string;
  critico?: string;
  valor?: number;
  unidade?: string;
}

export interface IndicadorData {
  status: 'bom' | 'regular' | 'critico';
  impacto_pilares?: Record<string, number>; // Novo: % de peso de cada pilar para UI futura
  causas?: IshikawaItem[];                  
  ishikawa?: IshikawaCategorias;            
  textos_analise?: string;
  fatores_impacto?: Record<string, ImpactThresholds>;
  unidade?: string;
  thresholds?: ImpactThresholds;
  valor_atual?: number | string;
  ranking?: string[];
}

export interface ResumoGeral {
  visao_geral: string;
  prioridades: string[];
  proximos_passos: string[];
}

export interface DiagnosticoIAResponse {
  resumo_geral?: ResumoGeral;
  resumo?: string; // Fallback temporário para versões anteriores
  benchmarking: BenchmarkingCardData[];
  indicadores?: Record<string, IndicadorData>;
}