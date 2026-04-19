import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCrefAndIsVerifiedToUser1773527000000 implements MigrationInterface {
    name = 'AddCrefAndIsVerifiedToUser1773527000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "cref" varchar(20)`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_user_cref" UNIQUE ("cref")`);
        await queryRunner.query(`ALTER TABLE "users" ADD "isVerified" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isVerified"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_user_cref"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "cref"`);
    }
}
