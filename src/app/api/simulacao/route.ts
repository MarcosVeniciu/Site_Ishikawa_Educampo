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
  console.log('\n[BFF Simulacao] >>> INICIANDO NOVA REQUISIÇÃO DE SIMULAÇÃO <<<');
  try {
    console.log('[BFF Simulacao] Tentando extrair payload JSON da requisição...');
    const body = await req.json();
    console.log('[BFF Simulacao] Payload JSON extraído com sucesso. Variáveis Simuladas:', JSON.stringify(body.dados_simulados));

    /**
     * 1. Extração e Validação do Payload:
     * Intercepta o corpo da requisição e aplica uma barreira leve garantindo 
     * que a variável custo_concentrado (no bloco simulado), vital para a ML, esteja presente.
     */
    const custoConcentrado = body.dados_simulados?.custo_concentrado;
    if (custoConcentrado === undefined || custoConcentrado === null) {
      console.warn('[BFF Simulacao] Block: Variável custo_concentrado está ausente no payload.');
      return NextResponse.json(
        { error: 'O campo custo_concentrado é obrigatório para as estimativas de custo.' },
        { status: 400 }
      );
    }

    /**
     * 2. Configuração de Variáveis de Ambiente e Proxy Seguro:
     * Oculta a URL base e o token de autorização injetando-os nativamente 
     * no servidor via process.env. O Frontend jamais tem acesso a essas chaves.
     */
    const baseUrl = process.env.API_BASE_URL; 
    const apiKey = process.env.API_KEY || process.env.API_TOKEN; 

    if (!baseUrl) {
      console.error('[BFF Simulacao] ALERTA CRÍTICO: API_BASE_URL não está definida no arquivo .env.local!');
    }

    const apiUrl = `${baseUrl || 'http://localhost:8000'}/api/simulacao`;
    console.log(`[BFF Simulacao] Preparando chamada para a API Externa em: ${apiUrl}`);

    /**
     * 3. Despacho da Requisição (Fetch):
     * Monta e envia a requisição HTTP POST para a API externa (Python), 
     * anexando os cabeçalhos de segurança (Bearer e X-API-KEY).
     */
    let apiResponse: Response;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      console.log('[BFF Simulacao] Disparando fetch para a Inteligência Externa (Python)...');
      apiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey || '42'}`,
          'X-API-KEY': apiKey || '42'
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      console.log(`[BFF Simulacao] Sucesso na rede. API externa respondeu com Status HTTP: ${apiResponse.status}`);
    } catch (fetchError: any) {
      console.error('[BFF Simulacao] A chamada fetch() interna falhou!');
      if (fetchError.name === 'AbortError') {
        console.error('[BFF Simulacao] Causa: Estouro de Timeout (mais de 30 segundos aguardando a resposta).');
        return NextResponse.json({ error: 'Timeout ao aguardar simulação.' }, { status: 504 });
      }
      console.error(`[BFF Simulacao] Causa da Falha de Rede:`, fetchError.message || fetchError);
      return NextResponse.json(
        { error: 'Falha de comunicação de rede com o motor de Machine Learning (API Python offline ou inacessível).' },
        { status: 502 }
      );
    }

    /**
     * 4. Tratamento de Erro de Rede Externo:
     * Caso a API de Machine Learning retorne um erro (ex: 400, 500), 
     * o texto é capturado para log interno e uma mensagem higienizada
     * é repassada ao Frontend sem expor detalhes da stack trace em Python.
     */
    if (!apiResponse.ok) {
      const errorData = await apiResponse.text();
      console.error(`[BFF Simulacao] Erro ${apiResponse.status}:`, errorData);
      return NextResponse.json(
        { error: 'Falha ao processar a simulação na inteligência externa.' },
        { status: apiResponse.status }
      );
    }

    /**
     * 5. Sucesso e Retorno:
     * Resolve e extrai o JSON gerado pela inteligência artificial contendo 
     * as predições e os indicadores recalculados, enviando-os como resposta 200.
     */
    console.log('[BFF Simulacao] Lendo o corpo da resposta enviada pela API externa...');
    const data = await apiResponse.json();
    console.log('[BFF Simulacao] Processamento finalizado com sucesso! Retornando resultados ao front-end.');
    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    /**
     * 6. Tratamento de Exceções Críticas Internas:
     * Captura falhas inesperadas de parsing ou de rede (Timeout) durante
     * a comunicação interna do Node.js/Next.js com a API externa.
     */
    console.error('\n[BFF Simulacao] >>> ERRO CRÍTICO INTERNO CAPTURADO PELO BFF <<<');
    console.error(`[BFF Simulacao] Mensagem: ${error.message}`);
    console.error(`[BFF Simulacao] Stacktrace:\n`, error.stack);
    return NextResponse.json(
      { error: 'Erro interno no servidor ao processar a simulação.' },
      { status: 500 }
    );
  }
}