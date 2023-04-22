import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialTable1682134572362 implements MigrationInterface {
    name = 'InitialTable1682134572362'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "last_read_message" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "readAt" TIMESTAMP NOT NULL, "messageId" uuid, "userId" integer, CONSTRAINT "PK_50556009a1d0cdb4af5905e3948" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "friend_request" DROP COLUMN "senderSetPermission"`);
        await queryRunner.query(`DROP TYPE "public"."friend_request_sendersetpermission_enum"`);
        await queryRunner.query(`ALTER TABLE "friend_request" DROP COLUMN "senderSetNickname"`);
        await queryRunner.query(`ALTER TABLE "friend_request" DROP COLUMN "targetSetPermission"`);
        await queryRunner.query(`DROP TYPE "public"."friend_request_targetsetpermission_enum"`);
        await queryRunner.query(`ALTER TABLE "friend_request" DROP COLUMN "targetSetNickname"`);
        await queryRunner.query(`ALTER TABLE "friend_request" ADD "senderSetPreferencesId" uuid`);
        await queryRunner.query(`ALTER TABLE "friend_request" ADD CONSTRAINT "UQ_319f4441b49aa089bb2779ca351" UNIQUE ("senderSetPreferencesId")`);
        await queryRunner.query(`ALTER TABLE "friend_request" ADD "targetSetPreferencesId" uuid`);
        await queryRunner.query(`ALTER TABLE "friend_request" ADD CONSTRAINT "UQ_e5f3deec049782d758564db910f" UNIQUE ("targetSetPreferencesId")`);
        await queryRunner.query(`ALTER TABLE "friend_request" ADD CONSTRAINT "FK_319f4441b49aa089bb2779ca351" FOREIGN KEY ("senderSetPreferencesId") REFERENCES "friend_preferences"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "friend_request" ADD CONSTRAINT "FK_e5f3deec049782d758564db910f" FOREIGN KEY ("targetSetPreferencesId") REFERENCES "friend_preferences"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "last_read_message" ADD CONSTRAINT "FK_dc89d0537ca1625f74378db3bdb" FOREIGN KEY ("messageId") REFERENCES "message"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "last_read_message" ADD CONSTRAINT "FK_8146dc761aeca694f4919155b00" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "last_read_message" DROP CONSTRAINT "FK_8146dc761aeca694f4919155b00"`);
        await queryRunner.query(`ALTER TABLE "last_read_message" DROP CONSTRAINT "FK_dc89d0537ca1625f74378db3bdb"`);
        await queryRunner.query(`ALTER TABLE "friend_request" DROP CONSTRAINT "FK_e5f3deec049782d758564db910f"`);
        await queryRunner.query(`ALTER TABLE "friend_request" DROP CONSTRAINT "FK_319f4441b49aa089bb2779ca351"`);
        await queryRunner.query(`ALTER TABLE "friend_request" DROP CONSTRAINT "UQ_e5f3deec049782d758564db910f"`);
        await queryRunner.query(`ALTER TABLE "friend_request" DROP COLUMN "targetSetPreferencesId"`);
        await queryRunner.query(`ALTER TABLE "friend_request" DROP CONSTRAINT "UQ_319f4441b49aa089bb2779ca351"`);
        await queryRunner.query(`ALTER TABLE "friend_request" DROP COLUMN "senderSetPreferencesId"`);
        await queryRunner.query(`ALTER TABLE "friend_request" ADD "targetSetNickname" character varying`);
        await queryRunner.query(`CREATE TYPE "public"."friend_request_targetsetpermission_enum" AS ENUM('normal', 'chat-only')`);
        await queryRunner.query(`ALTER TABLE "friend_request" ADD "targetSetPermission" "public"."friend_request_targetsetpermission_enum" NOT NULL DEFAULT 'normal'`);
        await queryRunner.query(`ALTER TABLE "friend_request" ADD "senderSetNickname" character varying`);
        await queryRunner.query(`CREATE TYPE "public"."friend_request_sendersetpermission_enum" AS ENUM('normal', 'chat-only')`);
        await queryRunner.query(`ALTER TABLE "friend_request" ADD "senderSetPermission" "public"."friend_request_sendersetpermission_enum" NOT NULL DEFAULT 'normal'`);
        await queryRunner.query(`DROP TABLE "last_read_message"`);
    }

}
