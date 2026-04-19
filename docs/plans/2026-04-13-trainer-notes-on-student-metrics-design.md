# Design Doc: Notas do Professor em Métricas do Aluno

**Status:** Approved
**Date:** 2026-04-13
**Author:** Gemini CLI

## 1. Contexto & Objetivos

Com a Dashboard de Métricas do Aluno já operacional para o `PERSONAL_TRAINER`, o próximo passo qualitativo é permitir a comunicação contextualizada. O sistema deve permitir que o professor deixe observações técnicas diretamente nos registros de peso e medidas corporais dos alunos vinculados.

### Objetivos:
- Prover um canal de feedback unidirecional (Professor -> Aluno) sobre dados biométricos.
- Facilitar a orientação técnica sem a necessidade de um chat complexo.
- Manter o registro do feedback atrelado ao dado histórico para análise de evolução.

## 2. Mudanças no Módulo Identity

### 2.1. Entidades (`WeightLog` e `BodyMeasurement`)
Utilizando a **Abordagem 1 (Campos Embutidos)** para simplicidade e performance:
- Adicionar campo `trainerNote` (Text, Nullable).
- Adicionar campo `trainerNoteAt` (Timestamp, Nullable).

### 2.2. Novos Métodos no `UserManagementService`
- `addWeightLogNote(logId: string, note: string)`:
    1. Valida se o usuário logado é o professor do dono do log (via `validateTrainerAccess`).
    2. Atualiza `trainerNote` e `trainerNoteAt` no registro correspondente.
- `addBodyMeasurementNote(measurementId: string, note: string)`:
    1. Mesma lógica de validação do vínculo.
    2. Atualiza os campos de nota no registro de medida.

### 2.3. Endpoints (`UserController`)
- `PATCH /identity/user/trainer/weight-log/:id/note`
    - Body: `{ "note": string }`
- `PATCH /identity/user/trainer/body-measurement/:id/note`
    - Body: `{ "note": string }`

## 3. Fluxo de Dados & UX

1. **Ação do Professor:** Na dashboard de métricas do aluno, o professor clica em um registro específico.
2. **Backend:** O sistema valida o relacionamento ativo entre `trainerId` e `studentId`.
3. **Persistência:** A nota é salva diretamente na linha da tabela de métrica.
4. **Visualização do Aluno:** O aluno recebe o dado atualizado em seu histórico. Registros com nota devem possuir um indicador visual no app.

## 4. Considerações de Segurança & Regras

- **Imutabilidade pelo Aluno:** O aluno pode ler a nota, mas o endpoint de edição é restrito a usuários do tipo `PERSONAL_TRAINER` que possuam vínculo ativo.
- **Vínculo Obrigatório:** Se um professor tentar notar um registro de alguém que não é seu aluno, o sistema deve retornar `403 Forbidden` ou `400 Bad Request` através do `validateTrainerAccess`.
- **Integridade:** Como a nota está na mesma tabela do registro, a deleção do registro pelo aluno resultará na deleção automática da nota.

## 5. Testes E2E

- **Sucesso:** Professor vinculado adicionando nota com sucesso.
- **Falha de Permissão:** Aluno tentando acessar o endpoint de adição de nota (403).
- **Falha de Vínculo:** Professor tentando adicionar nota em registro de usuário que não é seu aluno.
- **Visualização:** Garantir que o `GET` do histórico agora retorna os novos campos de nota.
