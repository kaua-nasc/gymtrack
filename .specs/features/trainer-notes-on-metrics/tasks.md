# Tasks: Notas do Professor em Métricas do Aluno

**Feature:** FEAT-TRAINER-NOTES

## 1. Persistência
- [ ] **TASK-01:** Adicionar colunas `trainerNote` e `trainerNoteAt` na entidade `WeightLog` (`src/module/identity/persistence/entity/weight-log.entity.ts`).
    - *Verificação:* O banco de dados deve refletir as novas colunas (usar migração ou sincronização em dev).
- [ ] **TASK-02:** Adicionar colunas `trainerNote` e `trainerNoteAt` na entidade `BodyMeasurement` (`src/module/identity/persistence/entity/body-measurement.entity.ts`).
    - *Verificação:* O banco de dados deve refletir as novas colunas.

## 2. Repositórios & DTOs
- [ ] **TASK-03:** Criar DTO de request `UpdateTrainerNoteRequestDto` (`src/module/identity/http/rest/dto/request/update-trainer-note-request.dto.ts`).
    - *Campos:* `note: string`.
- [ ] **TASK-04:** Atualizar DTOs de resposta `WeightLogResponseDto` e `BodyMeasurementResponseDto` para incluir os novos campos.

## 3. Core (Service)
- [ ] **TASK-05:** Implementar `addWeightLogNote` no `UserManagementService`.
    - *Lógica:* Buscar log -> `validateTrainerAccess(log.userId)` -> Atualizar campos -> Salvar.
- [ ] **TASK-06:** Implementar `addBodyMeasurementNote` no `UserManagementService`.
    - *Lógica:* Buscar medida -> `validateTrainerAccess(measurement.userId)` -> Atualizar campos -> Salvar.

## 4. HTTP (Controller)
- [ ] **TASK-07:** Adicionar endpoint `PATCH identity/user/trainer/weight-log/:id/note` no `UserController`.
- [ ] **TASK-08:** Adicionar endpoint `PATCH identity/user/trainer/body-measurement/:id/note` no `UserController`.

## 5. Validação
- [ ] **TASK-09:** Criar teste E2E para validar o fluxo completo (Professor vinculado adicionando nota e Aluno visualizando).
