

## Ameliorer les animations des slides

### Etat actuel

Les slides (MatchSlide / RecapSlide) s'affichent sans aucune animation de transition. Quand l'utilisateur navigue entre les matchs, le contenu change de maniere abrupte.

### Animations a ajouter

#### 1. Transition de slide avec direction (swipe feel)

Ajouter une animation de glissement horizontal lors du changement de slide. Le nouveau slide entre par la droite quand on avance, et par la gauche quand on recule. Ceci sera gere via un state `slideDirection` dans `LotoFootPlayGrid.tsx` et des classes CSS dynamiques.

#### 2. Animation des boutons de pronostic (1 / N / 2)

Quand un bouton est selectionne, ajouter un effet "bounce-in" (deja defini dans tailwind.config.ts) et un leger pulse glow pour renforcer le feedback visuel.

#### 3. Animation d'entree des elements du RecapSlide

Les lignes de matchs dans le recapitulatif apparaissent en cascade (staggered fade-in) pour un effet plus fluide.

### Plan technique

#### Fichier `tailwind.config.ts`

Ajouter les keyframes suivants :

- `slide-in-left` : translateX(-100%) vers translateX(0)
- `slide-in-right` : translateX(100%) vers translateX(0)
- `slide-out-left` : translateX(0) vers translateX(-100%)
- `slide-out-right` : translateX(0) vers translateX(100%)

Et les animations correspondantes.

#### Fichier `LotoFootPlayGrid.tsx`

- Ajouter un state `slideDirection` ('left' | 'right') mis a jour dans `goNext` et `goPrev`
- Ajouter une `key` basee sur `currentSlide` pour forcer le remontage du composant a chaque changement
- Wrapper le slide courant dans un `div` avec la classe d'animation appropriee selon la direction

```text
goNext() --> slideDirection = 'right' --> animate-slide-in-right
goPrev() --> slideDirection = 'left'  --> animate-slide-in-left
```

#### Fichier `MatchSlide.tsx`

- Ajouter `animate-bounce-in` sur les boutons de pronostic lors de la selection
- Ajouter `animate-pulse-glow` (deja dans tailwind.config.ts) sur le bouton selectionne
- Ajouter une transition d'entree douce sur la card : `animate-fade-in`

#### Fichier `RecapSlide.tsx`

- Ajouter un delai progressif (`animation-delay`) sur chaque ligne de match pour un effet cascade
- Utiliser des styles inline pour le delai : `style={{ animationDelay: index * 50ms }}`
- Classe de base : `animate-fade-in opacity-0` avec `animation-fill-mode: forwards`

### Fichiers modifies

| Fichier | Modification |
|---------|-------------|
| `tailwind.config.ts` | Ajouter keyframes slide-in-left, slide-in-right et animations correspondantes |
| `src/components/loto-foot/LotoFootPlayGrid.tsx` | Ajouter slideDirection state, wrapper animee avec key dynamique |
| `src/components/loto-foot/MatchSlide.tsx` | Animations bounce-in et pulse-glow sur les boutons de pronostic |
| `src/components/loto-foot/RecapSlide.tsx` | Apparition en cascade des lignes de matchs |

