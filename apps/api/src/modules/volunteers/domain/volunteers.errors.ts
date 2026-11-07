import { AppError, type ErrorKind } from '../../../core/errors/app-error';

/** Codes stables exposés aux clients ; la catégorie décide du statut HTTP. */
const VOLUNTEER_ERROR_KINDS = {
  /** Le créneau a déjà autant d'inscrits que sa capacité. */
  SLOT_FULL: 'CONFLICT',
  /** Aucun créneau n'a cet identifiant. */
  SLOT_NOT_FOUND: 'NOT_FOUND',
  /** Cet email est déjà inscrit sur ce créneau. */
  VOLUNTEER_ALREADY_REGISTERED: 'CONFLICT',
} as const satisfies Record<string, ErrorKind>;

export type VolunteerErrorCode = keyof typeof VOLUNTEER_ERROR_KINDS;

export class VolunteerError extends AppError<VolunteerErrorCode> {
  constructor(code: VolunteerErrorCode, message: string, details?: Record<string, unknown>) {
    super(code, VOLUNTEER_ERROR_KINDS[code], message, details);
  }
}

export function slotFull(slotId: string): VolunteerError {
  return new VolunteerError('SLOT_FULL', 'Ce créneau est complet', { slotId });
}

export function slotNotFound(slotId: string): VolunteerError {
  return new VolunteerError('SLOT_NOT_FOUND', `No slot with id ${slotId}`, { slotId });
}

export function volunteerAlreadyRegistered(slotId: string): VolunteerError {
  return new VolunteerError(
    'VOLUNTEER_ALREADY_REGISTERED',
    'Cet email est déjà inscrit sur ce créneau',
    { slotId },
  );
}
