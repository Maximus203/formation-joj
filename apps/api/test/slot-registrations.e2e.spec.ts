import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestApp } from './create-test-app';
import { readRegistrations, seedSlot } from './slot-fixtures';

describe('POST /api/slots/:slotId/registrations (e2e)', () => {
  let app: INestApplication;
  const register = (slotId: string, body: object) =>
    request(app.getHttpServer()).post(`/api/slots/${slotId}/registrations`).send(body);

  // Une base neuve par test : les créneaux d'un test ne se mêlent pas à ceux d'un autre.
  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(() => app?.close());

  it('001-AS1: registers a volunteer (201), email trimmed and lowercased', async () => {
    const slotId = await seedSlot(app, 2);

    const response = await register(slotId, { name: ' Awa ', email: ' Awa@JOJ.sn ' }).expect(201);

    expect(response.body).toMatchObject({
      slotId,
      name: 'Awa',
      email: 'awa@joj.sn',
      placesLeft: 1,
    });
    expect(response.body.id).toEqual(expect.any(String));
    expect(response.body.createdAt).toEqual(expect.any(String));
    const stored = await readRegistrations(app, slotId);
    expect(stored.map((r) => [r.name, r.email])).toEqual([['Awa', 'awa@joj.sn']]);
  });

  it('001-AS4: refuses an unknown slot (404)', async () => {
    const unknownSlot = randomUUID();

    const response = await register(unknownSlot, { name: 'Awa', email: 'awa@joj.sn' }).expect(404);

    expect(response.body).toMatchObject({ code: 'SLOT_NOT_FOUND' });
    expect(await readRegistrations(app, unknownSlot)).toHaveLength(0);
  });

  it('rejects invalid input (400): slot id not a UUID, empty or too long fields', async () => {
    const slotId = await seedSlot(app, 2);

    await register('not-a-uuid', { name: 'Awa', email: 'awa@joj.sn' }).expect(400);
    await register(slotId, { name: '   ', email: 'awa@joj.sn' }).expect(400);
    await register(slotId, { name: 'Awa', email: '' }).expect(400);
    await register(slotId, { name: 'A'.repeat(101), email: 'awa@joj.sn' }).expect(400);
    await register(slotId, { name: 'Awa', email: `${'a'.repeat(250)}@joj.sn` }).expect(400);
    expect(await readRegistrations(app, slotId)).toHaveLength(0);
  });
});
