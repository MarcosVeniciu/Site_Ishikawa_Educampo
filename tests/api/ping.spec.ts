/**
 * @file tests/api/ping.spec.ts
 * @description Contrato de testes para o Proxy BFF do endpoint de Ping.
 * Garante o comportamento fire-and-forget e a tolerância a falhas na ativação da nuvem.
 */

import { GET } from '@/app/api/ping/route';
import { NextResponse } from 'next/server';

// Mock da NextResponse
jest.mock('next/server', () => ({
  NextResponse: class MockNextResponse {
    static json(body: any, init?: { status?: number }) {
      return { status: init?.status || 200, json: async () => body };
    }
  },
}));

global.fetch = jest.fn();

describe('BFF Route: GET /api/ping', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.API_BASE_URL = 'https://api-fake-educampo.com';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('deve repassar o ping com sucesso para a API externa', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
    const response = await GET();
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.message).toBe('Ping repassado à API com sucesso');
    expect(global.fetch).toHaveBeenCalledWith(`${process.env.API_BASE_URL}/api/ping`, expect.any(Object));
  });

  it('deve engolir falhas de rede (timeout) e retornar 200 para não quebrar o frontend', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network timeout'));
    const response = await GET();
    expect(response.status).toBe(200); // Retorna 200 mesmo com falha no fetch
  });

  it('deve retornar 500 se API_BASE_URL não estiver configurada', async () => {
    delete process.env.API_BASE_URL;
    const response = await GET();
    expect(response.status).toBe(500);
  });
});