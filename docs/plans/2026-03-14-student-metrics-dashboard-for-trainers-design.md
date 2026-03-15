# Design Doc: Dashboard de Métricas do Aluno para Treinadores

**Status:** Approved
**Date:** 2026-03-14
**Author:** Gemini CLI

## 1. Contexto & Objetivos

Após a implementação do vínculo oficial entre `PERSONAL_TRAINER` e `CLIENT` (aluno), o próximo passo é permitir que o profissional visualize o progresso biométrico de seus alunos. Este acesso deve ser seguro, validado pelo vínculo e respeitar as preferências de privacidade do aluno quanto ao histórico retroativo.

### Objetivos:
- Permitir que Treinadores visualizem histórico de peso, medidas corporais e metas de seus alunos vinculados.
- Implementar controle de privacidade onde o aluno decide se o treinador vê dados anteriores ao início da consultoria.
- Garantir que apenas o treinador oficialmente vinculado tenha acesso a esses dados sensíveis.

## 2. Mudanças no Módulo Identity

### 2.1. Entidade `UserPrivacySettings`
- Adicionar campo `sharePastDataWithTrainer` (Boolean, Default: `false`).

### 2.2. Lógica de Validação (`UserManagementService`)
Implementar método privado `validateTrainerAccess(studentId: string)`:
1. Verifica se o usuário autenticado é o Treinador do `studentId`.
2. Recupera a data de início do vínculo (`linkedAt`).
3. Recupera a configuração de privacidade do aluno (`sharePastDataWithTrainer`).
4. Retorna uma possível `cutoffDate` (data de corte) para as queries.

### 2.3. Novos Métodos de Serviço
- `getStudentWeightHistory`: Busca logs de peso do aluno, respeitando a data de corte.
- `getStudentBodyMeasurementsHistory`: Busca medidas corporais do aluno, respeitando a data de corte.
- `getStudentMetricGoals`: Busca metas de métricas ativas e concluídas do aluno.

### 2.4. Endpoints (UserController)
- `GET /identity/user/trainer/students/:studentId/metrics/weight`
- `GET /identity/user/trainer/students/:studentId/metrics/measurements`
- `GET /identity/user/trainer/students/:studentId/metrics/goals`

## 3. Fluxo de Dados

1. O Personal Trainer solicita o histórico de peso do aluno João (`studentId`).
2. O sistema verifica se o Personal é o treinador oficial do João.
3. O sistema checa se João permite ver dados antigos. 
   - Se SIM: Retorna todo o histórico.
   - Se NÃO: Filtra a query de peso para `measuredAt >= data_do_vinculo`.
4. Os dados são retornados formatados para o dashboard do Personal.

## 4. Considerações de Segurança

- **Roles**: Os novos endpoints devem ser protegidos por `@Roles(UserType.personalTrainer)`.
- **Isolamento**: O Treinador **não** tem permissão para editar ou deletar os logs do aluno, apenas visualizar (Read-Only).

## 5. Testes E2E

- **Acesso Autorizado**: Treinador vinculado acessando dados (Sucesso).
- **Acesso Negado**: Treinador tentando acessar usuário que não é seu aluno (Erro 403).
- **Respeito à Privacidade**: Validar que registros anteriores ao vínculo não aparecem quando `sharePastDataWithTrainer` é falso.
