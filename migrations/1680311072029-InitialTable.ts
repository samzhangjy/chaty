import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialTable1680311072029 implements MigrationInterface {
    name = 'InitialTable1680311072029'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."friend_preferences_permission_enum" AS ENUM('normal', 'chat-only')`);
        await queryRunner.query(`CREATE TABLE "friend_preferences" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "permission" "public"."friend_preferences_permission_enum" NOT NULL DEFAULT 'normal', "nickname" character varying, CONSTRAINT "PK_73e6070fdcd3bca78285cea9dfa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "friend" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "targetId" integer, "preferencesId" uuid, CONSTRAINT "REL_e91546d5d303b5716f668b45e3" UNIQUE ("preferencesId"), CONSTRAINT "PK_1b301ac8ac5fcee876db96069b6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."friend_request_status_enum" AS ENUM('accepted', 'unaccepted', 'waiting')`);
        await queryRunner.query(`CREATE TYPE "public"."friend_request_sendersetpermission_enum" AS ENUM('normal', 'chat-only')`);
        await queryRunner.query(`CREATE TYPE "public"."friend_request_targetsetpermission_enum" AS ENUM('normal', 'chat-only')`);
        await queryRunner.query(`CREATE TABLE "friend_request" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."friend_request_status_enum" NOT NULL DEFAULT 'waiting', "senderSetPermission" "public"."friend_request_sendersetpermission_enum" NOT NULL DEFAULT 'normal', "senderSetNickname" character varying, "targetSetPermission" "public"."friend_request_targetsetpermission_enum" NOT NULL DEFAULT 'normal', "targetSetNickname" character varying, "message" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "targetId" integer, "senderId" integer, CONSTRAINT "PK_4c9d23ff394888750cf66cac17c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."join_group_request_status_enum" AS ENUM('accepted', 'unaccepted', 'waiting')`);
        await queryRunner.query(`CREATE TABLE "join_group_request" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."join_group_request_status_enum" NOT NULL DEFAULT 'waiting', "message" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "groupId" integer, "userId" integer, CONSTRAINT "PK_d6319d79a911812c281e9e547a1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "group" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_256aa0fda9b1de1a73ee0b7106b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."group_to_user_role_enum" AS ENUM('owner', 'admin', 'member')`);
        await queryRunner.query(`CREATE TABLE "group_to_user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "role" "public"."group_to_user_role_enum" NOT NULL DEFAULT 'owner', "groupId" integer, "userId" integer, CONSTRAINT "PK_d142e43baebc5f1abe2941950b6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "username" character varying, "lastLoginAt" TIMESTAMP, "socketId" character varying, "online" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."message_type_enum" AS ENUM('text', 'system', 'image', 'video', 'voice', 'file')`);
        await queryRunner.query(`CREATE TABLE "message" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "type" "public"."message_type_enum" NOT NULL DEFAULT 'text', "senderId" integer, "groupId" integer, CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "friend" ADD CONSTRAINT "FK_01cf728809dea38d7f76fbb07bf" FOREIGN KEY ("targetId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "friend" ADD CONSTRAINT "FK_e91546d5d303b5716f668b45e35" FOREIGN KEY ("preferencesId") REFERENCES "friend_preferences"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "friend_request" ADD CONSTRAINT "FK_c056b71f5032b183a23915a188f" FOREIGN KEY ("targetId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "friend_request" ADD CONSTRAINT "FK_9509b72f50f495668bae3c0171c" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "join_group_request" ADD CONSTRAINT "FK_c1f1ed990a3daa3c0098e5bf2dc" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "join_group_request" ADD CONSTRAINT "FK_fd3dd95f523feebde5e7bea6125" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "group_to_user" ADD CONSTRAINT "FK_8f0d7f4568fd0fb3b65ee8151b6" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "group_to_user" ADD CONSTRAINT "FK_fce96ee0c8cf3a4ac80bf7e757d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_bc096b4e18b1f9508197cd98066" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_a85a728f01be8f15f0e52019389" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_a85a728f01be8f15f0e52019389"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_bc096b4e18b1f9508197cd98066"`);
        await queryRunner.query(`ALTER TABLE "group_to_user" DROP CONSTRAINT "FK_fce96ee0c8cf3a4ac80bf7e757d"`);
        await queryRunner.query(`ALTER TABLE "group_to_user" DROP CONSTRAINT "FK_8f0d7f4568fd0fb3b65ee8151b6"`);
        await queryRunner.query(`ALTER TABLE "join_group_request" DROP CONSTRAINT "FK_fd3dd95f523feebde5e7bea6125"`);
        await queryRunner.query(`ALTER TABLE "join_group_request" DROP CONSTRAINT "FK_c1f1ed990a3daa3c0098e5bf2dc"`);
        await queryRunner.query(`ALTER TABLE "friend_request" DROP CONSTRAINT "FK_9509b72f50f495668bae3c0171c"`);
        await queryRunner.query(`ALTER TABLE "friend_request" DROP CONSTRAINT "FK_c056b71f5032b183a23915a188f"`);
        await queryRunner.query(`ALTER TABLE "friend" DROP CONSTRAINT "FK_e91546d5d303b5716f668b45e35"`);
        await queryRunner.query(`ALTER TABLE "friend" DROP CONSTRAINT "FK_01cf728809dea38d7f76fbb07bf"`);
        await queryRunner.query(`DROP TABLE "message"`);
        await queryRunner.query(`DROP TYPE "public"."message_type_enum"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "group_to_user"`);
        await queryRunner.query(`DROP TYPE "public"."group_to_user_role_enum"`);
        await queryRunner.query(`DROP TABLE "group"`);
        await queryRunner.query(`DROP TABLE "join_group_request"`);
        await queryRunner.query(`DROP TYPE "public"."join_group_request_status_enum"`);
        await queryRunner.query(`DROP TABLE "friend_request"`);
        await queryRunner.query(`DROP TYPE "public"."friend_request_targetsetpermission_enum"`);
        await queryRunner.query(`DROP TYPE "public"."friend_request_sendersetpermission_enum"`);
        await queryRunner.query(`DROP TYPE "public"."friend_request_status_enum"`);
        await queryRunner.query(`DROP TABLE "friend"`);
        await queryRunner.query(`DROP TABLE "friend_preferences"`);
        await queryRunner.query(`DROP TYPE "public"."friend_preferences_permission_enum"`);
    }

}
