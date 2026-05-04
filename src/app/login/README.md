# Diretório: `/src/app/login`

Responsável por armazenar a interface pública de autenticação, sendo a porta de entrada para os produtores/consultores que utilizarão o Diagnóstico Ishikawa.

## 📄 Arquivos Principais

* **`page.tsx`:**
  A interface reativa (`'use client'`) que apresenta o formulário de login.
  - **Separação de Responsabilidades Visual:** Não lida com breakpoints complexos ou fundos. Ela delega a formatação visual ao componente `SplitScreenLayout`.
  - **Segurança Prática (Zero-Token-Exposure):** O componente tem a missão estrita de coletar usuário/senha e disparar para o nosso BFF (`/api/auth`). Ele **não processa, não lê e não salva** tokens localmente (como `localStorage`), garantindo que o frontend fique cego para credenciais sensíveis e dependa dos cookies injetados pelo servidor.
  - **Atalho de Desenvolvimento:** Contém a função `fillTestCredentials` para acelerar o fluxo de testes funcionais.