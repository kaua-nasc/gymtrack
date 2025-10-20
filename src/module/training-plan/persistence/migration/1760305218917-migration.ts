import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1760305218917 implements MigrationInterface {
    name = 'Migration1760305218917'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "plan_subscription_privacy_settings" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "shareProgress" boolean NOT NULL DEFAULT true, "sharePersonalMetrics" boolean NOT NULL DEFAULT false, "planSubscriptionId" uuid, CONSTRAINT "REL_f0fe6f036ae32d5bfe1af9dc13" UNIQUE ("planSubscriptionId"), CONSTRAINT "PK_ed7f77b1c435440568ecff621e4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "training_plan_feedbacks" ALTER COLUMN "message" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "plan_subscription_privacy_settings" ADD CONSTRAINT "FK_f0fe6f036ae32d5bfe1af9dc133" FOREIGN KEY ("planSubscriptionId") REFERENCES "plan_subscription"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "plan_subscription_privacy_settings" DROP CONSTRAINT "FK_f0fe6f036ae32d5bfe1af9dc133"`);
        await queryRunner.query(`ALTER TABLE "training_plan_feedbacks" ALTER COLUMN "message" SET NOT NULL`);
        await queryRunner.query(`DROP TABLE "plan_subscription_privacy_settings"`);
    }

}
