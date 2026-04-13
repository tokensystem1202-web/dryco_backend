"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitialWashFlowSchema1713030000000 = void 0;
class InitialWashFlowSchema1713030000000 {
    constructor() {
        this.name = 'InitialWashFlowSchema1713030000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('customer', 'business', 'admin')`);
        await queryRunner.query(`CREATE TYPE "public"."services_category_enum" AS ENUM('wash', 'dry_clean', 'iron', 'wash_iron')`);
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('requested', 'accepted', 'picked_up', 'cleaning', 'out_for_delivery', 'delivered', 'cancelled')`);
        await queryRunner.query(`CREATE TYPE "public"."orders_payment_status_enum" AS ENUM('pending', 'paid', 'refunded')`);
        await queryRunner.query(`CREATE TYPE "public"."order_items_category_enum" AS ENUM('wash', 'dry_clean', 'iron', 'wash_iron')`);
        await queryRunner.query(`CREATE TYPE "public"."subscriptions_plan_name_enum" AS ENUM('silver', 'gold', 'platinum')`);
        await queryRunner.query(`CREATE TYPE "public"."coupons_discount_type_enum" AS ENUM('percentage', 'flat')`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_type_enum" AS ENUM('order', 'promo', 'system')`);
        await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "name" character varying NOT NULL,
        "email" character varying NOT NULL,
        "phone" character varying NOT NULL,
        "password_hash" character varying NOT NULL,
        "role" "public"."users_role_enum" NOT NULL,
        "profile_image" character varying,
        "address" character varying,
        "city" character varying,
        "pincode" character varying,
        "is_active" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "UQ_users_phone" UNIQUE ("phone")
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "businesses" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "user_id" uuid NOT NULL,
        "business_name" character varying NOT NULL,
        "logo" character varying,
        "address" character varying NOT NULL,
        "city" character varying NOT NULL,
        "pincode" character varying NOT NULL,
        "gst_number" character varying,
        "is_approved" boolean NOT NULL DEFAULT false,
        "is_active" boolean NOT NULL DEFAULT true,
        "commission_rate" numeric(5,2) NOT NULL DEFAULT 15,
        "rating" numeric(3,2) NOT NULL DEFAULT 0,
        "total_orders" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_businesses_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_businesses_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "services" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "business_id" uuid NOT NULL,
        "name" character varying NOT NULL,
        "category" "public"."services_category_enum" NOT NULL,
        "price_per_unit" numeric(10,2) NOT NULL,
        "unit" character varying NOT NULL,
        "description" character varying,
        "is_active" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_services_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_services_business_id" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "riders" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "business_id" uuid NOT NULL,
        "name" character varying NOT NULL,
        "phone" character varying NOT NULL,
        "email" character varying NOT NULL,
        "vehicle_type" character varying NOT NULL,
        "vehicle_number" character varying NOT NULL,
        "license_number" character varying NOT NULL,
        "profile_image" character varying,
        "is_available" boolean NOT NULL DEFAULT true,
        "is_active" boolean NOT NULL DEFAULT true,
        "total_deliveries" integer NOT NULL DEFAULT 0,
        "rating" numeric(3,2) NOT NULL DEFAULT 0,
        CONSTRAINT "PK_riders_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_riders_business_id" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "order_number" character varying NOT NULL,
        "customer_id" uuid NOT NULL,
        "business_id" uuid NOT NULL,
        "rider_id" uuid,
        "status" "public"."orders_status_enum" NOT NULL DEFAULT 'requested',
        "pickup_slot" character varying NOT NULL,
        "delivery_slot" character varying NOT NULL,
        "pickup_date" date NOT NULL,
        "delivery_date" date NOT NULL,
        "subtotal" numeric(10,2) NOT NULL,
        "discount_amount" numeric(10,2) NOT NULL DEFAULT 0,
        "coupon_code" character varying,
        "tax_amount" numeric(10,2) NOT NULL DEFAULT 0,
        "total_amount" numeric(10,2) NOT NULL,
        "payment_status" "public"."orders_payment_status_enum" NOT NULL DEFAULT 'pending',
        "payment_method" character varying,
        "payment_id" character varying,
        "special_instructions" character varying,
        CONSTRAINT "PK_orders_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_orders_order_number" UNIQUE ("order_number"),
        CONSTRAINT "FK_orders_customer_id" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION,
        CONSTRAINT "FK_orders_business_id" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE RESTRICT ON UPDATE NO ACTION,
        CONSTRAINT "FK_orders_rider_id" FOREIGN KEY ("rider_id") REFERENCES "riders"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "order_items" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "order_id" uuid NOT NULL,
        "service_id" uuid NOT NULL,
        "item_name" character varying NOT NULL,
        "category" "public"."order_items_category_enum" NOT NULL,
        "quantity" integer NOT NULL,
        "price_per_unit" numeric(10,2) NOT NULL,
        "total_price" numeric(10,2) NOT NULL,
        CONSTRAINT "PK_order_items_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_order_items_order_id" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_order_items_service_id" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "subscriptions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "customer_id" uuid NOT NULL,
        "business_id" uuid NOT NULL,
        "plan_name" "public"."subscriptions_plan_name_enum" NOT NULL,
        "price_per_month" numeric(10,2) NOT NULL,
        "items_limit" integer,
        "discount_percentage" numeric(5,2) NOT NULL,
        "start_date" date NOT NULL,
        "end_date" date NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "auto_renew" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_subscriptions_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_subscriptions_customer_id" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_subscriptions_business_id" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "coupons" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "business_id" uuid,
        "code" character varying NOT NULL,
        "discount_type" "public"."coupons_discount_type_enum" NOT NULL,
        "discount_value" numeric(10,2) NOT NULL,
        "min_order_value" numeric(10,2) NOT NULL DEFAULT 0,
        "max_discount" numeric(10,2),
        "usage_limit" integer,
        "used_count" integer NOT NULL DEFAULT 0,
        "valid_from" TIMESTAMP NOT NULL,
        "valid_till" TIMESTAMP NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_coupons_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_coupons_code" UNIQUE ("code"),
        CONSTRAINT "FK_coupons_business_id" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "reviews" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "order_id" uuid NOT NULL,
        "customer_id" uuid NOT NULL,
        "business_id" uuid NOT NULL,
        "rating" integer NOT NULL,
        "comment" character varying,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_reviews_id" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_reviews_rating" CHECK ("rating" >= 1 AND "rating" <= 5),
        CONSTRAINT "FK_reviews_order_id" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_reviews_customer_id" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_reviews_business_id" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "commissions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "order_id" uuid NOT NULL,
        "business_id" uuid NOT NULL,
        "order_amount" numeric(10,2) NOT NULL,
        "commission_rate" numeric(5,2) NOT NULL,
        "commission_amount" numeric(10,2) NOT NULL,
        "platform_earning" numeric(10,2) NOT NULL,
        "settled" boolean NOT NULL DEFAULT false,
        "settlement_date" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_commissions_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_commissions_order_id" UNIQUE ("order_id"),
        CONSTRAINT "FK_commissions_order_id" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_commissions_business_id" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "title" character varying NOT NULL,
        "message" character varying NOT NULL,
        "type" "public"."notifications_type_enum" NOT NULL,
        "is_read" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_notifications_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "otp_verifications" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "recipient" character varying NOT NULL,
        "otp" character varying NOT NULL,
        "expires_at" TIMESTAMP NOT NULL,
        "is_used" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_otp_verifications_id" PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`CREATE INDEX "IDX_businesses_city" ON "businesses" ("city")`);
        await queryRunner.query(`CREATE INDEX "IDX_services_business_id" ON "services" ("business_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_orders_customer_id" ON "orders" ("customer_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_orders_business_id" ON "orders" ("business_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_orders_status" ON "orders" ("status")`);
        await queryRunner.query(`CREATE INDEX "IDX_subscriptions_customer_id" ON "subscriptions" ("customer_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_notifications_user_id" ON "notifications" ("user_id")`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_notifications_user_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_subscriptions_customer_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_business_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_customer_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_services_business_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_businesses_city"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "otp_verifications"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "notifications"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "commissions"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "reviews"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "coupons"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "subscriptions"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "order_items"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "orders"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "riders"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "services"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "businesses"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."notifications_type_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."coupons_discount_type_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."subscriptions_plan_name_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."order_items_category_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."orders_payment_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."orders_status_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."services_category_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."users_role_enum"`);
    }
}
exports.InitialWashFlowSchema1713030000000 = InitialWashFlowSchema1713030000000;
//# sourceMappingURL=1713030000000-InitialWashFlowSchema.js.map