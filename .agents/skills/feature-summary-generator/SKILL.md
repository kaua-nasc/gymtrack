---
name: feature-summary-generator
description: "Gera resumos técnicos estruturados de funcionalidades para desenvolvedores e IAs de frontend/mobile. Use quando o usuário solicitar um resumo, documentação ou explicação de uma funcionalidade para implementação externa. O padrão inclui: Resumo Técnico, Lógica do Backend, Interface de API e Comportamento no Aplicativo."
---

# Feature Summary Generator

Esta skill deve ser utilizada para produzir documentação técnica de alta fidelidade para consumo por outros desenvolvedores ou agentes de IA encarregados da implementação da interface do usuário (Frontend ou Mobile).

## Diretrizes de Geração

Sempre siga o template definido em [template.md](references/template.md). O resumo deve ser conciso, técnico e direto ao ponto, evitando termos vagos.

### 1. Resumo Técnico
Deve descrever *o quê* a funcionalidade faz e *por quê* ela é importante.

### 2. Lógica do Backend
Detalhamento técnico do fluxo no servidor:
- Como o `userId` é obtido.
- Validações de regras de negócio (ex: se o usuário já possui o perfil solicitado).
- Mudanças persistentes no banco de dados (tabelas, colunas, deleções em cascata).
- Uso de transações para garantir atomicidade.

### 3. Interface de API
Especificação técnica do contrato de comunicação:
- Método HTTP e Rota exata.
- Requisitos de autenticação.
- Estrutura do payload e respostas HTTP (sucesso e erros comuns).

### 4. Comportamento no Aplicativo (UX/UI)
Orientações práticas para a interface:
- Avisos de confirmação para ações destrutivas (ex: perda de dados ao mudar de perfil).
- Necessidade de atualizar o estado global do usuário.
- Feedback visual para o usuário final.

---

## Recursos Adicionais

- **Template Base:** Consulte [template.md](references/template.md) para a estrutura padrão.
