// Lu par drizzle-kit pour générer les migrations : ce fichier n'importe que drizzle-orm.
import { check, integer, pgTable, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const slots = pgTable(
  'slots',
  {
    id: uuid('id').primaryKey(),
    capacity: integer('capacity').notNull(),
  },
  (table) => [check('slots_capacity_min', sql`${table.capacity} >= 1`)],
);

export type SlotRow = typeof slots.$inferSelect;
