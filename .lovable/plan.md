

## Correction : Le bouton "Publier" est bloqué

### Probleme

Quand l'admin revient sur une grille existante de 12 matchs, le formulaire s'initialise avec 15 matchs (valeur par defaut). Les 12 matchs existants sont charges mais le formulaire affiche 15 lignes. 3 lignes restent vides, donc `allMatchesFilled` = false et le bouton "Publier" est desactive.

### Cause racine

`matchCount` est initialise a 15 par defaut (ligne 27) et n'est jamais mis a jour quand une grille existante est chargee depuis la base.

### Correction dans `LotoFootMatchAndGridManager.tsx`

Ajouter un `useEffect` qui synchronise `matchCount` avec la grille publiee existante ou le nombre de matchs existants :

```typescript
// Synchronize matchCount when published grid or existing matches are loaded
useEffect(() => {
  if (publishedGrid?.match_count) {
    const count = publishedGrid.match_count;
    if (count === 12 || count === 14 || count === 15) {
      setMatchCount(count);
    }
  } else if (existingMatches && existingMatches.length > 0) {
    const count = existingMatches.length;
    if (count === 12 || count === 14 || count === 15) {
      setMatchCount(count as 12 | 14 | 15);
    }
  }
}, [publishedGrid, existingMatches]);
```

### Fichier modifie

| Fichier | Modification |
|---------|-------------|
| `src/components/admin/LotoFootMatchAndGridManager.tsx` | Ajouter un useEffect pour synchroniser matchCount avec les donnees existantes |

### Resultat attendu

- L'admin revient sur la page avec la grille du 14/02
- `matchCount` se met automatiquement a 12 (valeur de la grille existante)
- Les 12 matchs sont affiches et remplis → `allMatchesFilled` = true
- Le bouton "Publier" est actif et cliquable
