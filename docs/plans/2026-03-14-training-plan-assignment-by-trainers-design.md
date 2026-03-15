# Design Doc: Atribuição de Planos de Treino por Treinadores

**Status:** Approved
**Date:** 2026-03-14
**Author:** Gemini CLI

## 1. Contexto & Objetivos

Atualmente, o aluno é o único que pode se inscrever em um plano de treino. Em um cenário de consultoria esportiva, o Personal Trainer deve ter a autonomia de entregar o conteúdo diretamente ao dashboard do seu aluno. O objetivo é automatizar esse processo de entrega de planos de treino do treinador para o aluno vinculado.

### Objetivos:
- Permitir que Treinadores inscrevam seus alunos em planos de treino de sua autoria.
- Garantir que a atribuição seja restrita ao binômio Treinador-Aluno estabelecido oficialmente.
- Manter o plano atribuído no estado "Não Iniciado" para que o aluno tenha controle sobre quando começar.

## 2. Mudanças no Módulo Training Plan

### 2.1. Lógica de Negócio (`PlanSubscriptionManagementService`)
Implementar método `assignPlanToStudent(dto: AssignPlanRequestDto)`:
1. **Validação de Perfil**: Confirmar que o requester é `PERSONAL_TRAINER`.
2. **Validação de Vínculo**: Consultar o módulo Identity para confirmar que `requesterId === student.trainerId`.
3. **Validação de Posse**: Confirmar que o plano de treino pertence ao Treinador solicitante.
4. **Criação**: Inserir novo registro em `PlanSubscription` com `status = NOT_STARTED`.

### 2.2. DTO de Requisição
- `studentId` (UUID)
- `planId` (UUID)
- `type` (Enum de tipo de assinatura)

### 2.3. Endpoints (`PlanSubscriptionController`)
- `POST /training-plan/subscription/assign`: Endpoint exclusivo para treinadores.

## 3. Integração Cross-Module

- O serviço utilizará a interface `IdentityUserExistsApi.getTrainerId(studentId)` para validar a autoridade do treinador sobre o aluno.

## 4. Fluxo de Dados (Assignment)

1. **Treinador**: Faz POST para `/training-plan/subscription/assign` enviando o ID do aluno e do plano.
2. **Sistema**:
   - Valida se o Personal é treinador do aluno.
   - Valida se o plano é do Personal.
   - Cria a assinatura para o aluno.
3. **Aluno**: Ao abrir o app, vê o novo plano na sua lista de treinos pendentes.

## 5. Considerações de Segurança

- **Idempotência**: O sistema deve impedir que o treinador atribua o mesmo plano múltiplas vezes ao mesmo aluno se houver uma assinatura ativa ou pendente.
- **Roles**: O endpoint será protegido pelo `RolesGuard` e `JwtAuthGuard`.

## 6. Testes E2E

- **Caminho Feliz**: Treinador atribuindo seu próprio plano para seu aluno vinculado (Sucesso).
- **Violação de Vínculo**: Treinador tentando atribuir plano para um usuário que não é seu aluno (Erro 403/BadRequest).
- **Violação de Posse**: Treinador tentando atribuir um plano que não foi criado por ele (Erro 403/BadRequest).
