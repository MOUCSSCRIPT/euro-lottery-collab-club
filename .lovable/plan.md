

## Correction : Les matchs ne s'enregistrent pas pour les joueurs

### Probleme identifie

L'admin a publie la grille mais les matchs n'ont jamais ete sauvegardes dans la base de donnees. La requete `loto_foot_matches?draw_date=eq.2026-02-13` retourne un tableau vide `[]`.

**Cause racine** : Le workflow admin a 2 actions separees (Enregistrer matchs + Publier grille) et il est possible de publier sans avoir enregistre les matchs. Il faut forcer l'enregistrement des matchs avant toute publication.

### Corrections a apporter

#### 1. Fusionner "Enregistrer" et "Publier" dans `LotoFootMatchAndGridManager.tsx`

Quand l'admin clique "Creer la grille" ou "Publier", les matchs doivent etre automatiquement sauvegardes en meme temps. Plus besoin de cliquer separement sur "Enregistrer".

**Changements :**
- Modifier `createGridMutation` pour sauvegarder les matchs AVANT de creer la grille publiee
- Modifier `publishGridMutation` pour sauvegarder les matchs AVANT de publier
- Garder le bouton "Enregistrer" comme option manuelle (brouillon), mais le rendre secondaire
- Ajouter une verification : empecher la publication si les matchs ne sont pas tous remplis (deja fait via `allMatchesFilled`)

**Code concret :**

```typescript
// Fonction utilitaire pour sauvegarder les matchs
const saveMatchesToDB = async () => {
  await supabase
    .from('loto_foot_matches')
    .delete()
    .eq('draw_date', selectedDate);

  const matchesToInsert = matches
    .map((match, index) => ({
      home_team: match.home_team.trim(),
      away_team: match.away_team.trim(),
      match_position: index + 1,
      draw_date: selectedDate,
      match_datetime: new Date(selectedDate).toISOString(),
      status: 'scheduled',
    }))
    .filter(m => m.home_team && m.away_team);

  if (matchesToInsert.length === 0) {
    throw new Error('Aucun match valide');
  }

  const { error } = await supabase
    .from('loto_foot_matches')
    .insert(matchesToInsert);

  if (error) throw error;
  return matchesToInsert.length;
};

// createGridMutation sauvegarde les matchs PUIS cree la grille
const createGridMutation = useMutation({
  mutationFn: async (deadline: string) => {
    // Etape 1: sauvegarder les matchs
    await saveMatchesToDB();
    
    // Etape 2: creer la grille publiee
    const { data, error } = await supabase
      .from('loto_foot_published_grids')
      .insert({
        draw_date: selectedDate,
        play_deadline: deadline,
        match_count: matchCount,
        status: 'draft',
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['admin-loto-foot-matches'] });
    queryClient.invalidateQueries({ queryKey: ['published-grid', selectedDate] });
    toast.success('Matchs enregistres et grille creee');
  },
  // ...
});

// publishGridMutation met aussi a jour les matchs
const publishGridMutation = useMutation({
  mutationFn: async () => {
    // Sauvegarder les matchs (au cas ou modifies)
    await saveMatchesToDB();
    
    // Publier la grille
    const { error } = await supabase
      .from('loto_foot_published_grids')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .eq('id', publishedGrid.id);
    
    if (error) throw error;
  },
  // ...
});
```

#### 2. Proteger contre la reinitialisation des matchs

Le `useEffect` sur `matchCount` (ligne 32-34) reinitialise les matchs a vide a chaque changement. Il faut preserver les donnees existantes.

```typescript
useEffect(() => {
  setMatches(prev => {
    const newMatches = Array.from({ length: matchCount }, (_, i) => 
      prev[i] || { home_team: '', away_team: '' }
    );
    return newMatches;
  });
}, [matchCount]);
```

#### 3. Ajouter un message d'avertissement cote joueur

Dans `LotoFootPlayGrid.tsx`, ameliorer le message quand les matchs sont absents mais la grille existe :

```typescript
if (publishedGrid && (!matches || matches.length === 0)) {
  return (
    <Alert>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        La grille est en cours de preparation. Les matchs seront bientot disponibles.
      </AlertDescription>
    </Alert>
  );
}
```

### Fichiers modifies

| Fichier | Modification |
|---------|-------------|
| `src/components/admin/LotoFootMatchAndGridManager.tsx` | Fusionner sauvegarde matchs + publication, proteger useEffect matchCount |
| `src/components/loto-foot/LotoFootPlayGrid.tsx` | Meilleur message quand matchs absents |

### Resume

Le fix principal : **quand l'admin publie, les matchs sont automatiquement sauvegardes**. Plus de risque d'oublier l'etape "Enregistrer".
