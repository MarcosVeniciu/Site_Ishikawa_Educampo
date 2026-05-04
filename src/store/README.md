# 📦 Camada Store - Gerenciamento de Estado

Utilizamos o **Zustand** para gerenciar o estado global da aplicação de forma leve e performática.

## Responsabilidades

* **`useFazendaStore.ts`**: Gerencia os dados da fazenda inseridos pelo usuário.
  - Armazena informações temporárias durante o fluxo de diagnóstico.
  - Facilita o acesso aos dados em telas distantes (Coleta -> Dashboard -> Ishikawa).

Para entender o fluxo de mutação de estado, consulte as DocStrings em `useFazendaStore.ts`.