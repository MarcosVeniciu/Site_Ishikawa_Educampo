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

    const response = await fetch(`${baseUrl}/api/ping`, {
      method: 'GET',
      headers: {
        'X-Forwarded-For': forwardedFor
      },
      cache: 'no-store',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Se o Python respondeu 200 OK, repassa o sucesso
    if (response.ok) {
      return NextResponse.json({ message: 'API acordou com sucesso' }, { status: 200 });
    } 
    
    // Se a API Python ainda não acordou (ou deu 429), repassa o erro!
    return NextResponse.json(
      { error: `API Python ainda indisponível (Status: ${response.status})` }, 
      { status: response.status }
    );
  } catch (error: any) {
    // Se o container Python estiver totalmente desligado (erro de rede)
    return NextResponse.json(
      { error: 'Falha de rede ao contatar a API Python' }, 
      { status: 503 }
    );
  }
}