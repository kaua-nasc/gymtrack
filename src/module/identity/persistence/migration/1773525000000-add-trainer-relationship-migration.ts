import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTrainerRelationship1773525000000 implements MigrationInterface {
    name = 'AddTrainerRelationship1773525000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "trainerInviteCode" varchar(50)`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_trainer_invite_code" UNIQUE ("trainerInviteCode")`);
        
        await queryRunner.query(`
            CREATE TABLE "trainer_student_relationships" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "trainerId" uuid NOT NULL,
                "studentId" uuid NOT NULL,
                "linkedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_trainer_student_relationship" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_student_id" UNIQUE ("studentId"),
                CONSTRAINT "FK_trainer_id" FOREIGN KEY ("trainerId") REFERENCES "users"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_student_id" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "trainer_student_relationships"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_trainer_invite_code"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "trainerInviteCode"`);
    }
}
