// Lu par drizzle-kit pour générer les migrations : ce fichier n'importe que drizzle-orm.
import { pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';
import { slots } from './slots.schema';

export const REGISTRATIONS_SLOT_EMAIL_UNIQUE = 'registrations_slot_email_key';

export const registrations = pgTable(
  'registrations',
  {
    id: uuid('id').primaryKey(),
    slotId: uuid('slot_id')
      .notNull()
      .references(() => slots.id),
    name: varchar('name', { length: 100 }).notNull(),
    // Enregistré en minuscules : la normalisation est faite par le domaine (Registration.create).
    email: varchar('email', { length: 254 }).notNull(),
    // Précision milliseconde = celle de Date en JavaScript.
    createdAt: timestamp('created_at', { withTimezone: true, precision: 3 }).notNull(),
  },
  (table) => [uniqueIndex(REGISTRATIONS_SLOT_EMAIL_UNIQUE).on(table.slotId, table.email)],
);

export type RegistrationRow = typeof registrations.$inferSelect;
