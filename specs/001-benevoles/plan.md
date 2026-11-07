# 001 — Inscription d'un bénévole sur un créneau : plan

**Statut** : Validé

## 1. Résumé

On construit le module `volunteers` de l'API, organisé comme le module `disciplines`. Une fois les tâches terminées, un bénévole pourra s'inscrire sur un créneau existant avec son nom et son email : l'inscription est refusée si le créneau est complet, si l'email est déjà inscrit sur ce créneau, ou si le créneau n'existe pas. Le travail est découpé en cinq tâches, de l'intérieur vers l'extérieur : le domaine, les cas d'usage, la base de données, puis la route HTTP avec ses tests de bout en bout. On laisse de côté l'ouverture d'un créneau (TR4), la désinscription (TR3), la consultation (TR2) et tout écran.

Les mots de la spec et leur nom dans le code :

| Dans la spec     | Dans le code                   | Ce que c'est                                                                 |
| ---------------- | ------------------------------ | ---------------------------------------------------------------------------- |
| créneau          | `Slot`                         | une plage de bénévolat qui a une capacité et ses inscriptions                |
| capacité         | `capacity`                     | le nombre maximum d'inscriptions d'un créneau, au moins 1                    |
| inscription      | `Registration`                 | un bénévole inscrit sur un créneau : son nom, son email et sa date           |
| places restantes | `placesLeft`                   | la capacité du créneau moins le nombre d'inscriptions                        |
| créneau complet  | `SLOT_FULL`                    | le refus levé quand il ne reste aucune place                                 |
| créneau inconnu  | `SLOT_NOT_FOUND`               | le refus levé quand l'identifiant du créneau n'existe pas                    |
| même email       | `VOLUNTEER_ALREADY_REGISTERED` | le refus levé quand l'email (sans tenir compte des majuscules) est déjà pris |

## 2. Fichiers par couche

On crée le module `volunteers` dans `apps/api/src/modules/volunteers/`, organisé comme le module `disciplines` : un dossier par couche (`domain`, `application`, `infra`, `http`).

- **shared** : `packages/shared/src/volunteers.ts` contient les schémas Zod : le corps de l'inscription (`name` non vide après `trim`, 100 caractères au plus ; `email` non vide après `trim`, 254 caractères au plus ; Zod valide seulement, il ne transforme pas l'email), le paramètre `slotId` (un UUID : un identifiant mal formé est refusé avec `400`, voir §4) et la réponse. `packages/shared/src/index.ts` l'exporte.
- **domain** :
  - `domain/slot.ts` définit l'entité `Slot` (identifiant, capacité, inscriptions). Sa méthode `register()` applique les règles de capacité et d'unicité de l'email, puis renvoie la nouvelle `Registration`. Son accesseur `placesLeft` donne les places restantes.
  - `domain/registration.ts` définit l'entité `Registration` (identifiant, identifiant du créneau, nom, email, date d'inscription). Sa méthode `create()` applique `trim` au nom et `trim().toLowerCase()` à l'email : c'est le seul endroit qui normalise, et `restore()` relit sans règle.
  - `domain/volunteers.errors.ts` définit `VolunteerError`, qui étend `AppError`, avec les codes `SLOT_FULL`, `SLOT_NOT_FOUND` et `VOLUNTEER_ALREADY_REGISTERED`.
