import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1763374895200 implements MigrationInterface {
    name = 'Migration1763374895200'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "training_plans" DROP CONSTRAINT "UQ_6f760e830ee5bfe961944dde962"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "training_plans" ADD CONSTRAINT "UQ_6f760e830ee5bfe961944dde962" UNIQUE ("name")`);
    }

}
