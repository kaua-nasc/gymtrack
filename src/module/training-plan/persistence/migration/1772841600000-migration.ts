import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1772841600000 implements MigrationInterface {
    name = 'Migration1772841600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "active_workout_sessions" (
                "id" uuid NOT NULL, 
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
                "updatedAt" TIMESTAMP DEFAULT now(), 
                "deletedAt" TIMESTAMP, 
                "userId" uuid NOT NULL, 
                "planDayProgressId" uuid NOT NULL, 
                "currentExerciseId" uuid, 
                "currentSetIndex" int NOT NULL DEFAULT 0, 
                "restStartedAt" TIMESTAMP, 
                "adaptiveRestDurationSeconds" int, 
                "startedAt" TIMESTAMP NOT NULL DEFAULT now(), 
                "lastActiveAt" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "PK_active_workout_sessions" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "active_set_logs" (
                "id" uuid NOT NULL, 
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
                "updatedAt" TIMESTAMP DEFAULT now(), 
                "deletedAt" TIMESTAMP, 
                "sessionId" uuid NOT NULL, 
                "exerciseId" uuid NOT NULL, 
                "setIndex" int NOT NULL, 
                "reps" int NOT NULL, 
                "weight" decimal(5,2) NOT NULL, 
                "rpe" int, 
                CONSTRAINT "PK_active_set_logs" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            ALTER TABLE "active_workout_sessions" 
            ADD CONSTRAINT "FK_active_workout_sessions_plan_day_progress" 
            FOREIGN KEY ("planDayProgressId") REFERENCES "plan_day_progress"("id") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "active_set_logs" 
            ADD CONSTRAINT "FK_active_set_logs_session" 
            FOREIGN KEY ("sessionId") REFERENCES "active_workout_sessions"("id") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "active_set_logs" 
            ADD CONSTRAINT "FK_active_set_logs_exercise" 
            FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "active_set_logs" DROP CONSTRAINT "FK_active_set_logs_exercise"`);
        await queryRunner.query(`ALTER TABLE "active_set_logs" DROP CONSTRAINT "FK_active_set_logs_session"`);
        await queryRunner.query(`ALTER TABLE "active_workout_sessions" DROP CONSTRAINT "FK_active_workout_sessions_plan_day_progress"`);
        await queryRunner.query(`DROP TABLE "active_set_logs"`);
        await queryRunner.query(`DROP TABLE "active_workout_sessions"`);
    }

}
