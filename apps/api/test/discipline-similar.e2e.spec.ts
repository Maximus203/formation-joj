import type { INestApplication } from '@nestjs/common';
import { disciplineSchema, type DisciplineResponse } from '@joj/shared';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createTestApp } from './create-test-app';

const UNKNOWN_ID = '0199f5c2-0000-7000-8000-00000000ffff';

describe('/api/disciplines/:id/similaires (e2e)', () => {
  let app: INestApplication;
  const api = () => request(app.getHttpServer());

  // Une base neuve par test : les disciplines d'un test ne se mêlent pas à celles d'un autre.
  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(() => app?.close());

  async function create(name: string, category: string): Promise<DisciplineResponse> {
    const response = await api().post('/api/disciplines').send({ name, category }).expect(201);
    return disciplineSchema.parse(response.body);
  }

  it('lists the other disciplines of the same category, sorted by name (200)', async () => {
    const judo = await create('Judo', 'sports-de-combat');
    const lutte = await create('Lutte', 'sports-de-combat');
    const boxe = await create('Boxe', 'sports-de-combat');
    await create('Natation', 'sports-nautiques');

    const response = await api().get(`/api/disciplines/${judo.id}/similaires`).expect(200);

    expect(response.body).toEqual([boxe, lutte]);
  });

  it('does not include the discipline itself', async () => {
    const judo = await create('Judo', 'sports-de-combat');

    const response = await api().get(`/api/disciplines/${judo.id}/similaires`).expect(200);

    expect(response.body).toEqual([]);
  });

  it('answers an empty list when no other discipline shares the category (200)', async () => {
    const natation = await create('Natation', 'sports-nautiques');
    await create('Judo', 'sports-de-combat');

    const response = await api().get(`/api/disciplines/${natation.id}/similaires`).expect(200);

    expect(response.body).toEqual([]);
  });

  it('answers 404 for an unknown discipline', async () => {
    const response = await api().get(`/api/disciplines/${UNKNOWN_ID}/similaires`).expect(404);

    expect(response.headers['content-type']).toMatch(/application\/problem\+json/);
    expect(response.body).toMatchObject({ status: 404, code: 'DISCIPLINE_NOT_FOUND' });
  });

  it('answers 400 when the id is not a UUID', async () => {
    const response = await api().get('/api/disciplines/pas-un-uuid/similaires').expect(400);

    expect(response.body).toMatchObject({ code: 'VALIDATION_FAILED' });
  });
});
