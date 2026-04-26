import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1777145016740 implements MigrationInterface {
  name = 'Migration1777145016740';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."exercises_type_enum" AS ENUM('WARMUP', 'RECOGNITION', 'WORK', 'CARDIO')`
    );
    await queryRunner.query(
      `CREATE TABLE "exercises" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying NOT NULL, "dayId" uuid NOT NULL, "type" "public"."exercises_type_enum" NOT NULL, "setsNumber" integer NOT NULL, "repsNumber" integer NOT NULL, "description" text, "observation" text, CONSTRAINT "UQ_a521b5cac5648eedc036e17d1bd" UNIQUE ("name"), CONSTRAINT "PK_c4c46f5fa89a58ba7c2d894e3c3" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "plan_subscription_privacy_settings" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "shareProgress" boolean NOT NULL DEFAULT true, "sharePersonalMetrics" boolean NOT NULL DEFAULT false, "planSubscriptionId" uuid, CONSTRAINT "REL_f0fe6f036ae32d5bfe1af9dc13" UNIQUE ("planSubscriptionId"), CONSTRAINT "PK_ed7f77b1c435440568ecff621e4" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."plan_subscription_status_enum" AS ENUM('NOT_STARTED', 'IN_PROGRESS', 'CANCELED', 'COMPLETED')`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."plan_subscription_type_enum" AS ENUM('TOTAL_ACCESS', 'PARTIAL_ACCESS', 'PRIVATE')`
    );
    await queryRunner.query(
      `CREATE TABLE "plan_subscription" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "trainingPlanId" uuid NOT NULL, "userId" uuid NOT NULL, "status" "public"."plan_subscription_status_enum" NOT NULL DEFAULT 'NOT_STARTED', "type" "public"."plan_subscription_type_enum" NOT NULL, CONSTRAINT "PK_537e7826b55596d075de1bde618" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."plan_day_progress_status_enum" AS ENUM('IN_PROGRESS', 'COMPLETED', 'CANCELLED')`
    );
    await queryRunner.query(
      `CREATE TABLE "plan_day_progress" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "planSubscriptionId" uuid NOT NULL, "dayId" uuid NOT NULL, "status" "public"."plan_day_progress_status_enum" NOT NULL DEFAULT 'IN_PROGRESS', CONSTRAINT "PK_6a1d175ad26bc8e79d4253a447a" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "days" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying NOT NULL, "trainingPlanId" uuid NOT NULL, CONSTRAINT "UQ_18a49040122a90a7f959508f9b8" UNIQUE ("name"), CONSTRAINT "PK_c2c66eb46534bea34ba48cc4d7f" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."plan_access_request_status_enum" AS ENUM('APPROVED', 'PENDING', 'REJECTED', 'CANCELED')`
    );
    await queryRunner.query(
      `CREATE TABLE "plan_access_request" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" uuid NOT NULL, "trainingPlanId" uuid NOT NULL, "status" "public"."plan_access_request_status_enum" NOT NULL, CONSTRAINT "PK_f03dddf7f62547e17bd18fc8df0" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."plan_invites_status_enum" AS ENUM('PENDING', 'ACCEPTED', 'EXPIRED')`
    );
    await queryRunner.query(
      `CREATE TABLE "plan_invites" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "planId" uuid NOT NULL, "senderId" uuid NOT NULL, "recipientId" uuid, "recipientEmail" character varying NOT NULL, "status" "public"."plan_invites_status_enum" NOT NULL DEFAULT 'PENDING', CONSTRAINT "PK_a948e8c5ff31526d6e5f77efbe2" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "plan_participant" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" uuid NOT NULL, "trainingPlanId" uuid NOT NULL, "expiration_date" TIMESTAMP NOT NULL, "approved_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_cf83d1fc076ed13fc7447d55076" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "training_plan_comments" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "content" text NOT NULL, "authorId" uuid NOT NULL, "trainingPlanId" uuid NOT NULL, CONSTRAINT "PK_f9ae0ded8ad0835f8598e41963a" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "training_plan_feedbacks" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "trainingPlanId" uuid NOT NULL, "userId" uuid NOT NULL, "rating" numeric NOT NULL, "message" text, CONSTRAINT "PK_220c6f963204b4ee178c6e3bd16" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."training_plans_type_enum" AS ENUM('HYPERTROPHY', 'STRENGTH', 'MIXED')`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."training_plans_visibility_enum" AS ENUM('PUBLIC', 'PROTECTED', 'PRIVATE')`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."training_plans_level_enum" AS ENUM('BEGINNER', 'INTERMEDIARY', 'ADVANCED')`
    );
    await queryRunner.query(
      `CREATE TABLE "training_plans" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying NOT NULL, "authorId" uuid NOT NULL, "timeInDays" integer NOT NULL, "type" "public"."training_plans_type_enum" NOT NULL, "observation" text, "pathology" text, "visibility" "public"."training_plans_visibility_enum" NOT NULL, "level" "public"."training_plans_level_enum" NOT NULL, "maxSubscriptions" integer, "imageUrl" text, "description" text, CONSTRAINT "PK_246975cb895b51662b90515a390" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "training_plan_likes" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "likedBy" uuid NOT NULL, "trainingPlanId" uuid NOT NULL, CONSTRAINT "PK_1034857b4d99c260c6a4d9218e5" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "active_workout_sessions" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" uuid NOT NULL, "planDayProgressId" uuid NOT NULL, "currentExerciseId" uuid, "currentSetIndex" integer NOT NULL DEFAULT '0', "restStartedAt" TIMESTAMP, "adaptiveRestDurationSeconds" integer, "startedAt" TIMESTAMP NOT NULL DEFAULT now(), "lastActiveAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7c5d880eee6814a09a9ea2de6a7" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "active_set_logs" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "sessionId" uuid NOT NULL, "exerciseId" uuid NOT NULL, "setIndex" integer NOT NULL, "reps" integer NOT NULL, "weight" numeric(5,2) NOT NULL, "rpe" integer, CONSTRAINT "PK_cefba1f9f30da66680fe3873282" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "exercise_logs" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" uuid NOT NULL, "exerciseId" uuid NOT NULL, "reps" text NOT NULL, "weight" text NOT NULL, "notes" text, CONSTRAINT "PK_32076bf978e4169be16e25bf8dc" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "exercises" ADD CONSTRAINT "FK_85531791853605820c4f905ec7a" FOREIGN KEY ("dayId") REFERENCES "days"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "plan_subscription_privacy_settings" ADD CONSTRAINT "FK_f0fe6f036ae32d5bfe1af9dc133" FOREIGN KEY ("planSubscriptionId") REFERENCES "plan_subscription"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "plan_subscription" ADD CONSTRAINT "FK_7c57629907dcde0a2029c5dc68a" FOREIGN KEY ("trainingPlanId") REFERENCES "training_plans"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "plan_day_progress" ADD CONSTRAINT "FK_01e9018d0b5401f2d6bc02fca51" FOREIGN KEY ("planSubscriptionId") REFERENCES "plan_subscription"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "plan_day_progress" ADD CONSTRAINT "FK_4ad012ce3c8a11b973cb7d421d6" FOREIGN KEY ("dayId") REFERENCES "days"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "days" ADD CONSTRAINT "FK_4c4841535803ef06571a77782fc" FOREIGN KEY ("trainingPlanId") REFERENCES "training_plans"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "plan_access_request" ADD CONSTRAINT "FK_3bec98ff9eea3e72081314a4a59" FOREIGN KEY ("trainingPlanId") REFERENCES "training_plans"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "plan_invites" ADD CONSTRAINT "FK_e6b77ecc915a51b78b238e64b06" FOREIGN KEY ("planId") REFERENCES "training_plans"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "plan_participant" ADD CONSTRAINT "FK_98e114e0b05861ac9d025e9c0af" FOREIGN KEY ("trainingPlanId") REFERENCES "training_plans"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "training_plan_comments" ADD CONSTRAINT "FK_9e1eb349d94fb4593ff8bace996" FOREIGN KEY ("trainingPlanId") REFERENCES "training_plans"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "training_plan_feedbacks" ADD CONSTRAINT "FK_f1cfb6d6ba2120341efcac05041" FOREIGN KEY ("trainingPlanId") REFERENCES "training_plans"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "training_plan_likes" ADD CONSTRAINT "FK_2c85f41f867f9d0703b165425e9" FOREIGN KEY ("trainingPlanId") REFERENCES "training_plans"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "active_workout_sessions" ADD CONSTRAINT "FK_3886d36ff4fe44eb07cc60cde74" FOREIGN KEY ("planDayProgressId") REFERENCES "plan_day_progress"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "active_set_logs" ADD CONSTRAINT "FK_f6fe56d1720796ce2a7eda91689" FOREIGN KEY ("sessionId") REFERENCES "active_workout_sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "active_set_logs" ADD CONSTRAINT "FK_aa8a8d84879dac6d25ed7a3a9e6" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "exercise_logs" ADD CONSTRAINT "FK_1c25082e5788b58e4a91407e34d" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "exercise_logs" DROP CONSTRAINT "FK_1c25082e5788b58e4a91407e34d"`
    );
    await queryRunner.query(
      `ALTER TABLE "active_set_logs" DROP CONSTRAINT "FK_aa8a8d84879dac6d25ed7a3a9e6"`
    );
    await queryRunner.query(
      `ALTER TABLE "active_set_logs" DROP CONSTRAINT "FK_f6fe56d1720796ce2a7eda91689"`
    );
    await queryRunner.query(
      `ALTER TABLE "active_workout_sessions" DROP CONSTRAINT "FK_3886d36ff4fe44eb07cc60cde74"`
    );
    await queryRunner.query(
      `ALTER TABLE "training_plan_likes" DROP CONSTRAINT "FK_2c85f41f867f9d0703b165425e9"`
    );
    await queryRunner.query(
      `ALTER TABLE "training_plan_feedbacks" DROP CONSTRAINT "FK_f1cfb6d6ba2120341efcac05041"`
    );
    await queryRunner.query(
      `ALTER TABLE "training_plan_comments" DROP CONSTRAINT "FK_9e1eb349d94fb4593ff8bace996"`
    );
    await queryRunner.query(
      `ALTER TABLE "plan_participant" DROP CONSTRAINT "FK_98e114e0b05861ac9d025e9c0af"`
    );
    await queryRunner.query(
      `ALTER TABLE "plan_invites" DROP CONSTRAINT "FK_e6b77ecc915a51b78b238e64b06"`
    );
    await queryRunner.query(
      `ALTER TABLE "plan_access_request" DROP CONSTRAINT "FK_3bec98ff9eea3e72081314a4a59"`
    );
    await queryRunner.query(
      `ALTER TABLE "days" DROP CONSTRAINT "FK_4c4841535803ef06571a77782fc"`
    );
    await queryRunner.query(
      `ALTER TABLE "plan_day_progress" DROP CONSTRAINT "FK_4ad012ce3c8a11b973cb7d421d6"`
    );
    await queryRunner.query(
      `ALTER TABLE "plan_day_progress" DROP CONSTRAINT "FK_01e9018d0b5401f2d6bc02fca51"`
    );
    await queryRunner.query(
      `ALTER TABLE "plan_subscription" DROP CONSTRAINT "FK_7c57629907dcde0a2029c5dc68a"`
    );
    await queryRunner.query(
      `ALTER TABLE "plan_subscription_privacy_settings" DROP CONSTRAINT "FK_f0fe6f036ae32d5bfe1af9dc133"`
    );
    await queryRunner.query(
      `ALTER TABLE "exercises" DROP CONSTRAINT "FK_85531791853605820c4f905ec7a"`
    );
    await queryRunner.query(`DROP TABLE "exercise_logs"`);
    await queryRunner.query(`DROP TABLE "active_set_logs"`);
    await queryRunner.query(`DROP TABLE "active_workout_sessions"`);
    await queryRunner.query(`DROP TABLE "training_plan_likes"`);
    await queryRunner.query(`DROP TABLE "training_plans"`);
    await queryRunner.query(`DROP TYPE "public"."training_plans_level_enum"`);
    await queryRunner.query(`DROP TYPE "public"."training_plans_visibility_enum"`);
    await queryRunner.query(`DROP TYPE "public"."training_plans_type_enum"`);
    await queryRunner.query(`DROP TABLE "training_plan_feedbacks"`);
    await queryRunner.query(`DROP TABLE "training_plan_comments"`);
    await queryRunner.query(`DROP TABLE "plan_participant"`);
    await queryRunner.query(`DROP TABLE "plan_invites"`);
    await queryRunner.query(`DROP TYPE "public"."plan_invites_status_enum"`);
    await queryRunner.query(`DROP TABLE "plan_access_request"`);
    await queryRunner.query(`DROP TYPE "public"."plan_access_request_status_enum"`);
    await queryRunner.query(`DROP TABLE "days"`);
    await queryRunner.query(`DROP TABLE "plan_day_progress"`);
    await queryRunner.query(`DROP TYPE "public"."plan_day_progress_status_enum"`);
    await queryRunner.query(`DROP TABLE "plan_subscription"`);
    await queryRunner.query(`DROP TYPE "public"."plan_subscription_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."plan_subscription_status_enum"`);
    await queryRunner.query(`DROP TABLE "plan_subscription_privacy_settings"`);
    await queryRunner.query(`DROP TABLE "exercises"`);
    await queryRunner.query(`DROP TYPE "public"."exercises_type_enum"`);
  }
}
