-- Manual schema reference. Not applied by Supabase CLI.
-- Edit here, then run selected sections in the local SQL editor.
-- Source snapshot: supabase/migrations/20260509200759_remote_schema.sql
-- Vendor classification uses public.business_type: registered | unregistered.



SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."order_status" AS ENUM (
    'pending',
    'confirmed',
    'shipped',
    'completed',
    'cancelled',
    'to_pay',
    'to_ship',
    'to_receive'
);


ALTER TYPE "public"."order_status" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'admin',
    'vendor',
    'customer'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE TYPE "public"."vendor_status" AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE "public"."vendor_status" OWNER TO "postgres";


CREATE TYPE "public"."business_type" AS ENUM (
    'registered',
    'unregistered'
);


ALTER TYPE "public"."business_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."current_user_role"() RETURNS "public"."user_role"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT role
  FROM public.users
  WHERE id = auth.uid();
$$;


ALTER FUNCTION "public"."current_user_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."current_vendor_id"() RETURNS "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT id
  FROM public.vendors
  WHERE owner_id = auth.uid()
  LIMIT 1;
$$;


ALTER FUNCTION "public"."current_vendor_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enforce_product_category_limit"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  category_count integer;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT COUNT(*)
    INTO category_count
    FROM public.product_categories
    WHERE product_id = NEW.product_id;

    IF category_count >= 3 THEN
      RAISE EXCEPTION 'A product can have at most 3 categories.';
    END IF;
  ELSIF TG_OP = 'UPDATE' AND NEW.product_id <> OLD.product_id THEN
    SELECT COUNT(*)
    INTO category_count
    FROM public.product_categories
    WHERE product_id = NEW.product_id;

    IF category_count >= 3 THEN
      RAISE EXCEPTION 'A product can have at most 3 categories.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."enforce_product_category_limit"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT public.current_user_role() = 'admin'::user_role;
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_vendor"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT public.current_user_role() = 'vendor'::user_role;
$$;


ALTER FUNCTION "public"."is_vendor"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_customer_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_customer_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_order_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_order_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_vendor_applications_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_vendor_applications_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."activity_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "admin_user_id" "uuid" NOT NULL,
    "admin_name" "text" NOT NULL,
    "action_type" "text" NOT NULL,
    "action_title" "text" NOT NULL,
    "target_id" "uuid",
    "target_name" "text" NOT NULL,
    "details" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "tags" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "quick_links" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "rating" "jsonb",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "activity_logs_action_type_check" CHECK (("action_type" = ANY (ARRAY['approved'::"text", 'rejected'::"text", 'suspended'::"text", 'unsuspended'::"text", 'login'::"text", 'logout'::"text"])))
);


ALTER TABLE "public"."activity_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "category_name" "text" NOT NULL
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."customers" (
    "user_id" "uuid" NOT NULL,
    "shipping_address" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "profile_photo_url" "text",
    "notification_preferences" "jsonb" DEFAULT '{"promotions": false, "order_updates": true}'::"jsonb" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."customers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "quantity" integer NOT NULL,
    "subtotal" numeric(12,2) NOT NULL,
    CONSTRAINT "order_items_quantity_check" CHECK (("quantity" > 0)),
    CONSTRAINT "order_items_subtotal_check" CHECK (("subtotal" >= (0)::numeric))
);


ALTER TABLE "public"."order_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "vendor_id" "uuid" NOT NULL,
    "order_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "public"."order_status" DEFAULT 'pending'::"public"."order_status" NOT NULL,
    "total_amount" numeric(12,2) NOT NULL,
    "payment_method" "text",
    "receipt_proof_url" "text",
    "receipt_submitted_at" timestamp with time zone,
    "payment_confirmed_at" timestamp with time zone,
    "shipped_at" timestamp with time zone,
    "received_at" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "orders_payment_method_check" CHECK (("payment_method" = ANY (ARRAY['online'::"text", 'cod'::"text"]))),
    CONSTRAINT "orders_total_amount_check" CHECK (("total_amount" >= (0)::numeric))
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."popup_gallery_photos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "vendor_id" "uuid" NOT NULL,
    "image_url" "text" NOT NULL,
    "caption" "text" NOT NULL,
    "location" "text",
    "event_name" "text",
    "display_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."popup_gallery_photos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."popup_location_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "vendor_id" "uuid" NOT NULL,
    "requested_location" "text" NOT NULL,
    "requested_date" "date" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "requested_start_time" time without time zone,
    "requested_end_time" time without time zone,
    "latitude" double precision,
    "longitude" double precision,
    CONSTRAINT "popup_location_requests_time_range_check" CHECK ((("requested_start_time" IS NULL) OR ("requested_end_time" IS NULL) OR ("requested_start_time" < "requested_end_time")))
);


