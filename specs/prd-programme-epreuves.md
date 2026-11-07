# PRD — Programme des épreuves

**Statut** : Validé

## Problème

Le comité d'organisation construit le programme des Jeux épreuve par épreuve. Deux épreuves peuvent se retrouver au même lieu au même moment, ou sortir des dates des Jeux, et personne ne le voit avant la publication.

## Utilisateurs

- Comité d'organisation : programme les épreuves d'une discipline.
- Public et journalistes : consultent le programme d'une journée.

## Proposition

Le comité programme une épreuve (nom, lieu, début, fin). L'application refuse ce qui sort des dates des Jeux, ou ce qui se chevauche au même lieu.

## Mesure du succès

Pendant la démo : une épreuve du 13 novembre qui finit le 14 après minuit est refusée, car elle sort des dates des Jeux. Deux épreuves au même lieu qui se chevauchent : la seconde est refusée. Une épreuve qui commence quand l'autre finit est acceptée. Une journée affiche ses épreuves triées par heure de début.

## Tranches

### TR1 — Programmer une épreuve dans les dates des Jeux

Programmer une épreuve pour une discipline existante, avec un lieu en texte libre. Règle : l'épreuve est entièrement dans les dates des Jeux, du 31 octobre 2026 à 0 h jusqu'au 14 novembre 2026 à 0 h, heure de Dakar (UTC+0, sans changement d'heure).

### TR2 — Refuser le chevauchement dans un même lieu

Deux épreuves ne se chevauchent pas dans le même lieu. Une épreuve peut commencer à l'heure où la précédente finit. Le lieu ne tient pas compte des majuscules ni des espaces en trop. Prérequis : TR1.

### TR3 — Consulter le programme d'une journée

Toutes les épreuves d'une journée, tous lieux confondus, triées par heure de début. Prérequis : TR1.

## Hors périmètre

- L'écran, la modification et la suppression d'une épreuve.
- Une liste officielle des lieux, les autres fuseaux horaires, la billetterie et les résultats.

## Hypothèses et risques

- Les dates des Jeux (31 octobre au 13 novembre 2026) sont supposées, non confirmées.
- Une épreuve a un seul lieu et une seule discipline.
- Le lieu est un texte libre : deux noms différents pour un même stade ne seront pas détectés.
- Risque accepté pour la démo : rien ne limite la programmation aux membres du comité, car le PRD exclut les comptes. Condition de levée : avant toute utilisation réelle pendant les Jeux.
