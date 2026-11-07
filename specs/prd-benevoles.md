# PRD — Bénévoles

**Statut** : Validé

## Problème

Chaque discipline a besoin de bénévoles pour accueillir le public. Les inscriptions se font sur papier, et des créneaux débordent sans que personne le voie.

## Utilisateurs

- Responsable de discipline (ouvre des créneaux) ; bénévole (s'inscrit, voit les places restantes).

## Proposition

Le responsable ouvre un créneau avec une capacité. Les bénévoles s'y inscrivent, et l'application refuse toute inscription au-delà de la capacité.

## Mesure du succès

Pendant la démo, un créneau de capacité 2 accepte deux bénévoles et refuse le troisième, avec un message clair sur le fait que le créneau est complet.

## Tranches

### TR1 — Inscrire un bénévole sur un créneau

Un bénévole s'inscrit sur un créneau existant avec son nom et son email. Règles métier : on n'inscrit personne au-delà de la capacité du créneau ; un même email ne s'inscrit pas deux fois sur un créneau.

### TR2 — Consulter un créneau et ses inscrits

Un créneau affiche ses horaires, sa capacité, ses places restantes et ses inscrits.

### TR3 — Se désinscrire d'un créneau

Un bénévole se désinscrit d'un créneau avec son email, et sa place se libère.

### TR4 — Ouvrir un créneau

Le responsable ouvre un créneau pour une discipline, avec une capacité d'au moins une place. Prérequis : TR1 (le créneau ouvert reçoit des inscriptions).

### TR5 — Gérer un créneau à l'écran

Un écran permet de voir un créneau, de s'y inscrire et de s'en désinscrire, sans règle nouvelle.

## Hors périmètre

- La modification ou la suppression d'un créneau, les emails de confirmation, les comptes des bénévoles.

## Hypothèses et risques

- Le bénévole est identifié par son email, et un créneau ne change pas de capacité une fois ouvert. Si l'email est partagé, TR1 bloque deux bénévoles.
- Risque accepté pour la démo : rien ne limite aujourd'hui l'ouverture d'un créneau (TR4) aux responsables, car le PRD exclut les comptes. Condition de levée : avant toute utilisation réelle pendant les Jeux.
