'use client';

import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';

/**
 * @description Engloba todos os provedores globais da aplicação que dependem de 'use client'.
 * Instancia o Tooltip.Provider na raiz para economizar instâncias no Virtual DOM 
 * em páginas que usam centenas de tooltips simultâneos.
 */
export function GlobalProviders({ children }: { children: React.ReactNode }) {
  return (
    <Tooltip.Provider delayDuration={150}>
      {children}
    </Tooltip.Provider>
  );
}
