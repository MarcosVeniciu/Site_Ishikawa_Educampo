# 🤖 Diretrizes do Assistente Virtual (Gemini Code Assist)

> **⚠️ INSTRUÇÃO MÁXIMA E OBRIGATÓRIA**
> Você é o assistente oficial de engenharia de software deste projeto. 
> As regras, padrões arquiteturais e fluxos de trabalho descritos neste arquivo são **inegociáveis**. 
> **Você DEVE SEMPRE ler, analisar e seguir estritamente TODAS as instruções contidas neste documento em absolutamente todas as interações.** Nenhuma sugestão, criação ou modificação de código deve ser feita se violar as regras abaixo.

---

## Regras de Desenvolvimento e Conduta

1. **Testes como Contrato (A Lei)**: Primeiro criamos os testes (unitários, segurança, etc.) para definir como o código deve funcionar. Só após os testes estarem prontos iniciamos a implementação. O código deve se adaptar para passar nos testes. NUNCA altere o teste apenas porque o código falhou; o código é que deve se adaptar a ele. Em caso de mudança de requisitos, altere o teste primeiro e, depois, o código.
2. **DocStrings Obrigatórias**: Todo código gerado (inclusive os de testes) deve conter DocStrings. Essa é a documentação para que os programadores entendam *como* o código está fazendo o que se propõe.
A documentação é feita não apenas no cabeçalho do código mas também internamente.
3. **Documentação via README.md**: Todo diretório deve ter um `README.md` explicando detalhadamente *o que* o código faz (para programadores e não-programadores). Um único README engloba todos os arquivos daquele diretório. Para os subdiretórios, explique-os brevemente indicando seus propósitos e inclua obrigatoriamente o link em markdown para seus respectivos READMEs.
4. **Fluxo de Criação e Atualização de Código (Obrigatório)**: Sempre que for solicitado a criar, modificar ou atualizar qualquer código, você deve seguir este ciclo rigorosamente:
* **Antes de codificar:** Leia e analise o `README.md` presente no diretório do arquivo em questão. Este documento contém o propósito e as responsabilidades dos códigos daquela pasta e guiará sua implementação.
* **Após codificar:**
  1. Revise e atualize as **DocStrings** do arquivo alterado, garantindo o cumprimento da Regra 2 (explicando *como* o código funciona).
  2. Revise e atualize o **`README.md` do diretório** do arquivo. Se a sua alteração adicionou novas lógicas de negócio, novos arquivos ou mudou o que o módulo faz, o README do diretório deve ser atualizado imediatamente para refletir a nova realidade.
5. **Consciência de Contexto (Context Awareness)**: Antes de propor modificações em qualquer arquivo, faça uma verificação cruzada do seu contexto. Caso os arquivos necessários para a execução da tarefa não tenham sido fornecidos na janela de contexto atual, não tente adivinhar a estrutura do código. Em vez disso, pause a ação e liste explicitamente os nomes ou caminhos completos dos arquivos que o usuário precisa compartilhar para prosseguir.
6. **Geração Segura de Diffs (Blind-Edit Prevention)**: É estritamente proibido gerar *diffs* unificados para modificar arquivos que não estejam carregados no seu contexto. A geração de alterações sem conhecer o estado atual exato (*baseline*) do arquivo pode causar a corrupção do código. Sempre solicite que o usuário insira o arquivo no contexto primeiro. A única exceção aplica-se à **criação de arquivos inteiramente novos**, onde o *diff* deve obrigatoriamente partir de uma origem vazia (ex: `--- /dev/null`).
7. **Atualização Obrigatória da Estrutura do Projeto no README**: Sempre que você criar ou apagar um arquivo ou diretório, você deve, obrigatoriamente, atualizar a seção "Estrutura do Projeto" no `README.md` principal (localizado na raiz do projeto). A árvore de diretórios documentada deve refletir exatamente o estado atualizado do código-fonte.