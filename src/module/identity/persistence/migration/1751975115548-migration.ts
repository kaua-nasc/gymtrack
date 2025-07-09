import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1751975115548 implements MigrationInterface {
    name = 'Migration1751975115548'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "currentTrainingPlan"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "nextTrainingPlan"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "firstName"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "firstName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lastName"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "lastName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "email" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "email" character varying(150) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lastName"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "lastName" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "firstName"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "firstName" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "nextTrainingPlan" uuid`);
        await queryRunner.query(`ALTER TABLE "users" ADD "currentTrainingPlan" uuid`);
    }

}
