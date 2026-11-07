# CLAUDE.md

Application d'organisation des JOJ Dakar 2026 : une API NestJS (`apps/api`), un front React (`apps/web`) et des schémas partagés (`packages/shared`), dans un monorepo pnpm. Commandes et structure détaillée : `README.md`.

## Méthodologie

- Toute fonctionnalité suit le cycle `/prd` → `/spec` → `/spec-plan` → `/tdd-task` → `/converge` (méthode dans `specs/constitution.md`).
- Un test d'abord, vu en échec, puis le code minimal qui le fait passer.
- `pnpm check` doit être vert avant de dire « fait ». Le pre-commit lance `pnpm verify --staged`.
- Une tâche = un commit Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`).

## Architecture

- Un module par domaine dans `apps/api/src/modules/<domaine>/`, découpé en `domain/`, `application/`, `infra/`, `http/`, sur le modèle de `disciplines`.
- `domain/` n'importe ni NestJS, ni Drizzle, ni `pg` (règle vérifiée par `.oxlintrc.json`).
- `application/` définit les ports (classes abstraites comme `DisciplineRepository`) et les cas d'usage ; `infra/` les implémente.
- Les schémas d'entrée et de sortie vivent dans `packages/shared`, utilisés par l'API comme par le front.
- Erreurs et filtre HTTP transverses dans `apps/api/src/core/`.

## Concepts appréciés

- TypeScript strict, pas de `any`.
- Une classe par cas d'usage, avec une seule méthode publique `execute()`.
- Les objets du domaine sont créés par `create()` (qui applique les règles) et relus par `restore()` (sans règle).
- Controller fin : valider, appeler un cas d'usage, sérialiser. Aucune règle métier.
- Injection de dépendances NestJS ; le port est relié à son implémentation dans le `*.module.ts`.

## Bonnes pratiques

- Toute erreur métier est une `AppError` (ou une de ses sous-classes, comme `DisciplineError`) avec un code stable en majuscules. Seul `ProblemDetailsFilter` la transforme en réponse HTTP (RFC 9457).
- Une entrée HTTP est validée par un schéma Zod de `packages/shared`, branché via un DTO `createZodDto`, jamais à la main dans le controller.
- Une violation d'unicité en base est traduite en erreur métier dans l'infra, pas dans le controller.
- Tests unitaires du domaine et des cas d'usage avec `InMemoryDisciplineRepository` ; tests e2e dans `apps/api/test/`.
- Aucun secret dans le code : les valeurs sensibles viennent de `.env`.

## Nommage

- Fichiers en kebab-case avec suffixe de rôle : `create-discipline.ts`, `disciplines.controller.ts`, `drizzle-discipline.repository.ts`.
- Classes en PascalCase ; cas d'usage nommés par un verbe : `CreateDiscipline`, `ListDisciplines`.
- Codes d'erreur en majuscules, préfixés par l'entité : `DISCIPLINE_NAME_TAKEN`, `DISCIPLINE_NOT_FOUND`.
- Tests unitaires en `*.spec.ts` à côté du code, e2e en `*.e2e.spec.ts` dans `apps/api/test/`, intégration en `*.int.spec.ts`.
- Titres de tests en anglais, préfixés par l'identifiant du scénario : `it('000-AS2: rejects a name that is too long')`.
- Format géré par `oxfmt` (`pnpm format`) : guillemets simples, largeur 100.
