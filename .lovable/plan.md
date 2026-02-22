
# Appliquer le style "Grille commune" admin sur la grille joueur

## Objectif
Remplacer le layout `<table>` actuel de `LotoFootPlayGrid.tsx` par le layout CSS Grid utilise dans `ConsolidatedGrid.tsx`, pour un rendu visuel identique cote joueur et cote admin.

## Changements prevus

### Fichier : `src/components/loto-foot/LotoFootPlayGrid.tsx`

**Remplacement du `<table>` par un CSS Grid identique a la grille commune :**

- Utiliser `grid grid-cols-[2rem_1fr_repeat(3,4rem)_1fr]` comme dans `ConsolidatedGrid.tsx`
- Header avec les memes classes : `text-xs font-semibold text-muted-foreground pb-2 border-b`
- Chaque ligne de match avec : `gap-1 items-center py-2 border-b last:border-0`
- Noms d'equipes avec `text-sm truncate font-medium`
- Numero de match avec `text-xs font-mono text-muted-foreground`

**Adaptation des boutons de selection (specifique joueur) :**

Les colonnes 1/N/2 contiendront des boutons cliquables au lieu des barres de progression admin. Les boutons garderont :
- Les couleurs existantes : vert (1), jaune (N/X), bleu (2)
- Le style `bg-green-500/20 text-green-700 border-green-500/40` etc.
- La taille et le `touch-manipulation` pour le mobile

**Responsive mobile :**

- Ajuster la grille pour mobile : `grid-cols-[1.5rem_1fr_repeat(3,2.5rem)_1fr]` sur petits ecrans via des classes `sm:`
- Conserver la troncature des noms d'equipes

**Le reste du composant ne change pas** : deadline countdown, carte recapitulative, bouton de soumission, logique de predictions et mutations.

## Details techniques

Structure cible par ligne de match :

```text
[#] [Domicile________] [btn 1] [btn N] [btn 2] [________Exterieur]
```

Avec CSS Grid au lieu de `<table>`, exactement comme la grille commune admin, mais avec des `<button>` interactifs dans les colonnes centrales.
