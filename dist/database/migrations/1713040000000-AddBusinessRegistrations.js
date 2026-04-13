"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddBusinessRegistrations1713040000000 = void 0;
class AddBusinessRegistrations1713040000000 {
    constructor() {
        this.name = 'AddBusinessRegistrations1713040000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."business_registrations_business_type_enum" AS ENUM('laundry', 'dry_clean')`);
        await queryRunner.query(`CREATE TYPE "public"."business_registrations_status_enum" AS ENUM('pending', 'approved', 'rejected')`);
        await queryRunner.query(`
      CREATE TABLE "business_registrations" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "business_name" character varying NOT NULL,
        "owner_name" character varying NOT NULL,
        "phone" character varying NOT NULL,
        "address" character varying NOT NULL,
        "service_area" character varying NOT NULL,
        "business_type" "public"."business_registrations_business_type_enum" NOT NULL,
        "id_proof_path" character varying,
        "shop_image_path" character varying,
        "status" "public"."business_registrations_status_enum" NOT NULL DEFAULT 'pending',
        CONSTRAINT "PK_business_registrations_id" PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`CREATE INDEX "IDX_business_registrations_status" ON "business_registrations" ("status")`);
        await queryRunner.query(`CREATE INDEX "IDX_business_registrations_phone" ON "business_registrations" ("phone")`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_business_registrations_phone"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_business_registrations_status"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "business_registrations"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."business_registrations_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."business_registrations_business_type_enum"`);
    }
}
exports.AddBusinessRegistrations1713040000000 = AddBusinessRegistrations1713040000000;
//# sourceMappingURL=1713040000000-AddBusinessRegistrations.js.map