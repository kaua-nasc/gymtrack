import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1772911927750 implements MigrationInterface {
    name = 'Migration1772911927750'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "active_workout_sessions" DROP CONSTRAINT "FK_active_workout_sessions_plan_day_progress"`);
        await queryRunner.query(`ALTER TABLE "active_set_logs" DROP CONSTRAINT "FK_active_set_logs_exercise"`);
        await queryRunner.query(`ALTER TABLE "active_set_logs" DROP CONSTRAINT "FK_active_set_logs_session"`);
        await queryRunner.query(`CREATE TYPE "public"."plan_day_progress_status_enum" AS ENUM('IN_PROGRESS', 'COMPLETED', 'CANCELLED')`);
        await queryRunner.query(`ALTER TABLE "plan_day_progress" ADD "status" "public"."plan_day_progress_status_enum" NOT NULL DEFAULT 'IN_PROGRESS'`);
        await queryRunner.query(`ALTER TABLE "active_workout_sessions" ALTER COLUMN "updatedAt" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "active_set_logs" ALTER COLUMN "updatedAt" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "active_workout_sessions" ADD CONSTRAINT "FK_3886d36ff4fe44eb07cc60cde74" FOREIGN KEY ("planDayProgressId") REFERENCES "plan_day_progress"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "active_set_logs" ADD CONSTRAINT "FK_f6fe56d1720796ce2a7eda91689" FOREIGN KEY ("sessionId") REFERENCES "active_workout_sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "active_set_logs" ADD CONSTRAINT "FK_aa8a8d84879dac6d25ed7a3a9e6" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "active_set_logs" DROP CONSTRAINT "FK_aa8a8d84879dac6d25ed7a3a9e6"`);
        await queryRunner.query(`ALTER TABLE "active_set_logs" DROP CONSTRAINT "FK_f6fe56d1720796ce2a7eda91689"`);
        await queryRunner.query(`ALTER TABLE "active_workout_sessions" DROP CONSTRAINT "FK_3886d36ff4fe44eb07cc60cde74"`);
        await queryRunner.query(`ALTER TABLE "active_set_logs" ALTER COLUMN "updatedAt" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "active_workout_sessions" ALTER COLUMN "updatedAt" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "plan_day_progress" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."plan_day_progress_status_enum"`);
        await queryRunner.query(`ALTER TABLE "active_set_logs" ADD CONSTRAINT "FK_active_set_logs_session" FOREIGN KEY ("sessionId") REFERENCES "active_workout_sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "active_set_logs" ADD CONSTRAINT "FK_active_set_logs_exercise" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "active_workout_sessions" ADD CONSTRAINT "FK_active_workout_sessions_plan_day_progress" FOREIGN KEY ("planDayProgressId") REFERENCES "plan_day_progress"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