ALTER TABLE "public"."popup_location_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."popup_locations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "vendor_id" "uuid" NOT NULL,
    "location" "text" NOT NULL,
    "scheduled_date" "date" NOT NULL,
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone NOT NULL,
    "latitude" numeric(10,8),
    "longitude" numeric(11,8),
    CONSTRAINT "popup_locations_latitude_range_check" CHECK ((("latitude" IS NULL) OR (("latitude" >= ('-90'::integer)::numeric) AND ("latitude" <= (90)::numeric)))),
    CONSTRAINT "popup_locations_longitude_range_check" CHECK ((("longitude" IS NULL) OR (("longitude" >= ('-180'::integer)::numeric) AND ("longitude" <= (180)::numeric))))
);


ALTER TABLE "public"."popup_locations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_categories" (
    "product_id" "uuid" NOT NULL,
    "category_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."product_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_images" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "image_url" "text" NOT NULL,
    "display_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."product_images" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "vendor_id" "uuid" NOT NULL,
    "category_id" "uuid",
    "product_name" "text" NOT NULL,
    "description" "text",
    "price" numeric(10,2) NOT NULL,
    "stocks" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "product_image_url" "text",
    CONSTRAINT "products_price_check" CHECK (("price" >= (0)::numeric)),
    CONSTRAINT "products_stocks_check" CHECK (("stocks" >= 0))
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "vendor_id" "uuid" NOT NULL,
    "rating" integer NOT NULL,
    "comment" "text",
    "review_date" timestamp with time zone DEFAULT "now"(),
    "product_id" "uuid",
    "order_id" "uuid",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    CONSTRAINT "reviews_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5))),
    CONSTRAINT "reviews_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "name" "text",
    "email" "text" NOT NULL,
    "contact_number" "text",
    "role" "public"."user_role" DEFAULT 'customer'::"public"."user_role",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "profile_photo_url" "text"
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vendor_applications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "owner_id" "uuid" NOT NULL,
    "shop_name" "text",
    "shop_address" "text",
    "email" "text",
    "phone_number" "text",
    "business_type" "public"."business_type",
    "business_submission_timing" "text",
    "primary_business_document_type" "text",
    "primary_business_document_url" "text",
    "government_id_type" "text",
    "government_id_document_url" "text",
    "taxpayer_identification_number" "text",
    "vat_registration_status" "text",
    "bir_certificate_url" "text",
    "submission_status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "submitted_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "rejection_reason" "text",
    "approved_at" timestamp with time zone,
    "rejected_at" timestamp with time zone,
    "approved_vendor_user_id" "uuid",
    "suspension_reason" "text",
    CONSTRAINT "vendor_applications_business_submission_timing_check" CHECK (("business_submission_timing" = ANY (ARRAY['now'::"text", 'later'::"text"]))),
    CONSTRAINT "vendor_applications_submission_status_check" CHECK (("submission_status" = ANY (ARRAY['draft'::"text", 'submitted'::"text", 'approved'::"text", 'rejected'::"text"]))),
    CONSTRAINT "vendor_applications_vat_registration_status_check" CHECK (("vat_registration_status" = ANY (ARRAY['vat-registered'::"text", 'non-vat-registered'::"text"])))
);


ALTER TABLE "public"."vendor_applications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vendors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "owner_id" "uuid" NOT NULL,
    "shop_name" "text",
    "business_type" "public"."business_type" NOT NULL,
    "average_rating" numeric(3,2) DEFAULT 0.00,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "public"."vendor_status" DEFAULT 'pending'::"public"."vendor_status" NOT NULL,
    "suspended_at" timestamp with time zone,
    "suspended_by_admin_id" "uuid",
    "suspension_reason" "text",
    "location_text" "text",
    "location_latitude" double precision,
    "location_longitude" double precision,
    "phone_number" "text",
    "opens_at" time without time zone,
    "closes_at" time without time zone,
    "about" "text",
    CONSTRAINT "vendors_average_rating_check" CHECK ((("average_rating" >= (0)::numeric) AND ("average_rating" <= (5)::numeric))),
    CONSTRAINT "vendors_phone_number_ph_check" CHECK ((("phone_number" IS NULL) OR ("phone_number" ~ '^\+63\d{9}$'::"text")))
);


ALTER TABLE "public"."vendors" OWNER TO "postgres";


ALTER TABLE ONLY "public"."activity_logs"
    ADD CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_category_name_key" UNIQUE ("category_name");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."popup_gallery_photos"
    ADD CONSTRAINT "popup_gallery_photos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."popup_locations"
    ADD CONSTRAINT "popup_locations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."popup_location_requests"
    ADD CONSTRAINT "popup_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_categories"
    ADD CONSTRAINT "product_categories_pkey" PRIMARY KEY ("product_id", "category_id");



