

## Refonte complète : Système Loto Foot simplifié

### Objectif
Créer un système propre où :
1. **Admin** : Génère une grille de matchs (12, 14 ou 15)
2. **Joueurs** : Naviguent en slides, peuvent revenir en arrière, paient à la fin
3. **Calcul automatique** : Coût basé sur les sélections 1-N-2

---

## Architecture proposée

```text
┌─────────────────────────────────────────────────────────────┐
│                        ADMIN                                │
├─────────────────────────────────────────────────────────────┤
│  Composant unique simplifié :                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  [Date du tirage]  [12 ▼] [14 ▼] [15 ▼] matchs         ││
│  │                                                         ││
│  │  Match 1: [Équipe A] vs [Équipe B]                      ││
│  │  Match 2: [Équipe C] vs [Équipe D]                      ││
│  │  ...                                                    ││
│  │  Match 15: [Équipe X] vs [Équipe Y]                     ││
│  │                                                         ││
│  │  [Date limite: __/__/__]  [Publier la grille]          ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                       JOUEUR                                │
├─────────────────────────────────────────────────────────────┤
│  Interface slides avec navigation libre :                   │
│  ┌─────────────────────────────────────────────────────────┐│
│  │        Match 3/15                                       ││
│  │        ● ● ● ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○                  ││
│  │                                                         ││
│  │     ┌───────────────────────────────────┐               ││
│  │     │     PSG  vs  Lyon                 │               ││
│  │     │                                   │               ││
│  │     │   [  1  ]  [  N  ]  [  2  ]      │               ││
│  │     │     ✓                            │               ││
│  │     │   (multiple sélections OK)        │               ││
│  │     └───────────────────────────────────┘               ││
│  │                                                         ││
│  │    [← Précédent]              [Suivant →]               ││
│  │                                                         ││
│  │    ┌────────────────────────────────────┐               ││
│  │    │ Combinaisons: 24 | Coût: 600 SC    │               ││
│  │    └────────────────────────────────────┘               ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  Dernier slide → Récapitulatif + [Payer X SC]              │
└─────────────────────────────────────────────────────────────┘
```

---

## Modifications

### 1. Simplifier l'admin `LotoFootMatchAndGridManager.tsx`

**Changements majeurs :**
- Supprimer les champs `match_datetime` (non nécessaires selon demande)
- Interface plus compacte : formulaire inline pour tous les matchs
- Un seul bouton "Publier" quand tous les matchs sont remplis

**Nouvelle structure :**

```typescript
// État simplifié
const [selectedDate, setSelectedDate] = useState<string>(today);
const [matchCount, setMatchCount] = useState<12 | 14 | 15>(15);
const [matches, setMatches] = useState<{home: string, away: string}[]>([]);
const [deadline, setDeadline] = useState<string>('');

// Formulaire inline sans popup
<div className="space-y-2">
  {Array.from({length: matchCount}).map((_, i) => (
    <div className="flex gap-2 items-center">
      <span className="w-8">{i + 1}.</span>
      <Input placeholder="Équipe domicile" ... />
      <span>vs</span>
      <Input placeholder="Équipe extérieur" ... />
    </div>
  ))}
</div>
```

**Réduction de code :** ~868 lignes → ~300 lignes (-65%)

---

### 2. Refonte complète du composant joueur `LotoFootPlayGrid.tsx`

**Nouveau composant avec slides :**

