import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1760960248111 implements MigrationInterface {
    name = 'Migration1760960248111'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_follows" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "followerId" uuid NOT NULL, "followingId" uuid NOT NULL, CONSTRAINT "PK_da8e8793113adf3015952880966" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_privacy_settings" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "shareName" boolean NOT NULL DEFAULT true, "shareEmail" boolean NOT NULL DEFAULT true, "shareTrainingProgress" boolean NOT NULL DEFAULT false, "userId" uuid, CONSTRAINT "REL_6c6227fa8fb10ca8cc23ce6939" UNIQUE ("userId"), CONSTRAINT "PK_95fc563e79fedf0b241c0360be0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_follows" ADD CONSTRAINT "FK_6300484b604263eaae8a6aab88d" FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_follows" ADD CONSTRAINT "FK_7c6c27f12c4e972eab4b3aaccbf" FOREIGN KEY ("followingId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_privacy_settings" ADD CONSTRAINT "FK_6c6227fa8fb10ca8cc23ce6939b" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_privacy_settings" DROP CONSTRAINT "FK_6c6227fa8fb10ca8cc23ce6939b"`);
        await queryRunner.query(`ALTER TABLE "user_follows" DROP CONSTRAINT "FK_7c6c27f12c4e972eab4b3aaccbf"`);
        await queryRunner.query(`ALTER TABLE "user_follows" DROP CONSTRAINT "FK_6300484b604263eaae8a6aab88d"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "user_privacy_settings"`);
        await queryRunner.query(`DROP TABLE "user_follows"`);
    }

}
