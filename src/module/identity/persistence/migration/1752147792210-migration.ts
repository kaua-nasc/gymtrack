import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1752147792210 implements MigrationInterface {
    name = 'Migration1752147792210'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "actualTrainingPlan"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "actualTrainingPlan" character varying`);
    }

}
