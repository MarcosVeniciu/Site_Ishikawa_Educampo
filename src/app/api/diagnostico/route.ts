/**
 * @file route.ts
 * @description Implementação do Endpoint BFF para Diagnóstico.
 * * Este arquivo atua como um Proxy Seguro entre o Frontend e a API Python no Render.
 * * Lógica de Funcionamento:
 * 1. Recebe a requisição POST do navegador.
 * 2. Valida o payload utilizando o Schema do Zod para garantir integridade.
 * 3. Verifica a Feature Flag de criptografia para preparo de segurança futura.
 * 4. Injeta o Token de Autenticação (Bearer) oculto no servidor.
 * 5. Encaminha a chamada para a API real e trata possíveis falhas de conexão (Resiliência).
 */

import { NextRequest, NextResponse } from 'next/server';
import { fazendaSchema } from '@/lib/schemas';

/**
 * Manipula requisições POST para gerar o diagnóstico da fazenda.
 * * @param req - Objeto da requisição NextRequest contendo os dados da fazenda.
 * @returns NextResponse com o diagnóstico da IA ou mensagens de erro tratadas.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Captura e Validação de Dados (Anti-Injection/Payload Malformado)
    const body = await req.json();
    const validation = fazendaSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Dados da fazenda inválidos ou incompletos.', details: validation.error.format() },
        { status: 400 }
      );
    }

    // 2. Transformação de Payload (O verdadeiro poder de um BFF!)
    // O Frontend e o Backend possuem nomenclaturas ligeiramente diferentes. 
    // Nosso BFF atua como um tradutor para satisfazer o Pydantic do Python.
    const payloadToSend = {
      nome_fazenda: validation.data.nome_fazenda,
      sistema_producao: validation.data.sistema_producao,
      total_vacas: validation.data.total_vacas,
      vacas_lactacao: validation.data.vacas_lactacao,
      total_rebanho: validation.data.animais_rebanho,       // Frontend -> Backend
      area_atividade: validation.data.area_atividade,
      numero_trabalhadores: validation.data.mao_obra_total, // Frontend -> Backend
      producao_vaca: validation.data.producao_vaca,
      preco_recebido: validation.data.preco_leite,          // Frontend -> Backend
      preco_referencia: validation.data.preco_referencia,
      ccs: validation.data.ccs,
      regiao_sebrae: validation.data.regiao                 // Frontend -> Backend
    };

    // 2.1 Verificação de Feature Flag (Security by Design)
    const encryptionEnabled = process.env.ENABLE_PAYLOAD_ENCRYPTION === 'true';

    if (encryptionEnabled) {
      // TODO: Implementar lógica de criptografia AES-256 no futuro se necessário.
      console.log("[BFF] Payload encryption flag is ACTIVE. Ready for AES implementation.");
    }

    // 3. Comunicação Segura com a API Externa (Render)
    const apiUrl = `${process.env.API_BASE_URL}/api/diagnostico`;
    
    console.log(`[BFF Debug] Chamando API Externa: ${apiUrl}`);
    
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_TOKEN}`,
        'X-API-KEY': process.env.API_TOKEN || ''
      },
      body: JSON.stringify(payloadToSend),
    });

    // 4. Tratamento de Resiliência (Bad Gateway)
    if (!apiResponse.ok) {
      if (apiResponse.status === 422 || apiResponse.status === 400) {
        const errorData = await apiResponse.json().catch(() => null);
        console.error("[ERRO DE VALIDAÇÃO DA API PYTHON]:", JSON.stringify(errorData, null, 2));
        return NextResponse.json(
          { error: 'Falha na validação da API', detalhes: errorData },
          { status: apiResponse.status }
        );
      }

      // Se for erro de autenticação (401 ou 403), repassamos com clareza para depuração
      if (apiResponse.status === 401 || apiResponse.status === 403) {
        console.error(`[BFF Error] Autenticação recusada pela API Python. Status: ${apiResponse.status}`);
        return NextResponse.json(
          { error: 'Falha de autenticação ao comunicar com a inteligência.' },
          { status: apiResponse.status }
        );
      }

      console.error(`[BFF Error] API Externa retornou status: ${apiResponse.status}`);
      return NextResponse.json(
        { error: 'Falha ao comunicar com a API de Diagnóstico.' },
        { status: 502 }
      );
    }

    // 5. Sucesso: Repassa os dados processados pela IA para o Frontend
    const data = await apiResponse.json();
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('[BFF Critical Error]:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor de processamento.' },
      { status: 500 }
    );
  }
}