ALTER TABLE ONLY "public"."product_images"
    ADD CONSTRAINT "product_images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vendors"
    ADD CONSTRAINT "unique_vendor_owner" UNIQUE ("owner_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vendor_applications"
    ADD CONSTRAINT "vendor_applications_owner_id_key" UNIQUE ("owner_id");



ALTER TABLE ONLY "public"."vendor_applications"
    ADD CONSTRAINT "vendor_applications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vendors"
    ADD CONSTRAINT "vendors_pkey" PRIMARY KEY ("id");



CREATE INDEX "activity_logs_action_type_idx" ON "public"."activity_logs" USING "btree" ("action_type");



CREATE INDEX "activity_logs_admin_user_id_idx" ON "public"."activity_logs" USING "btree" ("admin_user_id");



CREATE INDEX "activity_logs_created_at_idx" ON "public"."activity_logs" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_orders_customer_status" ON "public"."orders" USING "btree" ("customer_id", "status");



CREATE INDEX "idx_orders_vendor_status" ON "public"."orders" USING "btree" ("vendor_id", "status");



CREATE INDEX "idx_vendors_location_coords" ON "public"."vendors" USING "btree" ("location_latitude", "location_longitude");



CREATE INDEX "idx_vendors_location_text" ON "public"."vendors" USING "gin" ("to_tsvector"('"simple"'::"regconfig", COALESCE("location_text", ''::"text")));



CREATE INDEX "idx_vendors_owner_status" ON "public"."vendors" USING "btree" ("owner_id", "status");



CREATE UNIQUE INDEX "vendors_owner_id_key" ON "public"."vendors" USING "btree" ("owner_id");



CREATE INDEX "idx_vendors_status" ON "public"."vendors" USING "btree" ("status");



CREATE INDEX "popup_gallery_photos_vendor_id_idx" ON "public"."popup_gallery_photos" USING "btree" ("vendor_id");



CREATE INDEX "popup_gallery_photos_vendor_order_idx" ON "public"."popup_gallery_photos" USING "btree" ("vendor_id", "display_order", "created_at");



CREATE INDEX "product_categories_category_id_idx" ON "public"."product_categories" USING "btree" ("category_id");



CREATE INDEX "product_images_display_order_idx" ON "public"."product_images" USING "btree" ("product_id", "display_order");



CREATE INDEX "product_images_product_id_idx" ON "public"."product_images" USING "btree" ("product_id");



CREATE INDEX "reviews_order_id_idx" ON "public"."reviews" USING "btree" ("order_id");



CREATE INDEX "reviews_product_id_idx" ON "public"."reviews" USING "btree" ("product_id");



CREATE INDEX "reviews_status_idx" ON "public"."reviews" USING "btree" ("status");



CREATE INDEX "vendor_applications_email_lower_idx" ON "public"."vendor_applications" USING "btree" ("lower"("email"));



CREATE INDEX "vendor_applications_submission_status_idx" ON "public"."vendor_applications" USING "btree" ("submission_status");



CREATE OR REPLACE TRIGGER "set_customer_updated_at" BEFORE UPDATE ON "public"."customers" FOR EACH ROW EXECUTE FUNCTION "public"."set_customer_updated_at"();



CREATE OR REPLACE TRIGGER "set_order_updated_at" BEFORE UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."set_order_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_enforce_product_category_limit" BEFORE INSERT OR UPDATE ON "public"."product_categories" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_product_category_limit"();



CREATE OR REPLACE TRIGGER "vendor_applications_updated_at" BEFORE UPDATE ON "public"."vendor_applications" FOR EACH ROW EXECUTE FUNCTION "public"."set_vendor_applications_updated_at"();



ALTER TABLE ONLY "public"."activity_logs"
    ADD CONSTRAINT "activity_logs_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."popup_gallery_photos"
    ADD CONSTRAINT "popup_gallery_photos_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."popup_locations"
    ADD CONSTRAINT "popup_locations_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."popup_location_requests"
    ADD CONSTRAINT "popup_requests_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."popup_location_requests"
    ADD CONSTRAINT "popup_requests_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_categories"
    ADD CONSTRAINT "product_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_categories"
    ADD CONSTRAINT "product_categories_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_images"
    ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vendor_applications"
    ADD CONSTRAINT "vendor_applications_approved_vendor_user_id_fkey" FOREIGN KEY ("approved_vendor_user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."vendor_applications"
    ADD CONSTRAINT "vendor_applications_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vendors"
    ADD CONSTRAINT "vendors_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vendors"
    ADD CONSTRAINT "vendors_suspended_by_admin_id_fkey" FOREIGN KEY ("suspended_by_admin_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



CREATE POLICY "Admins can insert activity logs" ON "public"."activity_logs" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Anyone can view categories" ON "public"."categories" FOR SELECT USING (true);



CREATE POLICY "Anyone can view popup gallery photos" ON "public"."popup_gallery_photos" FOR SELECT USING (true);



CREATE POLICY "Anyone can view product categories" ON "public"."product_categories" FOR SELECT USING (true);



CREATE POLICY "Anyone can view product images" ON "public"."product_images" FOR SELECT USING (true);



CREATE POLICY "Customers can create own orders" ON "public"."orders" FOR INSERT WITH CHECK (("auth"."uid"() = "customer_id"));



CREATE POLICY "Customers can insert own profile" ON "public"."customers" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"() = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."role" = 'admin'::"public"."user_role"))))));



CREATE POLICY "Customers can manage own order items" ON "public"."order_items" USING (("order_id" IN ( SELECT "orders"."id"
   FROM "public"."orders"
  WHERE ("orders"."customer_id" = "auth"."uid"()))));



CREATE POLICY "Customers can read own profile" ON "public"."customers" FOR SELECT TO "authenticated" USING ((("auth"."uid"() = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."role" = 'admin'::"public"."user_role"))))));



