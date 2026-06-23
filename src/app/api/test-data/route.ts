/**
 * @file src/app/api/test-data/route.ts
 * @description Proxy BFF para as rotas de Fazendas de Teste.
 * Injeta de forma segura a chave de API (X-API-KEY) no lado do servidor
 * antes de repassar a requisição para o backend FastAPI.
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * @description Intercepta requisições GET para os dados de teste e realiza o proxy para o backend.
 * 
 * Domain Context:
 * Resolve a regra de segurança de não expor a X-API-KEY no frontend,
 * conforme definido nas rotas de integração de Mock Data (2026-06-19-mock-data-routes-integration).
 * 
 * @param {NextRequest} request - A requisição Next.js recebida do cliente.
 * @returns {Promise<NextResponse>} O payload JSON do backend ou um erro serializado.
 */
export async function GET(request: NextRequest) {
  try {
    // Fix (Segurança): Oculta a rota se a feature não estiver ativa
    if (process.env.NEXT_PUBLIC_ENABLE_TEST_FARMS !== 'true') {
      return NextResponse.json(
        { error: 'Endpoint desativado' },
        { status: 403 }
      );
    }
    const nome = request.nextUrl.searchParams.get('nome');
    const baseUrl = process.env.API_BASE_URL;
    const apiKey = process.env.API_TOKEN;

    if (!baseUrl || !apiKey) {
      console.error('[API Proxy] Variáveis de ambiente API_BASE_URL ou API_TOKEN ausentes.');
      return NextResponse.json(
        { error: 'Configurações da API não encontradas no servidor' },
        { status: 500 }
      );
    }

    // Fix (Segurança): Extrai o IP do cliente para repassar ao Rate Limiter do Backend
    // Nota: 'request.ip' foi removido no Next.js 15+, usamos apenas o header 'x-forwarded-for'
    const clientIp = request.headers.get('x-forwarded-for') || '127.0.0.1';

    // Se 'nome' for fornecido, busca os dados da fazenda específica. 
    // Caso contrário, busca a lista completa.
    const endpoint = nome 
      ? `/api/test-data/farms/${encodeURIComponent(nome)}`
      : `/api/test-data/farms`;

    const url = `${baseUrl}${endpoint}`;

    // Fix (Performance): Adiciona timeout de 5000ms para evitar conexões penduradas
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
        'X-Forwarded-For': clientIp
      },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Falha ao buscar dados de teste' }, 
        { status: response.status }
      );
    }

    const data = await response.json();

    // Fix (Performance): Aplica cabeçalho de cache
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 's-maxage=60, stale-while-revalidate'
      }
    });
  } catch (error: any) {
    console.error('[API Proxy] Falha interna na rota test-data:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar dados de teste' },
      { status: 500 }
    );
  }
}
