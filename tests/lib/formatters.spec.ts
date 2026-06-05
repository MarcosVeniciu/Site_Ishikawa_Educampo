/**
 * @file tests/lib/formatters.spec.ts
 * @description Suíte de testes unitários para os utilitários de formatação pt-BR.
 */

import { formatSidebarNumber, formatValor } from '@/lib/formatters';

describe('Utilitários de Formatação (formatters)', () => {
  describe('formatSidebarNumber', () => {
    it('deve formatar número inteiro sem casas decimais por padrão', () => {
      expect(formatSidebarNumber(1000)).toBe('1.000');
    });

    it('deve formatar número decimal com separador de milhar e vírgula', () => {
      expect(formatSidebarNumber(1000.5)).toBe('1.000,5');
    });

    it('deve respeitar limite mínimo de casas decimais', () => {
      expect(formatSidebarNumber(3, 2, 2)).toBe('3,00');
      expect(formatSidebarNumber(1250, 2, 2)).toBe('1.250,00');
    });

    it('deve respeitar limite máximo de casas decimais', () => {
      expect(formatSidebarNumber(85.456, 0, 2)).toBe('85,46');
    });
  });

  describe('formatValor', () => {
    it('deve retornar string vazia para valores nulos ou indefinidos', () => {
      expect(formatValor(null)).toBe('');
      expect(formatValor(undefined)).toBe('');
    });

    it('deve formatar números com até duas casas decimais no padrão brasileiro', () => {
      expect(formatValor(1500.5)).toBe('1.500,5');
      expect(formatValor(30.00)).toBe('30');
    });

    it('deve formatar strings numéricas válidas', () => {
      expect(formatValor('2500')).toBe('2.500');
      expect(formatValor(' 123.45 ')).toBe('123,45');
    });

    it('deve retornar a própria string se não for um número válido', () => {
      expect(formatValor('texto')).toBe('texto');
      expect(formatValor('--')).toBe('--');
    });
  });
});
