# 📡 Módulo de Aquecimento (`/app/api/ping`)

Este diretório contém a rota BFF responsável por despertar as APIs externas hospedadas em nuvem.

## 📖 O que este diretório faz?

Em provedores de nuvem serverless, o backend Python de Inteligência Artificial pode "dormir" após períodos de inatividade (Cold Start). Esta rota atua como um gatilho de "despertador": ela despacha uma requisição de rede ultra-leve (sem necessidade de chaves de API) para garantir que os servidores comecem a inicializar em *background* logo no momento em que o usuário acessa a tela de Login do site, economizando preciosos segundos de espera nas etapas analíticas seguintes.

A rota está configurada com um timeout intencionalmente longo (60 segundos) para suportar a latência completa de um cold start em ambientes de nuvem. Além disso, ela repassa o IP real do cliente (`X-Forwarded-For`) para a API de destino, assegurando que o Rate Limiter do Python não bloqueie indevidamente o IP do servidor Next.js durante múltiplas requisições.