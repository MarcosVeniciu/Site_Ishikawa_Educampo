/**
 * @file tests/api/ping.spec.ts
 * @description Contrato de testes para o Proxy BFF do endpoint de Ping.
 * Garante o comportamento fire-and-forget e a tolerância a falhas na ativação da nuvem.
 */

import { GET } from '@/app/api/ping/route';
import { NextRequest, NextResponse } from 'next/server';

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

  const mockRequest = {
    headers: {
      get: jest.fn().mockReturnValue('127.0.0.1')
    }
  } as unknown as NextRequest;

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
    const response = await GET(mockRequest);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.message).toBe('API acordou com sucesso');
    expect(global.fetch).toHaveBeenCalledWith(`${process.env.API_BASE_URL}/api/ping`, expect.objectContaining({
      headers: { 'X-Forwarded-For': '127.0.0.1' }
    }));
  });

  it('deve retornar o status real se a API externa devolver um erro (ex: 429)', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 429 });
    const response = await GET(mockRequest);
    expect(response.status).toBe(429);
  });

  it('deve retornar 503 se houver falha de rede (container desligado)', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network timeout'));
    const response = await GET(mockRequest);
    expect(response.status).toBe(503);
  });

  it('deve retornar 500 se API_BASE_URL não estiver configurada', async () => {
    delete process.env.API_BASE_URL;
    const response = await GET(mockRequest);
    expect(response.status).toBe(500);
  });
});