

# Ajouter le calcul du cout de la grille commune consolidee

## Objectif
La grille commune regroupe tous les choix de tous les joueurs. L'admin veut savoir combien couterait cette grille si on la validait comme une seule grille combinee (produit cartesien de toutes les cases cochees).

## Logique de calcul

Pour chaque match, on compte combien de choix distincts ont ete faits par l'ensemble des joueurs (1, 2 ou 3 parmi 1/N/2). Le cout total = produit du nombre de choix distincts par match.

Exemple avec 15 matchs :
- 10 matchs avec 1 seul choix (tous les joueurs d'accord) = 1 chacun
- 3 matchs avec 2 choix differents = 2 chacun
- 2 matchs avec les 3 choix = 3 chacun

Cout = 1^10 x 2^3 x 3^2 = 1 x 8 x 9 = 72 SC (72 combinaisons)

## Changements prevus

### Fichier : `src/components/admin/ConsolidatedGrid.tsx`

1. **Calculer les choix distincts par match** : pour chaque match, determiner combien de valeurs distinctes (1, N, 2) ont ete selectionnees par au moins un joueur (count1 > 0, countN > 0, count2 > 0).

2. **Calculer le nombre de combinaisons** : multiplier le nombre de choix distincts de chaque match entre eux (produit cartesien).

3. **Afficher dans le footer** : ajouter une ligne sous la mise totale actuelle, indiquant :
   - Le nombre de combinaisons de la grille commune
   - Le cout en SC (1 SC par combinaison)

   Exemple de rendu dans le footer :

```text
Mise totale : 45 SC                     12 joueurs
Grille commune : 72 combinaisons = 72 SC
```

## Details techniques

Le calcul s'appuie sur les donnees deja presentes dans `consolidatedData` :

```typescript
const distinctChoicesPerMatch = consolidatedData.map(row => {
  let choices = 0;
  if (row.count1 > 0) choices++;
  if (row.countN > 0) choices++;
  if (row.count2 > 0) choices++;
  return Math.max(1, choices);
});

const totalCombinations = distinctChoicesPerMatch.reduce((acc, c) => acc * c, 1);
const combinedCost = totalCombinations; // 1 SC par combinaison
```

Pas de nouveau fichier, pas de modification de base de donnees. Uniquement un calcul et affichage supplementaire dans le footer de `ConsolidatedGrid.tsx`.
