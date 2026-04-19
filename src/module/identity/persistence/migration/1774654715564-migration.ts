import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1774654715564 implements MigrationInterface {
    name = 'Migration1774654715564'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "trainer_student_relationships" DROP CONSTRAINT "FK_student_id"`);
        await queryRunner.query(`ALTER TABLE "trainer_student_relationships" DROP CONSTRAINT "FK_trainer_id"`);
        await queryRunner.query(`ALTER TABLE "trainer_student_relationships" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "trainer_student_relationships" ADD CONSTRAINT "FK_abb1b731e39687111e7feb0288e" FOREIGN KEY ("trainerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "trainer_student_relationships" ADD CONSTRAINT "FK_6466809dbe84657bfe692add1ce" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "trainer_student_relationships" DROP CONSTRAINT "FK_6466809dbe84657bfe692add1ce"`);
        await queryRunner.query(`ALTER TABLE "trainer_student_relationships" DROP CONSTRAINT "FK_abb1b731e39687111e7feb0288e"`);
        await queryRunner.query(`ALTER TABLE "trainer_student_relationships" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "trainer_student_relationships" ADD CONSTRAINT "FK_trainer_id" FOREIGN KEY ("trainerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "trainer_student_relationships" ADD CONSTRAINT "FK_student_id" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
