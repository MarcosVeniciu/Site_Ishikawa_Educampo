/**
 * @file src/app/login/page.tsx
 * @description Interface visual e lógica de autenticação do produtor.
 * * COMO ESTE CÓDIGO FUNCIONA:
 * 1. Abstração Visual: Utiliza o 'SplitScreenLayout' para gerenciar a responsividade, 
 * mantendo o código desta página focado apenas no processo de login.
 * 2. Segurança Zero-Token-Exposure: Não armazena nem lê tokens no cliente (localStorage). 
 * A autenticação é processada via BFF, que injeta cookies HttpOnly no navegador.
 * 3. Fluxo de Autenticação: Captura inputs via useState, valida campos básicos e realiza 
 * uma requisição POST para '/api/auth'. Em caso de sucesso, o roteador do Next.js 
 * redireciona o usuário.
 * 4. Atalho de Teste: Implementa a função 'fillTestCredentials' para agilizar a validação 
 * funcional em ambiente de desenvolvimento.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SplitScreenLayout } from '@/components/ui/SplitScreenLayout';

/**
 * Componente principal da página de Login.
 * Renderiza o formulário de autenticação e gerencia o estado local dos inputs.
 * 
 * @returns {JSX.Element} Interface do formulário de login envolta no SplitScreenLayout.
 */
export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiReady, setApiReady] = useState(false);
  const [isWarmingUp, setIsWarmingUp] = useState(true);
  const router = useRouter();

  /**
   * Dispara um "ping" para acordar a API assim que a tela de login monta (evita cold start).
   * Prioriza o fetch direto do cliente para ignorar o limite de timeout do servidor BFF.
   * Realiza tentativas em loop de 5 segundos até obter sucesso na ativação da nuvem.
   * 
   * @returns {void} Esta função de efeito do React não possui retorno.
   */
  useEffect(() => {
    // REGRA DE OPERAÇÃO:
    // A API do Render pode hibernar por inatividade. O ping assíncrono na montagem do Login
    // garante que ela seja acordada enquanto o usuário digita ou usa as credenciais de teste.
    // Usamos prioritariamente a chamada direta do cliente para contornar o limite de 10s da Vercel (BFF).
    const baseApiUrl = process.env.NEXT_PUBLIC_API_URL;
    const pingUrl = baseApiUrl ? `${baseApiUrl}/api/ping` : '/api/ping';

    setIsWarmingUp(true);

    const checkApi = async () => {
      try {
        const response = await fetch(pingUrl, {
          method: 'GET',
          cache: 'no-store',
        });
        
        if (response.ok) {
          setApiReady(true);
          setIsWarmingUp(false);
          
          if (process.env.NODE_ENV === 'development') {
            console.info(
              '%c[API Ping] API Principal está acordada e pronta para requisições!',
              'color: #10b981; font-weight: bold; background-color: #f0fdf4; padding: 2px 4px; border-radius: 4px;'
            );
          }
        } else {
          // Em caso de erro na resposta, reagenda a tentativa para dali a 5 segundos
          setTimeout(checkApi, 5000);
        }
      } catch (error) {
        // Em caso de erro de rede (máquina subindo), reagenda a tentativa
        if (process.env.NODE_ENV === 'development') {
          console.warn('[API Ping] API ainda subindo, tentando novamente em 5s...');
        }
        setTimeout(checkApi, 5000);
      }
    };

    checkApi();
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

          {isWarmingUp && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-100 p-3 rounded-lg text-center font-medium animate-pulse">
              ⏱️ Ativando servidores de teste. Por favor, aguarde de 30 a 60 segundos (hospedagem gratuita por inatividade).
            </div>
          )}

          {apiReady && !isLoading && (
            <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg text-center font-medium flex items-center justify-center gap-1.5 animate-in fade-in duration-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Servidores ativos e prontos!
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
              ? 'Aquecendo servidores...' 
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
      </div>
    </SplitScreenLayout>
  );
}