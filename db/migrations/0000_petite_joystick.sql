CREATE TYPE "public"."category" AS ENUM('Engie', 'ESGI', 'BBX', 'Basket', 'Base Camp');--> statement-breakpoint
CREATE TABLE "routines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"interval_days" integer NOT NULL,
	"last_completed_at" timestamp with time zone,
	"category" "category" DEFAULT 'Base Camp' NOT NULL,
	CONSTRAINT "routines_title_not_blank" CHECK (char_length(btrim("routines"."title")) > 0),
	CONSTRAINT "routines_interval_positive" CHECK ("routines"."interval_days" > 0)
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"category" "category" NOT NULL,
	"is_micro" boolean DEFAULT false NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tasks_title_not_blank" CHECK (char_length(btrim("tasks"."title")) > 0)
);
--> statement-breakpoint
CREATE INDEX "routines_last_completed_idx" ON "routines" USING btree ("last_completed_at");--> statement-breakpoint
CREATE INDEX "tasks_active_created_idx" ON "tasks" USING btree ("created_at") WHERE "tasks"."is_completed" = false;--> statement-breakpoint
CREATE INDEX "tasks_micro_created_idx" ON "tasks" USING btree ("created_at") WHERE "tasks"."is_micro" = true and "tasks"."is_completed" = false;