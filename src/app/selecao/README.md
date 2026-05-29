# 🧭 Rota de Seleção (`/selecao`)

## 📖 O Que Este Diretório Faz?
Este diretório contém a interface de bifurcação (padrão *Split Screen/Dual Action*) da aplicação. Ele abriga a tela apresentada ao usuário imediatamente após a finalização do processo de processamento da API (na Tela de Carregamento).

Sua única responsabilidade de negócio é forçar o usuário a decidir, visualmente, qual jornada deseja trilhar em seguida: analisar o presente (Diagnóstico) ou projetar o futuro (Simulação).

## 🧠 Arquitetura Visual e Engenharia

### Padrão *Split Screen Hover*
A página (`page.tsx`) divide ativamente a Viewport (`100vh`) do dispositivo em duas áreas que competem pela atenção do produtor. 
* **Desktop:** Divide a tela verticalmente (50% esquerda e 50% direita).
* **Mobile:** Divide a tela horizontalmente (metade superior e metade inferior).

### A Lógica de Mutação de Estado
Em vez de isolar interações CSS com a pseudo-classe `:hover`, usamos uma abordagem programática no React (`useState`) capturando eventos de `onMouseEnter` e `onMouseLeave`. Isso permite um *Cross-Reaction*:
* Se o mouse foca no lado **Diagnóstico**, não apenas ele expande seu tamanho em grade flexível e intensifica as cores primárias, mas ativa condicionalmente classes no componente **Simulação** que o retraem (`flex shrink`), escurecem (`brightness-50`) e reduzem sua saturação (`grayscale`). O inverso também ocorre perfeitamente.

## 🛡️ Regras de Consistência
* **Acessibilidade Absoluta:** Como botões gigantes que cobrem a tela inteira, os contêineres usam a tag `<Link>` de forma nativa e semântica (`aria-label`), garantindo pré-carregamento dinâmico das rotas de destino (`prefetch`) e suporte via navegação por teclado.
* **Identidade de Cores:** O arquivo consome as cores temáticas já estipuladas na `Navbar.tsx` (Azul `#1973d3` para o Diagnóstico e Laranja `amber-600` para a Simulação). As transições de cores são processadas suavemente através da diretiva do Tailwind `transition-all duration-700 ease-in-out`.