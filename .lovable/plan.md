
# Ajouter un nom personnalisable aux grilles Loto Foot

## Objectif
Permettre a l'administrateur de donner un nom a une grille lors de sa creation (ex: "Loto Foot Journee 25"), et afficher ce nom dynamiquement dans le titre de la page Play (ligne 58) a la place du texte statique "Loto Foot 15".

## Modifications prevues

### 1. Migration base de donnees
Ajouter une colonne `name` (texte, nullable, valeur par defaut `NULL`) a la table `loto_foot_published_grids`.

```text
ALTER TABLE public.loto_foot_published_grids
  ADD COLUMN name text DEFAULT NULL;
```

### 2. Interface admin -- LotoFootMatchAndGridManager
- Ajouter un champ `Input` "Nom de la grille" dans l'etape 1 (section Selection) ou l'etape 3 (section Publication), avec un placeholder comme "Ex: Loto Foot Journee 25".
- Ajouter un state `gridName` dans le composant.
- Passer `name: gridName` lors de l'insertion dans `createGridMutation`.
- Permettre la modification du nom sur une grille existante (brouillon ou publiee).

### 3. Type PublishedGrid
Ajouter `name: string | null` dans l'interface `PublishedGrid` du fichier `src/hooks/usePublishedGrid.ts`.

### 4. Page Play -- affichage dynamique du titre
- Importer `useNextPublishedGrid` (deja utilise par `LotoFootPlayGrid`).
- Remplacer le texte statique "Loto Foot 15" par le nom de la grille publiee si disponible, sinon conserver "Loto Foot 15" comme fallback.
- Le CSS existant (gradient, taille, etc.) reste identique.

```text
Avant:  <h1 ...>Loto Foot 15</h1>
Apres:  <h1 ...>{publishedGrid?.name || 'Loto Foot 15'}</h1>
```

## Details techniques

| Fichier | Modification |
|---|---|
| Migration SQL | Ajout colonne `name` sur `loto_foot_published_grids` |
| `src/hooks/usePublishedGrid.ts` | Ajout `name: string \| null` dans l'interface |
| `src/components/admin/LotoFootMatchAndGridManager.tsx` | Ajout champ "Nom de la grille" + state + insertion/mise a jour |
| `src/pages/Play.tsx` | Hook `useNextPublishedGrid` + affichage dynamique du titre |

## Comportement
- Si l'admin ne saisit pas de nom, le titre affiche "Loto Foot 15" (fallback).
- Si un nom est saisi, il s'affiche avec le meme style gradient.
- Le nom est modifiable tant que la grille existe (brouillon ou publiee).
