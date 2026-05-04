/**
 * @file tests/components/formulario.spec.tsx
 * @description Suíte de testes (A Lei) para a Tela de Coleta de Dados.
 * * COMO FUNCIONA:
 * 1. Mocking: Simulamos o roteador do Next.js (useRouter) e o estado global (useFazendaStore)
 * para isolar o teste puramente na lógica do componente de formulário.
 * 2. Teste de Renderização: Verifica se as categorias visuais e os inputs vitais baseados
 * na UI designada estão acessíveis na árvore do DOM.
 * 3. Teste de Validação (Zod): Simula um clique no botão "Avançar" com o formulário vazio
 * para garantir que a interface bloqueie a submissão e exiba os alertas de erro.
 * 4. Teste de Mutação de Estado: Preenche o formulário com dados válidos, submete e atesta
 * se a função `setDadosFazenda` do Zustand foi acionada com o payload exato, seguido
 * do redirecionamento para a rota `/carregando`.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormularioPage from '@/app/formulario/page';
import { useFazendaStore } from '@/store/useFazendaStore';
import { useRouter } from 'next/navigation';

// Mock do roteador do Next.js
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock do Zustand Store
jest.mock('@/store/useFazendaStore', () => ({
  useFazendaStore: jest.fn(),
}));

describe('Tela de Coleta de Dados (Formulário)', () => {
  const mockPush = jest.fn();
  const mockSetDadosFazenda = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configura o mock do router para escutar redirecionamentos
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    // Configura o mock do Zustand para fornecer a função de injeção de estado
    (useFazendaStore as unknown as jest.Mock).mockImplementation((selector) => {
      const mockedState = { setDadosFazenda: mockSetDadosFazenda };
      // Se o componente usar um seletor, nós o executamos passando o estado simulado
      return selector ? selector(mockedState) : mockedState;
    });
  });

  it('deve renderizar os grupos de campos e inputs essenciais da interface', () => {
    render(<FormularioPage />);

    // Verifica a presença dos cabeçalhos de seção
    expect(screen.getByText(/Informações Gerais/i)).toBeInTheDocument();
    expect(screen.getByText(/Estrutura e Rebanho/i)).toBeInTheDocument();
    expect(screen.getByText(/Produção e Qualidade/i)).toBeInTheDocument();

    // Verifica a presença de inputs baseados em suas labels associadas
    expect(screen.getByLabelText(/Nome da Fazenda/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sistema de Produção/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Total de Vacas/i)).toBeInTheDocument();
  });

  it('deve bloquear a submissão e exibir erros do Zod quando os dados forem inválidos', async () => {
    const user = userEvent.setup();
    render(<FormularioPage />);

    // Clica em submeter sem preencher nada
    const botaoAvancar = screen.getByRole('button', { name: /Avançar/i });
    await user.click(botaoAvancar);

    // Aguarda a renderização das mensagens de erro (validação em tempo real)
    await waitFor(() => {
      // Verifica se a função de salvar no Zustand NÃO foi chamada
      expect(mockSetDadosFazenda).not.toHaveBeenCalled();
      
      // Verifica se as mensagens de erro apareceram na tela
      // Nota: Os textos exatos dependerão das mensagens configuradas no Zod schema
      expect(screen.getAllByText(/Obrigatório|Inválido/i).length).toBeGreaterThan(0);
    });
  });

  it('deve injetar os dados no estado global e redirecionar ao submeter corretamente', async () => {
    const user = userEvent.setup();
    render(<FormularioPage />);

    // Preenche as Informações Gerais
    await user.type(screen.getByLabelText(/Nome da Fazenda/i), 'Fazenda Leiteira Experimental');
    
    // O select nativo ou componente de UI sendo alterado
    const sistemaSelect = screen.getByLabelText(/Sistema de Produção/i);
    await user.selectOptions(sistemaSelect, 'semi confinado');

    // Preenche Estrutura e Rebanho
    await user.type(screen.getByLabelText(/Total de Vacas/i), '100');
    await user.type(screen.getByLabelText(/Vacas em Lactação/i), '85');
    await user.type(screen.getByLabelText(/Total de Animais no Rebanho/i), '150');
    await user.type(screen.getByLabelText(/Área da Atividade/i), '200');
    await user.type(screen.getByLabelText(/Mão de Obra Total/i), '3');

    // Preenche Produção e Qualidade (e Região)
    await user.type(screen.getByLabelText(/Produção por Vaca/i), '35');
    await user.type(screen.getByLabelText(/Preço do Leite/i), '3.20');
    await user.type(screen.getByLabelText(/Preço de Referência/i), '2.50');
    await user.type(screen.getByLabelText(/CCS/i), '150');
    
    const regiaoSelect = screen.getByLabelText(/Região/i);
    await user.selectOptions(regiaoSelect, 'triangulo');

    // Submete o formulário
    const botaoAvancar = screen.getByRole('button', { name: /Avançar/i });
    await user.click(botaoAvancar);

    // Aguarda a promessa do formulário e validações
    await waitFor(() => {
      // Verifica se o Zustand foi chamado com os dados corretos (tipados pelo schema)
      expect(mockSetDadosFazenda).toHaveBeenCalledWith(expect.objectContaining({
        nomeFazenda: 'Fazenda Leiteira Experimental',
        sistemaProducao: 'semi confinado',
        totalVacas: 100,
        vacasLactacao: 85,
      }));

      // Verifica se o usuário foi redirecionado para a tela de espera da API
      expect(mockPush).toHaveBeenCalledWith('/carregando');
    });
  });
});