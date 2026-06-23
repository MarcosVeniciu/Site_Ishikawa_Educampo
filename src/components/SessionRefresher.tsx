'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Componente invisível responsável por realizar o Sliding Session.
 * 
 * COMO FUNCIONA:
 * Ele é montado globalmente, mas só roda o intervalo se não estivermos na tela de login.
 * A cada 10 minutos (600000 ms), ele dispara uma requisição POST silenciosa para a rota /api/auth/refresh.
 * Isso permite que sessões de curta duração (15m) sejam continuamente estendidas enquanto a aba estiver aberta.
 */
export function SessionRefresher() {
  const pathname = usePathname();

  useEffect(() => {
    // Não roda o refresh se o usuário estiver na tela pública de login
    if (pathname === '/login') return;

    const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutos em milissegundos

    const interval = setInterval(async () => {
      // Evita polling redundante em múltiplas abas
      const lastRefresh = localStorage.getItem('last_refresh_time');
      const now = Date.now();
      
      // Se outra aba atualizou a sessão nos últimos 5 minutos, nós pulamos este ciclo
      if (lastRefresh && (now - parseInt(lastRefresh, 10)) < (5 * 60 * 1000)) {
        return;
      }

      try {
        await fetch('/api/auth/refresh', { method: 'POST' });
        // Registra o sucesso para avisar outras abas
        localStorage.setItem('last_refresh_time', now.toString());
      } catch (error) {
        console.error('Falha silenciosa ao tentar renovar a sessão');
      }
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [pathname]);

  return null;
}
