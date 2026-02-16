

# Corriger la remontée des statistiques admin

## Problème identifié

Deux causes empêchent les données de s'afficher :

1. **Erreur 400 PostgREST** : les hooks `useAdminLotoFootGrids` et `useLotoFootStats` utilisent `profiles!inner(username)` pour joindre les profils, mais il n'existe **aucune clé étrangère** entre `user_loto_foot_grids.user_id` et `profiles.user_id`. PostgREST refuse la requête.

2. **Date par défaut incorrecte** : le dashboard utilise `getNextDrawDate('loto_foot')` qui renvoie la date du jour (`2026-02-16`), alors que les données existantes sont pour `2026-02-15`. Problème mineur (l'admin peut changer la date manuellement), mais on peut améliorer le comportement par défaut.

## Correction

### 1. Migration : ajouter la clé étrangère

Ajouter une FK sur `user_loto_foot_grids.user_id` pointant vers `profiles.user_id` pour que PostgREST puisse résoudre la jointure.

```sql
ALTER TABLE public.user_loto_foot_grids
  ADD CONSTRAINT user_loto_foot_grids_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(user_id);
```

### 2. Améliorer la date par défaut du dashboard

Dans `LotoFootAdminDashboard.tsx`, au lieu de `getNextDrawDate('loto_foot')`, utiliser la date de la dernière grille publiée ou du dernier tirage existant. On peut faire une petite requête ou simplement laisser le champ date vide avec un message invitant l'admin à sélectionner une date.

Approche retenue : garder `getNextDrawDate` comme valeur par défaut mais ajouter un bouton rapide pour charger la date la plus récente ayant des données.

### Fichiers modifiés

| Fichier | Modification |
|---|---|
| Nouvelle migration SQL | Ajouter FK `user_loto_foot_grids.user_id -> profiles.user_id` |
| `src/components/admin/LotoFootAdminDashboard.tsx` | Ajouter un bouton "Dernière date avec données" pour faciliter la navigation |

### Impact

- La FK permet aux jointures PostgREST de fonctionner pour les deux hooks (`useAdminLotoFootGrids` et `useLotoFootStats`)
- Aucun changement de logique dans les hooks eux-mêmes
- Les données existantes sont compatibles (le `user_id` pointe déjà vers un profil valide)

