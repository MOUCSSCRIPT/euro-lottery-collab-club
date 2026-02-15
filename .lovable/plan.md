
## Correction de la validation des resultats admin

### Probleme identifie

Le bouton "Valider et calculer les gagnants" reste desactive car le code exige exactement **15 resultats saisis** (`Object.keys(results).length < 15`), meme si la grille ne contient que **12 ou 14 matchs**. L'administrateur ne peut jamais atteindre 15 si la grille a moins de matchs.

Le meme probleme existe dans le message d'erreur toast qui affiche toujours "15 resultats".

### Correction

Modifier `LotoFootPublishedGridsManager.tsx` pour utiliser le nombre reel de matchs au lieu du chiffre 15 fixe :

1. **Condition du bouton (ligne 234)** : Remplacer `Object.keys(results).length < 15` par `Object.keys(results).length < (matches?.length || 15)` -- le bouton s'active des que tous les matchs ont un resultat.

2. **Message toast (ligne 41-44)** : Remplacer le chiffre 15 par `matches?.length` pour afficher le bon compteur (ex: "10/12" au lieu de "10/15").

3. **Compteur affiche (ligne 189)** : Remplacer le `/15` fixe par le nombre reel de matchs pour que l'indicateur de progression soit correct.

### Details techniques

Fichier modifie : `src/components/admin/LotoFootPublishedGridsManager.tsx`

- Ligne 41 : `resultsCount < (matches?.length || 15)` 
- Ligne 44 : afficher `matches?.length || 15` dans le message
- Ligne 189 : afficher `matches?.length || 15` dans le compteur
- Ligne 234 : `Object.keys(results).length < (matches?.length || 15)` pour la condition disabled du bouton
