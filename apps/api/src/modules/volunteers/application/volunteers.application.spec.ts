import { describe, expect, it } from 'vitest';
import { Slot } from '../domain/slot';
import { InMemorySlotRepository } from './testing/in-memory-slot.repository';
import { RegisterVolunteer } from './use-cases/register-volunteer';

function setup(capacity = 2) {
  const slots = new InMemorySlotRepository();
  slots.seed(Slot.restore({ id: 'slot-1', capacity, registrations: [] }));
  return { slots, registerVolunteer: new RegisterVolunteer(slots) };
}

describe('RegisterVolunteer (application layer)', () => {
  it('001-AS1: registers a volunteer and returns the places left', async () => {
    const { slots, registerVolunteer } = setup(2);

    const result = await registerVolunteer.execute('slot-1', {
      name: 'Awa',
      email: 'awa@joj.sn',
    });

    expect(result.registration).toMatchObject({
      slotId: 'slot-1',
      name: 'Awa',
      email: 'awa@joj.sn',
    });
    expect(result.placesLeft).toBe(1);
    const stored = await slots.findById('slot-1');
    expect(stored?.registrations.map((r) => r.email)).toEqual(['awa@joj.sn']);
  });

  it('001-AS4: refuses an unknown slot', async () => {
    const { slots, registerVolunteer } = setup();

    await expect(
      registerVolunteer.execute('unknown-slot', { name: 'Awa', email: 'awa@joj.sn' }),
    ).rejects.toMatchObject({ code: 'SLOT_NOT_FOUND' });
    expect((await slots.findById('slot-1'))?.registrations).toHaveLength(0);
  });
});
