import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1772404766612 implements MigrationInterface {
    name = 'Migration1772404766612'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."body_measurements_type_enum" AS ENUM('BODY_FAT', 'WATER_PERCENTAGE', 'MUSCLE_MASS', 'BONE_MASS', 'WAIST', 'CHEST', 'HIPS', 'NECK', 'SHOULDERS', 'BICEP_LEFT', 'BICEP_RIGHT', 'FOREARM_LEFT', 'FOREARM_RIGHT', 'THIGH_LEFT', 'THIGH_RIGHT', 'CALF_LEFT', 'CALF_RIGHT')`);
        await queryRunner.query(`CREATE TABLE "body_measurements" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "type" "public"."body_measurements_type_enum" NOT NULL, "value" numeric(6,2) NOT NULL, "measuredAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid NOT NULL, CONSTRAINT "PK_474282e620ea0cd4fe5d8cbce0f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "body_measurements" ADD CONSTRAINT "FK_e52cb7540788161ebe6a1ac2113" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "body_measurements" DROP CONSTRAINT "FK_e52cb7540788161ebe6a1ac2113"`);
        await queryRunner.query(`DROP TABLE "body_measurements"`);
        await queryRunner.query(`DROP TYPE "public"."body_measurements_type_enum"`);
    }

}
