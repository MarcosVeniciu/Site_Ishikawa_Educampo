/**
 * @file src/app/login/page.tsx
 * @description Interface visual e lógica de autenticação do produtor.
 * 
 * COMO ESTE CÓDIGO FUNCIONA:
 * 1. Abstração Visual: Utiliza o 'SplitScreenLayout' para gerenciar a responsividade, 
 *    mantendo o código desta página focado apenas no processo de login.
 * 2. Segurança Zero-Token-Exposure: Não armazena nem lê tokens no cliente (localStorage). 
 *    A autenticação é processada via BFF, que injeta cookies HttpOnly no navegador.
 * 3. Verificação Centralizada da API: Executa o fluxo completo Ping → Health Check nesta
 *    tela, gravando o resultado no Zustand (`apiHealthy`). A tela de carregamento consome
 *    esse flag e pula a verificação redundante, eliminando erros 429 no Render.
 * 4. Fluxo de Autenticação: Captura inputs via useState, valida campos básicos e realiza 
 *    uma requisição POST para '/api/auth'. Em caso de sucesso, o roteador do Next.js 
 *    redireciona o usuário.
 * 5. Atalho de Teste: Implementa a função 'fillTestCredentials' para agilizar a validação 
 *    funcional em ambiente de desenvolvimento.
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SplitScreenLayout } from '@/components/ui/SplitScreenLayout';
import { useFazendaStore } from '@/store/useFazendaStore';

/**
 * Componente principal da página de Login.
 * Renderiza o formulário de autenticação e gerencia o estado local dos inputs.
 * Centraliza toda a verificação de saúde da API (Ping → Health Check) antes de liberar o login.
 * 
 * @returns {JSX.Element} Interface do formulário de login envolta no SplitScreenLayout.
 */
