# Design Doc: Restrições de Criação de Planos de Treino por Perfil

**Status:** Approved
**Date:** 2026-03-14
**Author:** Gemini CLI

## 1. Contexto & Objetivos

Atualmente, qualquer usuário pode criar planos de treino sem restrições de quantidade ou visibilidade. Com a introdução do `UserType` (Client e Personal Trainer), precisamos diferenciar o que cada perfil pode realizar no sistema para proteger a autoridade de conteúdo e incentivar o uso profissional por treinadores.

### Objetivos:
- Restringir usuários comuns (`CLIENT`) a criarem apenas **um** plano de treino ativo por vez.
- Garantir que planos criados por `CLIENT` sejam obrigatoriamente **privados**.
- Permitir que `PERSONAL_TRAINER` crie múltiplos planos com qualquer visibilidade (`PUBLIC`, `PROTECTED`, `PRIVATE`).

## 2. Mudanças Arquiteturais

### 2.1. Módulo Identity (Auth)
O payload do JWT deve ser enriquecido para evitar chamadas de rede desnecessárias entre módulos.

- **JWT Structure**:
  ```json
  {
    "sub": "user-uuid",
    "email": "user@example.com",
    "type": "CLIENT" | "PERSONAL_TRAINER",
    "iat": 123456789,
    "exp": 123456789
  }
  ```
- **Alteração**: `AuthService.signIn` e `AuthService.generateToken` devem incluir o `UserType`.

### 2.2. Módulo Shared (Security)
Implementação de infraestrutura para controle de acesso baseado em tipos.

- **Roles Decorator**: `@Roles(UserType.personalTrainer)`
- **Roles Guard**: Validar o campo `type` do objeto `request.user` (preenchido pelo `JwtStrategy`).

### 2.3. Módulo Training Plan (Business Logic)

#### Regras no `TrainingPlanManagementService.create`:

1. **Identificação**: Obter o `userId` e `userType` do `request.user`.
2. **Lógica para `CLIENT`**:
   - **Check Count**: `trainingPlanRepository.count({ authorId: userId })`.
   - **Interrupção**: Se `count >= 1`, lançar `BadRequestException("Users with profile CLIENT can only have one personal training plan. Please delete your existing plan to create a new one.")`.
   - **Sanitização**: Forçar `visibility = TrainingPlanVisibility.private`.
3. **Lógica para `PERSONAL_TRAINER`**:
   - Ignorar limite de contagem.
   - Respeitar a visibilidade enviada no DTO.

## 3. Fluxo de Dados

1. O usuário envia uma requisição `POST /training-plan`.
2. O `JwtAuthGuard` valida o token e anexa o `user` (id e type) à requisição.
3. O `TrainingPlanManagementService` recebe o DTO.
4. O serviço verifica o tipo:
   - Se `CLIENT`, consulta o total de planos criados.
   - Se já existe 1 plano, retorna erro 400.
   - Se não, cria o plano forçando `PRIVATE`.
5. O plano é salvo no banco de dados.

## 4. Considerações de Segurança

- **Tainting**: O `authorId` deve ser sempre extraído do JWT, nunca do corpo da requisição enviada pelo cliente, para evitar que um usuário crie treinos em nome de outro.
- **Roles**: O `RolesGuard` será usado futuramente para endpoints que apenas Personal Trainers podem acessar (ex: relatórios de alunos).

## 5. Testes

- **E2E**: 
  - Testar criação por `CLIENT` com 0 planos (Sucesso).
  - Testar criação por `CLIENT` com 1 plano (Falha/400).
  - Testar se plano criado por `CLIENT` ignorou `visibility: public` no DTO (Sucesso, gravou como private).
  - Testar criação múltipla por `PERSONAL_TRAINER` (Sucesso).