CREATE POLICY "Customers can update own profile" ON "public"."customers" FOR UPDATE TO "authenticated" USING ((("auth"."uid"() = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."role" = 'admin'::"public"."user_role")))))) WITH CHECK ((("auth"."uid"() = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."users" "u"
  WHERE (("u"."id" = "auth"."uid"()) AND ("u"."role" = 'admin'::"public"."user_role"))))));



CREATE POLICY "Customers can view own orders" ON "public"."orders" FOR SELECT USING (("auth"."uid"() = "customer_id"));



CREATE POLICY "Popup vendors can delete their own gallery photos" ON "public"."popup_gallery_photos" FOR DELETE USING (("vendor_id" IN ( SELECT "vendors"."id"
   FROM "public"."vendors"
  WHERE ("vendors"."owner_id" = "auth"."uid"()))));



CREATE POLICY "Popup vendors can insert their own gallery photos" ON "public"."popup_gallery_photos" FOR INSERT WITH CHECK (("vendor_id" IN ( SELECT "vendors"."id"
   FROM "public"."vendors"
  WHERE ("vendors"."owner_id" = "auth"."uid"()))));



CREATE POLICY "Popup vendors can update their own gallery photos" ON "public"."popup_gallery_photos" FOR UPDATE USING (("vendor_id" IN ( SELECT "vendors"."id"
   FROM "public"."vendors"
  WHERE ("vendors"."owner_id" = "auth"."uid"())))) WITH CHECK (("vendor_id" IN ( SELECT "vendors"."id"
   FROM "public"."vendors"
  WHERE ("vendors"."owner_id" = "auth"."uid"()))));



CREATE POLICY "Vendors can delete product categories for own products" ON "public"."product_categories" FOR DELETE USING (("product_id" IN ( SELECT "products"."id"
   FROM ("public"."products"
     JOIN "public"."vendors" ON (("products"."vendor_id" = "vendors"."id")))
  WHERE ("vendors"."owner_id" = "auth"."uid"()))));



CREATE POLICY "Vendors can delete their product images" ON "public"."product_images" FOR DELETE USING (("product_id" IN ( SELECT "products"."id"
   FROM ("public"."products"
     JOIN "public"."vendors" ON (("products"."vendor_id" = "vendors"."id")))
  WHERE ("vendors"."owner_id" = "auth"."uid"()))));



CREATE POLICY "Vendors can insert product categories for own products" ON "public"."product_categories" FOR INSERT WITH CHECK (("product_id" IN ( SELECT "products"."id"
   FROM ("public"."products"
     JOIN "public"."vendors" ON (("products"."vendor_id" = "vendors"."id")))
  WHERE ("vendors"."owner_id" = "auth"."uid"()))));



CREATE POLICY "Vendors can insert product images for their products" ON "public"."product_images" FOR INSERT WITH CHECK (("product_id" IN ( SELECT "products"."id"
   FROM ("public"."products"
     JOIN "public"."vendors" ON (("products"."vendor_id" = "vendors"."id")))
  WHERE ("vendors"."owner_id" = "auth"."uid"()))));



CREATE POLICY "Vendors can update product categories for own products" ON "public"."product_categories" FOR UPDATE USING (("product_id" IN ( SELECT "products"."id"
   FROM ("public"."products"
     JOIN "public"."vendors" ON (("products"."vendor_id" = "vendors"."id")))
  WHERE ("vendors"."owner_id" = "auth"."uid"())))) WITH CHECK (("product_id" IN ( SELECT "products"."id"
   FROM ("public"."products"
     JOIN "public"."vendors" ON (("products"."vendor_id" = "vendors"."id")))
  WHERE ("vendors"."owner_id" = "auth"."uid"()))));



