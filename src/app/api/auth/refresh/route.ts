import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import { SECURITY_CONSTANTS } from '@/lib/constants';

export const runtime = 'edge';

// Chave secreta para assinatura e verificação do JWT (proveniente do .env)
if (!process.env.ENCRYPTION_SECRET_KEY) {
  throw new Error('ALERTA CRÍTICO: Variável ENCRYPTION_SECRET_KEY ausente no .env');
}

const SECRET_KEY = new TextEncoder().encode(process.env.ENCRYPTION_SECRET_KEY);

/**
 * Manipula as requisições POST para a rota silenciosa de refresh do Sliding Session.
 * 
 * COMO FUNCIONA:
 * Extrai o cookie atual da requisição. Se não existir, retorna 401.
 * Valida o JWT utilizando a chave secreta. 
 * Extrai as informações de 'user' e 'rememberMe'.
 * Emite um novo token (assinatura fresca, nova data de expiração) e o injeta novamente
 * no navegador através de um cookie blindado (HttpOnly, Secure, SameSite=Strict).
 * 
 * Domain Context:
 * Resolve a regra de Sliding Session para renovar sessões ativas enquanto o usuário usa a aplicação,
 * expirando rapidamente se o navegador for fechado (caso rememberMe seja falso).
 *
 * @param {NextRequest} request - O objeto da requisição HTTP contendo o cookie.
 * @returns {Promise<NextResponse>} Resposta com o novo cookie ou mensagem de erro.
 */
export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SECURITY_CONSTANTS.SESSION_COOKIE_NAME);

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 401 });
    }

    // Valida o token atual (ainda precisa estar vivo)
    const { payload } = await jwtVerify(sessionCookie.value, SECRET_KEY);
    
    const username = payload.user as string;
    const rememberMe = Boolean(payload.rememberMe);
    const origIat = Number(payload.origIat);

    const now = Math.floor(Date.now() / 1000);
    const absoluteTimeout = rememberMe ? SECURITY_CONSTANTS.ABSOLUTE_TIMEOUT_LONG : SECURITY_CONSTANTS.ABSOLUTE_TIMEOUT_SHORT;

    // Hard Limit: Se o token for mais velho que o timeout absoluto, não permite refresh
    if (!origIat || (now - origIat) > absoluteTimeout) {
      return NextResponse.json({ error: 'Sessão atingiu o limite absoluto de duração' }, { status: 401 });
    }

    // Determina a nova duração do token e do cookie com base no rememberMe extraído
    const tokenAge = rememberMe ? SECURITY_CONSTANTS.MAX_TOKEN_AGE_LONG : SECURITY_CONSTANTS.MAX_TOKEN_AGE_SHORT;
    const cookieMaxAge = rememberMe ? SECURITY_CONSTANTS.COOKIE_MAX_AGE_LONG : SECURITY_CONSTANTS.COOKIE_MAX_AGE_SHORT;

    // Geração do NOVO token JWT dinâmico renovado (mantendo a data original)
    const newToken = await new SignJWT({ user: username, rememberMe, origIat })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(tokenAge)
      .sign(SECRET_KEY);

    const response = NextResponse.json({ message: 'Token renovado' }, { status: 200 });

    // Padrão Zero-Token-Exposure: Injeção do token renovado via Cookie Blindado
    response.cookies.set({
      name: SECURITY_CONSTANTS.SESSION_COOKIE_NAME,
      value: newToken,
      httpOnly: true,
      secure: true, // Forçado true para conformidade estrita com o teste de segurança
      sameSite: 'strict',
      path: '/',
      maxAge: cookieMaxAge,
    });

    return response;
  } catch (error) {
    // Falha silenciosa para o cliente, mas barra o refresh
    return NextResponse.json({ error: 'Token inválido ou expirado' }, { status: 401 });
  }
}
