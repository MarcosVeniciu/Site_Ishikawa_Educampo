# Módulo de Coleta de Dados

Este diretório contém a interface de entrada de dados operacionais e zootécnicos da fazenda.

## 📋 Responsabilidades
- **Interface de Usuário:** Renderiza o formulário dividido em quadrantes lógicos (Geral, Rebanho, Qualidade).
- **Validação de Entrada:** Utiliza o `fazendaSchema` (Zod) para garantir que apenas dados válidos sejam processados.
- **Persistência Temporária:** Injeta os dados validados na store global (`Zustand`) para uso posterior no diagnóstico.

## 🧩 Componentes e Arquivos
* `page.tsx`: Componente principal que gerencia o formulário e a navegação para a próxima etapa.
* `README.md`: Este guia de documentação do diretório.

## 🔗 Navegação
Para entender como esses dados são validados, consulte a documentação da [Biblioteca de Schemas](../lib/README.md).

## 🛡️ Segurança e UX
- **Sanitização:** Todos os inputs numéricos são tratados antes de chegarem à store.
- **Feedback Visual:** Exibe mensagens de erro em tempo real caso os requisitos do schema não sejam atendidos.
- **Hierarquia de Informação em 3 Níveis:** Para maximizar a clareza para o público rural, o formulário adota:
  1. **Rótulo e Unidade (Label):** Informa claramente o que é esperado e a métrica (ex: cab., ha, L/dia).
  2. **Placeholder (Exemplo):** Exemplifica o formato numérico esperado (ex: 35.0, 150).
  3. **Tooltips (Apoio):** Ícones iterativos (`lucide-react`) que detalham a regra de negócio para campos complexos, como a regra dos "mil" no CCS.
