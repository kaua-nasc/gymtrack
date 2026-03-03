import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1772408176804 implements MigrationInterface {
    name = 'Migration1772408176804'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."metric_goals_status_enum" AS ENUM('ACTIVE', 'ACHIEVED', 'ABANDONED')`);
        await queryRunner.query(`CREATE TABLE "metric_goals" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "type" character varying NOT NULL, "startingValue" numeric(6,2) NOT NULL, "targetValue" numeric(6,2) NOT NULL, "deadline" TIMESTAMP, "achievedAt" TIMESTAMP, "status" "public"."metric_goals_status_enum" NOT NULL DEFAULT 'ACTIVE', "userId" uuid NOT NULL, CONSTRAINT "PK_4b91e2d0945f2434af811ea86df" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "metric_goals" ADD CONSTRAINT "FK_920692c5277515acb1536e08f64" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "metric_goals" DROP CONSTRAINT "FK_920692c5277515acb1536e08f64"`);
        await queryRunner.query(`DROP TABLE "metric_goals"`);
        await queryRunner.query(`DROP TYPE "public"."metric_goals_status_enum"`);
    }

}
