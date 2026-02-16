

# Corriger les resultats et proteger les grilles en cours

## Problemes identifies

### 1. Format de stockage incompatible avec le calcul
Le joueur sauvegarde ses predictions au format **tableau** :
```json
[{"match_position": 1, "predictions": ["1", "N"]}, ...]
```
Mais la fonction SQL `calculate_loto_foot_results` ne traite que le format **objet** (`jsonb_typeof = 'object'`). Toutes les grilles joueurs sont donc **ignorees** lors du calcul.

### 2. Valeur "Nul" incoherente : N vs X
- Le joueur selectionne `N` (composant `MatchSlide.tsx`)
- L'admin saisit les resultats avec `X` (composant `LotoFootPublishedGridsManager.tsx`)
- Meme si le format etait correct, la comparaison `"N" = "X"` echouerait toujours pour les matchs nuls

### 3. Suppression possible des grilles en cours
Le bouton de suppression (individuel et global) ne verifie pas le statut de la grille. Un joueur peut supprimer une grille `pending` qui n'a pas encore ete calculee par l'admin.

---

## Corrections prevues

### Fichier 1 : `src/components/loto-foot/LotoFootPlayGrid.tsx`
Modifier le format de sauvegarde pour utiliser un objet indexe par `match.id` (compatible avec la fonction SQL) :

```text
Avant (ligne 88-91) :
  matches.map((match) => ({
    match_position: match.match_position,
    predictions: predictions[match.id] || [],
  }))

Apres :
  Object.fromEntries(
    Object.entries(predictions).map(([matchId, preds]) => [matchId, preds])
  )
```

### Fichier 2 : `src/components/loto-foot/MatchSlide.tsx`
Remplacer `'N'` par `'X'` partout pour harmoniser avec le systeme de calcul admin :
- Ligne 12 : type `'1' | 'N' | '2'` -> `'1' | 'X' | '2'`
- Ligne 40 : tableau `['1', 'N', '2']` -> `['1', 'X', '2']`
- Ligne 51 : condition `value === 'N'` -> `value === 'X'`

### Fichier 3 : `src/components/loto-foot/RecapSlide.tsx`
Mettre a jour le type pour accepter `'X'` au lieu de `'N'` (coherence).

### Fichier 4 : `src/pages/PlayerStats.tsx`
Proteger la suppression en n'autorisant que les grilles finalisees :

**Suppression individuelle** : masquer le bouton poubelle si `grid.status === 'pending'`

**Suppression globale** : ne supprimer que les grilles dont le statut n'est pas `pending` :
```sql
.delete().eq('user_id', user.id).neq('status', 'pending')
```

Ajouter un message explicatif si des grilles en cours ne peuvent pas etre supprimees.

### Fichier 5 : `src/components/loto-foot/LotoFootPlayGrid.tsx`
Adapter le type du toggle pour `'X'` au lieu de `'N'`.

---

## Resume des modifications

| Fichier | Nature |
|---|---|
| `MatchSlide.tsx` | Remplacer N par X |
| `RecapSlide.tsx` | Mettre a jour le type N -> X |
| `LotoFootPlayGrid.tsx` | Format objet + type X |
| `PlayerStats.tsx` | Bloquer suppression des grilles pending |

Aucune migration SQL necessaire : la fonction `calculate_loto_foot_results` est deja correcte pour le format objet avec des valeurs `X`.

