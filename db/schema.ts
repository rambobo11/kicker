import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const categoryEnum = pgEnum("category", [
  "Engie",
  "ESGI",
  "BBX",
  "Basket",
  "Base Camp",
]);

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    category: categoryEnum("category").notNull(),
    isMicro: boolean("is_micro").notNull().default(false),
    isCompleted: boolean("is_completed").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check("tasks_title_not_blank", sql`char_length(btrim(${table.title})) > 0`),
    index("tasks_active_created_idx")
      .on(table.createdAt)
      .where(sql`${table.isCompleted} = false`),
    index("tasks_micro_created_idx")
      .on(table.createdAt)
      .where(sql`${table.isMicro} = true and ${table.isCompleted} = false`),
  ],
);

export const routines = pgTable(
  "routines",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    intervalDays: integer("interval_days").notNull(),
    lastCompletedAt: timestamp("last_completed_at", {
      withTimezone: true,
      mode: "date",
    }),
    category: categoryEnum("category").notNull().default("Base Camp"),
  },
  (table) => [
    check("routines_title_not_blank", sql`char_length(btrim(${table.title})) > 0`),
    check("routines_interval_positive", sql`${table.intervalDays} > 0`),
    index("routines_last_completed_idx").on(table.lastCompletedAt),
  ],
);

export type Task = typeof tasks.$inferSelect;
export type Routine = typeof routines.$inferSelect;
