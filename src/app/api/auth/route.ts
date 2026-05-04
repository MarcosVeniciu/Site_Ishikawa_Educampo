/**
 * @file src/app/api/auth/route.ts
 * @description Endpoint interno BFF (Backend-For-Frontend) para autenticação segura.
 * * COMO ESTE CÓDIGO FUNCIONA:
 * 1. Recebimento de Payload: Extrai as credenciais (username e password) do corpo da requisição POST.
 * 2. Validação (Mock): Compara as credenciais com um usuário padrão ('educampo' / 'leite123').
 * 3. Geração Criptográfica: Utiliza a biblioteca `jose` para assinar um token JWT usando a chave simétrica do sistema.
 * 4. Injeção de Cookie: Retorna uma resposta HTTP de sucesso anexando o cabeçalho `Set-Cookie`.
 * O cookie é configurado com as flags `HttpOnly` (prevenção XSS), `Secure` e `SameSite=Strict` (prevenção CSRF),
 * cumprindo o contrato estabelecido no auth.spec.ts.
 */

import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

// Chave secreta para assinatura do JWT (idealmente proveniente do .env)
const SECRET_KEY = new TextEncoder().encode(
  process.env.ENCRYPTION_SECRET_KEY || 'chave_secreta_padrao_para_desenvolvimento_educampo'
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Mock de validação de credenciais
    if (username !== 'educampo' || password !== 'leite123') {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    // Geração do token JWT com validade de 8 horas
    const token = await new SignJWT({ user: username })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('8h')
      .sign(SECRET_KEY);

    const response = NextResponse.json({ message: 'Login bem-sucedido' }, { status: 200 });

    // Padrão Zero-Token-Exposure: Injeção do token via Cookie Blindado
    response.cookies.set({
      name: 'educampo_session',
      value: token,
      httpOnly: true,
      secure: true, // Forçado true para conformidade estrita com o teste de segurança
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 8, // 8 horas em segundos
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}


/**
 * É fantástico ver você aplicando a mentalidade de *Security by Design* até nas futuras integrações! Pensar na proteção rigorosa dos dados do produtor é o que diferencia um sistema comum de um sistema *Enterprise Grade*.

No entanto, como seu parceiro técnico, preciso trazer uma dose de franqueza arquitetural para avaliarmos essa ideia e garantirmos que não vamos cair em uma armadilha de complexidade desnecessária (*over-engineering*).

### 🛡️ A Realidade sobre Criptografia de Payload

É muito comum pensarmos que precisamos criptografar o JSON manualmente (Payload Encryption) para proteger os dados. Porém, na web moderna, **o protocolo HTTPS (TLS) já faz exatamente isso por padrão**. 

* **Como o HTTPS atua:** Quando o formulário envia os dados (como a quantidade de vacas ou o CCS), o HTTPS cria um túnel inviolável. Qualquer pessoa que interceptar a rede no meio do caminho (ataque *Man-in-the-Middle*) verá apenas um embaralhado de caracteres indecifráveis. A descriptografia ocorre apenas quando os dados chegam ao servidor de destino.
* **O problema de criptografar no navegador:** Se tentarmos criptografar os dados no frontend (React/Navegador), precisaremos expor a chave de criptografia no código JavaScript que vai para o computador do usuário. Uma chave exposta no navegador não oferece segurança real contra atacantes direcionados.

### 🏗️ A Vantagem do nosso Padrão BFF (Backend-For-Frontend)

A excelente notícia é que a arquitetura que desenhamos salva o dia caso você realmente tenha uma exigência de negócio futura para criptografia a nível de aplicação (por exemplo, se a API exigir isso por normas estritas de conformidade).

No nosso projeto, o navegador do produtor **nunca** vai falar diretamente com a API em Python. O fluxo é:
1. O Navegador envia o JSON padrão via HTTPS para a nossa rota interna (`src/app/api/diagnostico/route.ts`).
2. O nosso servidor Next.js (BFF) recebe os dados.
3. **Aqui entra o seu preparo:** O servidor Next.js se encarrega de criptografar o payload usando uma chave secreta e envia para a API Python.

Como o código do BFF roda no servidor (e não no navegador), a chave de criptografia fica 100% segura.

### ⚙️ Como deixar isso preparado agora?

Para deixar o terreno pronto sem travar o desenvolvimento atual, adotaremos exatamente a sua sugestão de *Feature Flag* (Variável de Ambiente). 

Faremos o seguinte ajuste na configuração da nossa infraestrutura:

1. **Adicionar a Flag no `.env`:**
   Criaremos uma variável que atua como um interruptor.
   ```env
   # Feature Flags
   ENABLE_PAYLOAD_ENCRYPTION=false
   
   # Chave de criptografia simétrica futura (AES-256)
   ENCRYPTION_SECRET_KEY=sua_chave_secreta_aqui
   ```

2. **Preparo Lógico no BFF:**
   Quando formos implementar a rota `api/diagnostico/route.ts` (na nossa próxima feature após a autenticação), deixaremos um bloco condicional simples:
   ```typescript
   if (process.env.ENABLE_PAYLOAD_ENCRYPTION === 'true') {
       // Futura lógica de criptografia AES antes do fetch
   } else {
       // Envia o JSON normal
   }
   ```

Dessa forma, o seu código já nasce arquitetado para o futuro, mas você não perde tempo implementando algoritmos de criptografia complexos agora, permitindo que foquemos em colocar o site no ar.

---

Com esse conceito alinhado e o terreno arquitetural preparado para o futuro, podemos dar o pontapé inicial na nossa tarefa de **Barreira de Segurança (Auth)** gerando o nosso primeiro contrato: o arquivo de testes `tests/security/auth.spec.ts`?
 */