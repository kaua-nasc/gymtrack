import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1755989185950 implements MigrationInterface {
    name = 'Migration1755989185950'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."exercises_type_enum" AS ENUM('WARMUP', 'RECOGNITION', 'WORK', 'CARDIO')`);
        await queryRunner.query(`CREATE TABLE "exercises" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying NOT NULL, "dayId" uuid NOT NULL, "type" "public"."exercises_type_enum" NOT NULL, "setsNumber" integer NOT NULL, "repsNumber" integer NOT NULL, "description" text, "observation" text, CONSTRAINT "UQ_a521b5cac5648eedc036e17d1bd" UNIQUE ("name"), CONSTRAINT "PK_c4c46f5fa89a58ba7c2d894e3c3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "plan_subscription_partial_access_information" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "planSubscriptionId" uuid, "showDayProgress" boolean NOT NULL DEFAULT false, CONSTRAINT "REL_570db77182eacdd8ede65514fe" UNIQUE ("planSubscriptionId"), CONSTRAINT "PK_0dafa5145d671bb6d50948e1991" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."plan_subscription_status_enum" AS ENUM('NOT_STARTED', 'IN_PROGRESS', 'CANCELED', 'COMPLETED')`);
        await queryRunner.query(`CREATE TYPE "public"."plan_subscription_type_enum" AS ENUM('TOTAL_ACCESS', 'PARTIAL_ACCESS', 'PRIVATE')`);
        await queryRunner.query(`CREATE TABLE "plan_subscription" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "trainingPlanId" uuid NOT NULL, "userId" uuid NOT NULL, "status" "public"."plan_subscription_status_enum" NOT NULL DEFAULT 'NOT_STARTED', "type" "public"."plan_subscription_type_enum" NOT NULL, CONSTRAINT "PK_537e7826b55596d075de1bde618" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "plan_day_progress" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "planSubscriptionId" uuid NOT NULL, "dayId" uuid NOT NULL, CONSTRAINT "PK_6a1d175ad26bc8e79d4253a447a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "days" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying NOT NULL, "trainingPlanId" uuid NOT NULL, CONSTRAINT "UQ_18a49040122a90a7f959508f9b8" UNIQUE ("name"), CONSTRAINT "PK_c2c66eb46534bea34ba48cc4d7f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."plan_access_request_status_enum" AS ENUM('APPROVED', 'PENDING', 'REJECTED', 'CANCELED')`);
        await queryRunner.query(`CREATE TABLE "plan_access_request" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" uuid NOT NULL, "trainingPlanId" uuid NOT NULL, "status" "public"."plan_access_request_status_enum" NOT NULL, CONSTRAINT "PK_f03dddf7f62547e17bd18fc8df0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "plan_participant" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" uuid NOT NULL, "trainingPlanId" uuid NOT NULL, "expiration_date" TIMESTAMP NOT NULL, "approved_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_cf83d1fc076ed13fc7447d55076" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."training_plans_type_enum" AS ENUM('HYPERTROPHY', 'STRENGTH', 'MIXED')`);
        await queryRunner.query(`CREATE TYPE "public"."training_plans_visibility_enum" AS ENUM('PUBLIC', 'PROTECTED', 'PRIVATE')`);
        await queryRunner.query(`CREATE TYPE "public"."training_plans_level_enum" AS ENUM('BEGINNER', 'INTERMEDIARY', 'ADVANCED')`);
        await queryRunner.query(`CREATE TABLE "training_plans" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying NOT NULL, "authorId" uuid NOT NULL, "timeInDays" integer NOT NULL, "type" "public"."training_plans_type_enum" NOT NULL, "observation" text, "pathology" text, "visibility" "public"."training_plans_visibility_enum" NOT NULL, "level" "public"."training_plans_level_enum" NOT NULL, "maxSubscriptions" integer NOT NULL, CONSTRAINT "UQ_6f760e830ee5bfe961944dde962" UNIQUE ("name"), CONSTRAINT "PK_246975cb895b51662b90515a390" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "exercises" ADD CONSTRAINT "FK_85531791853605820c4f905ec7a" FOREIGN KEY ("dayId") REFERENCES "days"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "plan_subscription_partial_access_information" ADD CONSTRAINT "FK_570db77182eacdd8ede65514fe9" FOREIGN KEY ("planSubscriptionId") REFERENCES "plan_subscription"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "plan_subscription" ADD CONSTRAINT "FK_7c57629907dcde0a2029c5dc68a" FOREIGN KEY ("trainingPlanId") REFERENCES "training_plans"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "plan_day_progress" ADD CONSTRAINT "FK_01e9018d0b5401f2d6bc02fca51" FOREIGN KEY ("planSubscriptionId") REFERENCES "plan_subscription"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "plan_day_progress" ADD CONSTRAINT "FK_4ad012ce3c8a11b973cb7d421d6" FOREIGN KEY ("dayId") REFERENCES "days"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "days" ADD CONSTRAINT "FK_4c4841535803ef06571a77782fc" FOREIGN KEY ("trainingPlanId") REFERENCES "training_plans"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "plan_access_request" ADD CONSTRAINT "FK_3bec98ff9eea3e72081314a4a59" FOREIGN KEY ("trainingPlanId") REFERENCES "training_plans"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "plan_participant" ADD CONSTRAINT "FK_98e114e0b05861ac9d025e9c0af" FOREIGN KEY ("trainingPlanId") REFERENCES "training_plans"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "plan_participant" DROP CONSTRAINT "FK_98e114e0b05861ac9d025e9c0af"`);
        await queryRunner.query(`ALTER TABLE "plan_access_request" DROP CONSTRAINT "FK_3bec98ff9eea3e72081314a4a59"`);
        await queryRunner.query(`ALTER TABLE "days" DROP CONSTRAINT "FK_4c4841535803ef06571a77782fc"`);
        await queryRunner.query(`ALTER TABLE "plan_day_progress" DROP CONSTRAINT "FK_4ad012ce3c8a11b973cb7d421d6"`);
        await queryRunner.query(`ALTER TABLE "plan_day_progress" DROP CONSTRAINT "FK_01e9018d0b5401f2d6bc02fca51"`);
        await queryRunner.query(`ALTER TABLE "plan_subscription" DROP CONSTRAINT "FK_7c57629907dcde0a2029c5dc68a"`);
        await queryRunner.query(`ALTER TABLE "plan_subscription_partial_access_information" DROP CONSTRAINT "FK_570db77182eacdd8ede65514fe9"`);
        await queryRunner.query(`ALTER TABLE "exercises" DROP CONSTRAINT "FK_85531791853605820c4f905ec7a"`);
        await queryRunner.query(`DROP TABLE "training_plans"`);
        await queryRunner.query(`DROP TYPE "public"."training_plans_level_enum"`);
        await queryRunner.query(`DROP TYPE "public"."training_plans_visibility_enum"`);
        await queryRunner.query(`DROP TYPE "public"."training_plans_type_enum"`);
        await queryRunner.query(`DROP TABLE "plan_participant"`);
        await queryRunner.query(`DROP TABLE "plan_access_request"`);
        await queryRunner.query(`DROP TYPE "public"."plan_access_request_status_enum"`);
        await queryRunner.query(`DROP TABLE "days"`);
        await queryRunner.query(`DROP TABLE "plan_day_progress"`);
        await queryRunner.query(`DROP TABLE "plan_subscription"`);
        await queryRunner.query(`DROP TYPE "public"."plan_subscription_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."plan_subscription_status_enum"`);
        await queryRunner.query(`DROP TABLE "plan_subscription_partial_access_information"`);
        await queryRunner.query(`DROP TABLE "exercises"`);
        await queryRunner.query(`DROP TYPE "public"."exercises_type_enum"`);
    }

}
