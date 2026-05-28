/**
 * @file apiUtils.ts
 * @description Utilitários globais para comunicação de rede segura com a API (BFF).
 */

/**
 * @description Wrapper do `fetch` nativo que implementa os padrões arquiteturais de 
 * Circuit Breaker (Limite de Tentativas) e Exponential Backoff (Espera Progressiva).
 * Ideal para rotas que exigem alta resiliência e processamento pesado (ex: Inteligência Artificial).
 * 
 * @param {string} url - O endpoint da requisição (ex: '/api/diagnostico').
 * @param {RequestInit} options - As opções padrão do fetch (method, headers, body, etc).
 * @param {number} maxTentativas - O número máximo de tentativas antes da desistência graciosa. (Padrão: 3).
 * @param {number} tempoBaseMs - O tempo base inicial de espera em milissegundos. (Padrão: 2000ms).
 * @param {number} capTempoMs - O teto máximo de espera permitido entre tentativas. (Padrão: 10000ms).
 * @param {number} timeoutMs - Tempo limite por requisição, forçando falha e retentativa se a API "travar" (Hang infinito).
 * @returns {Promise<Response>} - A Promise nativa do Response se a comunicação for bem-sucedida.
 * @throws {Error} - Escala a falha para o chamador (catch superior) se o Circuit Breaker se esgotar.
 */
export async function fetchComResiliencia(
  url: string,
  options?: RequestInit,
  maxTentativas: number = 3,
  tempoBaseMs: number = 2000,
  capTempoMs: number = 10000,
  timeoutMs?: number
): Promise<Response> {
  let tentativaAtual = 1;

  while (tentativaAtual <= maxTentativas) {
    // Preparamos o mecanismo de Timeout Dinâmico
    const controller = new AbortController();
    let timeoutId: NodeJS.Timeout | undefined;
    
    const fetchOptions: RequestInit = { ...options };
    if (timeoutMs) {
      timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      fetchOptions.signal = controller.signal;
    }

    try {
      // Ação: Tentativa de comunicação real
      const response = await fetch(url, fetchOptions);

      if (timeoutId) clearTimeout(timeoutId);

      // Regra de Negócio: Tratamos os erros 502/503/504 como falhas transitórias da nuvem.
      // Status 4xx (como 400 Bad Request ou 401) não caem na retentativa, pois o payload está incorreto.
      if (!response.ok && [502, 503, 504].includes(response.status)) {
        throw new Error(`Falha transitória do servidor (Status: ${response.status})`);
      }

      return response; // Comunicação bem-sucedida (Status 200~299 ou 4xx tratado pelo cliente)
    } catch (error: any) {
      if (timeoutId) clearTimeout(timeoutId);

      const isTimeout = error.name === "AbortError";
      const msgLog = isTimeout ? `Timeout atingido (${timeoutMs}ms)` : error.message;

      // O Circuit Breaker atua: rompe a repetição se atingimos o teto
      if (tentativaAtual >= maxTentativas) {
        console.error(`[Circuit Breaker] Rota ${url} falhou após ${maxTentativas} tentativas. Erro fatal: ${msgLog}. Abortando.`);
        throw error;
      }

      // Exponential Backoff: Aumenta o tempo de espera em progressão geométrica até o limite estabelecido
      const tempoEspera = Math.min(tempoBaseMs * Math.pow(2, tentativaAtual - 1), capTempoMs);
      await new Promise(resolve => setTimeout(resolve, tempoEspera));
      tentativaAtual++;
    }
  }

  throw new Error(`Erro fatal em fetchComResiliencia para a rota ${url}`);
}