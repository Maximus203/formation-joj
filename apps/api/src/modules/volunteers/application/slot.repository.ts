import type { Registration } from '../domain/registration';
import type { Slot } from '../domain/slot';

/**
 * Port de persistance : ce dont les cas d'usage ont besoin, rien de plus.
 * Implémenté par DrizzleSlotRepository (infra) et InMemorySlotRepository (tests).
 */
export abstract class SlotRepository {
  /** Le créneau avec ses inscriptions, ou null s'il n'existe pas. */
  abstract findById(id: string): Promise<Slot | null>;
  /** Écrit l'inscription ; lève SLOT_FULL ou VOLUNTEER_ALREADY_REGISTERED si la base la refuse. */
  abstract addRegistration(registration: Registration): Promise<void>;
}
