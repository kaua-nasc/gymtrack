import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1772397319247 implements MigrationInterface {
    name = 'Migration1772397319247'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "exercise_logs" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" uuid NOT NULL, "exerciseId" uuid NOT NULL, "reps" text NOT NULL, "weight" text NOT NULL, "notes" text, CONSTRAINT "PK_32076bf978e4169be16e25bf8dc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "exercise_logs" ADD CONSTRAINT "FK_1c25082e5788b58e4a91407e34d" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "exercise_logs" DROP CONSTRAINT "FK_1c25082e5788b58e4a91407e34d"`);
        await queryRunner.query(`DROP TABLE "exercise_logs"`);
    }

}
