import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1771887670721 implements MigrationInterface {
    name = 'Migration1771887670721'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."plan_invites_status_enum" AS ENUM('PENDING', 'ACCEPTED', 'EXPIRED')`);
        await queryRunner.query(`CREATE TABLE "plan_invites" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "planId" uuid NOT NULL, "senderId" uuid NOT NULL, "recipientId" uuid, "recipientEmail" character varying NOT NULL, "status" "public"."plan_invites_status_enum" NOT NULL DEFAULT 'PENDING', CONSTRAINT "PK_a948e8c5ff31526d6e5f77efbe2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "plan_invites" ADD CONSTRAINT "FK_e6b77ecc915a51b78b238e64b06" FOREIGN KEY ("planId") REFERENCES "training_plans"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "plan_invites" DROP CONSTRAINT "FK_e6b77ecc915a51b78b238e64b06"`);
        await queryRunner.query(`DROP TABLE "plan_invites"`);
        await queryRunner.query(`DROP TYPE "public"."plan_invites_status_enum"`);
    }

}
