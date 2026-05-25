import { NextResponse } from 'next/server';

// Força o Next.js a não fazer cache desta rota de checagem
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:8000';
    const apiKey = process.env.API_TOKEN || '';

    // Injeta a chave da API de forma segura no servidor
    const res = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-KEY': apiKey
      },
      cache: 'no-store', // Garante que sondagens repetidas não fiquem em cache
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: 'API Offline (Gateway Timeout)' }, { status: 504 });
  }
}
