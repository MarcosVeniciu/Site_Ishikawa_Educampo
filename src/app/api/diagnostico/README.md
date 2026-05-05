# 🛡️ Camada de Proxy: Diagnóstico (BFF)

Este diretório contém a lógica de integração segura para o processamento de diagnósticos zootécnicos.

## O Que Este Código Faz?
Esta rota atua como um **Backend-For-Frontend (BFF)**. Ela recebe os dados da fazenda enviados pelo produtor e os encaminha para a inteligência central do projeto Educampo.

### Responsabilidades:
1.  **Ocultação de Segredos:** Garante que o `API_TOKEN` e a `API_BASE_URL` nunca fiquem expostos no navegador do usuário.
2.  **Validação Estrita:** Utiliza o `Zod` para validar se os dados enviados pelo formulário são verídicos e seguros antes de enviá-los à API externa.
3.  **Segurança Flexível:** Possui suporte nativo via *Feature Flag* para ativação de criptografia de payload.
4.  **Tratamento de Erros:** Converte falhas técnicas complexas da API externa em mensagens amigáveis e códigos de status HTTP semânticos (ex: 502 Bad Gateway).

## Segurança
A comunicação é protegida pelo protocolo HTTPS e utiliza autenticação via Bearer Token injetada em nível de servidor.

### 🔐 Feature Flags (Criptografia de Payload - Futuro)
A arquitetura do BFF foi desenhada com *Security by Design*, prevendo a necessidade de criptografia avançada do payload (dados sensíveis da fazenda) antes do envio à API em Python.

⚠️ **Status Atual:** Esta funcionalidade é **opcional e atualmente não está implementada** (marcada com um `TODO` no código-fonte em `route.ts`). 

Ela foi preparada para ser controlada pelas seguintes variáveis no arquivo `.env`:
*   `ENABLE_PAYLOAD_ENCRYPTION=true`: Habilita o desvio de fluxo para criptografar os dados.
*   `ENCRYPTION_SECRET_KEY`: Receberá a chave simétrica gerada (ex: para criptografia AES-256).

> **Atenção:** Ative essa *Feature Flag* no ambiente de produção apenas após a lógica AES ser totalmente implementada neste frontend **e** a API em Python ter sido devidamente atualizada para descriptografar os dados com a mesma chave.