# Diretório: `/src/app/simulacao`

Este diretório concentra a interface e a lógica da **Ferramenta de Simulação de Cenários (What-If Analysis)**.

## 📄 O Que Este Código Faz

É o painel analítico interativo onde o produtor ou o consultor pode manipular as variáveis atuais da sua propriedade e projetar (com base na predição algorítmica) como pequenas melhorias impactarão na sua margem financeira no fim do ciclo.

* **Isolamento de Estado (Sandbox):** A tela importa os dados originais resgatados pelo Zustand (`useFazendaStore`), mas transcreve-os para um estado reativo e descartável local. Isso garante que o usuário arraste os controles livremente sem corromper acidentalmente os dados reais do seu diagnóstico principal.
* **Motor Matemático Otimizado:** Componentes triviais como a "Receita Bruta" são recalculados de imediato no próprio navegador (via gancho estrutural `useMemo`) a cada vez que o usuário move o controle deslizante, garantindo uma resposta fluida (UX em 60 FPS) sem esgotar a rede com múltiplas requisições.
* **Orquestração de Machine Learning:** Ao clicar em "Analisar Cenário", a tela calcula o perfil produtivo e envia as anomalias para a rota local `api/simulacao/route.ts`, solicitando que a IA devolva as projeções de limiares complexos (como Custos Ocultos e Benchmarking de Quartis).
* **Renderização Numérica Absoluta:** O arquivo gerencia e renderiza múltiplos componentes embutidos de gráficos comparativos puros, sem depender de bibliotecas pesadas de desenho vetorial como Chart.js ou Recharts.