CREATE POLICY "Vendors can update their product images" ON "public"."product_images" FOR UPDATE USING (("product_id" IN ( SELECT "products"."id"
   FROM ("public"."products"
     JOIN "public"."vendors" ON (("products"."vendor_id" = "vendors"."id")))
  WHERE ("vendors"."owner_id" = "auth"."uid"()))));



ALTER TABLE "public"."activity_logs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "activity_logs_select_admins" ON "public"."activity_logs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."customers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."popup_gallery_photos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_images" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."current_user_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."current_user_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."current_user_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."current_vendor_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."current_vendor_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."current_vendor_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."enforce_product_category_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_product_category_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_product_category_limit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_vendor"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_vendor"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_vendor"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_customer_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_customer_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_customer_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_order_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_order_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_order_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_vendor_applications_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_vendor_applications_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_vendor_applications_updated_at"() TO "service_role";


















GRANT ALL ON TABLE "public"."activity_logs" TO "anon";
GRANT ALL ON TABLE "public"."activity_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_logs" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."customers" TO "anon";
GRANT ALL ON TABLE "public"."customers" TO "authenticated";
GRANT ALL ON TABLE "public"."customers" TO "service_role";



GRANT ALL ON TABLE "public"."order_items" TO "anon";
GRANT ALL ON TABLE "public"."order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."order_items" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."popup_gallery_photos" TO "anon";
GRANT ALL ON TABLE "public"."popup_gallery_photos" TO "authenticated";
GRANT ALL ON TABLE "public"."popup_gallery_photos" TO "service_role";



GRANT ALL ON TABLE "public"."popup_location_requests" TO "anon";
GRANT ALL ON TABLE "public"."popup_location_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."popup_location_requests" TO "service_role";



GRANT ALL ON TABLE "public"."popup_locations" TO "anon";
GRANT ALL ON TABLE "public"."popup_locations" TO "authenticated";
GRANT ALL ON TABLE "public"."popup_locations" TO "service_role";



GRANT ALL ON TABLE "public"."product_categories" TO "anon";
GRANT ALL ON TABLE "public"."product_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."product_categories" TO "service_role";



GRANT ALL ON TABLE "public"."product_images" TO "anon";
GRANT ALL ON TABLE "public"."product_images" TO "authenticated";
GRANT ALL ON TABLE "public"."product_images" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."reviews" TO "anon";
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."reviews" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."vendor_applications" TO "anon";
GRANT ALL ON TABLE "public"."vendor_applications" TO "authenticated";
GRANT ALL ON TABLE "public"."vendor_applications" TO "service_role";



GRANT ALL ON TABLE "public"."vendors" TO "anon";
GRANT ALL ON TABLE "public"."vendors" TO "authenticated";
GRANT ALL ON TABLE "public"."vendors" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";

drop trigger if exists "set_customer_updated_at" on "public"."customers";

drop trigger if exists "set_order_updated_at" on "public"."orders";

drop trigger if exists "trigger_enforce_product_category_limit" on "public"."product_categories";

drop trigger if exists "vendor_applications_updated_at" on "public"."vendor_applications";

drop policy "Admins can insert activity logs" on "public"."activity_logs";

drop policy "activity_logs_select_admins" on "public"."activity_logs";

drop policy "Customers can insert own profile" on "public"."customers";

drop policy "Customers can read own profile" on "public"."customers";

drop policy "Customers can update own profile" on "public"."customers";

drop policy "Customers can manage own order items" on "public"."order_items";

drop policy "Popup vendors can delete their own gallery photos" on "public"."popup_gallery_photos";

drop policy "Popup vendors can insert their own gallery photos" on "public"."popup_gallery_photos";

drop policy "Popup vendors can update their own gallery photos" on "public"."popup_gallery_photos";

drop policy "Vendors can delete product categories for own products" on "public"."product_categories";

drop policy "Vendors can insert product categories for own products" on "public"."product_categories";

drop policy "Vendors can update product categories for own products" on "public"."product_categories";

drop policy "Vendors can delete their product images" on "public"."product_images";

drop policy "Vendors can insert product images for their products" on "public"."product_images";

drop policy "Vendors can update their product images" on "public"."product_images";

alter table "public"."activity_logs" drop constraint "activity_logs_admin_user_id_fkey";

alter table "public"."customers" drop constraint "customers_user_id_fkey";

alter table "public"."order_items" drop constraint "order_items_order_id_fkey";

alter table "public"."order_items" drop constraint "order_items_product_id_fkey";

alter table "public"."orders" drop constraint "orders_customer_id_fkey";

alter table "public"."orders" drop constraint "orders_vendor_id_fkey";

alter table "public"."popup_gallery_photos" drop constraint "popup_gallery_photos_vendor_id_fkey";

