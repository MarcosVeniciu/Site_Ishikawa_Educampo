# BFF - Rota de Autenticação

Este diretório faz parte da camada BFF (*Backend-For-Frontend*) da aplicação, atuando como o intermediário seguro entre a interface do usuário e a lógica de autenticação.

### O que este módulo faz:
* Recebe as credenciais fornecidas pelo produtor na Tela de Login.
* Valida as informações de acesso (atualmente via *mock*, futuramente via integração com backend definitivo).
* Gera e assina criptograficamente o token JWT da sessão utilizando a biblioteca `jose`.
* Injeta o token de forma invisível no navegador do usuário utilizando cabeçalhos HTTP (`Set-Cookie` blindado), garantindo o padrão *Zero-Token-Exposure*.