```typescript
interface MatchSlidePlayerProps {
  matches: Match[];
  onComplete: (predictions: Record<string, string[]>) => void;
}

const LotoFootSlidePlayer = ({ matches, onComplete }: MatchSlidePlayerProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [predictions, setPredictions] = useState<Record<string, string[]>>({});
  
  // Calcul dynamique
  const { combinations, cost } = useMemo(() => {
    return calculateCost(predictions);
  }, [predictions]);
  
  // Navigation libre
  const goToSlide = (index: number) => setCurrentSlide(index);
  const goNext = () => setCurrentSlide(prev => Math.min(prev + 1, matches.length));
  const goPrev = () => setCurrentSlide(prev => Math.max(prev - 1, 0));
  
  // Toggle prédiction (1, N ou 2)
  const togglePrediction = (matchId: string, value: '1' | 'N' | '2') => {
    setPredictions(prev => {
      const current = prev[matchId] || [];
      if (current.includes(value)) {
        // Retirer
        const filtered = current.filter(v => v !== value);
        if (filtered.length === 0) {
          const { [matchId]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [matchId]: filtered };
      } else {
        // Ajouter
        return { ...prev, [matchId]: [...current, value] };
      }
    });
  };
  
  return (
    <div className="space-y-4">
      {/* Indicateur de progression */}
      <div className="flex justify-center gap-1">
        {matches.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={cn(
              "w-3 h-3 rounded-full transition-all",
              i === currentSlide ? "bg-primary scale-125" : 
              predictions[matches[i].id] ? "bg-green-500" : "bg-gray-300"
            )}
          />
        ))}
      </div>
      
      {/* Slide actuel ou récap final */}
      {currentSlide < matches.length ? (
        <MatchSlide 
          match={matches[currentSlide]}
          selected={predictions[matches[currentSlide].id] || []}
          onToggle={(v) => togglePrediction(matches[currentSlide].id, v)}
        />
      ) : (
        <RecapSlide 
          predictions={predictions}
          matches={matches}
          combinations={combinations}
          cost={cost}
          onConfirm={() => onComplete(predictions)}
        />
      )}
      
      {/* Navigation */}
      <div className="flex justify-between">
        <Button onClick={goPrev} disabled={currentSlide === 0}>
          ← Précédent
        </Button>
        <Button onClick={goNext}>
          {currentSlide < matches.length - 1 ? "Suivant →" : "Voir récap"}
        </Button>
      </div>
      
      {/* Coût en temps réel */}
      <div className="fixed bottom-20 left-0 right-0 bg-background border-t p-3">
        <div className="flex justify-between max-w-md mx-auto">
          <span>Combinaisons: {combinations}</span>
          <span className="font-bold">Coût: {cost} SC</span>
        </div>
      </div>
    </div>
  );
};
```

---

### 3. Nouveau composant `MatchSlide.tsx`

```typescript
const MatchSlide = ({ 
  match, 
  selected, 
  onToggle 
}: { 
  match: Match; 
  selected: string[]; 
  onToggle: (value: '1' | 'N' | '2') => void 
}) => {
  return (
    <Card className="p-6 text-center">
      <h2 className="text-xl font-bold mb-6">
        {match.home_team} <span className="text-muted-foreground">vs</span> {match.away_team}
      </h2>
      
      <div className="flex justify-center gap-4">
        {(['1', 'N', '2'] as const).map(value => (
          <Button
            key={value}
            variant={selected.includes(value) ? "default" : "outline"}
            size="lg"
            className={cn(
              "w-20 h-20 text-2xl font-bold transition-all",
              selected.includes(value) && value === '1' && "bg-blue-600",
              selected.includes(value) && value === 'N' && "bg-gray-600",
              selected.includes(value) && value === '2' && "bg-red-600",
            )}
            onClick={() => onToggle(value)}
          >
            {value}
          </Button>
        ))}
      </div>
      
      <p className="mt-4 text-sm text-muted-foreground">
        Sélectionnez 1, 2 ou 3 résultats possibles
      </p>
    </Card>
  );
};
```

---

### 4. Composant `RecapSlide.tsx` (slide final)