export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isWarmingUp, setIsWarmingUp] = useState(true);
  
  /**
   * @description Estado visual que acompanha a fase atual da verificação.
   * Exibe feedback granular ao usuário sobre o progresso do despertar da API.
   */
  const [warmupPhase, setWarmupPhase] = useState<'ping' | 'health' | 'ready'>('ping');

  /**
   * @description Estado que armazena a resposta bruta ou formatada das rotas de verificação.
   * Usado para debug visual tanto em desenvolvimento quanto em produção (temporariamente).
   */
  const [debugLog, setDebugLog] = useState<string>('Iniciando verificação...');

  /** Ref para evitar que o useEffect de verificação rode mais de uma vez (StrictMode). */
  const verificacaoIniciada = useRef(false);
  
  const router = useRouter();
  const { setApiHealthy } = useFazendaStore();

  // REGRA DE OPERAÇÃO:
  // Define o caminho de API para o ping de aquecimento de forma limpa no escopo do componente.
  // Utiliza estritamente o servidor Next.js (BFF) para mascarar a API real.
  const pingUrl = '/api/ping';

  /**
   * @description Fluxo centralizado de verificação da API: Ping (acordar) → Health Check (confirmar).
   * 
   * FASE 1 — PING (Cold Start):
   *   Dispara requisições GET para a rota /api/ping da API externa até obter resposta OK.
   *   Usa intervalo de 5 segundos com tentativas ilimitadas (a API pode levar até 60s para acordar).
   * 
   * FASE 2 — HEALTH CHECK (Confirmação):
   *   Após o ping ser bem-sucedido, faz uma única requisição ao BFF /api/health.
   *   Se retornar "healthy", seta `apiHealthy=true` no Zustand e libera o login.
   *   Se retornar "warming_up", aguarda e tenta novamente (máximo 5 tentativas com backoff).
   * 
   * REGRA DE NEGÓCIO: Esse fluxo evita que a tela de carregamento faça polling redundante,
   * eliminando os erros 429 (Too Many Requests) que ocorriam no Render.
   */
  useEffect(() => {
    // Previne execução dupla em StrictMode do React 18
    if (verificacaoIniciada.current) return;
    verificacaoIniciada.current = true;

    // Reseta o flag de saúde ao entrar na tela de login (nova sessão de verificação)
    setApiHealthy(false);
    setIsWarmingUp(true);
    setWarmupPhase('ping');

    /**
     * FASE 1: Ping — Acorda a API externa do Cold Start.
     * Tenta indefinidamente a cada 5 segundos até obter uma resposta HTTP 2xx.
     */
    const executarPing = async (): Promise<void> => {
      const logPrefix = '[Ping]';
      
      // eslint-disable-next-line no-constant-condition
      while (true) {
        try {
          console.info(`${logPrefix} Enviando ping para: ${pingUrl}`);
          setDebugLog(prev => prev + `\n${logPrefix} Tentando ${pingUrl}...`);

          const response = await fetch(pingUrl, {
            method: 'GET',
            cache: 'no-store',
          });

          // Captura o corpo da resposta para debug
          let responseBody = '';
          try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const data = await response.json();
              responseBody = JSON.stringify(data, null, 2);
            } else {
              responseBody = await response.text();
            }
          } catch (e: any) {
            responseBody = `Erro decodificando corpo: ${e.message || e}`;
          }

          const statusMsg = `[Status: ${response.status} ${response.statusText}]`;
          setDebugLog(prev => prev + `\n${logPrefix} ${statusMsg}\n${responseBody}`);

          if (response.ok) {
            console.info(
              '%c[Ping] ✅ API acordou com sucesso!',
              'color: #10b981; font-weight: bold; background-color: #f0fdf4; padding: 2px 4px; border-radius: 4px;'
            );
            setDebugLog(prev => prev + `\n${logPrefix} ✅ API acordou! Iniciando Health Check...`);
            return; // Sai do loop e passa para a Fase 2
          }

          // Resposta não-OK: aguarda 5 segundos antes de retentar
          console.warn(`${logPrefix} API respondeu com ${response.status}. Retentando em 5s...`);
          setDebugLog(prev => prev + `\n${logPrefix} ⏳ Retentando em 5s...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        } catch (error: any) {
          // Erro de rede (API totalmente offline ou CORS)
          console.warn(`${logPrefix} Erro de rede: ${error?.message}. Retentando em 5s...`);
          setDebugLog(prev => prev + `\n${logPrefix} ❌ Erro de rede: ${error?.message}. Retentando em 5s...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    };

    /**
     * FASE 2: Health Check — Confirma que a API está totalmente operacional.
     * Utiliza Exponential Backoff com máximo de 5 tentativas.
     * Se confirmar "healthy", seta o flag no Zustand e libera o login.
     */
    const executarHealthCheck = async (): Promise<void> => {
      const logPrefix = '[HealthCheck]';
      const MAX_TENTATIVAS = 5;
      const TEMPO_BASE_MS = 3000;
      const CAP_TEMPO_MS = 15000;

      for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
        try {
          console.info(`${logPrefix} Tentativa ${tentativa}/${MAX_TENTATIVAS}...`);
          setDebugLog(prev => prev + `\n${logPrefix} Tentativa ${tentativa}/${MAX_TENTATIVAS}...`);

          const res = await fetch('/api/health', { cache: 'no-store' });

          // Se receber 429, espera com backoff progressivo (não conta como falha crítica)
          if (res.status === 429) {
            const tempoEspera = Math.min(TEMPO_BASE_MS * Math.pow(2, tentativa - 1), CAP_TEMPO_MS);
            console.warn(`${logPrefix} 429 Rate Limited. Aguardando ${tempoEspera / 1000}s...`);
            setDebugLog(prev => prev + `\n${logPrefix} ⚠️ 429 Rate Limited. Aguardando ${tempoEspera / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, tempoEspera));
            continue;
          }

          // Erros críticos irrecuperáveis
          if (res.status === 403 || res.status === 503) {
            const msg = res.status === 403 ? 'Chave de API inválida (403)' : 'Serviço indisponível (503)';
            console.error(`${logPrefix} ❌ Erro crítico: ${msg}`);
            setDebugLog(prev => prev + `\n${logPrefix} ❌ ${msg}`);
            setIsWarmingUp(false);
            setWarmupPhase('ping'); // Reset visual
            return;
          }

          if (res.ok) {
            const data = await res.json().catch(() => ({}));
            setDebugLog(prev => prev + `\n${logPrefix} Resposta: ${JSON.stringify(data)}`);

            // API ainda está em processo de boot (contêiner iniciando)
            if (data.status === 'warming_up' || data.ml_api === 'waking_up') {
              const tempoEspera = Math.min(TEMPO_BASE_MS * Math.pow(2, tentativa - 1), CAP_TEMPO_MS);
              console.info(`${logPrefix} API em aquecimento. Retentando em ${tempoEspera / 1000}s...`);
              setDebugLog(prev => prev + `\n${logPrefix} 🔥 API aquecendo... Retentando em ${tempoEspera / 1000}s...`);
              await new Promise(resolve => setTimeout(resolve, tempoEspera));
              continue;
            }

            // SUCESSO: API confirmada como saudável
            if (data.status === 'healthy') {
              console.info(
                '%c[HealthCheck] ✅ API confirmada como HEALTHY! Login liberado.',
                'color: #10b981; font-weight: bold; background-color: #f0fdf4; padding: 4px 8px; border-radius: 4px;'
              );
              setDebugLog(prev => prev + `\n${logPrefix} ✅ API HEALTHY! Login liberado.`);
              
              // Grava no Zustand: a tela de carregamento vai ler esse flag
              setApiHealthy(true);
              setIsWarmingUp(false);
              setWarmupPhase('ready');
              return;
            }
          }

          // Qualquer outro status não-ok: backoff e retenta
          const tempoEspera = Math.min(TEMPO_BASE_MS * Math.pow(2, tentativa - 1), CAP_TEMPO_MS);
          console.warn(`${logPrefix} Status ${res.status}. Retentando em ${tempoEspera / 1000}s...`);
          setDebugLog(prev => prev + `\n${logPrefix} ⏳ Status ${res.status}. Retentando em ${tempoEspera / 1000}s...`);
          await new Promise(resolve => setTimeout(resolve, tempoEspera));
        } catch (error: any) {
          const tempoEspera = Math.min(TEMPO_BASE_MS * Math.pow(2, tentativa - 1), CAP_TEMPO_MS);
          console.error(`${logPrefix} Erro: ${error?.message}. Retentando em ${tempoEspera / 1000}s...`);
          setDebugLog(prev => prev + `\n${logPrefix} ❌ ${error?.message}. Retentando em ${tempoEspera / 1000}s...`);
          await new Promise(resolve => setTimeout(resolve, tempoEspera));
        }
      }

      // Esgotou todas as tentativas: exibe erro mas não redireciona (fica no login)
      console.error(`${logPrefix} ❌ Esgotou ${MAX_TENTATIVAS} tentativas. API indisponível.`);
      setDebugLog(prev => prev + `\n${logPrefix} ❌ Esgotou tentativas. API pode estar instável.`);
      setIsWarmingUp(false);
    };

    /**
     * Orquestra o fluxo sequencial: Ping → Health Check.
     * Cada fase só inicia após a anterior completar com sucesso.
     */
    const iniciarVerificacao = async () => {
      // FASE 1: Acorda a API
      setWarmupPhase('ping');
      await executarPing();

      // FASE 2: Confirma saúde
      setWarmupPhase('health');
      await executarHealthCheck();
    };

    iniciarVerificacao();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Processa a submissão do formulário de login.
   * Exibe estado de carregamento e dispara a requisição POST para o BFF (/api/auth) para validar as credenciais.
   * Em caso de sucesso (cookies injetados pelo servidor), redireciona para a tela de formulário.
   * 
   * @param {React.FormEvent} e - Evento de submissão do formulário.
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        router.push('/formulario');
      } else {
        const data = await response.json();
        setError(data.error || 'Falha na autenticação.');
      }
    } catch (err) {
      setError('Erro de rede. Verifique sua conexão e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Preenche automaticamente os campos de usuário e senha com credenciais de teste.
   * Função utilitária para agilizar validações funcionais no ambiente de desenvolvimento.
   */
  const fillTestCredentials = () => {
    setUsername('educampo');
    setPassword('leite123');
    setError('');
  };

  /**
   * @description Mensagem dinâmica do banner de aquecimento baseada na fase atual.
   * Fornece feedback visual granular ao usuário sobre qual etapa está sendo executada.
   */
  const warmupMessage = warmupPhase === 'ping'
    ? '⏱️ Acordando servidores (ping). Por favor, aguarde de 30 a 60 segundos...'
    : '🔍 Verificando saúde da API (health check)...';

  return (
    <SplitScreenLayout 
      title="Bem-vindo de volta" 
      subtitle="Insira suas credenciais para acessar o diagnóstico."
    >
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Usuário <span className="text-blue-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: educampo"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors outline-none text-gray-800"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Senha <span className="text-blue-600">*</span>
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors outline-none text-gray-800"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Banner de aquecimento: exibe a fase atual (ping ou health check) */}
          {isWarmingUp && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-100 p-3 rounded-lg text-center font-medium animate-pulse">
              {warmupMessage}
            </div>
          )}

          {/* Indicador de API pronta: exibido quando o health check confirma "healthy" */}
          {warmupPhase === 'ready' && !isLoading && (
            <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg text-center font-medium flex items-center justify-center gap-1.5 animate-in fade-in duration-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Servidores ativos e verificados! ✅
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-lg text-center font-medium animate-in fade-in duration-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || isWarmingUp}
            className={`w-full py-3 px-4 mt-2 rounded-lg font-medium text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-4 focus:ring-primary/30 transition-all shadow-sm ${
              (isLoading || isWarmingUp) ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isWarmingUp 
              ? (warmupPhase === 'ping' ? 'Acordando servidores...' : 'Verificando saúde...')
              : isLoading 
                ? 'Autenticando...' 
                : 'Entrar'}
          </button>
        </form>
      </div>

      <div className="mt-8 text-center space-y-4">
        <button 
          type="button"
          onClick={fillTestCredentials}
          className="text-sm font-medium text-primary hover:text-primary-light transition-colors bg-transparent border-none cursor-pointer focus:outline-none focus:underline"
        >
          Preencher com credenciais de teste
        </button>
        <p className="text-xs text-gray-400">Ambiente restrito a consultores autorizados.</p>

        {/* Painel de Debug: Visível durante a fase de testes para depuração em produção */}
        <div className="mt-6 p-4 bg-slate-900 border border-slate-800 rounded-xl text-left font-mono text-xs text-emerald-400 shadow-md transition-all duration-300">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <span className="text-slate-400 font-sans font-semibold flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${warmupPhase === 'ready' ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'}`}></span>
              API Debugger
            </span>
            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 font-sans">
              Fase: {warmupPhase} | pingUrl: {pingUrl}
            </span>
          </div>
          <div>
            <div className="text-slate-400 font-semibold mb-1 font-sans">Log de Verificação (Ping → Health):</div>
            <pre className="bg-slate-950 p-2.5 rounded border border-slate-800 overflow-x-auto text-[11px] leading-relaxed max-h-48 whitespace-pre-wrap break-all overflow-y-auto">
              {debugLog}
            </pre>
          </div>
        </div>
      </div>
    </SplitScreenLayout>
  );
}