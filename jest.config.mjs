/**
 * @file jest.config.mjs
 * @description Configuração do motor de testes Jest para Next.js 16+.
 * * COMO FUNCIONA:
 * 1. Utiliza o `next/jest` para herdar as configurações de compilação do framework,
 * garantindo que o SWC/Turbopack processe os arquivos de teste.
 * 2. Define o ambiente `jsdom` para emular o navegador em memória.
 * 3. Configura o `moduleNameMapper` para suportar os aliases de diretório (ex: @/)
 * definidos no tsconfig.json.
 */
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const config = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

export default createJestConfig(config);