/**
 * @file src/app/api/auth/route.ts
 * @description Endpoint interno BFF (Backend-For-Frontend) para autenticação segura.
 * * COMO ESTE CÓDIGO FUNCIONA:
 * 1. Recebimento de Payload: Extrai as credenciais (username e password) do corpo da requisição POST.
 * 2. Validação (Mock): Compara as credenciais com um usuário padrão ('educampo' / 'leite123').
 * 3. Geração Criptográfica: Utiliza a biblioteca `jose` para assinar um token JWT usando a chave simétrica do sistema.
 * 4. Injeção de Cookie: Retorna uma resposta HTTP de sucesso anexando o cabeçalho `Set-Cookie`.
 * O cookie é configurado com as flags `HttpOnly` (prevenção XSS), `Secure` e `SameSite=Strict` (prevenção CSRF),
 * cumprindo o contrato estabelecido no auth.spec.ts.
 */

import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

// Chave secreta para assinatura do JWT (idealmente proveniente do .env)
const SECRET_KEY = new TextEncoder().encode(
  process.env.ENCRYPTION_SECRET_KEY || 'chave_secreta_padrao_para_desenvolvimento_educampo'
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Mock de validação de credenciais
    if (username !== 'educampo' || password !== 'leite123') {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    // Geração do token JWT com validade de 8 horas
    const token = await new SignJWT({ user: username })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('8h')
      .sign(SECRET_KEY);

    const response = NextResponse.json({ message: 'Login bem-sucedido' }, { status: 200 });

    // Padrão Zero-Token-Exposure: Injeção do token via Cookie Blindado
    response.cookies.set({
      name: 'educampo_session',
      value: token,
      httpOnly: true,
      secure: true, // Forçado true para conformidade estrita com o teste de segurança
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 8, // 8 horas em segundos
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}