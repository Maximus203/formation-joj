import { Injectable } from '@nestjs/common';
import type { Discipline } from '../../domain/discipline';
import { disciplineNotFound } from '../../domain/disciplines.errors';
import { DisciplineRepository } from '../discipline.repository';

@Injectable()
export class ListSimilarDisciplines {
  constructor(private readonly disciplines: DisciplineRepository) {}

  async execute(id: string): Promise<Discipline[]> {
    const discipline = await this.disciplines.findById(id);
    if (!discipline) throw disciplineNotFound(id);

    // Le repository trie déjà par nom.
    return (await this.disciplines.list()).filter(
      (other) => other.id !== discipline.id && other.category === discipline.category,
    );
  }
}
