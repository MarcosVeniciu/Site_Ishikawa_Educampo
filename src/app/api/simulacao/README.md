# Diretório: `/src/app/api/simulacao`

Este diretório contém a rota BFF (Backend-For-Frontend) responsável pela comunicação segura com o serviço de predição e Machine Learning da API em Python.

## 📄 O Que Este Código Faz

Diferente do `/api/diagnostico` que realiza uma varredura completa e custosa em processamento gerativo (LLM), este endpoint atua como uma via de acesso rápido projetada para as **Simulações de Cenário**.

1. **Proxy Seguro:** Recebe os dados alterados pelo produtor na interface (ex: aumento artificial do preço do leite), oculta os Tokens de Autorização corporativos do Frontend e repassa a requisição HTTP.
2. **Barreira de Insumos:** Ele atua como um porteiro leve, garantindo (antes mesmo de fazer a requisição de rede externa) que campos vitais para o algoritmo de Machine Learning, como o `preco_concentrado`, estejam presentes no *payload*.
3. **Alta Frequência e Resiliência:** Projetado para responder na casa dos milissegundos para que a interface de *sliders* não trave o navegador do produtor enquanto projeta as métricas na tela.

### Contrato de Comunicação
* **Entrada (POST):** Recebe um *payload* segmentado em dois blocos principais: `dados_originais` (para ancoragem e filtro inalterado do produtor, evitando o *Moving Goalpost Problem*) e `dados_simulados` (com as variáveis manipuladas no front). O insumo `custo_concentrado` é obrigatório no bloco simulado.
* **Saída:** Retorna as métricas e indicadores de simulação emparelhados com as réguas de mercado (quartil inferior, mediano e superior), incluindo um campo extra de predição do Custo Total gerado pelo algoritmo de ML.
