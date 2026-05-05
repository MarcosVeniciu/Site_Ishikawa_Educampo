# 📊 Módulo: Dashboard Central

Este diretório contém a página principal de visualização de dados do produtor. O Dashboard atua como o hub central da aplicação, transformando o estado global (`useFazendaStore`) em indicadores visuais e atalhos estratégicos.

## 📁 Estrutura de Arquivos

* `page.tsx`: Componente principal que renderiza a grade de benchmarking e os blocos de resumo/atalhos.
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

O layout segue o padrão de **Split-Screen** definido em protótipo:
* **Top Bar:** Navbar animada com menu hamburger e identidade visual Educampo.
* **Benchmarking (Top):** Grid de 3 colunas com indicadores rápidos de performance.
* **Resumo IA (Esquerda):** Bloco de alto contraste (Azul Educampo) que apresenta o insight principal e redireciona para o Diagnóstico Ishikawa.
* **Atalhos (Direita):** Grade de botões para acesso rápido às funcionalidades secundárias (Simulações e Edição de Dados).

## 🧪 Validação
A integridade deste módulo é garantida pelo arquivo de teste:
`tests/components/dashboard.spec.tsx`