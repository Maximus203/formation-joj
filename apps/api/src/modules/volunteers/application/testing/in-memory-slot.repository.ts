import { Registration } from '../../domain/registration';
import { Slot } from '../../domain/slot';
import { slotFull, volunteerAlreadyRegistered } from '../../domain/volunteers.errors';
import { SlotRepository } from '../slot.repository';

/** Fake fidèle au contrat du port (capacité, unicité de l'email), pour tester sans base. */
export class InMemorySlotRepository extends SlotRepository {
  private readonly rows = new Map<string, Slot>();

  /** Pose un créneau avant un test : son ouverture n'est pas dans cette tranche. */
  seed(slot: Slot): void {
    this.rows.set(slot.id, clone(slot));
  }

  async findById(id: string): Promise<Slot | null> {
    const found = this.rows.get(id);
    return found ? clone(found) : null;
  }

  async addRegistration(registration: Registration): Promise<void> {
    const slot = this.rows.get(registration.slotId);
    if (!slot) return;
    if (slot.registrations.some((r) => r.email === registration.email)) {
      throw volunteerAlreadyRegistered(slot.id);
    }
    if (slot.placesLeft <= 0) throw slotFull(slot.id);
    this.rows.set(
      slot.id,
      Slot.restore({
        id: slot.id,
        capacity: slot.capacity,
        registrations: [...slot.registrations, registration],
      }),
    );
  }
}

/** Copie : un test ne voit pas une modification qui n'a pas été persistée. */
function clone(slot: Slot): Slot {
  return Slot.restore({
    id: slot.id,
    capacity: slot.capacity,
    registrations: slot.registrations.map((r) =>
      Registration.restore({
        id: r.id,
        slotId: r.slotId,
        name: r.name,
        email: r.email,
        createdAt: r.createdAt,
      }),
    ),
  });
}
