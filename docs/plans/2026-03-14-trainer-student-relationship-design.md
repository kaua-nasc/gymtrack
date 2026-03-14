# Design Doc: Vínculo de Consultoria Treinador-Aluno

**Status:** Approved
**Date:** 2026-03-14
**Author:** Gemini CLI

## 1. Contexto & Objetivos

Com a distinção entre perfis de `CLIENT` e `PERSONAL_TRAINER`, precisamos de uma forma oficial de conectá-los para fins de consultoria esportiva. O objetivo é permitir que um profissional gerencie múltiplos alunos, tendo acesso aos seus dados de progresso e capacidade de personalizar seus treinos.

### Objetivos:
- Implementar um sistema de convite via código (Invite Code) gerenciado pelo Treinador.
- Estabelecer um vínculo oficial de consultoria no banco de dados.
- Garantir que o Treinador tenha permissões de visualização e edição sobre os dados do Aluno vinculado.
- Permitir que ambas as partes encerrem o vínculo a qualquer momento.

## 2. Mudanças no Módulo Identity

### 2.1. Entidade `User`
- Adicionar campo `trainerInviteCode` (String, Unique, Nullable).
- Apenas usuários com `type: PERSONAL_TRAINER` podem ter este campo preenchido.

### 2.2. Nova Entidade `TrainerStudentRelationship`
- `trainerId` (UUID): Referência ao Personal Trainer.
- `studentId` (UUID): Referência ao Aluno (Unique).
- `linkedAt` (DateTime): Data de início do vínculo.

### 2.3. Lógica de Negócio (Service)
- **Gerar Código**: Personal pode definir seu código customizado ou o sistema gera um aleatório.
- **Vincular**: Aluno fornece o código. O sistema valida o código, encontra o Personal e cria o registro de vínculo.
- **Desvincular**: Remove o registro da tabela de relacionamento.

## 3. Mudanças no Módulo Training Plan

### 3.1. Autorização de Edição
- Ao tentar modificar um plano de um usuário, o `TrainingPlanManagementService` deve verificar se o autor da requisição é:
  1. O próprio dono do plano.
  2. O Personal Trainer vinculado oficialmente ao dono do plano (via integração com Identity).

## 4. Fluxo de Dados (Linking)

1. **Treinador**: `PATCH /identity/user/profile/trainer-code` -> Define "TEAM-SILVA".
2. **Aluno**: `POST /identity/user/profile/link-trainer` -> Body `{ "code": "TEAM-SILVA" }`.
3. **Sistema**: Valida código -> Cria vínculo -> Retorna sucesso.
4. **Treinador**: Agora ao listar `GET /identity/user/students`, o aluno aparece na lista.

## 5. Considerações de Privacidade

- O vínculo de consultoria atua como uma "procuração". O aluno, ao aceitar o convite, concorda em compartilhar seus dados biométricos com o profissional selecionado.
- Se o vínculo for encerrado, o Personal Trainer perde instantaneamente o acesso aos dados privados e à edição dos planos do ex-aluno.

## 6. Testes E2E

- **Testes de Vínculo**:
  - Aluno vinculando-se com código válido (Sucesso).
  - Aluno tentando se vincular a dois treinadores (Erro - Um aluno por vez).
  - Usuário tentando definir código de treinador sem ser `PERSONAL_TRAINER` (Erro - 403).
- **Testes de Acesso**:
  - Treinador acessando peso de aluno vinculado (Sucesso).
  - Treinador tentando acessar peso de usuário não vinculado (Erro - 403).
