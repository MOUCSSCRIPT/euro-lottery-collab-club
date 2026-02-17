

# Enregistrement individuel des grilles et anti-doublons

## Contexte

Ton projet utilise Supabase (pas Node.js/Express), donc la logique sera implementee via une **Edge Function Supabase** (Deno/TypeScript) qui remplace l'equivalent d'une route Express `POST /grilles/jouer`.

## Architecture actuelle vs cible

Aujourd'hui : 1 grille jouee = 1 ligne dans `user_loto_foot_grids` avec `cost = N` (nombre de combinaisons).

Demain : 1 grille jouee = **N lignes distinctes** dans la table, chacune avec un `instance_index` (de 1 a N) et le meme `group_grid_id` pour les regrouper visuellement.

## Modifications prevues

### 1. Migration SQL : ajouter les colonnes manquantes

Ajouter deux colonnes a `user_loto_foot_grids` :
- `instance_index` (integer, default 1) : numero de l'instance (1 a N)
- `group_grid_id` (uuid, nullable) : identifiant commun pour regrouper les N grilles visuelles d'un meme jeu

### 2. Edge Function : `submit-loto-foot-grid`

Cette fonction remplace la logique client actuelle et gere tout cote serveur :

- **Verification anti-doublons** : compare la combinaison normalisee (cles et valeurs triees) avec toutes les grilles existantes pour le meme `draw_date` (tous joueurs confondus). Si doublon, retourne une erreur 409.
- **Verification du solde** : verifie que le joueur a assez de SuerteCoins.
- **Insertion de N lignes** : cree N enregistrements avec le meme `group_grid_id`, des `instance_index` de 1 a N, et un cout de 1 SC chacun.
- **Deduction des coins** : deduit N coins du profil joueur.
- Tout dans une transaction pour garantir la coherence.

Parametres attendus (POST) :
```text
{
  "predictions": { "matchId1": ["1", "X"], "matchId2": ["2"], ... },
  "draw_date": "2026-02-15"
}
```

Reponse succes :
```text
{
  "success": true,
  "grids_created": 3,
  "group_grid_id": "uuid",
  "cost": 3
}
```

Reponse doublon :
```text
{
  "error": "Cette combinaison existe deja. Veuillez modifier vos choix.",
  "code": "DUPLICATE_GRID"
}
```

### 3. Mise a jour du composant `LotoFootPlayGrid.tsx`

Remplacer l'appel direct a Supabase par un appel a l'Edge Function :
```text
const response = await supabase.functions.invoke('submit-loto-foot-grid', {
  body: { predictions, draw_date: nextDrawDate }
});
```

Gerer le cas d'erreur doublon avec un message specifique pour le joueur.

### 4. Adaptation de l'affichage joueur (`PlayerStats.tsx`)

Regrouper les grilles ayant le meme `group_grid_id` pour n'afficher qu'une seule entree visuelle avec le nombre d'instances (ex: "Grille x3").

### 5. Adaptation du calcul des resultats

La fonction SQL `calculate_loto_foot_results` fonctionne deja ligne par ligne, donc chaque instance sera calculee independamment -- aucun changement necessaire.

## Fichiers concernes

| Fichier | Modification |
|---|---|
| Nouvelle migration SQL | Ajouter `instance_index` et `group_grid_id` |
| `supabase/functions/submit-loto-foot-grid/index.ts` | Nouvelle Edge Function (logique metier complete) |
| `src/components/loto-foot/LotoFootPlayGrid.tsx` | Appeler l'Edge Function au lieu de Supabase direct |
| `src/pages/PlayerStats.tsx` | Regrouper visuellement par `group_grid_id` |
| `src/integrations/supabase/types.ts` | Mise a jour auto des types |

## Detection de doublons

La verification se fait sur **tous les joueurs** pour le meme tirage : si un joueur A a deja joue la combinaison exacte, un joueur B ne peut pas la rejouer. La normalisation trie les cles (match IDs) et les valeurs (predictions) pour garantir une comparaison fiable.

