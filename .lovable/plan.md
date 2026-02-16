
# Tableau de bord admin : consultation des choix joueurs, grille commune et gestion des gains

## Vue d'ensemble

Ce plan ajoute un ensemble de fonctionnalites dans l'onglet admin "Stats" existant, organisees en sous-onglets :

1. **Choix joueurs (slides)** -- voir les pronostics de chaque joueur un par un
2. **Grille commune** -- pourcentages consolides par match (comme l'image de reference)
3. **Vue globale** -- tableau de toutes les cases selectionnees
4. **Participation** -- pourcentages de participation par joueur
5. **Gains** -- saisie du montant gagne et repartition automatique
6. **Historique joueur** -- suppression de l'historique des grilles (cote joueur)

---

## 1. Choix joueurs en mode slide

### Comportement
- L'admin selectionne une date de tirage
- Le systeme charge toutes les grilles joueurs (`user_loto_foot_grids`) pour cette date
- Un carousel affiche un slide par joueur, montrant :
  - Nom du joueur (depuis `profiles`)
  - Pour chaque match : les cases selectionnees (1 / N / 2)
  - Navigation fleches gauche/droite entre joueurs

### Donnees
- Requete : `user_loto_foot_grids` JOIN `profiles` filtre par `draw_date`
- Les predictions sont au format `Array<{match_position, predictions}>` ou `Record<matchId, string[]>`

---

## 2. Grille commune consolidee

### Comportement
- Pour chaque match, le systeme calcule le pourcentage de joueurs ayant choisi 1, N, 2
- Affichage identique a l'image de reference :
  - Numero du match
  - Equipe domicile | 1 | N | 2 | Equipe exterieur
  - Sous chaque bouton : le pourcentage (ex: 49%)
  - Barre de progression coloree proportionnelle
- En bas : Mise totale, nombre de doubles, nombre de triples

### Calcul
```text
Pour chaque match M :
  count_1 = nombre de grilles contenant "1" pour M
  count_N = nombre de grilles contenant "N" pour M  
  count_2 = nombre de grilles contenant "2" pour M
  total = count_1 + count_N + count_2
  pct_1 = (count_1 / total) * 100
  ...
```

---

## 3. Vue globale (toutes les cases)

### Comportement
- Tableau recapitulatif affichant toutes les cases selectionnees par tous les joueurs
- Colonnes : Match | 1 | N | 2 (avec le nombre de selections)
- Mise en evidence des cases les plus choisies (couleur plus intense)
- Identification des doubles/triples par joueur

---

## 4. Statistiques de participation

### Comportement
- Reprend et enrichit l'onglet Stats existant (`LotoFootStatsChart`)
- Pour chaque joueur : nombre de choix, pourcentage de participation, detail

---

## 5. Gestion des gains

### Comportement
- L'admin saisit le montant total gagne pour un tirage
- Le systeme calcule automatiquement :
  `gain_joueur = montant_total * (participation_joueur / 100)`
- Affichage : tableau avec joueur, % participation, montant gagne
- Pas de stockage en base dans un premier temps (calcul a la volee)

---

## 6. Suppression historique (cote joueur)

### Comportement
- Sur la page `/stats` (PlayerStats), ajouter un bouton "Supprimer tout mon historique"
- Confirmation via dialog
- Supprime toutes les grilles de l'utilisateur dans `user_loto_foot_grids`

---

## Details techniques

### Nouveau hook : `useAdminLotoFootGrids`
Fichier : `src/hooks/useAdminLotoFootGrids.ts`

Charge toutes les grilles joueurs pour une date donnee avec les profils :
```text
SELECT ulg.*, p.username 
FROM user_loto_foot_grids ulg
JOIN profiles p ON p.user_id = ulg.user_id
WHERE ulg.draw_date = ?
```
(Utilise la policy RLS "Admins can view all user loto foot grids")

### Nouveau composant admin : `LotoFootAdminDashboard`
Fichier : `src/components/admin/LotoFootAdminDashboard.tsx`

Remplace `LotoFootStatsChart` dans l'onglet "Stats" de `AdminPanel`. Contient des sous-onglets :
- Slides joueurs
- Grille commune
- Vue globale
- Participation
- Gains

### Composants enfants

| Fichier | Role |
|---|---|
| `src/components/admin/PlayerSlideView.tsx` | Slide individuel par joueur avec ses pronostics |
| `src/components/admin/ConsolidatedGrid.tsx` | Grille commune avec pourcentages et barres |
| `src/components/admin/AllSelectionsView.tsx` | Vue globale de toutes les cases |
| `src/components/admin/WinningsCalculator.tsx` | Saisie gains + repartition automatique |

### Modification existante

| Fichier | Modification |
|---|---|
| `src/components/admin/AdminPanel.tsx` | Remplacer `LotoFootStatsChart` par `LotoFootAdminDashboard` dans l'onglet Stats |
| `src/pages/PlayerStats.tsx` | Ajouter bouton "Supprimer mon historique" avec confirmation |
| `src/hooks/useLotoFootStats.ts` | Enrichir pour inclure les details de predictions par joueur |

### Structure de la grille commune (reference image)

```text
+----+----------------+-----+-----+-----+------------------+
| #  | Equipe dom.    |  1  |  N  |  2  | Equipe ext.      |
+----+----------------+-----+-----+-----+------------------+
|  1 | Gerone         | 5%  | 5%  | 90% | FC Barcelone     |
|    |                | === |     |     | ================ |
+----+----------------+-----+-----+-----+------------------+
|  2 | Bastia         | 24% | 22% | 54% | Troyes           |
|    |                | === | === | ========               |
+----+----------------+-----+-----+-----+------------------+
...
```

Les barres de progression sous chaque pourcentage sont colorees :
- Vert pour 1
- Jaune/orange pour N  
- Bleu pour 2

### Sequence d'implementation

1. Creer `useAdminLotoFootGrids` (hook de donnees)
2. Creer `ConsolidatedGrid` (grille commune -- fonctionnalite principale)
3. Creer `PlayerSlideView` (slides joueurs)
4. Creer `AllSelectionsView` (vue globale)
5. Creer `WinningsCalculator` (gestion gains)
6. Creer `LotoFootAdminDashboard` (conteneur avec sous-onglets)
7. Modifier `AdminPanel` pour integrer le nouveau dashboard
8. Modifier `PlayerStats` pour ajouter la suppression d'historique
