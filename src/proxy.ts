/**
 * @file src/proxy.ts
 * @description Proxy nativo do Next.js (antigo Middleware) executado no Edge Runtime para segurança de rotas.
 *
 * COMO ESTE CÓDIGO FUNCIONA:
 * 1. Interceptação: O objeto `config` define quais rotas (matcher) devem acionar este proxy.
 * 2. Extração: Tenta ler o cookie 'educampo_session' da requisição. Se não existir, redireciona para `/login`.
 * 3. Verificação Criptográfica: Utiliza a função `jwtVerify` da biblioteca `jose` para garantir que o token
 * foi emitido pelo nosso sistema, não sofreu adulteração e respeita o tempo limite de vida (TTL).
 * 4. Resolução Inteligente: Redireciona usuários deslogados para `/login`. Se já estiver logado e tentar
 * acessar `/` ou `/login`, o sistema o redireciona dinamicamente para `/formulario`.
 * 5. Tempo de Validade: A sessão tem uma duração máxima estrita de 5 minutos.
 */

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { SECURITY_CONSTANTS, ROUTES } from './lib/constants';

if (!process.env.ENCRYPTION_SECRET_KEY) {
  throw new Error('ALERTA CRÍTICO: Variável ENCRYPTION_SECRET_KEY ausente no .env');
}
const SECRET_KEY = new TextEncoder().encode(process.env.ENCRYPTION_SECRET_KEY);

// Define as rotas que o Proxy irá proteger/interceptar
export const config = {
  matcher: [
    /*
     * Intercepta a raiz e o login, além das rotas privadas.
     * Ficam de fora:
     * - api/auth (rota de autenticação)
     * - arquivos estáticos (public, favicon, etc)
     */
    '/',
    '/login',
    '/formulario/:path*',
    '/carregando/:path*',
    '/selecao/:path*',
    '/dashboard/:path*',
    '/diagnostico/:path*',
    '/simulacao/:path*',
    '/configuracoes/:path*',
  ],
};

/**
 * Guardião de rotas e proxy de segurança executado no Edge Runtime do Next.js.
 *
 * Purpose:
 *   Intercepta requisições HTTP para validar a sessão do usuário por meio de cookies e tokens JWT,
 *   garantindo que rotas privadas fiquem inacessíveis para usuários deslogados e redirecionando
 *   usuários autenticados para a home da aplicação.
 *
 * Parameters:
 *   request (NextRequest): O objeto de requisição HTTP do Next.js contendo cookies, URL e headers.
 *
 * Returns:
 *   Promise<NextResponse>: Um objeto de resposta do Next.js que pode ser um redirecionamento
 *   (NextResponse.redirect) ou a liberação da requisição (NextResponse.next).
 *
 * Raises:
 *   Error: Lança erro caso o token JWT verificado esteja expirado ou corrompido, tratando internamente
 *   e retornando redirecionamento ao login com limpeza do cookie de sessão.
 *
 * Domain Context:
 *   Garante a segurança e a integridade da sessão do usuário de forma que os segredos da fazenda e do produtor
 *   não fiquem expostos a sessões inativas ou acessos não autorizados. Implementa a barreira de segurança e TTL
 *   de 5 minutos definido na convenção de segurança do projeto.
 */
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const sessionCookie = request.cookies.get(SECURITY_CONSTANTS.SESSION_COOKIE_NAME);
  const pathname = request.nextUrl.pathname;
  
  const isAuthPage = pathname === ROUTES.LOGIN;
  const isRootPath = pathname === ROUTES.ROOT;

  if (!sessionCookie) {
    // Negócio/Regra: Deslogado tentando acessar rota privada: manda pro login. Deslogado já no /login: deixa passar.
    return isAuthPage ? NextResponse.next() : NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
  }

  try {
    // Negócio/Regra: Valida a assinatura do JWT e enforça que o token não tenha mais de 5 minutos de idade
    await jwtVerify(sessionCookie.value, SECRET_KEY, { maxTokenAge: SECURITY_CONSTANTS.MAX_TOKEN_AGE });
    
    // Negócio/Regra: Autenticado tentando acessar rotas públicas (raiz ou login): pula direto para a área interna (/formulario)
    if (isRootPath || isAuthPage) {
      return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
    }
    return NextResponse.next();
  } catch (error) {
    // Negócio/Regra: Token corrompido/expirado: limpa o cookie e redireciona (se já estiver no /login, apenas renderiza)
    const response = isAuthPage 
      ? NextResponse.next() 
      : NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
      
    response.cookies.delete(SECURITY_CONSTANTS.SESSION_COOKIE_NAME);
    return response;
  }
}
