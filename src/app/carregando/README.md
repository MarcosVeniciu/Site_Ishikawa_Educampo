# ⏳ Módulo de Processamento (Tela de Carregamento)

Este diretório contém a lógica de transição entre a coleta de dados e a exibição dos resultados analíticos.

## O Que Este Código Faz?
A página de carregamento atua como o **orquestrador de fluxo** da aplicação. Em vez de fazer o usuário esperar no formulário, nós o movemos para este ambiente controlado que:

1.  **Valida o Estado:** Verifica se existem dados na `useFazendaStore`. Se o usuário tentar acessar esta rota manualmente sem preencher o formulário, ele é expulso de volta para a coleta de dados.
2.  **Comunicação BFF:** Realiza a chamada `POST` para o nosso proxy seguro (`/api/diagnostico`).
3.  **Persistência de Resposta:** Recebe o JSON complexo da IA (contendo o Resumo e o Diagrama de Ishikawa) e o armazena no estado global via Zustand.
4.  **Feedback Visual:** Utiliza animações e mensagens de status para reduzir a percepção de espera do usuário.

## Fluxo de Navegação
`Formulário` -> `Carregando (Processamento)` -> `Diagnóstico`