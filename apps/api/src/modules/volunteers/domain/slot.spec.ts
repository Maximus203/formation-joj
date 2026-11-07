import { describe, expect, it } from 'vitest';
import { Registration } from './registration';
import { Slot } from './slot';

const NOW = new Date('2026-11-07T09:00:00.000Z');
const SLOT_ID = '0199f5c2-0000-7000-8000-0000000000a1';

const registration = (n: number, email: string) =>
  Registration.create({
    id: `0199f5c2-0000-7000-8000-00000000010${n}`,
    slotId: SLOT_ID,
    name: `Bénévole ${n}`,
    email,
    now: NOW,
  });

const slotWith = (capacity: number, emails: string[]) =>
  Slot.restore({
    id: SLOT_ID,
    capacity,
    registrations: emails.map((email, i) => registration(i + 1, email)),
  });

const newcomer = (email: string) => ({
  id: '0199f5c2-0000-7000-8000-000000000199',
  name: 'Fatou',
  email,
  now: NOW,
});

describe('Registration', () => {
  it('001-AS1: trims the name and lowercases the trimmed email', () => {
    const r = Registration.create({
      id: 'r1',
      slotId: SLOT_ID,
      name: '  Awa Ndiaye ',
      email: '  Awa@Example.COM ',
      now: NOW,
    });
    expect(r).toMatchObject({
      id: 'r1',
      slotId: SLOT_ID,
      name: 'Awa Ndiaye',
      email: 'awa@example.com',
      createdAt: NOW,
    });
  });
});

describe('Slot', () => {
  it('001-AS2: refuses a registration when the slot is full', () => {
    const slot = slotWith(2, ['a@x.sn', 'b@x.sn']);
    expect(() => slot.register(newcomer('c@x.sn'))).toThrow(
      expect.objectContaining({
        code: 'SLOT_FULL',
        kind: 'CONFLICT',
        message: expect.stringMatching(/complet/),
      }),
    );
    expect(slot.placesLeft).toBe(0);
  });

  it('001-AS3: accepts the last place', () => {
    const slot = slotWith(2, ['a@x.sn']);
    const r = slot.register(newcomer('b@x.sn'));
    expect(r.email).toBe('b@x.sn');
    expect(slot.placesLeft).toBe(0);
    expect(() => slot.register(newcomer('c@x.sn'))).toThrow(
      expect.objectContaining({ code: 'SLOT_FULL' }),
    );
  });

  it('001-AS5: refuses the same email twice, ignoring case', () => {
    const slot = slotWith(2, ['awa@x.sn']);
    expect(() => slot.register(newcomer(' AWA@x.sn '))).toThrow(
      expect.objectContaining({ code: 'VOLUNTEER_ALREADY_REGISTERED', kind: 'CONFLICT' }),
    );
    expect(slot.placesLeft).toBe(1);
  });
});
