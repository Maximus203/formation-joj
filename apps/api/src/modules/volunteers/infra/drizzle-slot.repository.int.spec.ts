import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { type DatabaseConnection, openDatabase } from '../../../core/database/database';
import { Registration } from '../domain/registration';
import { DrizzleSlotRepository } from './drizzle-slot.repository';
import { slots } from './slots.schema';

const registration = (slotId: string, email: string) =>
  Registration.create({
    id: randomUUID(),
    slotId,
    name: 'Volunteer',
    email,
    now: new Date('2026-11-01T10:00:00.123Z'),
  });

async function seedSlot(connection: DatabaseConnection, capacity: number): Promise<string> {
  const id = randomUUID();
  await connection.db.insert(slots).values({ id, capacity });
  return id;
}

/** Le même contrat, sur PGlite (toujours) puis sur un vrai Postgres (si DATABASE_URL existe). */
function contractTests(open: () => DatabaseConnection) {
  let connection: DatabaseConnection;
  let repository: DrizzleSlotRepository;

  beforeAll(async () => {
    connection = open();
    await connection.migrate();
    repository = new DrizzleSlotRepository(connection.db);
  });

  afterAll(() => connection?.close());

  it('001-AS5: the database refuses the same email twice on a slot', async () => {
    const slotId = await seedSlot(connection, 2);
    await repository.addRegistration(registration(slotId, 'awa@joj.sn'));

    await expect(
      repository.addRegistration(registration(slotId, 'awa@joj.sn')),
    ).rejects.toMatchObject({ code: 'VOLUNTEER_ALREADY_REGISTERED' });
    expect((await repository.findById(slotId))?.registrations).toHaveLength(1);
  });

  it('001-AS2: two simultaneous registrations on the last place, only one succeeds', async () => {
    const slotId = await seedSlot(connection, 1);

    const results = await Promise.allSettled([
      repository.addRegistration(registration(slotId, 'awa@joj.sn')),
      repository.addRegistration(registration(slotId, 'moussa@joj.sn')),
    ]);

    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    const refused = results.find((r) => r.status === 'rejected');
    expect(refused).toMatchObject({ reason: { code: 'SLOT_FULL' } });
    expect((await repository.findById(slotId))?.registrations).toHaveLength(1);
  });

  it('001-AS1: reads back the slot with its registrations', async () => {
    const slotId = await seedSlot(connection, 3);
    const awa = registration(slotId, 'awa@joj.sn');
    await repository.addRegistration(awa);

    const slot = await repository.findById(slotId);

    expect(slot?.capacity).toBe(3);
    expect(slot?.registrations).toEqual([awa]);
    expect(await repository.findById(randomUUID())).toBeNull();
  });
}

describe('DrizzleSlotRepository (in-memory PGlite, migrations applied)', () => {
  contractTests(() => openDatabase({ pgliteDataDir: 'memory://' }));
});

// PGlite n'a qu'une connexion et sérialise les requêtes : seul un vrai Postgres (pool de
// connexions) prouve que le verrou de ligne empêche deux inscriptions sur la dernière place.
describe.skipIf(!process.env.DATABASE_URL)('DrizzleSlotRepository (real Postgres)', () => {
  contractTests(() =>
    openDatabase({ databaseUrl: process.env.DATABASE_URL, pgliteDataDir: 'memory://' }),
  );
});
