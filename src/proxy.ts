/**
 * @file src/proxy.ts
 * @description Guardião de rotas nativo do Next.js executado no Edge Runtime.
 * * COMO ESTE CÓDIGO FUNCIONA:
 * 1. Interceptação: O objeto `config` define quais rotas (matcher) devem acionar este proxy.
 * 2. Extração: Tenta ler o cookie 'educampo_session' da requisição. Se não existir, redireciona para `/login`.
 * 3. Verificação Criptográfica: Utiliza a função `jwtVerify` da biblioteca `jose` para garantir que o token
 * foi emitido pelo nosso sistema e não expirou ou sofreu adulteração (tampering).
 * 4. Resolução: Se a assinatura for válida, permite que a requisição prossiga (`NextResponse.next()`).
 * Caso contrário, destrói o cookie corrompido e redireciona para o login.
 */

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.ENCRYPTION_SECRET_KEY || 'chave_secreta_padrao_para_desenvolvimento_educampo'
);

// Define as rotas privadas que o Proxy irá proteger
export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/formulario/:path*', 
    '/diagnostico/:path*', 
    '/simulacao/:path*', 
    '/carregando/:path*'
  ],
};

/**
 * Função de Proxy (antigo Middleware)
 * Alterada para seguir a convenção do Next.js 16+
 */
export async function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get('educampo_session');

  // Redirecionamento 1: Sem cookie presente
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verificação criptográfica do JWT (Edge compatible)
    await jwtVerify(sessionCookie.value, SECRET_KEY);
    
    // Passagem liberada
    return NextResponse.next();
  } catch (error) {
    // Redirecionamento 2: Token inválido, adulterado ou expirado
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('educampo_session');
    return response;
  }
}