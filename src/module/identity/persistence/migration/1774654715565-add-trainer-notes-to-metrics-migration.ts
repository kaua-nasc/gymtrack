import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTrainerNotesToMetrics1774654715565 implements MigrationInterface {
    name = 'AddTrainerNotesToMetrics1774654715565'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "weight_logs" ADD "trainerNote" text`);
        await queryRunner.query(`ALTER TABLE "weight_logs" ADD "trainerNoteAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "body_measurements" ADD "trainerNote" text`);
        await queryRunner.query(`ALTER TABLE "body_measurements" ADD "trainerNoteAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "body_measurements" DROP COLUMN "trainerNoteAt"`);
        await queryRunner.query(`ALTER TABLE "body_measurements" DROP COLUMN "trainerNote"`);
        await queryRunner.query(`ALTER TABLE "weight_logs" DROP COLUMN "trainerNoteAt"`);
        await queryRunner.query(`ALTER TABLE "weight_logs" DROP COLUMN "trainerNote"`);
    }
}
