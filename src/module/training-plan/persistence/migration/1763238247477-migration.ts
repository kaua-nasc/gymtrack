import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1763238247477 implements MigrationInterface {
    name = 'Migration1763238247477'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "training_plan_likes" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "likedBy" uuid NOT NULL, "trainingPlanId" uuid NOT NULL, CONSTRAINT "PK_1034857b4d99c260c6a4d9218e5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_bc27334c64090429f15a8bc5ac" ON "training_plan_likes" ("trainingPlanId", "likedBy") `);
        await queryRunner.query(`ALTER TABLE "training_plan_likes" ADD CONSTRAINT "FK_2c85f41f867f9d0703b165425e9" FOREIGN KEY ("trainingPlanId") REFERENCES "training_plans"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "training_plan_likes" DROP CONSTRAINT "FK_2c85f41f867f9d0703b165425e9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bc27334c64090429f15a8bc5ac"`);
        await queryRunner.query(`DROP TABLE "training_plan_likes"`);
    }

}
