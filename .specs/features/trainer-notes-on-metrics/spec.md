# Spec: Notas do Professor em Métricas do Aluno

**ID:** FEAT-TRAINER-NOTES
**Status:** In Progress
**Design Doc:** [docs/plans/2026-04-13-trainer-notes-on-student-metrics-design.md](../../../docs/plans/2026-04-13-trainer-notes-on-student-metrics-design.md)

## 1. Descrição
Permite que Personal Trainers adicionem notas técnicas unidirecionais em registros de peso e medidas corporais de seus alunos vinculados.

## 2. Requisitos Traceáveis

### 2.1. Persistência
- **REQ-01:** Adicionar `trainerNote` (TEXT, nullable) e `trainerNoteAt` (TIMESTAMP, nullable) à entidade `WeightLog`.
- **REQ-02:** Adicionar `trainerNote` (TEXT, nullable) e `trainerNoteAt` (TIMESTAMP, nullable) à entidade `BodyMeasurement`.

### 2.2. Regras de Negócio (Service)
- **REQ-03:** Criar método `addWeightLogNote` que valide se o executor é o treinador do aluno dono do registro.
- **REQ-04:** Criar método `addBodyMeasurementNote` que valide se o executor é o treinador do aluno dono do registro.
- **REQ-05:** A validação deve usar o método existente `validateTrainerAccess`.

### 2.3. Interface (Controller)
- **REQ-06:** Endpoint `PATCH /identity/user/trainer/weight-log/:id/note` para atualizar notas de peso.
- **REQ-07:** Endpoint `PATCH /identity/user/trainer/body-measurement/:id/note` para atualizar notas de medidas.

### 2.4. Segurança & Privacidade
- **REQ-08:** Apenas usuários com `UserType.personalTrainer` podem acessar os endpoints de escrita de nota.
- **REQ-09:** O aluno pode ler as notas em seu histórico, mas não pode editá-las ou removê-las.

## 3. Critérios de Aceite
- [ ] Professor vinculado consegue salvar uma nota em um peso do aluno.
- [ ] Professor vinculado consegue salvar uma nota em uma medida do aluno.
- [ ] Aluno vê a nota ao listar seu histórico.
- [ ] Professor NÃO vinculado recebe erro ao tentar adicionar nota.
- [ ] Aluno recebe erro ao tentar acessar os endpoints de PATCH de nota.
