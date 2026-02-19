
# Refonte visuelle "Squid Game-Inspired" -- SuertePlus

## Direction artistique

L'identite visuelle s'inspire de l'**ambiance** Squid Game sans utiliser de contenus proteges : fond sombre, rose neon vif (le rose iconique), formes geometriques abstraites (cercle, triangle, carre), typographie industrielle/bold, et une tension visuelle entre le noir profond et les accents neon.

### Palette de couleurs

| Role | Actuel | Nouveau (HSL) | Rendu |
|---|---|---|---|
| Background | Blanc | Noir profond `220 20% 6%` | #0d1117 |
| Foreground | Bleu fonce | Blanc casse `210 20% 92%` | #e6eaef |
| Card | Blanc | Gris tres fonce `220 15% 10%` | #151a22 |
| Primary | Bleu `240 100% 65%` | Rose neon `340 85% 55%` | #e6305a |
| Primary glow | Violet | Rose clair `340 90% 65%` | #f05a7e |
| Accent | Orange | Dore/jaune `45 90% 55%` | #e6b830 |
| Secondary | Gris clair | Gris fonce `220 15% 15%` | #1f2630 |
| Muted | Gris clair | Gris moyen fonce `220 12% 18%` | #272d36 |
| Prediction 1 | Bleu | Cercle/Teal `175 70% 45%` | #22b8a0 |
| Prediction X | Orange | Triangle/Rose `340 85% 55%` | #e6305a |
| Prediction 2 | Vert | Carre/Dore `45 90% 55%` | #e6b830 |
| Success | Vert | Teal vif `160 75% 45%` | #1db87a |
| Destructive | Rouge | Rouge intense `0 75% 50%` | #df2020 |
| Border | Gris clair | Gris subtil `220 15% 18%` | #272d38 |

### Symboles geometriques abstraits

Les formes cercle, triangle et carre sont utilisees comme motifs decoratifs abstraits (inspirees des formes de jeux de societe classiques, pas de contenu protege). Elles apparaitront :
- Dans le fond du Hero via CSS (formes flottantes en opacite faible)
- Comme separateurs visuels
- Dans les boutons de prediction (1 = cercle, X = triangle, 2 = carre)

## Fichiers modifies

| Fichier | Modifications |
|---|---|
| `src/index.css` | Nouvelle palette dark-mode-only, formes geometriques CSS, police Google Fonts, classes utilitaires neon |
| `tailwind.config.ts` | Nouvelles animations (glow neon, float), font-family etendue |
| `src/components/Header.tsx` | Fond noir, logo rose neon, texte adapte |
| `src/components/HeroSection.tsx` | Fond sombre, formes geometriques flottantes, gradient rose/dore, bouton neon |
| `src/pages/Auth.tsx` | Fond sombre, card sombre, branding rose |
| `src/pages/Play.tsx` | Fond sombre, titre gradient rose |
| `src/pages/PlayerStats.tsx` | Fond sombre |
| `src/pages/Index.tsx` | Fond sombre, gradient rose |
| `src/components/loto-foot/MatchSlide.tsx` | Boutons 1/X/2 avec formes geometriques, couleurs prediction mises a jour |
| `src/components/loto-foot/RecapSlide.tsx` | Adaptation couleurs sombres |
| `src/components/loto-foot/LotoFootPlayGrid.tsx` | Barre de progression et footer en theme sombre |
| `src/components/layout/MobileNavBar.tsx` | Fond noir, icones neon |
| `src/components/layout/MobileHeader.tsx` | Fond sombre |
| `src/components/ui/SuerteCoinsDisplay.tsx` | Variantes adaptees au theme sombre (fond dore/ambre sur noir) |
| `src/components/grids/GridStatusBadge.tsx` | Badges en couleurs neon sur fond sombre |
| `src/components/coins/CoinPurchaseModal.tsx` | Modal sombre, accents neon |

## Details techniques

### 1. `src/index.css` -- Design system complet

Remplacement de la palette `:root` par un theme dark-by-default :
- Suppression du mode light (tout est sombre)
- Ajout de classes utilitaires : `.neon-glow`, `.geometric-circle`, `.geometric-triangle`, `.geometric-square`
- Import Google Font "Inter" ou "Space Grotesk" pour un aspect industriel
- Fond global avec subtil motif de grille (grid pattern CSS)

### 2. `tailwind.config.ts` -- Animations

Ajout de keyframes :
- `neon-pulse` : pulsation de l'ombre neon rose
- `float` : mouvement lent vertical pour les formes decoratives
- `glow-border` : bordure qui pulse en rose

### 3. Composants principaux

**Header** : fond `bg-card/95 backdrop-blur`, logo avec glow rose, liens en blanc/rose au hover.

**HeroSection** : fond noir avec formes geometriques SVG animees en arriere-plan (cercle rose, triangle dore, carre teal en opacite 5-10%), titre en gradient rose-dore, bouton "JOUER" avec glow neon pulsant.

**MatchSlide** : les boutons 1/X/2 gardent leur logique mais recoivent les nouvelles couleurs prediction (teal/rose/dore) avec un effet glow quand selectionnes.

**MobileNavBar** : fond noir opaque, icone active en rose neon, texte inactif en gris moyen.

**Auth page** : fond sombre uni, card avec bordure subtile, branding rose au lieu de bleu/jaune.

**SuerteCoinsDisplay** : variante default en ambre/dore sur fond sombre transparent au lieu de jaune sur blanc.

### 4. Approche globale

La majorite du restyling passe par le fichier CSS central (`index.css`) grace aux variables CSS. Les composants qui utilisent des classes hardcodees (`bg-blue-600`, `from-blue-50`, `text-gray-600`, etc.) doivent etre mis a jour individuellement pour utiliser les tokens du design system (`bg-primary`, `bg-background`, `text-foreground`, etc.) ou les nouvelles couleurs du theme.
