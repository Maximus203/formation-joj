import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  registerVolunteerSchema,
  registrationSchema,
  type RegistrationResponse,
  slotIdParamsSchema,
} from '@joj/shared';
import { createZodDto, ZodSerializerDto } from 'nestjs-zod';
import {
  RegisterVolunteer,
  type RegisterVolunteerResult,
} from '../application/use-cases/register-volunteer';

class RegisterVolunteerDto extends createZodDto(registerVolunteerSchema) {}
class SlotIdParamsDto extends createZodDto(slotIdParamsSchema) {}
class RegistrationDto extends createZodDto(registrationSchema) {}

/** Couche fine : valider (DTO zod), appeler un cas d'usage, sérialiser. Aucune règle métier ici. */
@ApiTags('slots')
@Controller('slots/:slotId/registrations')
export class SlotRegistrationsController {
  constructor(private readonly registerVolunteer: RegisterVolunteer) {}

  @Post()
  @ZodSerializerDto(RegistrationDto)
  async register(
    @Param() { slotId }: SlotIdParamsDto,
    @Body() body: RegisterVolunteerDto,
  ): Promise<RegistrationResponse> {
    return toResponse(await this.registerVolunteer.execute(slotId, body));
  }
}

function toResponse({ registration, placesLeft }: RegisterVolunteerResult): RegistrationResponse {
  return {
    id: registration.id,
    slotId: registration.slotId,
    name: registration.name,
    email: registration.email,
    createdAt: registration.createdAt.toISOString(),
    placesLeft,
  };
}
