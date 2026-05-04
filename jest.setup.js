/**
 * @file jest.setup.js
 * @description Arquivo de inicialização e injeção de dependências globais para a suíte de testes.
 * * COMO FUNCIONA:
 * Importa o pacote `@testing-library/jest-dom`, que adiciona "matchers" personalizados
 * ao objeto `expect` do Jest. Isso permite utilizarmos asserções semânticas e voltadas 
 * para a interface de usuário, como `expect(element).toBeInTheDocument()` ou 
 * `expect(element).toHaveTextContent()`.
 */

import '@testing-library/jest-dom';