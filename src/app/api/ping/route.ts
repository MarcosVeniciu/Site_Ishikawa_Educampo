/**
 * @file src/app/api/ping/route.ts
 * @description Endpoint BFF para o "ping" de aquecimento (Cold Start).
 * Ele despacha uma requisição leve para a API externa a fim de tirá-la da inatividade.
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * @description Executa a chamada GET para a rota /api/ping da API externa.
 * Não necessita de autenticação e possui timeout curto para não prender o servidor Node.js
 * enquanto a nuvem desperta.
 * @returns NextResponse com status HTTP 200, independente de falhas de timeout externo.
 */
export async function GET() {
  try {
    const baseUrl = process.env.API_BASE_URL;
    if (!baseUrl) {
      return NextResponse.json({ error: 'API_BASE_URL não configurada no ambiente interno.' }, { status: 500 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    await fetch(`${baseUrl}/api/ping`, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return NextResponse.json({ message: 'Ping repassado à API com sucesso' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Ping disparado internamente (Aguardando Wakeup da nuvem)' }, { status: 200 });
  }
}