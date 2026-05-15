/**
 * @file src/middleware.ts
 * @description Guardião de rotas nativo do Next.js executado no Edge Runtime.
 * * COMO ESTE CÓDIGO FUNCIONA:
 * 1. Interceptação: O objeto `config` define quais rotas (matcher) devem acionar este middleware.
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

const SECRET_KEY = new TextEncoder().encode(
  process.env.ENCRYPTION_SECRET_KEY || 'chave_secreta_padrao_para_desenvolvimento_educampo'
);

// Define as rotas que o Middleware irá proteger/interceptar
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
    '/dashboard/:path*',
    '/diagnostico/:path*',
    '/simulacao/:path*',
    '/configuracoes/:path*',
  ],
};

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get(SECURITY_CONSTANTS.SESSION_COOKIE_NAME);
  const pathname = request.nextUrl.pathname;
  
  const isAuthPage = pathname === ROUTES.LOGIN;
  const isRootPath = pathname === ROUTES.ROOT;

  if (!sessionCookie) {
    // Deslogado tentando acessar rota privada: manda pro login. Deslogado já no /login: deixa passar.
    return isAuthPage ? NextResponse.next() : NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
  }

  try {
    // Valida a assinatura do JWT e enforça que o token não tenha mais de 5 minutos de idade
    await jwtVerify(sessionCookie.value, SECRET_KEY, { maxTokenAge: SECURITY_CONSTANTS.MAX_TOKEN_AGE });
    
    // Autenticado tentando acessar rotas públicas (raiz ou login): pula direto para a área interna
    if (isRootPath || isAuthPage) {
      return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
    }
    return NextResponse.next();
  } catch (error) {
    // Token corrompido/expirado: limpa o cookie e redireciona (se já estiver no /login, apenas renderiza)
    const response = isAuthPage 
      ? NextResponse.next() 
      : NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
      
    response.cookies.delete(SECURITY_CONSTANTS.SESSION_COOKIE_NAME);
    return response;
  }
}