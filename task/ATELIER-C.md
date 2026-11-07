# Atelier C : construire ton application

**Durée** : 3 h 15.

## L'objectif

Partir du problème de ta table, imaginer ta solution, la défendre dans un PRD, puis la construire seul avec la méthode de l'atelier B.

Personne ne te dit quoi construire. Ta table reçoit un problème ; la solution est la tienne. Ce qui est exigé, c'est qu'elle réponde au problème, que tu saches dire pourquoi, et qu'elle soit livrée avec la méthode.

Tu repars du dépôt des ateliers A et B, sur ta branche `journee`, avec ton `CLAUDE.md`. Chacun a son propre dépôt ; les participants d'une même table ont le même problème et peuvent s'entraider (challenger un PRD, relire une spec, débloquer un test), mais chacun construit sa propre application.

**Réussi si**, à la fin de l'atelier :

- ton PRD décrit tout ton produit en tranches, et il est validé ;
- la tranche 1 est livrée : chaque scénario de sa spec a son test (`pnpm spec:check specs/NNN-nom --trace`), et `pnpm check` est vert ;
- `pnpm dev` démarre l'application, et la démo se montre en moins de 5 minutes ;
- trois lignes en tête de `README.md` disent le problème et pour qui, comment lancer l'application, et ce qui manque.

## Les trois thèmes

### Thème 1 : Résultats et médailles

Pendant les Jeux, les épreuves s'enchaînent sur plusieurs sites. Le public veut savoir qui a gagné aujourd'hui et où en est son pays ; les journalistes doivent publier vite, et vérifient les résultats à la main d'une source à l'autre. Une erreur de podium, une fois publiée, se corrige mal.

## Tes outils, et quand les utiliser

| Quand                                   | Outil                                         | Pour quoi                                                                      |
| --------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------ |
| au début, et avant chaque nouvelle spec | `/clear`                                      | repartir d'une conversation vide                                               |
| pour décrire ta solution                | `/prd <ta vision>`                            | écrire le PRD de tout ton produit, challengé par Claude                        |
| si tu n'as pas d'idée                   | les [pistes](PISTES-ATELIER-C.md)             | des points de départ, pas des consignes                                        |
| avant chaque « je valide »              | la [grille de relecture](GRILLE-RELECTURE.md) | relire le PRD, la spec ou le plan : un seul « non » suffit pour ne pas valider |
| pour chaque tranche, dans l'ordre       | `/spec TRn <précisions>`                      | écrire la spec d'une tranche                                                   |
| une fois la spec validée                | `/spec-plan`                                  | écrire le plan technique                                                       |
| une fois le plan validé                 | `/tdd-task`, ou `/tdd-task Tnn`               | construire, test d'abord, un commit par tâche                                  |
| quand toutes les tâches sont cochées    | `/converge`                                   | vérifier que la tranche est finie, avec un relecteur indépendant               |
| quand ta vision change                  | `/prd <la modification>`                      | amender le PRD existant                                                        |
| si ta solution a besoin d'IA            | l'API Claude                                  | résumer, répondre en langage courant, lire un message libre                    |

Le détail de chaque commande est dans l'[atelier B](ATELIER-B.md) et dans la section « Méthode » du [README](../README.md#méthode).

### Ton PRD : `/prd`

Le PRD est ta vision produit, sur une page. C'est toi qui l'écris : Claude le met en forme, te pose des questions et te dit où il est faible, mais il ne choisit pas à ta place. Pour l'écrire, pars du problème, pas de la solution :

- **Qui** souffre du problème, précisément ? Un journaliste qui écrit à 18 h, un supporter qui arrive de Thiès, un conducteur qui part de Pikine.
- **Comment fait-il aujourd'hui**, et qu'est-ce qui ne va pas ?
- **Qu'est-ce que tu proposes**, et pourquoi ça plutôt qu'autre chose ?
- **Comment saura-t-on que ça marche**, pendant ta démo ?
- **Par quoi commences-tu, et où vas-tu ensuite ?** La tranche 1 est la plus petite chose qui ait de la valeur seule, et elle tient en 2 heures de code. Les tranches suivantes disent la suite de ta vision.

**Le PRD décrit tout ton produit**, découpé en tranches `TR1`, `TR2`… Tu les réalises ensuite une à une, une spec par tranche, dans l'ordre. Seule la tranche 1 doit tenir dans l'atelier : les autres montrent où va ton produit, même si tu ne les construis pas aujourd'hui.

Ton texte pour `/prd` dit tout ça avec tes mots, en quelques phrases. Il n'a pas besoin d'être complet : ce qui manque, Claude te le demandera. Pour la forme, regarde le texte de l'atelier B.

### Ta spec : `/spec TRn`

Une fois ton PRD validé, ton texte pour `/spec` cite la tranche, puis précise ses règles avec la réponse attendue de l'API (statut et code d'erreur en majuscules) et ce qui est hors périmètre. Par exemple, pour une tranche de réservation :

