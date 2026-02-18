

# Correction de la logique de generation et d'enregistrement des grilles

## Probleme principal

Actuellement, la Edge Function `submit-loto-foot-grid` enregistre N copies **identiques** des predictions (le meme objet JSON avec doubles/triples) au lieu de **decomposer les combinaisons** en grilles individuelles avec un seul pronostic par match.

Exemple concret :
- Le joueur choisit : match1=["X","2"], match2=["X"], match3=["1"]
- Aujourd'hui : 2 lignes en base, toutes les deux avec `{"match1":["X","2"], "match2":["X"], "match3":["1"]}`
- Attendu : 2 lignes distinctes :
  - `{"match1":"X", "match2":"X", "match3":"1"}`
  - `{"match1":"2", "match2":"X", "match3":"1"}`

## Modifications prevues

### 1. Edge Function `submit-loto-foot-grid` -- Refonte complete

**Produit cartesien** : ajouter une fonction `expandCombinations` qui genere toutes les combinaisons possibles a partir des predictions multi-choix du joueur.

```text
Entree : { "m1": ["X","2"], "m2": ["X"], "m3": ["1"] }
Sortie : [
  { "m1": "X", "m2": "X", "m3": "1" },
  { "m1": "2", "m2": "X", "m3": "1" }
]
```

**Anti-doublons ameliore** : chaque combinaison generee est normalisee et comparee individuellement avec toutes les grilles existantes pour le meme tirage (tous joueurs confondus). Si **une seule** des combinaisons existe deja, la soumission entiere est bloquee.

**Insertion** : chaque combinaison est une ligne distincte avec :
- `predictions` = objet a valeur simple (ex: `{"m1":"X", "m2":"X"}`) au lieu d'un tableau
- `instance_index` = 1 a N
- `group_grid_id` = UUID commun pour regrouper visuellement
- `cost` = 1 SC par ligne

### 2. Affichage joueur (PlayerStats.tsx)

Adapter le rendu pour gerer les deux formats de predictions :
- Ancien format (objet avec tableaux) : afficher les multi-choix "1/X"
- Nouveau format (objet avec valeur simple) : afficher le choix unique

Le regroupement par `group_grid_id` reste inchange (fonctionne deja).

### 3. Protection contre la suppression de grilles en cours

Dans `PlayerStats.tsx`, modifier la condition de suppression :
- Aujourd'hui : suppression autorisee si `status !== 'pending'`
- Correction : suppression autorisee **uniquement** si `status !== 'pending'` (les grilles "pending" ne peuvent pas etre supprimees car le tirage n'a pas encore eu lieu)

Note : la logique actuelle est **inversee** -- elle permet de supprimer les grilles terminees mais pas les grilles en attente. Il faut decider :
- Option A : le joueur peut supprimer uniquement les grilles terminees (historique) -- c'est le comportement actuel
- Option B : le joueur ne peut rien supprimer tant que le calcul n'est pas fait -- bloquer la suppression des grilles "pending"

Le comportement actuel (option A) semble correct : on ne supprime que l'historique. La seule correction necessaire est d'empecher la suppression pendant un calcul en cours par l'admin (statut intermediaire).

### 4. Vues admin (deja fonctionnelles)

Les composants `PlayerSlideView`, `ConsolidatedGrid` et `AllSelectionsView` utilisent deja `parsePredictions` qui gere les deux formats. Avec le nouveau format a valeur simple, chaque grille en base correspondra a un seul pronostic par match, ce qui simplifie l'affichage admin.

L'admin verra desormais chaque combinaison individuelle dans les slides, ce qui est plus precis.

### 5. Remontee des resultats

La fonction SQL `calculate_loto_foot_results` fonctionne deja ligne par ligne et gere les deux formats (tableau et valeur simple). Avec le nouveau format a valeur simple, la comparaison avec le resultat gagnant sera plus directe et fiable.

## Fichiers modifies

| Fichier | Nature de la modification |
|---|---|
| `supabase/functions/submit-loto-foot-grid/index.ts` | Ajout du produit cartesien, anti-doublons par combinaison |
| `src/pages/PlayerStats.tsx` | Adaptation de l'affichage pour le nouveau format de predictions |

## Details techniques

### Fonction expandCombinations (produit cartesien)

```text
function expandCombinations(predictions: Record<string, string[]>): Record<string, string>[] {
  const matchIds = Object.keys(predictions).sort();
  let combos: Record<string, string>[] = [{}];

  for (const matchId of matchIds) {
    const choices = predictions[matchId];
    const newCombos: Record<string, string>[] = [];
    for (const combo of combos) {
      for (const choice of choices) {
        newCombos.push({ ...combo, [matchId]: choice });
      }
    }
    combos = newCombos;
  }
  return combos;
}
```

### Anti-doublons par combinaison

Chaque combinaison generee est normalisee en triant les cles, puis comparee en JSON avec les grilles existantes. La comparaison se fait contre les grilles de TOUS les joueurs pour le meme tirage.

### Flux complet

1. Le joueur soumet ses predictions (avec doubles/triples)
2. L'Edge Function genere toutes les combinaisons (produit cartesien)
3. Chaque combinaison est verifiee contre la base (anti-doublons)
4. Si aucun doublon : insertion de N lignes + deduction de N SC
5. Si doublon detecte : rejet total avec message d'erreur

