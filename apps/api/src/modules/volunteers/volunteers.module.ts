import { Module } from '@nestjs/common';
import { SlotRepository } from './application/slot.repository';
import { RegisterVolunteer } from './application/use-cases/register-volunteer';
import { SlotRegistrationsController } from './http/slot-registrations.controller';
import { DrizzleSlotRepository } from './infra/drizzle-slot.repository';

@Module({
  controllers: [SlotRegistrationsController],
  providers: [
    // Le port (classe abstraite) est relié ici à son implémentation Drizzle.
    { provide: SlotRepository, useClass: DrizzleSlotRepository },
    RegisterVolunteer,
  ],
})
export class VolunteersModule {}