```
/spec TR1 Réserver une place sur un trajet existant (nom et téléphone du passager), et voir les places restantes d'un trajet. On ne peut pas réserver sur un trajet complet : refus 409 avec le code TRIP_FULL. Un même téléphone ne réserve pas deux fois le même trajet : refus 409 avec le code PASSENGER_ALREADY_BOOKED. Pas d'écran : seulement l'API.
```

Pour une tranche qui utilise Claude, dis ce que fait l'assistant et les règles qui l'encadrent :

```
/spec TR1 Poser une question en langage courant et recevoir jusqu'à trois animations du jour qui y répondent, avec une phrase d'explication pour chacune. Les explications sont rédigées par un assistant IA. Une question vide est refusée : refus 400 avec le code QUESTION_EMPTY. Seules des animations du jour qui existent sont proposées : une proposition inconnue est écartée. Pas d'écran : seulement l'API.
```

Puis `/spec-plan`, `/tdd-task` et `/converge`, comme à l'atelier B. Quand une tranche répond « Converged », passe à la suivante : `/clear`, puis `/spec TR2 …`.

### Faire évoluer ton PRD : `/prd <la modification>`

Une fois validé, ton PRD n'est pas figé : il évolue au fil des tranches, quand une tranche se révèle trop grosse ou qu'une idée arrive en cours de route. Tu modifies le PRD existant, tu n'en écris pas un autre :

1. Lance `/prd` avec la modification, par exemple : `/prd Réduire TR1 : la seconde règle passe dans une nouvelle tranche TR3.`
2. Claude amende le PRD et le repasse en `Brouillon`. Il ne renumérote pas les tranches qui ont déjà une spec, et te dit lesquelles sont concernées.
3. Relis la modification avec la grille, puis écris « je valide » : Claude commite l'amendement.
4. Si une tranche qui a déjà une spec a changé, demande à Claude de mettre à jour sa spec, puis son plan, et revalide-les avant de reprendre `/tdd-task`.

### L'API Claude dans ton application

Tu as des crédits pour l'API Claude : ton application peut appeler Claude, par exemple pour résumer, répondre à une question en langage courant ou lire un message libre. C'est un choix de solution comme un autre : ton PRD dit pourquoi l'IA aide ton utilisateur. La réponse de Claude change d'un appel à l'autre ; tes règles non.

- **Ta tranche garde une règle métier que l'application applique elle-même**, autour de la réponse de Claude (par exemple : on ne propose que des lieux qui existent). La spec teste ces règles, pas ce que Claude doit « bien » répondre.
- **La clé reste dans `apps/api/.env`** : `ANTHROPIC_API_KEY=sk-ant-…`, que tu colles toi-même. Ce fichier est ignoré par git, et le hook refuse d'écrire une clé ailleurs. Ne la colle jamais dans la conversation avec Claude Code. L'API charge ce fichier au démarrage, et le SDK y lit la clé.
- **Le SDK officiel** est la seule dépendance ajoutée : `pnpm --filter @joj/api add @anthropic-ai/sdk`. Modèle : `claude-opus-5-5`.
- **Les tests n'appellent jamais Claude.** L'appel est derrière un port dans `application/`, comme `DisciplineRepository` : une classe abstraite (par exemple `AssistantTouristique`), un faux dans `application/testing/` qui renvoie une réponse fixée par le test, et l'implémentation avec le SDK dans `infra/`. Les tests restent rapides, gratuits et reproductibles ; `pnpm check` tourne sans clé ni réseau.
- **Demande une réponse structurée** (du JSON validé par un schéma Zod) plutôt que du texte à découper : ton cas d'usage contrôle ensuite chaque champ comme une donnée venue de l'extérieur.
- **Ménage tes crédits.** Tu essaies l'appel réel à la main, dans Swagger, quelques fois : pas en boucle, pas dans les tests.

## Les règles

- **Une page de PRD et une page de spec au plus** (`pnpm spec:check` le vérifie). La tranche 1 a **une ou deux règles métier**. Une tranche trop ambitieuse ne tient pas en 2 heures de code : c'est l'erreur la plus fréquente.
- **La spec suit le PRD.** Elle réalise une tranche, et rien d'autre. Une nouvelle idée en cours de route va d'abord dans le PRD, avec `/prd`.
- **Tu suis le module `disciplines` comme modèle.** Pas de nouvelle dépendance, sauf le SDK Claude.
- **Une API d'abord.** Un écran seulement quand l'API de ta tranche est verte, et s'il reste du temps.

## À la fin de l'atelier

- `git log --oneline` : le PRD validé (et ses amendements), la spec validée, puis un commit par tâche.
- `pnpm check` est vert, et `pnpm dev` démarre l'application.
- Les trois lignes en tête de `README.md` sont écrites.
- `git push` : tu repars avec ton dépôt, ton `CLAUDE.md`, ton PRD, tes specs, tes tests et ton application.
