/**
 * @file route.ts
 * @description Endpoint do BFF para verificação de saúde da API externa.
 */

import { NextResponse } from 'next/server';

// Força o Next.js a não fazer cache desta rota de checagem
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Usa 127.0.0.1 por padrão em vez de localhost para evitar problemas de roteamento IPv6 no Node.js
    const baseUrl = process.env.API_BASE_URL;
    const apiKey = process.env.API_KEY || process.env.API_TOKEN;

    if (!baseUrl || !apiKey) {
      console.error('[Health Check] ALERTA CRÍTICO: Variáveis de ambiente ausentes!');
      return NextResponse.json({ error: 'Configuração de servidor inválida.' }, { status: 500 });
    }

    // AbortController para evitar requisições presas (timeout após 5 segundos)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // Injeta a chave da API de forma segura no servidor
    const res = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-KEY': apiKey
      },
      cache: 'no-store', // Garante que sondagens repetidas não fiquem em cache
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error('[Health Check Erro de Comunicação]:', error.message || error);
    return NextResponse.json({ error: 'API Offline (Gateway Timeout)' }, { status: 504 });
  }
}
