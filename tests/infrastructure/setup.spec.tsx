/**
 * @file setup.spec.tsx
 * @description Teste de Sanidade (Smoke Test) da Infraestrutura de Testes.
 * * COMO FUNCIONA:
 * 1. Este teste atua como o "primeiro veredito" do tribunal, verificando se a 
 * integração entre Jest, React Testing Library (v16+) e JSDOM está funcional.
 * 2. Ele renderiza um componente React 19 simplificado para garantir que o 
 * processamento de JSX e a simulação do DOM não possuem erros de configuração.
 */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

const TestComponent = () => (
  <div>
    <h1>Tribunal Operacional</h1>
    <p>Infraestrutura pronta para a Lei do Projeto.</p>
  </div>
);

describe('Infraestrutura de Testes', () => {
  /**
   * @description Valida se o Jest consegue realizar asserções lógicas básicas.
   */
  it('deve validar que o motor Jest está ativo', () => {
    expect(true).toBe(true);
  });

  /**
   * @description Valida a renderização de componentes React 19 no ambiente virtual.
   */
  it('deve renderizar componentes e detectar elementos no JSDOM', () => {
    render(<TestComponent />);
    expect(screen.getByText(/Tribunal Operacional/i)).toBeInTheDocument();
  });
});