import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import type { Database } from '../src/core/database/database';
import { DATABASE } from '../src/core/database/database.module';
import { registrations } from '../src/modules/volunteers/infra/registrations.schema';
import { slots } from '../src/modules/volunteers/infra/slots.schema';

/**
 * Pose un créneau directement en base : son ouverture n'est pas dans cette tranche, le créneau
 * est fourni par le contexte du test. `takenBy` liste les emails déjà inscrits.
 */
export async function seedSlot(
  app: INestApplication,
  capacity: number,
  takenBy: string[] = [],
): Promise<string> {
  const db = app.get<Database>(DATABASE);
  const id = randomUUID();
  await db.insert(slots).values({ id, capacity });
  for (const email of takenBy) {
    await db.insert(registrations).values({
      id: randomUUID(),
      slotId: id,
      name: email.split('@')[0] ?? email,
      email,
      createdAt: new Date(),
    });
  }
  return id;
}

/** Les inscriptions d'un créneau, relues en base. */
export async function readRegistrations(app: INestApplication, slotId: string) {
  return app
    .get<Database>(DATABASE)
    .select()
    .from(registrations)
    .where(eq(registrations.slotId, slotId))
    .orderBy(asc(registrations.createdAt));
}
