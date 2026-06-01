/**
 * @file src/app/api/parametros-painel/route.ts
 * @description Proxy BFF para consultar os limites (mínimo, máximo, step e fronteiras)
 * dos sliders baseados no cenário da fazenda, alimentando a tela de simulação.
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * @description Recebe os dados operacionais âncora do produtor e consome a API de
 * limites de cenários para balizar o frontend interativo.
 * @param req Objeto NextRequest contendo producao_vaca, sistema_producao e vacas_lactacao.
 * @returns NextResponse com o JSON dos limites dos sliders.
 */
export async function POST(req: NextRequest) {
  console.log('\n[BFF Parametros] >>> INICIANDO REQUISIÇÃO DE LIMITES DE PAINEL <<<');
  
  try {
    const body = await req.json();

    const baseUrl = process.env.API_BASE_URL;
    const apiKey = process.env.API_KEY || process.env.API_TOKEN;

    if (!baseUrl || !apiKey) {
      console.error('[BFF Parametros] ALERTA CRÍTICO: Chaves de ambiente ausentes.');
      return NextResponse.json(
        { error: 'Configuração interna do servidor ausente.' },
        { status: 500 }
      );
    }

    const apiUrl = `${baseUrl}/api/parametros-painel`;
    const forwardedFor = req.headers?.get?.('x-forwarded-for') || '';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-API-KEY': apiKey,
        'X-Forwarded-For': forwardedFor
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!apiResponse.ok) {
      if (apiResponse.status === 422 || apiResponse.status === 400) {
        const errorData = await apiResponse.json().catch(() => null);
        console.error("\n[BFF Parametros Error] Erro de validação na API Externa:", JSON.stringify(errorData, null, 2));
        return NextResponse.json({ error: 'Falha na validação', detalhes: errorData }, { status: apiResponse.status });
      }
      throw new Error(`Status ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    console.error('\n[BFF Parametros] >>> ERRO INTERNO <<<', error.message);
    return NextResponse.json({ error: 'Erro ao processar parâmetros.' }, { status: 500 });
  }
}