import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { Registration } from '../../domain/registration';
import { slotNotFound } from '../../domain/volunteers.errors';
import { SlotRepository } from '../slot.repository';

export interface RegisterVolunteerInput {
  name: string;
  email: string;
}

export interface RegisterVolunteerResult {
  registration: Registration;
  placesLeft: number;
}

@Injectable()
export class RegisterVolunteer {
  constructor(private readonly slots: SlotRepository) {}

  async execute(slotId: string, input: RegisterVolunteerInput): Promise<RegisterVolunteerResult> {
    const slot = await this.slots.findById(slotId);
    if (!slot) throw slotNotFound(slotId);
    const registration = slot.register({
      id: randomUUID(),
      name: input.name,
      email: input.email,
      now: new Date(),
    });
    await this.slots.addRegistration(registration);
    return { registration, placesLeft: slot.placesLeft };
  }
}