alter table "public"."popup_location_requests" drop constraint "popup_requests_customer_id_fkey";

alter table "public"."popup_location_requests" drop constraint "popup_requests_vendor_id_fkey";

alter table "public"."popup_locations" drop constraint "popup_locations_vendor_id_fkey";

alter table "public"."product_categories" drop constraint "product_categories_category_id_fkey";

alter table "public"."product_categories" drop constraint "product_categories_product_id_fkey";

alter table "public"."product_images" drop constraint "product_images_product_id_fkey";

alter table "public"."products" drop constraint "products_category_id_fkey";

alter table "public"."products" drop constraint "products_vendor_id_fkey";

alter table "public"."reviews" drop constraint "reviews_customer_id_fkey";

alter table "public"."reviews" drop constraint "reviews_order_id_fkey";

alter table "public"."reviews" drop constraint "reviews_product_id_fkey";

alter table "public"."reviews" drop constraint "reviews_vendor_id_fkey";

alter table "public"."vendor_applications" drop constraint "vendor_applications_approved_vendor_user_id_fkey";

alter table "public"."vendor_applications" drop constraint "vendor_applications_owner_id_fkey";

alter table "public"."vendors" drop constraint "vendors_owner_id_fkey";

alter table "public"."vendors" drop constraint "vendors_suspended_by_admin_id_fkey";

alter table "public"."orders" alter column "status" set default 'pending'::public.order_status;

alter table "public"."orders" alter column "status" set data type public.order_status using "status"::text::public.order_status;

alter table "public"."users" alter column "role" set default 'customer'::public.user_role;

alter table "public"."users" alter column "role" set data type public.user_role using "role"::text::public.user_role;

alter table "public"."vendor_applications" alter column "business_type" set data type public.business_type using "business_type"::text::public.business_type;

alter table "public"."vendors" alter column "status" set default 'pending'::public.vendor_status;

alter table "public"."vendors" alter column "status" set data type public.vendor_status using "status"::text::public.vendor_status;

alter table "public"."vendors" alter column "business_type" set data type public.business_type using "business_type"::text::public.business_type;

alter table "public"."activity_logs" add constraint "activity_logs_admin_user_id_fkey" FOREIGN KEY (admin_user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."activity_logs" validate constraint "activity_logs_admin_user_id_fkey";

alter table "public"."customers" add constraint "customers_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."customers" validate constraint "customers_user_id_fkey";

alter table "public"."order_items" add constraint "order_items_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE not valid;

alter table "public"."order_items" validate constraint "order_items_order_id_fkey";

alter table "public"."order_items" add constraint "order_items_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE not valid;

alter table "public"."order_items" validate constraint "order_items_product_id_fkey";

alter table "public"."orders" add constraint "orders_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public.customers(user_id) ON DELETE CASCADE not valid;

alter table "public"."orders" validate constraint "orders_customer_id_fkey";

alter table "public"."orders" add constraint "orders_vendor_id_fkey" FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE not valid;

alter table "public"."orders" validate constraint "orders_vendor_id_fkey";

alter table "public"."popup_gallery_photos" add constraint "popup_gallery_photos_vendor_id_fkey" FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE not valid;

alter table "public"."popup_gallery_photos" validate constraint "popup_gallery_photos_vendor_id_fkey";

alter table "public"."popup_location_requests" add constraint "popup_requests_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public.customers(user_id) ON DELETE CASCADE not valid;

alter table "public"."popup_location_requests" validate constraint "popup_requests_customer_id_fkey";

alter table "public"."popup_location_requests" add constraint "popup_requests_vendor_id_fkey" FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE not valid;

alter table "public"."popup_location_requests" validate constraint "popup_requests_vendor_id_fkey";

alter table "public"."popup_locations" add constraint "popup_locations_vendor_id_fkey" FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE not valid;

alter table "public"."popup_locations" validate constraint "popup_locations_vendor_id_fkey";

alter table "public"."product_categories" add constraint "product_categories_category_id_fkey" FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE not valid;

alter table "public"."product_categories" validate constraint "product_categories_category_id_fkey";

alter table "public"."product_categories" add constraint "product_categories_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE not valid;

alter table "public"."product_categories" validate constraint "product_categories_product_id_fkey";

alter table "public"."product_images" add constraint "product_images_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE not valid;

alter table "public"."product_images" validate constraint "product_images_product_id_fkey";

alter table "public"."products" add constraint "products_category_id_fkey" FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL not valid;

alter table "public"."products" validate constraint "products_category_id_fkey";

alter table "public"."products" add constraint "products_vendor_id_fkey" FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE not valid;

alter table "public"."products" validate constraint "products_vendor_id_fkey";

alter table "public"."reviews" add constraint "reviews_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public.customers(user_id) ON DELETE CASCADE not valid;

alter table "public"."reviews" validate constraint "reviews_customer_id_fkey";

alter table "public"."reviews" add constraint "reviews_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL not valid;

alter table "public"."reviews" validate constraint "reviews_order_id_fkey";

alter table "public"."reviews" add constraint "reviews_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL not valid;

alter table "public"."reviews" validate constraint "reviews_product_id_fkey";

alter table "public"."reviews" add constraint "reviews_vendor_id_fkey" FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE not valid;

alter table "public"."reviews" validate constraint "reviews_vendor_id_fkey";

alter table "public"."vendor_applications" add constraint "vendor_applications_approved_vendor_user_id_fkey" FOREIGN KEY (approved_vendor_user_id) REFERENCES public.users(id) not valid;

alter table "public"."vendor_applications" validate constraint "vendor_applications_approved_vendor_user_id_fkey";

alter table "public"."vendor_applications" add constraint "vendor_applications_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."vendor_applications" validate constraint "vendor_applications_owner_id_fkey";

alter table "public"."vendors" add constraint "vendors_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."vendors" validate constraint "vendors_owner_id_fkey";

alter table "public"."vendors" add constraint "vendors_suspended_by_admin_id_fkey" FOREIGN KEY (suspended_by_admin_id) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."vendors" validate constraint "vendors_suspended_by_admin_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.current_user_role()
 RETURNS public.user_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role
  FROM public.users
  WHERE id = auth.uid();
$function$
;


  create policy "Admins can insert activity logs"
  on "public"."activity_logs"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::public.user_role)))));



  create policy "activity_logs_select_admins"
  on "public"."activity_logs"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::public.user_role)))));



  create policy "Customers can insert own profile"
  on "public"."customers"
  as permissive
  for insert
  to authenticated
