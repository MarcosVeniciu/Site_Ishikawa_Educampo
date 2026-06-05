/**
 * @file src/lib/formatters.ts
 * @description Módulo de utilitários de formatação de valores numéricos e monetários.
 * Contém funções centralizadas para exibição de números utilizando o padrão brasileiro (pt-BR).
 */

/**
 * Formata um número de acordo com as especificações regionais brasileiras (pt-BR).
 *
 * Utiliza o separador de milhar "." (ponto) e o decimal "," (vírgula).
 *
 * Parameters
 * ----------
 * num : number
 *     O valor numérico a ser formatado.
 * minDecimals : number, optional
 *     O número mínimo de casas decimais (padrão é 0).
 * maxDecimals : number, optional
 *     O número máximo de casas decimais (padrão é 2).
 *
 * Returns
 * -------
 * string
 *     O número formatado em string utilizando o padrão de localização pt-BR.
 */
export function formatSidebarNumber(
  num: number,
  minDecimals: number = 0,
  maxDecimals: number = 2
): string {
  // Regra de Negócio: A formatação para o produtor rural brasileiro deve sempre usar ponto para milhar e vírgula para decimal.
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  });
}

/**
 * Formata valores numéricos para exibição padrão em diagnósticos.
 *
 * Parameters
 * ----------
 * val : any
 *     Valor bruto a ser formatado.
 *
 * Returns
 * -------
 * string
 *     O valor formatado ou string vazia se inválido.
 */
export function formatValor(val: any): string {
  if (val === undefined || val === null) return '';
  if (typeof val === 'number') {
    return val.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  }
  const num = Number(val);
  if (!isNaN(num) && String(val).trim() !== '') {
    return num.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  }
  return String(val);
}
