import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1769965514083 implements MigrationInterface {
    name = 'Migration1769965514083'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "training_plan_comments" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "content" text NOT NULL, "authorId" uuid NOT NULL, "trainingPlanId" uuid NOT NULL, CONSTRAINT "PK_f9ae0ded8ad0835f8598e41963a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "training_plan_comments" ADD CONSTRAINT "FK_9e1eb349d94fb4593ff8bace996" FOREIGN KEY ("trainingPlanId") REFERENCES "training_plans"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "training_plan_comments" DROP CONSTRAINT "FK_9e1eb349d94fb4593ff8bace996"`);
        await queryRunner.query(`DROP TABLE "training_plan_comments"`);
    }

}
