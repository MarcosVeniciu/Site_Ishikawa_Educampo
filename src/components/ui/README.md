# Diretório: `/src/components/ui`

Este diretório armazena os **Componentes de Interface (UI)** que são reutilizáveis e agnósticos em relação à regra de negócio. O foco exclusivo destes componentes é a apresentação visual, acessibilidade e adaptação a diferentes tamanhos de tela.

## 📄 Arquivos Principais

* **`SplitScreenLayout.tsx`:**
  Um componente estrutural de layout (Wrapper) que serve como "moldura" visual.
  - **Responsividade:** Em dispositivos móveis (telas pequenas), exibe o formulário em tela cheia com um banner no topo. Em desktops (telas grandes), divide a tela no padrão 50/50.
  - **Design System:** Herda e aplica automaticamente os gradientes da marca (`from-primary` to `primary-light`).
  - **Propósito:** Impedir a duplicação de classes CSS complexas. Ao usar este layout, qualquer página herda instantaneamente o design corporativo aprovado, protegendo os desenvolvedores de precisarem recriar a identidade visual a cada nova tela.