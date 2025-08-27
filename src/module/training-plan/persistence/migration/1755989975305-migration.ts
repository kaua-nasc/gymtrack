import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1755989975305 implements MigrationInterface {
    name = 'Migration1755989975305'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "training_plans" ALTER COLUMN "maxSubscriptions" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "training_plans" ALTER COLUMN "maxSubscriptions" SET NOT NULL`);
    }

}
