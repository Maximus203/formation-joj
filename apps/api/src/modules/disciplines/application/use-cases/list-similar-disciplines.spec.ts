import { describe, expect, it } from 'vitest';
import { InMemoryDisciplineRepository } from '../testing/in-memory-discipline.repository';
import { CreateDiscipline } from './create-discipline';
import { ListSimilarDisciplines } from './list-similar-disciplines';

async function setup() {
  const disciplines = new InMemoryDisciplineRepository();
  const createDiscipline = new CreateDiscipline(disciplines);
  return { createDiscipline, listSimilar: new ListSimilarDisciplines(disciplines) };
}

describe('ListSimilarDisciplines (application layer)', () => {
  it('returns the other disciplines of the same category, sorted by name', async () => {
    const { createDiscipline, listSimilar } = await setup();
    const judo = await createDiscipline.execute({ name: 'Judo', category: 'sports-de-combat' });
    const boxe = await createDiscipline.execute({ name: 'Boxe', category: 'sports-de-combat' });
    await createDiscipline.execute({ name: 'Natation', category: 'sports-nautiques' });

    const similar = await listSimilar.execute(judo.id);

    expect(similar.map((d) => d.id)).toEqual([boxe.id]);
  });

  it('throws DISCIPLINE_NOT_FOUND for an unknown id', async () => {
    const { listSimilar } = await setup();
    await expect(listSimilar.execute('0199f5c2-0000-7000-8000-00000000ffff')).rejects.toMatchObject(
      { code: 'DISCIPLINE_NOT_FOUND' },
    );
  });
});
