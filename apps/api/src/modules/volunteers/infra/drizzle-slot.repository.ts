import { Inject, Injectable } from '@nestjs/common';
import { asc, count, eq } from 'drizzle-orm';
import type { Database } from '../../../core/database/database';
import { DATABASE } from '../../../core/database/database.module';
import { isUniqueViolation } from '../../../core/database/pg-errors';
import { SlotRepository } from '../application/slot.repository';
import type { Registration } from '../domain/registration';
import type { Slot } from '../domain/slot';
import { slotFull, slotNotFound, volunteerAlreadyRegistered } from '../domain/volunteers.errors';
import { REGISTRATIONS_SLOT_EMAIL_UNIQUE, registrations } from './registrations.schema';
import { toRegistrationRow, toSlot } from './slot.mapper';
import { slots } from './slots.schema';

@Injectable()
export class DrizzleSlotRepository extends SlotRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {
    super();
  }

  async findById(id: string): Promise<Slot | null> {
    const [slot] = await this.db.select().from(slots).where(eq(slots.id, id)).limit(1);
    if (!slot) return null;
    const rows = await this.db
      .select()
      .from(registrations)
      .where(eq(registrations.slotId, id))
      .orderBy(asc(registrations.createdAt), asc(registrations.id));
    return toSlot(slot, rows);
  }

  async addRegistration(registration: Registration): Promise<void> {
    try {
      await this.db.transaction(async (tx) => {
        // Le verrou de ligne fait attendre une seconde demande sur le même créneau : sans lui,
        // deux demandes pourraient compter une place libre et la prendre toutes les deux.
        const [slot] = await tx
          .select()
          .from(slots)
          .where(eq(slots.id, registration.slotId))
          .for('update');
        if (!slot) throw slotNotFound(registration.slotId);
        const [taken] = await tx
          .select({ total: count() })
          .from(registrations)
          .where(eq(registrations.slotId, slot.id));
        if ((taken?.total ?? 0) >= slot.capacity) throw slotFull(slot.id);
        await tx.insert(registrations).values(toRegistrationRow(registration));
      });
    } catch (error) {
      if (isUniqueViolation(error, REGISTRATIONS_SLOT_EMAIL_UNIQUE)) {
        throw volunteerAlreadyRegistered(registration.slotId);
      }
      throw error;
    }
  }
}
