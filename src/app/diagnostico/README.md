# 📊 Módulo: Tela de Diagnóstico

Este diretório contém a página principal de visualização de dados do produtor. A Tela de Diagnóstico atua como o hub central da aplicação, transformando o estado global (`useFazendaStore`) em indicadores visuais, resumo estratégico e detalhamento de causas através da metodologia Ishikawa.

## 📁 Estrutura de Arquivos

* `page.tsx`: Componente principal que renderiza a grade de benchmarking, blocos de resumo da IA e análise do diagrama Ishikawa.
* `README.md`: Documentação técnica do módulo (este arquivo).

## 🧮 Regras de Negócio e Benchmarking

### ⚠️ Importante: Cálculos Temporários (Dívida Técnica)
Conforme definição de projeto para a Sprint atual, os cálculos de benchmarking estão sendo realizados **diretamente no frontend** dentro de `page.tsx`. 

> **TODO:** Estes cálculos são temporários. Em versões futuras, a lógica de comparação regional e por sistema de produção deve ser delegada integralmente ao **BFF (Backend-for-Frontend)** ou à **API Educampo**, para garantir que os critérios de "Média Regional" sejam dinâmicos e baseados em dados reais de toda a base.

**Critérios Atuais (Hardcoded):**
1.  **Produção por Vaca:** * `>= 30 L/dia`: "Acima da Média" (Verde)
    * `< 30 L/dia`: "Atenção" (Âmbar)
2.  **Qualidade (CCS):**
    * `<= 200`: "Excelente" (Verde)
    * `> 200`: "Atenção" (Âmbar)
3.  **Preço Recebido:**
    * `>= Preço de Referência`: "Competitivo" (Verde)
    * `< Preço de Referência`: "Abaixo do Mercado" (Âmbar)

## 🎨 Layout e Experiência do Usuário (UX)

* **Top Bar:** Navbar animada com menu hamburger e identidade visual Educampo.
* **Benchmarking:** Grid de 3 colunas com comparativos rápidos de performance (Produção, Qualidade, Preço).
* **Resumo IA:** Bloco de largura total e alto contraste (Azul Educampo) que apresenta a conclusão principal e visão macro do negócio gerada pela inteligência artificial.
* **Navegação de Indicadores (Stepper):** Fluxo de navegação visual baseado em passos (círculos numerados interativos e conectores horizontais) que orienta o usuário através de cada indicador de forma sequencial e imersiva.
* **Ishikawa:** Painel visual mostrando o status do indicador, textos estratégicos e detalhamento causal (6 Ms).

## 🧪 Validação
A integridade deste módulo é garantida pelo arquivo de teste:
`tests/components/diagnostico.spec.tsx`