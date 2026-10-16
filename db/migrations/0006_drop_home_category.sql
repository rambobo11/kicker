ALTER TABLE "routines" ALTER COLUMN "category" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "routines" ALTER COLUMN "category" SET DEFAULT 'Base Camp'::text;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "category" SET DATA TYPE text;--> statement-breakpoint
UPDATE "tasks" SET "category" = 'Base Camp' WHERE "category" = 'Home';--> statement-breakpoint
UPDATE "routines" SET "category" = 'Base Camp' WHERE "category" = 'Home';--> statement-breakpoint
DROP TYPE "public"."category";--> statement-breakpoint
CREATE TYPE "public"."category" AS ENUM('Engie', 'ESGI', 'BBX', 'Basket', 'Base Camp', 'Other');--> statement-breakpoint
ALTER TABLE "routines" ALTER COLUMN "category" SET DEFAULT 'Base Camp'::"public"."category";--> statement-breakpoint
ALTER TABLE "routines" ALTER COLUMN "category" SET DATA TYPE "public"."category" USING "category"::"public"."category";--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "category" SET DATA TYPE "public"."category" USING "category"::"public"."category";