with check (((auth.uid() = user_id) OR (EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'admin'::public.user_role))))));



  create policy "Customers can read own profile"
  on "public"."customers"
  as permissive
  for select
  to authenticated
using (((auth.uid() = user_id) OR (EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'admin'::public.user_role))))));



  create policy "Customers can update own profile"
  on "public"."customers"
  as permissive
  for update
  to authenticated
using (((auth.uid() = user_id) OR (EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'admin'::public.user_role))))))
with check (((auth.uid() = user_id) OR (EXISTS ( SELECT 1
   FROM public.users u
  WHERE ((u.id = auth.uid()) AND (u.role = 'admin'::public.user_role))))));



  create policy "Customers can manage own order items"
  on "public"."order_items"
  as permissive
  for all
  to public
using ((order_id IN ( SELECT orders.id
   FROM public.orders
  WHERE (orders.customer_id = auth.uid()))));



  create policy "Popup vendors can delete their own gallery photos"
  on "public"."popup_gallery_photos"
  as permissive
  for delete
  to public
using ((vendor_id IN ( SELECT vendors.id
   FROM public.vendors
  WHERE (vendors.owner_id = auth.uid()))));



  create policy "Popup vendors can insert their own gallery photos"
  on "public"."popup_gallery_photos"
  as permissive
  for insert
  to public
with check ((vendor_id IN ( SELECT vendors.id
   FROM public.vendors
  WHERE (vendors.owner_id = auth.uid()))));



  create policy "Popup vendors can update their own gallery photos"
  on "public"."popup_gallery_photos"
  as permissive
  for update
  to public
using ((vendor_id IN ( SELECT vendors.id
   FROM public.vendors
  WHERE (vendors.owner_id = auth.uid()))))
with check ((vendor_id IN ( SELECT vendors.id
   FROM public.vendors
  WHERE (vendors.owner_id = auth.uid()))));



  create policy "Vendors can delete product categories for own products"
  on "public"."product_categories"
  as permissive
  for delete
  to public
using ((product_id IN ( SELECT products.id
   FROM (public.products
     JOIN public.vendors ON ((products.vendor_id = vendors.id)))
  WHERE (vendors.owner_id = auth.uid()))));



  create policy "Vendors can insert product categories for own products"
  on "public"."product_categories"
  as permissive
  for insert
  to public
with check ((product_id IN ( SELECT products.id
   FROM (public.products
     JOIN public.vendors ON ((products.vendor_id = vendors.id)))
  WHERE (vendors.owner_id = auth.uid()))));



  create policy "Vendors can update product categories for own products"
  on "public"."product_categories"
  as permissive
  for update
  to public
using ((product_id IN ( SELECT products.id
   FROM (public.products
     JOIN public.vendors ON ((products.vendor_id = vendors.id)))
  WHERE (vendors.owner_id = auth.uid()))))
