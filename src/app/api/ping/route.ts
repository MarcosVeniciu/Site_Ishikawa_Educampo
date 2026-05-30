/**
 * @file src/app/api/ping/route.ts
 * @description Endpoint BFF para o "ping" de aquecimento (Cold Start).
 * Ele despacha uma requisição leve para a API externa a fim de tirá-la da inatividade.
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * @description Executa a chamada GET para a rota /api/ping da API externa.
 * Não necessita de autenticação e possui timeout de 60s para acordar a nuvem.
 * Repassa o IP do cliente para evitar falsos positivos no Rate Limiter global.
 * @returns NextResponse com status HTTP 200, independente de falhas de timeout externo.
 */
export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.API_BASE_URL;
    if (!baseUrl) {
      return NextResponse.json({ error: 'API_BASE_URL não configurada no ambiente interno.' }, { status: 500 });
    }

    const forwardedFor = request.headers.get('x-forwarded-for') || '';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos para permitir Cold Start completo

    await fetch(`${baseUrl}/api/ping`, {
      method: 'GET',
      headers: {
        'X-Forwarded-For': forwardedFor
      },
      cache: 'no-store',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return NextResponse.json({ message: 'Ping repassado à API com sucesso' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Ping disparado internamente (Aguardando Wakeup da nuvem)' }, { status: 200 });
  }
}