# 📊 Módulo: Tela de Diagnóstico (Ishikawa)

## 🎯 Propósito
Este diretório contém a interface de visualização detalhada dos resultados da IA. É aqui que os dados brutos e as análises estratégicas são traduzidos visualmente para o produtor rural, permitindo uma rápida identificação de gargalos na fazenda.

## 🏗️ Arquitetura e Componentes
A tela foi construída sob um padrão de "Abas Dinâmicas" (Tabs) gerenciadas pelo estado local do React. Isso garante transições fluidas e sem recarregamento de página.

* **`page.tsx`**: O controlador principal da rota. Ele consome o `useFazendaStore` para resgatar o diagnóstico gerado pelo BFF, constrói a navegação superior (CCS, Produção, Preço, etc.) e exibe os painéis de análise (Acelerômetro de Status, IA e Valor Atual).
* **`IshikawaDiagram.tsx`** *(Localizado em `src/components/ui/`)*: Componente filho importado pela página. Ele abstrai a complexidade do Diagrama de Espinha de Peixe, renderizando os 6 pilares (Ms) em um formato de *Grid Cards* responsivo.

## 🔒 Segurança e Fluxo
Esta rota atua de forma puramente reativa e passiva. Ela **não** faz requisições externas; apenas reage às mutações do estado global (`Zustand`) que já foram validadas de forma segura nas etapas anteriores da aplicação.