with check ((product_id IN ( SELECT products.id
   FROM (public.products
     JOIN public.vendors ON ((products.vendor_id = vendors.id)))
  WHERE (vendors.owner_id = auth.uid()))));



  create policy "Vendors can delete their product images"
  on "public"."product_images"
  as permissive
  for delete
  to public
using ((product_id IN ( SELECT products.id
   FROM (public.products
     JOIN public.vendors ON ((products.vendor_id = vendors.id)))
  WHERE (vendors.owner_id = auth.uid()))));



  create policy "Vendors can insert product images for their products"
  on "public"."product_images"
  as permissive
  for insert
  to public
with check ((product_id IN ( SELECT products.id
   FROM (public.products
     JOIN public.vendors ON ((products.vendor_id = vendors.id)))
  WHERE (vendors.owner_id = auth.uid()))));



  create policy "Vendors can update their product images"
  on "public"."product_images"
  as permissive
  for update
  to public
using ((product_id IN ( SELECT products.id
   FROM (public.products
     JOIN public.vendors ON ((products.vendor_id = vendors.id)))
  WHERE (vendors.owner_id = auth.uid()))));


CREATE TRIGGER set_customer_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.set_customer_updated_at();

CREATE TRIGGER set_order_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_order_updated_at();

CREATE TRIGGER trigger_enforce_product_category_limit BEFORE INSERT OR UPDATE ON public.product_categories FOR EACH ROW EXECUTE FUNCTION public.enforce_product_category_limit();

CREATE TRIGGER vendor_applications_updated_at BEFORE UPDATE ON public.vendor_applications FOR EACH ROW EXECUTE FUNCTION public.set_vendor_applications_updated_at();

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


  create policy "Allow authenticated upload"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'profile-photos'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Allow public read"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'profile-photos'::text));



  create policy "Anyone can view popup gallery images"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'popup-gallery-images'::text));



  create policy "Anyone can view profile photos"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'profile-photos'::text));



  create policy "Authenticated delete product images"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'product-images'::text));



  create policy "Authenticated update product images"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using ((bucket_id = 'product-images'::text))
with check ((bucket_id = 'product-images'::text));



  create policy "Authenticated upload product images"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'product-images'::text));



  create policy "Authenticated users can upload popup gallery images"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'popup-gallery-images'::text) AND (auth.uid() IS NOT NULL)));



  create policy "Order proofs: customer and vendor read related orders"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using (((bucket_id = 'order-payment-proofs'::text) AND ((EXISTS ( SELECT 1
   FROM public.orders o
  WHERE (((o.id)::text = (storage.foldername(objects.name))[1]) AND (o.customer_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM (public.orders o
     JOIN public.vendors v ON ((v.id = o.vendor_id)))
  WHERE (((o.id)::text = (storage.foldername(objects.name))[1]) AND (v.owner_id = auth.uid())))))));



  create policy "Order proofs: customer delete own order"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'order-payment-proofs'::text) AND (EXISTS ( SELECT 1
   FROM public.orders o
  WHERE (((o.id)::text = (storage.foldername(objects.name))[1]) AND (o.customer_id = auth.uid()))))));



  create policy "Order proofs: customer update own order"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'order-payment-proofs'::text) AND (EXISTS ( SELECT 1
   FROM public.orders o
  WHERE (((o.id)::text = (storage.foldername(objects.name))[1]) AND (o.customer_id = auth.uid()))))))
with check (((bucket_id = 'order-payment-proofs'::text) AND (EXISTS ( SELECT 1
   FROM public.orders o
  WHERE (((o.id)::text = (storage.foldername(objects.name))[1]) AND (o.customer_id = auth.uid()))))));



  create policy "Order proofs: customer upload own order"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'order-payment-proofs'::text) AND (EXISTS ( SELECT 1
   FROM public.orders o
  WHERE (((o.id)::text = (storage.foldername(objects.name))[1]) AND (o.customer_id = auth.uid()) AND (o.status = 'to_pay'::public.order_status) AND (o.payment_method = 'online'::text))))));



  create policy "Public read product images"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'product-images'::text));



  create policy "Users can delete own profile photos"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'profile-photos'::text) AND (auth.uid() IS NOT NULL) AND (owner = auth.uid())));



  create policy "Users can update own profile photos"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'profile-photos'::text) AND (auth.uid() IS NOT NULL) AND (owner = auth.uid())))
with check (((bucket_id = 'profile-photos'::text) AND (auth.uid() IS NOT NULL) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Users can upload own profile photos"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'profile-photos'::text) AND (auth.uid() IS NOT NULL) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "vendor_docs_delete_own"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'vendor-documents'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "vendor_docs_insert_own"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'vendor-documents'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "vendor_docs_select_own"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using (((bucket_id = 'vendor-documents'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "vendor_docs_update_own"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'vendor-documents'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)))
with check (((bucket_id = 'vendor-documents'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));