```typescript
const RecapSlide = ({ 
  predictions, 
  matches, 
  combinations, 
  cost, 
  onConfirm 
}) => {
  const predictionCount = Object.keys(predictions).length;
  const isValid = predictionCount >= 12;
  
  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4 text-center">Récapitulatif</h2>
      
      <div className="space-y-2 max-h-60 overflow-y-auto mb-6">
        {matches.map((match, i) => {
          const preds = predictions[match.id];
          return (
            <div key={match.id} className="flex justify-between items-center py-2 border-b">
              <span className="text-sm">
                {i + 1}. {match.home_team} vs {match.away_team}
              </span>
              <span className={cn(
                "font-mono",
                preds ? "text-green-600" : "text-red-400"
              )}>
                {preds?.join(' / ') || '—'}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="space-y-3 border-t pt-4">
        <div className="flex justify-between">
          <span>Matchs pronostiqués</span>
          <span className={predictionCount >= 12 ? "text-green-600" : "text-red-600"}>
            {predictionCount}/{matches.length}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Combinaisons</span>
          <span className="font-bold">{combinations}</span>
        </div>
        <div className="flex justify-between text-lg font-bold">
          <span>Total à payer</span>
          <span>{cost} SuerteCoins</span>
        </div>
      </div>
      
      {!isValid && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>
            Minimum 12 pronostics requis ({12 - predictionCount} manquants)
          </AlertDescription>
        </Alert>
      )}
      
      <Button 
        className="w-full mt-6" 
        size="lg"
        disabled={!isValid}
        onClick={onConfirm}
      >
        Payer {cost} SC et valider
      </Button>
    </Card>
  );
};
```

---

### 5. Calcul automatique du coût

**Formule Loto Foot :**
```
Coût = 25 SC × (nb choix match 1) × (nb choix match 2) × ... × (nb choix match N)
```

**Exemples :**
- 15 matchs avec 1 choix chacun = 25 × 1^15 = **25 SC**
- 15 matchs dont 3 avec 2 choix = 25 × 1^12 × 2^3 = 25 × 8 = **200 SC**
- 15 matchs dont 1 avec 3 choix = 25 × 1^14 × 3 = **75 SC**

**Fonction mise à jour :**
```typescript
export function calculateCost(predictions: Record<string, string[]>): { combinations: number; cost: number } {
  const values = Object.values(predictions);
  if (values.length < 12) return { combinations: 0, cost: 0 };
  
  const combinations = values.reduce((acc, preds) => acc * preds.length, 1);
  const cost = combinations * 25; // 25 SC par combinaison
  
  return { combinations, cost };
}
```

---

### 6. Simplification de la base de données

**Table `loto_foot_matches` :**
- Garder les colonnes existantes mais `match_datetime` devient optionnel
- L'admin n'a pas besoin de le remplir (valeur par défaut = date du tirage)

**Modification SQL si nécessaire :**
```sql
ALTER TABLE loto_foot_matches 
ALTER COLUMN match_datetime SET DEFAULT NOW();
```

---

## Fichiers impactés

| Action | Fichier | Description |
|--------|---------|-------------|
| Modifier | `src/components/admin/LotoFootMatchAndGridManager.tsx` | Simplifier : formulaire inline, pas de datetime |
| Remplacer | `src/components/loto-foot/LotoFootPlayGrid.tsx` | Interface slides avec navigation libre |
| Créer | `src/components/loto-foot/MatchSlide.tsx` | Slide individuel pour un match |
| Créer | `src/components/loto-foot/RecapSlide.tsx` | Slide récapitulatif final avec paiement |
| Modifier | `src/utils/lotoFootCosts.ts` | Simplifier le calcul |
| Modifier | `src/pages/Play.tsx` | Adapter au nouveau composant |

---

## Avantages de cette refonte

| Aspect | Avant | Après |
|--------|-------|-------|
| **Admin** | 868 lignes, dialogs complexes | ~300 lignes, inline |
| **Joueur UX** | Liste verticale | Slides navigables |
| **Navigation** | Sens unique | Libre (avant/arrière) |
| **Paiement** | Panier séparé | Intégré au dernier slide |
| **Date/heure match** | Obligatoire | Optionnel/masqué |
| **Calcul coût** | Temps réel | Temps réel (conservé) |
| **Mobile** | Moyen | Optimisé (swipe-friendly) |

---

## Workflow utilisateur final

1. **Joueur ouvre /jouer**
2. **Voit le premier match** avec boutons 1, N, 2
3. **Sélectionne** (peut choisir plusieurs)
4. **Appuie "Suivant"** ou swipe
5. **Peut revenir en arrière** à tout moment
6. **Voit le coût mis à jour** en bas de l'écran
7. **Au dernier slide** : récapitulatif complet
8. **Clique "Payer"** → grille enregistrée

