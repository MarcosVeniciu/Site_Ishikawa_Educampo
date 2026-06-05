# Auditoria e Testes de Segurança

Este diretório contém os testes unitários dedicados a garantir as políticas estritas de segurança da plataforma. Eles atuam como a nossa "Lei".

### O que este diretório protege:
* **Zero-Token-Exposure:** Garante que dados sensíveis (tokens JWT) jamais toquem o armazenamento local do navegador (`localStorage` / `sessionStorage`), prevenindo ataques de XSS.
* **Blindagem de Sessão:** Assegura que os cookies gerados pelo backend sejam estritamente configurados com `HttpOnly`, `Secure` e `SameSite=Strict`.
* **Guardião de Rotas (Proxy):** Valida se o sistema bloqueia e redireciona implacavelmente acessos não autorizados às rotas privadas.