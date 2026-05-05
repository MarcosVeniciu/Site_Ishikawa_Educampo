/**
 * @fileoverview Suíte de testes unitários para o gerenciamento de estado da Fazenda (Zustand).
 * @description
 * Valida os métodos de mutação da store global. O Zustand é manipulado no ambiente Node (JSDOM)
 * simulando o que os componentes visuais fariam. Testa-se a injeção correta de dados preenchidos 
 * pelo formulário e o método de limpeza (reset) da sessão.
 */

import { useFazendaStore } from '../../src/store/useFazendaStore';

describe('Zustand Store: useFazendaStore', () => {
  const dadosMock = {
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

  const mockDiagnostico = {
    resumo_geral: {
      visao_global: "Fazenda com bom potencial, mas requer ajustes.",
      prioridades: ["Reduzir CCS", "Aumentar produção por vaca"],
      proximos_passos: "Revisar rotina de ordenha."
    },
    diagrama_ishikawa: {
      ccs: { mao_de_obra: ["Falta de treinamento na ordenha"] }
    }
  };

  /**
   * @description Limpa o estado global antes de cada teste para garantir isolamento.
   * Utiliza o método `getState().limparDados()` da própria store.
   */
  beforeEach(() => {
    useFazendaStore.getState().limparDados();
  });

  /**
   * @description Verifica o estado inicial da store logo após ser instanciada.
   * O objeto de dados deve ser estritamente nulo, indicando ausência de informações de sessão.
   */
  it('deve iniciar com os dados da fazenda vazios (null)', () => {
    const estado = useFazendaStore.getState();
    expect(estado.dadosFazenda).toBeNull();
    expect(estado.diagnostico).toBeNull();
  });

  /**
   * @description Simula a ação de submissão do formulário na tela de coleta.
   * Chama a função mutadora `setDadosFazenda` injetando o objeto e avalia se o estado o absorveu.
   */
  it('deve armazenar os dados da fazenda corretamente via setDadosFazenda', () => {
    useFazendaStore.getState().setDadosFazenda(dadosMock as any);
    
    const estadoAtual = useFazendaStore.getState();
    expect(estadoAtual.dadosFazenda).toEqual(dadosMock);
    expect(estadoAtual.dadosFazenda?.nomeFazenda).toBe('Fazenda Leiteira Experimental');
  });

  /**
   * @description Simula o armazenamento da resposta do BFF.
   */
  it('deve armazenar os dados do diagnóstico corretamente via setDiagnostico', () => {
    useFazendaStore.getState().setDiagnostico(mockDiagnostico as any);
    
    const estadoAtual = useFazendaStore.getState();
    expect(estadoAtual.diagnostico).toEqual(mockDiagnostico);
  });

  /**
   * @description Avalia a mecânica de prevenção de vazamento de estado.
   * Primeiro injeta dados, depois aciona a limpeza e verifica se a referência volta a ser null.
   */
  it('deve resetar o estado quando limparDados for chamado', () => {
    const store = useFazendaStore.getState();
    
    store.setDadosFazenda(dadosMock as any);
    store.setDiagnostico(mockDiagnostico as any);
    expect(useFazendaStore.getState().dadosFazenda).not.toBeNull();
    expect(useFazendaStore.getState().diagnostico).not.toBeNull();
    
    store.limparDados();
    expect(useFazendaStore.getState().dadosFazenda).toBeNull();
    expect(useFazendaStore.getState().diagnostico).toBeNull();
  });
});