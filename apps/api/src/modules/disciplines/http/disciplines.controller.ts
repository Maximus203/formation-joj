import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  createDisciplineSchema,
  disciplineIdParamsSchema,
  type DisciplineResponse,
  disciplineSchema,
  updateDisciplineSchema,
} from '@joj/shared';
import { createZodDto, ZodSerializerDto } from 'nestjs-zod';
import { CreateDiscipline } from '../application/use-cases/create-discipline';
import { DeleteDiscipline } from '../application/use-cases/delete-discipline';
import { GetDiscipline } from '../application/use-cases/get-discipline';
import { ListDisciplines } from '../application/use-cases/list-disciplines';
import { ListSimilarDisciplines } from '../application/use-cases/list-similar-disciplines';
import { UpdateDiscipline } from '../application/use-cases/update-discipline';
import type { Discipline } from '../domain/discipline';

class CreateDisciplineDto extends createZodDto(createDisciplineSchema) {}
class UpdateDisciplineDto extends createZodDto(updateDisciplineSchema) {}
class DisciplineIdParamsDto extends createZodDto(disciplineIdParamsSchema) {}
class DisciplineDto extends createZodDto(disciplineSchema) {}

/** Couche fine : valider (DTO zod), appeler un cas d'usage, sérialiser. Aucune règle métier ici. */
@ApiTags('disciplines')
@Controller('disciplines')
export class DisciplinesController {
  constructor(
    private readonly createDiscipline: CreateDiscipline,
    private readonly listDisciplines: ListDisciplines,
    private readonly getDiscipline: GetDiscipline,
    private readonly updateDiscipline: UpdateDiscipline,
    private readonly deleteDiscipline: DeleteDiscipline,
    private readonly listSimilarDisciplines: ListSimilarDisciplines,
  ) {}

  @Get()
  @ZodSerializerDto([DisciplineDto])
  async list(): Promise<DisciplineResponse[]> {
    return (await this.listDisciplines.execute()).map(toResponse);
  }

  @Post()
  @ZodSerializerDto(DisciplineDto)
  async create(@Body() body: CreateDisciplineDto): Promise<DisciplineResponse> {
    return toResponse(await this.createDiscipline.execute(body));
  }

  @Get(':id')
  @ZodSerializerDto(DisciplineDto)
  async get(@Param() { id }: DisciplineIdParamsDto): Promise<DisciplineResponse> {
    return toResponse(await this.getDiscipline.execute(id));
  }

  @Get(':id/similaires')
  @ZodSerializerDto([DisciplineDto])
  async similar(@Param() { id }: DisciplineIdParamsDto): Promise<DisciplineResponse[]> {
    return (await this.listSimilarDisciplines.execute(id)).map(toResponse);
  }

  @Patch(':id')
  @ZodSerializerDto(DisciplineDto)
  async update(
    @Param() { id }: DisciplineIdParamsDto,
    @Body() body: UpdateDisciplineDto,
  ): Promise<DisciplineResponse> {
    return toResponse(await this.updateDiscipline.execute(id, body));
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param() { id }: DisciplineIdParamsDto): Promise<void> {
    await this.deleteDiscipline.execute(id);
  }
}

function toResponse(discipline: Discipline): DisciplineResponse {
  return {
    id: discipline.id,
    name: discipline.name,
    category: discipline.category,
    createdAt: discipline.createdAt.toISOString(),
  };
}
