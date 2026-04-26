import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1777145013812 implements MigrationInterface {
  name = 'Migration1777145013812';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(
      `CREATE TABLE "user_follows" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "followerId" uuid NOT NULL, "followingId" uuid NOT NULL, CONSTRAINT "PK_da8e8793113adf3015952880966" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "user_privacy_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "shareName" boolean NOT NULL DEFAULT true, "shareEmail" boolean NOT NULL DEFAULT true, "shareTrainingProgress" boolean NOT NULL DEFAULT false, "sharePastDataWithTrainer" boolean NOT NULL DEFAULT false, "userId" uuid, CONSTRAINT "REL_6c6227fa8fb10ca8cc23ce6939" UNIQUE ("userId"), CONSTRAINT "PK_95fc563e79fedf0b241c0360be0" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_type_enum" AS ENUM('PERSONAL_TRAINER', 'CLIENT')`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_weightunit_enum" AS ENUM('kg', 'lb')`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_heightunit_enum" AS ENUM('cm', 'ft-in')`
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying NOT NULL, "bio" text, "profilePictureUrl" text, "password" character varying NOT NULL, "type" "public"."users_type_enum" NOT NULL DEFAULT 'CLIENT', "height" numeric(5,2), "currentWeight" numeric(5,2), "weightUnit" "public"."users_weightunit_enum" NOT NULL DEFAULT 'kg', "heightUnit" "public"."users_heightunit_enum" NOT NULL DEFAULT 'cm', "trainerInviteCode" character varying(50), "cref" character varying(20), "isVerified" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_52ad64cb712ed325dff463f2f13" UNIQUE ("trainerInviteCode"), CONSTRAINT "UQ_584f11b3c6df319615b141165a2" UNIQUE ("cref"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "trainer_student_relationships" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "trainerId" uuid NOT NULL, "studentId" uuid NOT NULL, "linkedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_6466809dbe84657bfe692add1ce" UNIQUE ("studentId"), CONSTRAINT "REL_6466809dbe84657bfe692add1c" UNIQUE ("studentId"), CONSTRAINT "PK_7bcad11b188ec201c383fb768d6" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."metric_goals_status_enum" AS ENUM('ACTIVE', 'ACHIEVED', 'ABANDONED')`
    );
    await queryRunner.query(
      `CREATE TABLE "metric_goals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "type" character varying NOT NULL, "startingValue" numeric(6,2) NOT NULL, "targetValue" numeric(6,2) NOT NULL, "deadline" TIMESTAMP, "achievedAt" TIMESTAMP, "status" "public"."metric_goals_status_enum" NOT NULL DEFAULT 'ACTIVE', "userId" uuid NOT NULL, CONSTRAINT "PK_4b91e2d0945f2434af811ea86df" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."body_measurements_type_enum" AS ENUM('BODY_FAT', 'WATER_PERCENTAGE', 'MUSCLE_MASS', 'BONE_MASS', 'WAIST', 'CHEST', 'HIPS', 'NECK', 'SHOULDERS', 'BICEP_LEFT', 'BICEP_RIGHT', 'FOREARM_LEFT', 'FOREARM_RIGHT', 'THIGH_LEFT', 'THIGH_RIGHT', 'CALF_LEFT', 'CALF_RIGHT')`
    );
    await queryRunner.query(
      `CREATE TABLE "body_measurements" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "type" "public"."body_measurements_type_enum" NOT NULL, "value" numeric(6,2) NOT NULL, "measuredAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "trainerNote" text, "trainerNoteAt" TIMESTAMP, CONSTRAINT "PK_474282e620ea0cd4fe5d8cbce0f" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "weight_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "weight" numeric(5,2) NOT NULL, "measuredAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "trainerNote" text, "trainerNoteAt" TIMESTAMP, CONSTRAINT "PK_96c8f4d341846b34fef50cf4576" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "user_follows" ADD CONSTRAINT "FK_6300484b604263eaae8a6aab88d" FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_follows" ADD CONSTRAINT "FK_7c6c27f12c4e972eab4b3aaccbf" FOREIGN KEY ("followingId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_privacy_settings" ADD CONSTRAINT "FK_6c6227fa8fb10ca8cc23ce6939b" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "trainer_student_relationships" ADD CONSTRAINT "FK_abb1b731e39687111e7feb0288e" FOREIGN KEY ("trainerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "trainer_student_relationships" ADD CONSTRAINT "FK_6466809dbe84657bfe692add1ce" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "metric_goals" ADD CONSTRAINT "FK_920692c5277515acb1536e08f64" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "body_measurements" ADD CONSTRAINT "FK_e52cb7540788161ebe6a1ac2113" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "weight_logs" ADD CONSTRAINT "FK_5d83c1656fef64dfbc54ab7ce37" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "weight_logs" DROP CONSTRAINT "FK_5d83c1656fef64dfbc54ab7ce37"`
    );
    await queryRunner.query(
      `ALTER TABLE "body_measurements" DROP CONSTRAINT "FK_e52cb7540788161ebe6a1ac2113"`
    );
    await queryRunner.query(
      `ALTER TABLE "metric_goals" DROP CONSTRAINT "FK_920692c5277515acb1536e08f64"`
    );
    await queryRunner.query(
      `ALTER TABLE "trainer_student_relationships" DROP CONSTRAINT "FK_6466809dbe84657bfe692add1ce"`
    );
    await queryRunner.query(
      `ALTER TABLE "trainer_student_relationships" DROP CONSTRAINT "FK_abb1b731e39687111e7feb0288e"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_privacy_settings" DROP CONSTRAINT "FK_6c6227fa8fb10ca8cc23ce6939b"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_follows" DROP CONSTRAINT "FK_7c6c27f12c4e972eab4b3aaccbf"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_follows" DROP CONSTRAINT "FK_6300484b604263eaae8a6aab88d"`
    );
    await queryRunner.query(`DROP TABLE "weight_logs"`);
    await queryRunner.query(`DROP TABLE "body_measurements"`);
    await queryRunner.query(`DROP TYPE "public"."body_measurements_type_enum"`);
    await queryRunner.query(`DROP TABLE "metric_goals"`);
    await queryRunner.query(`DROP TYPE "public"."metric_goals_status_enum"`);
    await queryRunner.query(`DROP TABLE "trainer_student_relationships"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_heightunit_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_weightunit_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_type_enum"`);
    await queryRunner.query(`DROP TABLE "user_privacy_settings"`);
    await queryRunner.query(`DROP TABLE "user_follows"`);
  }
}
