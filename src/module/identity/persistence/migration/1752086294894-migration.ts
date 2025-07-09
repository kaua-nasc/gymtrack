import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1752086294894 implements MigrationInterface {
    name = 'Migration1752086294894'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "actualTrainingPlan" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "actualTrainingPlan"`);
    }

}
