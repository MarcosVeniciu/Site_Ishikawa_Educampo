/**
 * @fileoverview Definição de esquemas de validação robustos utilizando Zod.
 * @description
 * Este arquivo centraliza a lógica de validação de entrada de dados do sistema.
 * Utilizamos o Zod para garantir tipagem estática e validação em tempo de execução,
 * aplicando regras zootécnicas e limites de segurança (malha fina) para evitar
 * inconsistências nos cálculos do Diagrama de Ishikawa.
 */

import { z } from 'zod';

/**
 * Enum para os sistemas de produção suportados pela API.
 */
export const SistemaProducaoEnum = z.enum(['compost barn', 'confinado', 'semi confinado']);

/**
 * Enum para as regiões geográficas mapeadas pelo SEBRAE/Educampo.
 */
export const RegiaoEnum = z.enum([
  'triangulo',
  'rio doce e vale do aco',
  'noroeste e alto paranaiba',
  'centro',
  'centro-oeste e sudoeste',
  'sul',
  'norte',
  'zona da mata e vertentes',
  'jequitinhonha e mucuri',
]);

/**
 * Schema principal para os dados da fazenda.
 * @description
 * Aplica limites superiores e inferiores para prevenir erros de digitação e
 * utiliza superRefine para validações cruzadas entre campos (ex: lactação vs total).
 */
export const fazendaSchema = z.object({
  nomeFazenda: z.string()
    .min(1, 'O nome da fazenda é obrigatório')
    .max(100, 'O nome deve ter no máximo 100 caracteres'),
  
  sistemaProducao: SistemaProducaoEnum,
  
  totalVacas: z.number().int().min(0).max(50000),
  
  vacasLactacao: z.number().int().min(0).max(50000),
  
  animaisRebanho: z.number().int().min(0).max(100000),
  
  areaAtividade: z.number().min(0.1, 'A área mínima é 0.1 ha').max(50000),
  
  maoObraTotal: z.number().int().min(1, 'Mínimo de 1 trabalhador').max(1000),
  
  producaoVaca: z.number().min(0).max(100),
  
  precoLeite: z.number().min(0).max(15),
  
  precoRegional: z.number().min(0).max(15),
  
  ccs: z.number().int().min(0).max(9999),
  
  regiao: RegiaoEnum,
}).superRefine((data, ctx) => {
  /**
   * Validação Cruzada: Vacas em Lactação não pode ser maior que o Total de Vacas.
   */
  if (data.vacasLactacao > data.totalVacas) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Vacas em lactação não pode exceder o total de vacas',
      path: ['vacasLactacao'],
    });
  }

  /**
   * Validação Cruzada: Total de Vacas não pode ser maior que o Rebanho Total.
   */
  if (data.totalVacas > data.animaisRebanho) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'O total de vacas não pode exceder o total do rebanho',
      path: ['totalVacas'],
    });
  }
});

/**
 * Tipo TypeScript extraído automaticamente do Schema do Zod.
 */
export type FazendaFormData = z.infer<typeof fazendaSchema>;