/**
 * @file src/app/api/simulacao/route.ts
 * @description Proxy BFF para o endpoint de Simulação.
 * Recebe os parâmetros ajustados pelo produtor, processa a segurança (esconde o token) 
 * e solicita à API Python o recálculo rápido dos indicadores e estimativa de Machine Learning.
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * @description Método principal para despachar o payload de simulação, validando
 * a presença obrigatória do valor do concentrado antes do consumo de rede externo.
 * @param req Objeto NextRequest contendo as variáveis manipuladas nos sliders.
 * @returns NextResponse com a resposta resolvida da ML ou os detalhes do erro de rede.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Barreira leve de payload: garante o insumo da Machine Learning
    if (body.custo_concentrado === undefined || body.custo_concentrado === null) {
      return NextResponse.json(
        { error: 'O campo custo_concentrado é obrigatório para as estimativas de custo.' },
        { status: 400 }
      );
    }

    const backendUrl = process.env.API_BASE_URL || 'https://api-ishikawa-educampo.onrender.com';
    const backendToken = process.env.API_TOKEN || '';

    const apiResponse = await fetch(`${backendUrl}/api/simulacao`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${backendToken}`,
        'X-API-KEY': backendToken
      },
      body: JSON.stringify(body),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.text();
      console.error(`[BFF Simulacao] Erro ${apiResponse.status}:`, errorData);
      return NextResponse.json(
        { error: 'Falha ao processar a simulação na inteligência externa.' },
        { status: apiResponse.status }
      );
    }

    const data = await apiResponse.json();
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('[BFF Simulacao] Erro Crítico:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor ao processar a simulação.' },
      { status: 500 }
    );
  }
}