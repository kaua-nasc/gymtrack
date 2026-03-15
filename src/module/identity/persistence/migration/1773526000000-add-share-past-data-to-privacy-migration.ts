import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSharePastDataToPrivacy1773526000000 implements MigrationInterface {
    name = 'AddSharePastDataToPrivacy1773526000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_privacy_settings" ADD "sharePastDataWithTrainer" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_privacy_settings" DROP COLUMN "sharePastDataWithTrainer"`);
    }
}
