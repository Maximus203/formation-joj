import { Registration } from '../domain/registration';
import { Slot } from '../domain/slot';
import type { RegistrationRow } from './registrations.schema';
import type { SlotRow } from './slots.schema';

/** Lignes des tables → entité. */
export function toSlot(row: SlotRow, registrationRows: RegistrationRow[]): Slot {
  return Slot.restore({
    id: row.id,
    capacity: row.capacity,
    registrations: registrationRows.map(toRegistration),
  });
}

export function toRegistration(row: RegistrationRow): Registration {
  return Registration.restore({
    id: row.id,
    slotId: row.slotId,
    name: row.name,
    email: row.email,
    createdAt: row.createdAt,
  });
}

/** Entité → ligne de la table. */
export function toRegistrationRow(registration: Registration): RegistrationRow {
  return {
    id: registration.id,
    slotId: registration.slotId,
    name: registration.name,
    email: registration.email,
    createdAt: registration.createdAt,
  };
}
