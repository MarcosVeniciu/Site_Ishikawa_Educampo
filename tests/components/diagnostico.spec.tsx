/**
 * @file diagnostico.spec.tsx
 * @description Suíte de testes de contrato para o Hub Central de Diagnóstico.
 * Valida a renderização do Benchmarking (indicadores macro), o comportamento da Navbar
 * e a lógica interativa da metodologia de Ishikawa baseada em abas.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DiagnosticoPage from '../../src/app/diagnostico/page';
import { useFazendaStore } from '../../src/store/useFazendaStore';
import { useRouter } from 'next/navigation';

// Mock do Zustand para isolar os testes do componente visual
jest.mock('../../src/store/useFazendaStore', () => ({
  useFazendaStore: jest.fn(),
}));

// Mock do Next.js Router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('Feature: Hub Central de Diagnóstico', () => {
  const mockPush = jest.fn();

  const mockStoreEmpty = {
    dadosFazenda: {
      producao_vaca: 35.0,
      ccs: 150,
      preco_leite: 3.20,
      preco_referencia: 3.00,
    },
    diagnosticoIA: null,
  };

  const mockStorePopulated = {
    dadosFazenda: {
      producao_vaca: 35.0,
      ccs: 150,
      preco_leite: 3.20,
      preco_referencia: 3.00,
    },
    diagnosticoIA: {
      resumo: "Sua fazenda apresenta excelente qualidade de leite, mas há gargalos na alimentação.",
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
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  describe('Visão Macro (Benchmarking e Navbar)', () => {
    it('deve renderizar os indicadores da fazenda a partir da store', async () => {
      (useFazendaStore as unknown as jest.Mock).mockReturnValue(mockStorePopulated);
      render(<DiagnosticoPage />);
      
      await waitFor(() => {
        expect(screen.getByText('35.0 L/dia')).toBeInTheDocument();
        expect(screen.getByText('CCS: 150')).toBeInTheDocument();
      });
    });

    it('deve calcular e exibir o status de benchmark temporário corretamente', async () => {
      (useFazendaStore as unknown as jest.Mock).mockReturnValue(mockStorePopulated);
      render(<DiagnosticoPage />);
      
      await waitFor(() => {
        // Produção >= 30, CCS <= 200, Preço Recebido > Preço Referência
        expect(screen.getByText(/Acima da Média/i)).toBeInTheDocument();
        expect(screen.getByText(/Excelente/i)).toBeInTheDocument();
        expect(screen.getByText(/Competitivo/i)).toBeInTheDocument();
      });
    });

    it('deve abrir o menu suspenso ao clicar no ícone hamburger e exibir os atalhos corretos', async () => {
      (useFazendaStore as unknown as jest.Mock).mockReturnValue(mockStorePopulated);
      render(<DiagnosticoPage />);
      
      const menuButton = await screen.findByRole('button', { name: /abrir menu/i });
      fireEvent.click(menuButton);
      
      expect(screen.getByText(/Diagnóstico/i)).toBeVisible();
      expect(screen.getByText(/Simulações/i)).toBeVisible();
      expect(screen.getByText(/Dados Fazendas/i)).toBeVisible(); // Atualizado de Configurações
    });
  });

  describe('Visão Micro (Diagrama de Ishikawa)', () => {
    it('deve renderizar mensagem orientativa se não houver diagnóstico processado', () => {
      (useFazendaStore as unknown as jest.Mock).mockReturnValue(mockStoreEmpty);
      render(<DiagnosticoPage />);
      
      expect(screen.getByText(/Selecione um indicador para visualizar o diagnóstico/i)).toBeInTheDocument();
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
      
      expect(screen.getByText('O CCS está acima do limite recomendado.')).toBeInTheDocument();
      expect(screen.getAllByText('Falta de treinamento na ordenha')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Vácuo desregulado')[0]).toBeInTheDocument();
    });

    it('deve substituir os cards e análise dinamicamente ao clicar em outra aba', () => {
      (useFazendaStore as unknown as jest.Mock).mockReturnValue(mockStorePopulated);
      render(<DiagnosticoPage />);
      
      const btnPreco = screen.getByRole('button', { name: /Preço do Leite/i });
      fireEvent.click(btnPreco);
      
      expect(screen.queryByText('O CCS está acima do limite recomendado.')).not.toBeInTheDocument();
      expect(screen.getByText('Preço acima da média da região.')).toBeInTheDocument();
      expect(screen.queryByText('Vácuo desregulado')).not.toBeInTheDocument();
      expect(screen.getAllByText('Boa negociação com laticínio')[0]).toBeInTheDocument();
    });
  });
});