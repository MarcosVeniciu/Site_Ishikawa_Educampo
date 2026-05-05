/**
 * @file diagnostico.spec.tsx
 * @description Suíte de testes unitários para a Tela de Diagnóstico (Diagrama de Ishikawa).
 * Garante que a renderização dinâmica baseada em abas funcione corretamente e que 
 * os dados do Zustand sejam mapeados de forma fiel para o visual.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DiagnosticoPage from '../../src/app/diagnostico/page';
import { useFazendaStore } from '../../src/store/useFazendaStore';

// Mock do Zustand para isolar os testes do componente visual
jest.mock('../../src/store/useFazendaStore', () => ({
  useFazendaStore: jest.fn(),
}));

describe('Tela de Diagnóstico (Ishikawa)', () => {
  const mockStoreEmpty = {
    diagnosticoIA: null,
  };

  const mockStorePopulated = {
    diagnosticoIA: {
      ccs: {
        status: 'crítico',
        textos_analise: 'O CCS está acima do limite recomendado.',
        valor_atual: 500,
        ishikawa: {
          mao_de_obra: [{ causa: 'Falta de treinamento na ordenha', pratica: 'Treinar equipe mensalmente' }],
          maquina: [{ causa: 'Vácuo desregulado', pratica: 'Revisar equipamento a cada 6 meses' }],
          meio_ambiente: [{ causa: 'Excesso de barro' }],
          metodo: [{ causa: 'Não realização do pré-dipping' }],
          medida: [{ causa: 'Atraso no envio das amostras' }],
          material: [{ causa: 'Papel toalha de baixa qualidade' }]
        },
        ranking: ['Falta de treinamento na ordenha', 'Vácuo desregulado']
      },
      preco_leite: {
        status: 'bom',
        textos_analise: 'Preço acima da média da região.',
        valor_atual: 3.50,
        ishikawa: {
          mao_de_obra: [],
          maquina: [],
          meio_ambiente: [],
          metodo: [{ causa: 'Boa negociação com laticínio' }],
          medida: [],
          material: []
        },
        ranking: ['Boa negociação com laticínio']
      }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar mensagem de estado vazio se não houver diagnóstico', () => {
    (useFazendaStore as unknown as jest.Mock).mockReturnValue(mockStoreEmpty);
    render(<DiagnosticoPage />);
    
    expect(screen.getByText(/Nenhum diagnóstico encontrado/i)).toBeInTheDocument();
  });

  it('deve renderizar os botões (abas) dos 5 indicadores', () => {
    (useFazendaStore as unknown as jest.Mock).mockReturnValue(mockStorePopulated);
    render(<DiagnosticoPage />);
    
    expect(screen.getByRole('button', { name: /CCS/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Produção Média Diária/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Produção por Área/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Produção por Funcionário/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Preço do Leite/i })).toBeInTheDocument();
  });

  it('deve carregar o indicador CCS por padrão e renderizar suas causas nos cards', () => {
    (useFazendaStore as unknown as jest.Mock).mockReturnValue(mockStorePopulated);
    render(<DiagnosticoPage />);
    
    // Verifica se os dados do CCS (aba padrão) aparecem na tela
    expect(screen.getByText('O CCS está acima do limite recomendado.')).toBeInTheDocument();
    expect(screen.getAllByText('Falta de treinamento na ordenha')[0]).toBeInTheDocument(); // Causa Mão de Obra
    expect(screen.getAllByText('Vácuo desregulado')[0]).toBeInTheDocument(); // Causa Máquina
  });

  it('deve substituir os cards e análise dinamicamente ao clicar em outra aba', () => {
    (useFazendaStore as unknown as jest.Mock).mockReturnValue(mockStorePopulated);
    render(<DiagnosticoPage />);
    
    // Clica na aba "Preço do Leite"
    const btnPreco = screen.getByRole('button', { name: /Preço do Leite/i });
    fireEvent.click(btnPreco);
    
    // O texto de análise do CCS deve sumir e o do Preço deve aparecer
    expect(screen.queryByText('O CCS está acima do limite recomendado.')).not.toBeInTheDocument();
    expect(screen.getByText('Preço acima da média da região.')).toBeInTheDocument();
    
    // As causas do Ishikawa devem ser substituídas (Vácuo desregulado do CCS some)
    expect(screen.queryByText('Vácuo desregulado')).not.toBeInTheDocument();
    expect(screen.getAllByText('Boa negociação com laticínio')[0]).toBeInTheDocument();
  });

  it('deve abrir o modal ao clicar em um pilar e exibir a prática recomendada', () => {
    (useFazendaStore as unknown as jest.Mock).mockReturnValue(mockStorePopulated);
    render(<DiagnosticoPage />);
    
    // O modal não deve estar aberto inicialmente (a prática não deve estar visível)
    expect(screen.queryByText('Treinar equipe mensalmente')).not.toBeInTheDocument();
    
    // Clica no card de Mão de Obra
    fireEvent.click(screen.getByText('Mão de Obra'));
    
    // O modal abre e a prática deve aparecer
    expect(screen.getByText('Treinar equipe mensalmente')).toBeInTheDocument();
    
    // Fecha o modal clicando no botão "Fechar" (seleciona o primeiro, pois há o ícone 'X' e o botão de texto)
    const closeButtons = screen.getAllByRole('button', { name: /Fechar/i });
    fireEvent.click(closeButtons[0]);
    expect(screen.queryByText('Treinar equipe mensalmente')).not.toBeInTheDocument();
  });
});