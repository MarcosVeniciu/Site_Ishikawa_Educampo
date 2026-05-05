# 🛡️ Camada de Proxy: Diagnóstico (BFF)

Este diretório contém a lógica de integração segura para o processamento de diagnósticos zootécnicos.

## O Que Este Código Faz?
Esta rota atua como um **Backend-For-Frontend (BFF)**. Ela recebe os dados da fazenda enviados pelo produtor e os encaminha para a inteligência central do projeto Educampo.

### Responsabilidades:
1.  **Ocultação de Segredos:** Garante que o `API_TOKEN` e a `API_BASE_URL` nunca fiquem expostos no navegador do usuário.
2.  **Validação Estrita:** Utiliza o `Zod` para validar se os dados enviados pelo formulário são verídicos e seguros antes de enviá-los à API externa.
3.  **Segurança Flexível:** Possui suporte nativo via *Feature Flag* para ativação de criptografia de payload caso as normas de conformidade exijam no futuro.
4.  **Tratamento de Erros:** Converte falhas técnicas complexas da API externa em mensagens amigáveis e códigos de status HTTP semânticos (ex: 502 Bad Gateway).

## Segurança
A comunicação é protegida pelo protocolo HTTPS e utiliza autenticação via Bearer Token injetada em nível de servidor.