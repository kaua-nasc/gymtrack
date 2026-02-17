import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1771353825328 implements MigrationInterface {
    name = 'Migration1771353825328'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_bc27334c64090429f15a8bc5ac"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_bc27334c64090429f15a8bc5ac" ON "training_plan_likes" ("likedBy", "trainingPlanId") `);
    }

}
