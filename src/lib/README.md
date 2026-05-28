# 🛠️ Lib: Utilitários e Bibliotecas Centrais

Este diretório concentra funções utilitárias globais, esquemas de validação e bibliotecas auxiliares que são agnósticas a componentes visuais e podem ser reutilizadas em toda a aplicação.

## 🏛️ Arquitetura e Lógicas Principais

### 1. Comunicação Resiliente de API (`apiUtils.ts`)
A comunicação em nuvem é propensa a falhas transitórias (*Cold Starts*, micro-cortes, *Gateway Timeouts*). O utilitário `fetchComResiliencia` aplica dois padrões corporativos (*Enterprise Grade*) para proteger nossa aplicação:
* **Circuit Breaker (Disjuntor):** Define um teto de tentativas (ex: 3x para rotas pesadas de IA). Caso a falha persista, o circuito é "aberto" e a aplicação aborta, devolvendo o controle ao usuário com uma mensagem amigável, ao invés de deixá-lo preso em um estado de espera infinito.
* **Exponential Backoff:** Em vez de realizar retentativas frenéticas que poderiam piorar a situação do servidor (DDoS acidental), o tempo de espera dobra progressivamente a cada falha (2s, 4s, 8s...), dando fôlego à infraestrutura para se recuperar.

### 2. Validações e Contratos de Dados (`schemas.ts`)
Define as estruturas e regras de negócio dos formulários (Zod). Garante que a entrada de dados do produtor (ex: preço do leite, número de vacas) não contenha anomalias matemáticas, aplicando o conceito de *Input Validation* de segurança.

### 3. Constantes de Negócio (`constants.ts`)
Acomoda os limites matemáticos fixos (tetos inegociáveis para renderização de gráficos), variáveis globais de timeout e limites de requisição (Rate Limit).

## ⚙️ Regras de Consistência
* **Agnosticismo:** Nenhuma função deste diretório deve importar componentes React (`.tsx`) ou acessar diretamente a árvore do DOM. Isso facilita os testes unitários.
* **Documentação Obrigatória:** Cada utilitário recém-adicionado deve obrigatoriamente possuir *DocStrings* explicando as suas assinaturas e o princípio arquitetural que o norteia.