import { NextResponse } from 'next/server';
import { SECURITY_CONSTANTS } from '@/lib/constants';

export async function POST() {
  const response = NextResponse.json({ message: 'Logout bem-sucedido' }, { status: 200 });

  // Padrão Zero-Token-Exposure: Invalida o cookie da sessão
  response.cookies.set({
    name: SECURITY_CONSTANTS.SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 0, // Expira imediatamente
  });

  return response;
}
