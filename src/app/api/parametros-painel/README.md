# 🎛️ Módulo de Parâmetros do Painel (`/app/api/parametros-painel`)

Este diretório contém a rota Backend-For-Frontend (BFF) responsável por buscar os limites estatísticos dinâmicos para a tela de simulação.

## 📖 O que este diretório faz?

Atua como um proxy seguro para a API Inteligente, recebendo dados âncora da fazenda (`producao_vaca`, `sistema_producao`, `vacas_lactacao`) para retornar os parâmetros limites (`min`, `max`, `step`, `fronteiras_cenario`). Esses limites são injetados diretamente nos controles interativos (*sliders*) no frontend, evitando distorções visuais e garantindo comparações precisas de cenários zootécnicos.