- **application** :
  - `application/slot.repository.ts` est le port : une classe abstraite avec `findById(id)` (renvoie le créneau et ses inscriptions) et `addRegistration(registration)`.
  - `application/use-cases/register-volunteer.ts` définit `RegisterVolunteer` avec `execute(slotId, input)` : il lit le créneau (`SLOT_NOT_FOUND` s'il manque), appelle `slot.register()`, enregistre l'inscription et renvoie l'inscription avec les places restantes.
  - `application/testing/in-memory-slot.repository.ts` est la version en mémoire du port, avec une méthode `seed(slot)` pour poser un créneau avant un test.
- **infra** :
  - `infra/slots.schema.ts` et `infra/registrations.schema.ts` décrivent les deux tables Drizzle.
  - `infra/slot.mapper.ts` convertit les lignes en `Slot` et en `Registration`, et inversement.
  - `infra/drizzle-slot.repository.ts` implémente le port avec Drizzle. `addRegistration` s'exécute dans une transaction qui verrouille la ligne du créneau (`SELECT … FOR UPDATE`), recompte les inscriptions et lève `SLOT_FULL` s'il n'y a plus de place : deux demandes simultanées sur la dernière place ne peuvent donc pas passer toutes les deux. Cette vérification répète la règle de capacité de `Slot.register()` : c'est un filet de sécurité voulu, car seule la base peut arbitrer deux demandes simultanées. Une violation de l'unicité (créneau, email) devient `VOLUNTEER_ALREADY_REGISTERED`.
- **http** :
  - `http/slot-registrations.controller.ts` expose `POST /api/slots/:slotId/registrations` : il valide le corps et le paramètre avec les schémas partagés, appelle `RegisterVolunteer` et répond `201` avec l'inscription (`id`, `slotId`, `name`, `email`, `createdAt`) et `placesLeft`.
  - `volunteers.module.ts` assemble le module et relie le port à `DrizzleSlotRepository`. `apps/api/src/app.module.ts` l'ajoute à ses imports.
- **tests de bout en bout** : `apps/api/test/slot-fixtures.ts` pose un créneau directement en base (le créneau est fourni par le contexte du test) et relit ses inscriptions.
- **web** : rien : l'écran est hors périmètre.

## 3. Données

On stocke les créneaux et leurs inscriptions. La migration se génère avec `pnpm db:generate --name=create_slots_and_registrations`.

- Table `slots` : `id` (uuid, clé primaire) et `capacity` (entier, non nul). Une contrainte `CHECK (capacity >= 1)` protège la règle « un créneau a au moins une place ».
- Table `registrations` : `id` (uuid, clé primaire), `slot_id` (uuid, non nul, clé étrangère vers `slots.id`), `name` (varchar 100), `email` (varchar 254, enregistré en minuscules) et `created_at` (timestamp avec fuseau, précision 3).
- Un index unique nommé par une constante exportée de `registrations.schema.ts` (`REGISTRATIONS_SLOT_EMAIL_UNIQUE`, utilisée par `isUniqueViolation`) sur (`slot_id`, `email`) protège la règle « un même email ne s'inscrit pas deux fois sur un créneau », même si deux demandes arrivent en même temps.
- La clé étrangère empêche une inscription sur un créneau qui n'existe pas.
- Le verrou de ligne sur `slots` (dans la transaction d'inscription) protège la règle « un créneau ne déborde jamais » quand deux demandes arrivent en même temps.

## 4. Erreurs

Chaque refus de la spec devient une `VolunteerError`, avec un code stable et un statut HTTP.

| Code AppError                  | Catégorie | HTTP | Quand                                               | Scénario |
| ------------------------------ | --------- | ---- | --------------------------------------------------- | -------- |
| `SLOT_FULL`                    | CONFLICT  | 409  | le créneau a déjà autant d'inscrits que sa capacité | AS2      |
| `SLOT_NOT_FOUND`               | NOT_FOUND | 404  | aucun créneau n'a cet identifiant                   | AS4      |
| `VOLUNTEER_ALREADY_REGISTERED` | CONFLICT  | 409  | cet email est déjà inscrit sur ce créneau           | AS5      |

Le message de `SLOT_FULL` est écrit en français et dit que le créneau est complet, comme l'exige AS2.

Une entrée invalide (nom ou email vide ou trop long, `slotId` qui n'est pas un UUID) est refusée en `400` par la validation Zod du controller. Ce n'est pas un scénario de la spec : une assertion `400` dans le e2e de T04 le vérifie, sans identifiant de scénario.

## 5. Tests par scénario

Chaque scénario est prouvé par au moins un test, au niveau le plus bas qui suffit pour son « Alors ». Le statut HTTP et le corps de la réponse ne se vérifient qu'en e2e.

| Scénario | Fichier de test                                                                                                        | Niveau                  | Ce que le test vérifie                                                                                                                                                                                                    |
| -------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AS1      | `apps/api/test/slot-registrations.e2e.spec.ts`, `…/application/volunteers.application.spec.ts`                         | e2e, unit.              | `201`, l'inscription est en base avec son nom et son email (en minuscules, espaces retirés), 1 place restante                                                                                                             |
| AS2      | `apps/api/test/slot-registrations.e2e.spec.ts`, `…/domain/slot.spec.ts`, `…/infra/drizzle-slot.repository.int.spec.ts` | e2e, unit., intégration | `409` `SLOT_FULL` avec un message qui dit « complet », le créneau reste à deux inscrits ; en intégration, deux demandes sur la dernière place : une seule passe (règle de capacité ; le verrou n'est pas prouvé, voir §6) |
| AS3      | `apps/api/test/slot-registrations.e2e.spec.ts`, `…/domain/slot.spec.ts`                                                | e2e, unit.              | `201` avec 0 place restante, puis une nouvelle tentative est refusée comme en AS2                                                                                                                                         |
| AS4      | `apps/api/test/slot-registrations.e2e.spec.ts`, `…/application/volunteers.application.spec.ts`                         | e2e, unit.              | `404` `SLOT_NOT_FOUND`, aucune inscription enregistrée                                                                                                                                                                    |
| AS5      | `apps/api/test/slot-registrations.e2e.spec.ts`, `…/domain/slot.spec.ts`, `…/infra/drizzle-slot.repository.int.spec.ts` | e2e, unit., intégration | `409` `VOLUNTEER_ALREADY_REGISTERED`, une seule inscription ; majuscules ignorées ; l'index unique refuse le doublon                                                                                                      |

## 6. Tâches

Cinq tâches, dans l'ordre des couches ; chacune tient dans un commit et dépend de la précédente (T01 → T02 → T03 → T04 → T05).

- [x] T01 [001-AS2, AS3, AS5] Écrire d'abord `apps/api/src/modules/volunteers/domain/slot.spec.ts` (« 001-AS2: refuses a registration when the slot is full », « 001-AS3: accepts the last place », « 001-AS5: refuses the same email twice, ignoring case ») et un test de `Registration.create()` qui retire les espaces et met l'email en minuscules, puis `slot.ts`, `registration.ts` et `volunteers.errors.ts`
- [x] T02 [001-AS1, AS4] Écrire d'abord `apps/api/src/modules/volunteers/application/volunteers.application.spec.ts` (« 001-AS1: registers a volunteer and returns the places left », « 001-AS4: refuses an unknown slot »), puis le port, `RegisterVolunteer` et le repository en mémoire
- [x] T03 [001-AS2, AS5] Écrire d'abord `apps/api/src/modules/volunteers/infra/drizzle-slot.repository.int.spec.ts` (« 001-AS5: the database refuses the same email twice on a slot », « 001-AS2: two simultaneous registrations on the last place, only one succeeds »), puis les schémas (avec la contrainte nommée), la migration, le mapper et `DrizzleSlotRepository` (transaction avec verrou). Ce test tourne sur PGlite, qui n'a qu'une connexion et sérialise les requêtes : il prouve la règle de capacité, pas le verrou. On ajoute donc un second test de concurrence, `describe.skipIf(!process.env.DATABASE_URL)`, sur un vrai Postgres avec un pool de deux connexions, qui prouve le verrou quand une base est disponible
- [x] T04 [001-AS1, AS4] Écrire d'abord `apps/api/test/slot-registrations.e2e.spec.ts` (« 001-AS1: registers a volunteer (201), email trimmed and lowercased », « 001-AS4: refuses an unknown slot (404) », plus une assertion `400` pour un `slotId` qui n'est pas un UUID) et `slot-fixtures.ts`, puis `packages/shared/src/volunteers.ts`, le controller, `volunteers.module.ts` et l'import dans `app.module.ts`
- [x] T05 [001-AS2, AS3, AS5] Ajouter à `apps/api/test/slot-registrations.e2e.spec.ts` « 001-AS2: refuses a full slot (409 SLOT_FULL) », « 001-AS3: accepts the last place then refuses the next », « 001-AS5: refuses the same email twice (409) » ; ces tests passent dès leur écriture, car la route existe depuis T04 : on vérifie qu'ils échouent si on casse la règle correspondante
