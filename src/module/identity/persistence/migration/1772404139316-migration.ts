import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1772404139316 implements MigrationInterface {
    name = 'Migration1772404139316'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "weight_logs" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "weight" numeric(5,2) NOT NULL, "measuredAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid NOT NULL, CONSTRAINT "PK_96c8f4d341846b34fef50cf4576" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD "height" numeric(5,2)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "currentWeight" numeric(5,2)`);
        await queryRunner.query(`CREATE TYPE "public"."users_weightunit_enum" AS ENUM('kg', 'lb')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "weightUnit" "public"."users_weightunit_enum" NOT NULL DEFAULT 'kg'`);
        await queryRunner.query(`CREATE TYPE "public"."users_heightunit_enum" AS ENUM('cm', 'ft-in')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "heightUnit" "public"."users_heightunit_enum" NOT NULL DEFAULT 'cm'`);
        await queryRunner.query(`ALTER TABLE "weight_logs" ADD CONSTRAINT "FK_5d83c1656fef64dfbc54ab7ce37" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "weight_logs" DROP CONSTRAINT "FK_5d83c1656fef64dfbc54ab7ce37"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "heightUnit"`);
        await queryRunner.query(`DROP TYPE "public"."users_heightunit_enum"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "weightUnit"`);
        await queryRunner.query(`DROP TYPE "public"."users_weightunit_enum"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "currentWeight"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "height"`);
        await queryRunner.query(`DROP TABLE "weight_logs"`);
    }

}
