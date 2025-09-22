import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1758402140601 implements MigrationInterface {
    name = 'Migration1758402140601'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_follows" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "followerId" uuid NOT NULL, "followingId" uuid NOT NULL, CONSTRAINT "PK_da8e8793113adf3015952880966" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_follows" ADD CONSTRAINT "FK_6300484b604263eaae8a6aab88d" FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_follows" ADD CONSTRAINT "FK_7c6c27f12c4e972eab4b3aaccbf" FOREIGN KEY ("followingId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_follows" DROP CONSTRAINT "FK_7c6c27f12c4e972eab4b3aaccbf"`);
        await queryRunner.query(`ALTER TABLE "user_follows" DROP CONSTRAINT "FK_6300484b604263eaae8a6aab88d"`);
        await queryRunner.query(`DROP TABLE "user_follows"`);
    }

}
