# 🤖 Diretrizes para Assistentes de IA

Olá, Gemini Code Assist! **Sempre** siga as regras descritas neste documento!

---

Preste atenção às seguintes diretrizes cruciais deste projeto:

1. **Testes como Contrato (A Lei)**: Primeiro criamos os testes (unitários, segurança, etc.) para definir como o código deve funcionar. Só após os testes estarem prontos iniciamos a implementação. O código deve se adaptar para passar nos testes. NUNCA altere o teste apenas porque o código falhou; o código é que deve se adaptar a ele. Em caso de mudança de requisitos, altere o teste primeiro e, depois, o código.
2. **DocStrings Obrigatórias**: Todo código gerado (inclusive os de testes) deve conter DocStrings. Essa é a documentação para que os programadores entendam *como* o código está fazendo o que se propõe.
3. **Documentação via README.md**: Todo diretório deve ter um `README.md` explicando detalhadamente *o que* o código faz (para programadores e não-programadores). Um único README engloba todos os arquivos daquele diretório. Para os subdiretórios, explique-os brevemente indicando seus propósitos e inclua obrigatoriamente o link em markdown para seus respectivos READMEs.
4. **Consciência de Contexto (Context Awareness)**: Antes de propor modificações em qualquer arquivo, faça uma verificação cruzada do seu contexto. Caso os arquivos necessários para a execução da tarefa não tenham sido fornecidos na janela de contexto atual, não tente adivinhar a estrutura do código. Em vez disso, pause a ação e liste explicitamente os nomes ou caminhos completos dos arquivos que o usuário precisa compartilhar para prosseguir.
5. **Geração Segura de Diffs (Blind-Edit Prevention)**: É estritamente proibido gerar *diffs* unificados para modificar arquivos que não estejam carregados no seu contexto. A geração de alterações sem conhecer o estado atual exato (*baseline*) do arquivo pode causar a corrupção do código. Sempre solicite que o usuário insira o arquivo no contexto primeiro. A única exceção aplica-se à **criação de arquivos inteiramente novos**, onde o *diff* deve obrigatoriamente partir de uma origem vazia (ex: `--- /dev/null`).
6. **Atualização Obrigatória da Estrutura do Projeto no README**: Sempre que você criar ou apagar um arquivo ou diretório, você deve, obrigatoriamente, atualizar a seção "Estrutura do Projeto" no `README.md` principal (localizado na raiz do projeto). A árvore de diretórios documentada deve refletir exatamente o estado atualizado do código-fonte.