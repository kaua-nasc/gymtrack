# Design Doc: Verificação de Registro Profissional (CREF)

**Status:** Approved
**Date:** 2026-03-14
**Author:** Gemini CLI

## 1. Contexto & Objetivos

Para aumentar a confiança dos alunos na plataforma GymTrack, precisamos diferenciar os profissionais de educação física. O objetivo é implementar o campo de registro profissional (CREF) e um status de verificação que sirva como selo de credibilidade para os Personal Trainers.

### Objetivos:
- Adicionar os campos `cref` e `isVerified` à entidade de usuário.
- Tornar o envio do `cref` obrigatório durante o processo de upgrade para Personal Trainer.
- Implementar um mecanismo de segurança que remove a verificação se o CREF for alterado.
- Expor o status de verificação para outros módulos do sistema.

## 2. Mudanças no Módulo Identity

### 2.1. Entidade `User`
- `cref` (String, Unique, Nullable): Armazena o registro do conselho profissional.
- `isVerified` (Boolean, Default: `false`): Indica se o perfil é verificado.

### 2.2. Lógica de Negócio (`UserManagementService`)
- **`upgradeToPersonalTrainer(cref: string)`**: 
  - Valida se o `cref` foi enviado e se não está em uso.
  - Altera `type` para `PERSONAL_TRAINER`.
  - Define `isVerified` como `true`.
- **`alterUserInformation`**: 
  - Se o campo `cref` for alterado por um usuário já profissional, o sistema deve resetar `isVerified` para `false`.

### 2.3. Camada HTTP (`UserController`)
- Atualizar `POST /identity/user/profile/upgrade` para aceitar um DTO com `cref`.
- Atualizar DTOs de resposta para incluir `cref` e `isVerified`.

## 3. Integração Cross-Module

- Atualizar a interface `IdentityUser` no módulo Shared para incluir a propriedade `isVerified`.
- O módulo `Training Plan` poderá usar essa informação para destacar planos de treinadores oficiais.

## 4. Fluxo de Dados (Verificação)

1. **Usuário**: Solicita upgrade enviando CREF "123456-G/SP".
2. **Sistema**: Valida unicidade -> Salva no banco -> Marca como verificado.
3. **Público**: Ao ver o perfil ou plano desse usuário, o selo de verificado é exibido.
4. **Segurança**: Se o usuário mudar o CREF para "000000-G/RJ", o selo some até nova validação.

## 5. Testes E2E

- **Upgrade com Sucesso**: Validar transição de tipo e status de verificação.
- **Conflito de CREF**: Tentar usar um CREF já registrado (Erro 409).
- **Perda de Verificação**: Atualizar o CREF e validar que `isVerified` tornou-se `false`.
