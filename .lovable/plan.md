

# Corriger l'affichage de l'onglet Stats admin

## Probleme
Dans `AdminPanel.tsx`, le `useEffect` qui synchronise l'onglet actif avec l'URL ne reconnait que la valeur `players`. Pour toute autre valeur (`stats`, `results`, `loto-foot`), il force le retour a `loto-foot`. Quand l'admin clique sur "Stats", l'URL passe a `?tab=stats` mais le composant revient immediatement a l'onglet "Matchs".

## Correction

### Fichier : `src/components/admin/AdminPanel.tsx`

Modifier le `useEffect` (lignes 99-107) pour reconnaitre toutes les valeurs d'onglets valides :

```text
Avant :
  if (tabParam === 'players') {
    setActiveTab('players');
  } else {
    setActiveTab('loto-foot');
  }

Apres :
  const validTabs = ['players', 'loto-foot', 'results', 'stats'];
  if (tabParam && validTabs.includes(tabParam)) {
    setActiveTab(tabParam);
  } else {
    setActiveTab('loto-foot');
  }
```

Cela permet a tous les onglets (Joueurs, Matchs, Resultats, Stats) de fonctionner correctement avec la navigation par URL.

## Impact
- Un seul fichier modifie : `src/components/admin/AdminPanel.tsx`
- Aucune modification de base de donnees
- Correction de 3 lignes dans le `useEffect`

