import { z } from 'zod';

export const VOLUNTEER_NAME_MAX_LENGTH = 100;
export const VOLUNTEER_EMAIL_MAX_LENGTH = 254;

/** Corps de `POST /api/slots/:slotId/registrations`. Le domaine normalise le nom et l'email. */
export const registerVolunteerSchema = z.object({
  name: z.string().trim().min(1).max(VOLUNTEER_NAME_MAX_LENGTH),
  email: z.string().trim().min(1).max(VOLUNTEER_EMAIL_MAX_LENGTH),
});
export type RegisterVolunteerInput = z.infer<typeof registerVolunteerSchema>;

/** Paramètre `:slotId` des routes d'un créneau. */
export const slotIdParamsSchema = z.object({ slotId: z.uuid() });

/** Une inscription telle que l'API la renvoie, avec les places restantes du créneau. */
export const registrationSchema = z.object({
  id: z.uuid(),
  slotId: z.uuid(),
  name: z.string(),
  email: z.string(),
  createdAt: z.iso.datetime(),
  placesLeft: z.number().int().min(0),
});
export type RegistrationResponse = z.infer<typeof registrationSchema>;
