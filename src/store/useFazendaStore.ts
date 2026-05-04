/**
 * @fileoverview Gerenciamento de estado global utilizando Zustand.
 * @description
 * Esta store é responsável por manter a persistência em memória dos dados da fazenda
 * preenchidos pelo produtor. Ela atua como a única fonte de verdade para os dados
 * que serão enviados ao BFF e posteriormente renderizados no Dashboard e no Diagrama de Ishikawa.
 */

import { create } from 'zustand';
import { FazendaFormData } from '../lib/schemas';

/**
 * Interface que define a estrutura do estado da fazenda e suas ações.
 */
interface FazendaState {
  /** Dados preenchidos no formulário de coleta. */
  dadosFazenda: FazendaFormData | null;
  /** Define os dados da fazenda no estado global. */
  setDadosFazenda: (dados: FazendaFormData) => void;
  /** Reseta a store para o estado inicial (limpeza de sessão). */
  limparDados: () => void;
}

/**
 * Hook customizado useFazendaStore.
 * @description
 * Implementa a store com suporte a mutações simples e seguras.
 */
export const useFazendaStore = create<FazendaState>((set) => ({
  dadosFazenda: null,

  setDadosFazenda: (dados) => {
    /**
     * @description Atualiza o estado global com os novos dados validados.
     */
    set({ dadosFazenda: dados });
  },

  limparDados: () => {
    /**
     * @description Garante a limpeza agressiva de estado para segurança e logout.
     */
    set({ dadosFazenda: null });
  },
}));