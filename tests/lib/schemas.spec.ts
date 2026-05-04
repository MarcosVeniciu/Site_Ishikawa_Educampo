/**
 * @fileoverview Suíte de testes unitários para os schemas de validação do Zod.
 * @description
 * Esta suíte garante que a validação de entrada de dados da fazenda funcione como uma malha fina.
 * Como o código se adapta aos testes, as asserções aqui definem como a função `parse` do Zod
 * deve aceitar objetos que cumpram as regras zootécnicas e rejeitar (lançando erros) objetos
 * com valores fora da realidade, como números negativos, limites estourados ou inconsistências cruzadas.
 */

import { fazendaSchema } from '../../src/lib/schemas';

describe('Validações Zod: fazendaSchema', () => {
  const dadosValidos = {
    nomeFazenda: 'Fazenda Leiteira Experimental',
    sistemaProducao: 'compost barn',
    totalVacas: 100,
    vacasLactacao: 85,
    animaisRebanho: 120,
    areaAtividade: 10.0,
    maoObraTotal: 2,
    producaoVaca: 35.0,
    precoLeite: 3.20,
    precoRegional: 2.50,
    ccs: 150,
    regiao: 'triangulo',
  };

  /**
   * @description Testa o caminho feliz (Happy Path). Se o schema estiver correto, 
   * o método `.parse()` retornará o próprio objeto sem lançar exceções.
   */
  it('deve aceitar um objeto de dados completamente válido', () => {
    expect(() => fazendaSchema.parse(dadosValidos)).not.toThrow();
  });

  /**
   * @description Injeta uma string contendo 101 caracteres no campo nomeFazenda.
   * O Zod deve identificar o excesso e lançar um ZodError, validando a proteção contra abusos no banco.
   */
  it('deve rejeitar nome da fazenda com mais de 100 caracteres', () => {
    const dadosInvalidos = { ...dadosValidos, nomeFazenda: 'A'.repeat(101) };
    expect(() => fazendaSchema.parse(dadosInvalidos)).toThrow();
  });

  /**
   * @description Injeta um valor negativo em um campo financeiro (precoLeite).
   * O método deve lançar um erro provando que a aplicação não aceitará prejuízos matemáticos irreais.
   */
  it('deve rejeitar valores negativos em campos estritamente positivos', () => {
    const dadosInvalidos = { ...dadosValidos, precoLeite: -1.5 };
    expect(() => fazendaSchema.parse(dadosInvalidos)).toThrow();
  });

  /**
   * @description Testa a lógica zootécnica cruzada (Super Refine do Zod).
   * Define vacasLactacao (110) maior que totalVacas (100). O schema deve barrar a inconsistência.
   */
  it('deve rejeitar vacas em lactação maior que o total de vacas (Regra Cruzada)', () => {
    const dadosInvalidos = { ...dadosValidos, totalVacas: 100, vacasLactacao: 110 };
    expect(() => fazendaSchema.parse(dadosInvalidos)).toThrow();
  });

  /**
   * @description Avalia a hierarquia de rebanho. O número total de vacas (100)
   * não pode superar o total de animais do rebanho (90).
   */
  it('deve rejeitar total de vacas maior que o total do rebanho (Regra Cruzada)', () => {
    const dadosInvalidos = { ...dadosValidos, totalVacas: 100, animaisRebanho: 90 };
    expect(() => fazendaSchema.parse(dadosInvalidos)).toThrow();
  });

  /**
   * @description Fornece strings não tabeladas ('pastagem' e 'capital').
   * O Zod deve lançar erro garantindo o funcionamento estrito dos Enums definidos pela API.
   */
  it('deve rejeitar sistemas de produção ou regiões fora do Enum permitido', () => {
    const dadosInvalidos = { ...dadosValidos, sistemaProducao: 'pastagem', regiao: 'capital' };
    expect(() => fazendaSchema.parse(dadosInvalidos)).toThrow();
  });
});