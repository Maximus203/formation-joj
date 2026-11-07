# 001 — Inscription d'un bénévole sur un créneau

**Statut** : Implémentée
**PRD** : specs/prd-benevoles.md, TR1

## Contexte

Chaque discipline doit savoir combien de bénévoles elle accueille. Aujourd'hui, les inscriptions sur papier débordent : un créneau accepte plus de bénévoles que de places. Cette tranche fait que l'application refuse la place en trop, au moment de l'inscription.

## User stories

- En tant que bénévole, je veux m'inscrire sur un créneau, afin d'aider à l'accueil du public.
- En tant que responsable de discipline, je veux qu'un créneau complet refuse les inscriptions, afin qu'il ne déborde jamais.

## Scénarios d'acceptation

Le créneau existe déjà, avec une capacité d'au moins une place ; son ouverture n'est pas dans cette tranche.

### AS1 — Inscription sur un créneau qui a de la place

- **Étant donné** un créneau de capacité 2, sans inscrit
- **Quand** Awa s'inscrit avec son nom et son email
- **Alors** l'inscription est acceptée (201), Awa est enregistrée avec son nom et son email, et la réponse indique 1 place restante

### AS2 — Refus sur un créneau complet

- **Étant donné** un créneau de capacité 2, avec deux inscrits
- **Quand** Fatou essaie de s'inscrire
- **Alors** l'inscription est refusée (409) avec le code SLOT_FULL et un message qui dit en français que le créneau est complet, et le créneau reste à deux inscrits

### AS3 — La dernière place

- **Étant donné** un créneau de capacité 2, avec un inscrit
- **Quand** Moussa s'inscrit
- **Alors** l'inscription est acceptée (201), la réponse indique 0 place restante, et une nouvelle tentative est refusée comme en AS2

### AS5 — Même email deux fois

- **Étant donné** un créneau de capacité 2, où Awa est déjà inscrite
- **Quand** Awa s'inscrit à nouveau avec le même email
- **Alors** l'inscription est refusée (409) avec le code VOLUNTEER_ALREADY_REGISTERED, et le créneau garde une seule place prise par Awa

### AS4 — Créneau inconnu

- **Étant donné** un identifiant de créneau qui n'existe pas
- **Quand** Awa essaie de s'inscrire sur ce créneau
- **Alors** l'inscription est refusée (404) avec le code SLOT_NOT_FOUND, et rien n'est enregistré

## Hors périmètre

- Ouvrir un créneau (TR4).
- Se désinscrire (TR3), et consulter les inscrits d'un créneau (TR2).
- L'écran : cette tranche n'a que l'API.

## Questions ouvertes

- Le format de l'email est-il vérifié ? Hypothèse : non, tant que la règle n'est pas écrite dans le PRD.
- Le code SLOT_NOT_FOUND (AS4) n'est pas donné par la demande : hypothèse retenue, à confirmer.
