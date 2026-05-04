# Diretório: `/src/app`

Este é o diretório raiz do **Next.js App Router**. Ele contém o layout mestre da aplicação, estilos globais, configurações de tema e as rotas principais do sistema.

## 📄 Arquivos Principais

* **`layout.tsx` (Root Layout):** A "casca" obrigatória de todo o sistema. Ele injeta as tags HTML fundamentais (`<html>` e `<body>`) para envolver as rotas da aplicação. É o responsável por importar o `globals.css`, aplicando o sistema de cores base e a cor de fundo padrão em todas as telas.
* **`globals.css`:**
  Responsável por inicializar o **Tailwind CSS v4** (via diretiva `@import "tailwindcss";`) e centralizar o nosso **Design System**. Dentro do bloco `@theme`, mapeamos as cores institucionais do Educampo para nomenclaturas semânticas (como `--color-primary` e `--color-fundo`), garantindo uma "Única Fonte de Verdade" para a identidade visual do projeto.

## 🔗 Subdiretórios
* [`/login`](./login/README.md) - Rota visual para autenticação de usuários.
* [`/api`](./api/README.md) - Endpoints internos do nosso Backend-For-Frontend (BFF).