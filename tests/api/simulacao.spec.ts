/**
 * @file tests/api/simulacao.spec.ts
 * @description Contrato de testes para o Proxy BFF do endpoint de Simulação.
 * Garante o repasse correto do custo_concentrado e as proteções básicas de payload.
 */

import { POST } from '@/app/api/simulacao/route';
import { NextRequest } from 'next/server';

// Mock do next/server para o ambiente JSDOM
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    url: string;
    _body: any;
    constructor(url: string, options?: any) {
      this.url = url;
      this._body = options?.body ? JSON.parse(options.body) : null;
    }
    async json() { return this._body; }
  },
  NextResponse: class MockNextResponse {
    static json(body: any, init?: { status?: number }) {
      return { status: init?.status || 200, json: async () => body };
    }
  },
}));

global.fetch = jest.fn();

/**
 * @description Bloco de suítes de teste de contrato para a rota de simulação.
 * Valida fluxo positivo de repasse e a blindagem de payloads vazios.
 */
describe('BFF Route: POST /api/simulacao', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.API_BASE_URL = 'https://api-fake-educampo.com';
    process.env.API_TOKEN = 'token-fake-123';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  /**
   * @description Verifica o caminho feliz de submissão do formulário.
   * Assegura que todas as variáveis (inclusive custo_concentrado) estão compondo o body do fetch real.
   */
  it('deve processar o payload de simulação incluindo o custo_concentrado', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ resultado: 'simulacao_ok' }),
    });

    const payload = {
      nome_fazenda: 'Fazenda Simulador',
      producao_vaca: 38.0,
      custo_concentrado: 2.50
    };

    const req = new NextRequest('http://localhost:3000/api/simulacao', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.resultado).toBe('simulacao_ok');
    expect(global.fetch).toHaveBeenCalledWith(
      `${process.env.API_BASE_URL}/api/simulacao`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(payload)
      })
    );
  });

  /**
   * @description Teste de resiliência. Valida se o BFF evita gastos de tráfego/nuvem
   * bloqueando requisições sem o custo do concentrado já na borda da aplicação.
   */
  it('deve retornar erro 400 se custo_concentrado não for fornecido', async () => {
    const payload = { producao_vaca: 38.0 }; // Faltando o custo_concentrado

    const req = new NextRequest('http://localhost:3000/api/simulacao', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    const response = await POST(req);
    
    expect(response.status).toBe(400);
    expect(global.fetch).not.toHaveBeenCalled(); // Garante o bloqueio no BFF
  });
});