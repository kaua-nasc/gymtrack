import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1752147797396 implements MigrationInterface {
    name = 'Migration1752147797396'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_plan_subscription_status_enum" AS ENUM('NOT_STARTED', 'IN_PROGRESS', 'FINISHED', 'CANCELED')`);
        await queryRunner.query(`CREATE TABLE "user_plan_subscription" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "trainingPlanId" uuid NOT NULL, "userId" uuid NOT NULL, "status" "public"."user_plan_subscription_status_enum" NOT NULL DEFAULT 'NOT_STARTED', CONSTRAINT "PK_b06a2c567e54d010808cab050e3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "plan_day_progress" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "planSubscriptionId" uuid NOT NULL, "dayId" uuid NOT NULL, CONSTRAINT "PK_6a1d175ad26bc8e79d4253a447a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_plan_subscription" ADD CONSTRAINT "FK_4b1f74208000fabb377812c41dc" FOREIGN KEY ("trainingPlanId") REFERENCES "training_plans"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "plan_day_progress" ADD CONSTRAINT "FK_01e9018d0b5401f2d6bc02fca51" FOREIGN KEY ("planSubscriptionId") REFERENCES "user_plan_subscription"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "plan_day_progress" ADD CONSTRAINT "FK_4ad012ce3c8a11b973cb7d421d6" FOREIGN KEY ("dayId") REFERENCES "days"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "plan_day_progress" DROP CONSTRAINT "FK_4ad012ce3c8a11b973cb7d421d6"`);
        await queryRunner.query(`ALTER TABLE "plan_day_progress" DROP CONSTRAINT "FK_01e9018d0b5401f2d6bc02fca51"`);
        await queryRunner.query(`ALTER TABLE "user_plan_subscription" DROP CONSTRAINT "FK_4b1f74208000fabb377812c41dc"`);
        await queryRunner.query(`DROP TABLE "plan_day_progress"`);
        await queryRunner.query(`DROP TABLE "user_plan_subscription"`);
        await queryRunner.query(`DROP TYPE "public"."user_plan_subscription_status_enum"`);
    }

}
