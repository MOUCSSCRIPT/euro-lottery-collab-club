
# Corriger la validation des résultats et renommer le bouton

## Probleme identifie
La fonction SQL `calculate_loto_foot_results` declare le parametre `p_draw_date` en type `text`, mais les colonnes `draw_date` des tables `user_loto_foot_grids` et `loto_foot_grids` sont de type `date`. PostgreSQL refuse la comparaison `date = text` sans cast explicite.

**Erreur exacte** : `operator does not exist: date = text`

## Corrections prevues

### 1. Migration SQL : recréer la fonction avec un cast explicite
Remplacer la fonction `calculate_loto_foot_results` pour caster `p_draw_date::date` dans les clauses `WHERE`, afin que la comparaison fonctionne correctement.

```text
WHERE draw_date = p_draw_date::date AND status = 'pending'
```

Cela s'applique aux deux boucles de la fonction (user grids et group grids), ainsi qu'a l'insertion dans `loto_foot_wins`.

### 2. Renommer les labels dans l'interface admin
Dans `LotoFootPublishedGridsManager.tsx`, remplacer les textes "Valider" par "Calculer" pour eviter la confusion avec la validation joueur :

| Avant | Apres |
|---|---|
| "Valider Resultat" (bouton) | "Calculer Resultat" |
| "Saisir les resultats" (titre dialog) | "Saisir les resultats" (inchange) |
| "Valider et calculer les gagnants" (bouton final) | "Calculer les gagnants" |
| "Validation en cours..." | "Calcul en cours..." |
| "Resultats valides !" (toast) | "Resultats calcules !" |
| "Impossible de valider les resultats" (toast erreur) | "Impossible de calculer les resultats" |
| "Grilles publiees a valider" (titre section) | "Grilles publiees a calculer" |
| "Validez les resultats..." (description) | "Calculez les resultats..." |

### 3. Fichiers impactes

| Fichier | Modification |
|---|---|
| Migration SQL | `CREATE OR REPLACE FUNCTION` avec `p_draw_date::date` dans les WHERE et INSERT |
| `src/components/admin/LotoFootPublishedGridsManager.tsx` | Renommer les labels "valider" en "calculer" |

### 4. Comportement attendu
- L'admin saisit les resultats (1, X, 2) pour chaque match
- Le bouton "Calculer les gagnants" appelle la fonction corrigee
- La comparaison `draw_date = p_draw_date::date` fonctionne sans erreur
- Les grilles joueurs et groupes sont analysees et les statuts mis a jour
