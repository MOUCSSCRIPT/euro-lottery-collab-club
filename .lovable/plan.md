

# Gestion des joueurs par l'administrateur

## Vue d'ensemble

L'administrateur pourra ajouter et supprimer des joueurs directement depuis l'onglet "Joueurs" du panneau admin. Les joueurs crees recevront un mot de passe provisoire (`Buenasuerte{Nom}`) et devront le changer a leur premiere connexion.

## Modifications prevues

### 1. Migration base de donnees

Ajouter une colonne `must_change_password` (boolean, defaut `false`) a la table `profiles` pour suivre si le joueur doit changer son mot de passe.

```text
ALTER TABLE profiles ADD COLUMN must_change_password boolean NOT NULL DEFAULT false;
```

### 2. Edge Function `admin-manage-players`

Nouvelle Edge Function securisee (admin only) avec deux actions :

**Action "create"** :
- Recoit `username`, `email` (optionnel), `country` (optionnel)
- Genere le mot de passe `Buenasuerte{username}` (premiere lettre en majuscule)
- Cree l'utilisateur via `supabase.auth.admin.createUser()` avec `email_confirm: true`
- Si pas d'email fourni, genere un email interne (ex: `{username}@suerte.local`)
- Met a jour le profil cree par le trigger `handle_new_user` pour y ajouter `must_change_password = true` et le `country`
- Retourne le mot de passe provisoire a l'admin pour qu'il le communique au joueur

**Action "delete"** :
- Recoit `user_id`
- Verifie qu'il n'y a pas de grilles en cours (`status = 'pending'`) pour ce joueur
- Si grilles en cours : refuse la suppression avec un message explicatif
- Sinon : supprime l'utilisateur via `supabase.auth.admin.deleteUser()` (cascade sur profiles grace a la FK)

**Securite** : verifie que l'appelant a le role `admin` via `has_role()`.

### 3. Changement de mot de passe obligatoire

**Dans `MandatoryProfileSetup.tsx`** : ajouter une condition supplementaire. Si `profile.must_change_password === true`, afficher un modal de changement de mot de passe au lieu du ProfileModal.

**Nouveau composant `ForcePasswordChange.tsx`** :
- Modal non fermable (comme le profil obligatoire)
- Deux champs : nouveau mot de passe + confirmation
- Validation : minimum 6 caracteres, les deux champs identiques
- Appelle `supabase.auth.updateUser({ password })` puis met a jour `must_change_password = false` dans profiles
- Message d'accueil : "Bienvenue ! Pour la securite de votre compte, veuillez choisir un nouveau mot de passe."

### 4. Interface admin (onglet Joueurs)

**Bouton "Ajouter un joueur"** en haut de la liste :
- Ouvre un modal avec les champs : Pseudo (obligatoire), Email (optionnel), Pays (optionnel)
- Affiche le mot de passe provisoire genere apres creation (dans un champ copiable)
- Rafraichit la liste des profils

**Bouton "Supprimer"** sur chaque ligne joueur :
- Confirmation avant suppression
- Si grilles en cours : affiche un message d'erreur expliquant pourquoi la suppression est impossible
- Si OK : supprime et rafraichit la liste

### 5. Page Profil -- modification du mot de passe

Remplacer le bouton "Modifier le mot de passe" (actuellement "Bientot disponible") par un vrai formulaire :
- Champs : nouveau mot de passe + confirmation
- Appelle `supabase.auth.updateUser({ password })`
- Toast de confirmation

## Fichiers concernes

| Fichier | Modification |
|---|---|
| Migration SQL | Ajout colonne `must_change_password` |
| `supabase/functions/admin-manage-players/index.ts` | Nouvelle Edge Function (create/delete) |
| `supabase/config.toml` | Config de la nouvelle function (`verify_jwt = false`) |
| `src/hooks/useAdminActions.ts` | Hooks `useCreatePlayer` et `useDeletePlayer` |
| `src/components/admin/AdminPanel.tsx` | UI ajout/suppression joueurs |
| `src/components/profile/ForcePasswordChange.tsx` | Nouveau modal changement MDP obligatoire |
| `src/components/profile/MandatoryProfileSetup.tsx` | Detection `must_change_password` |
| `src/pages/Profile.tsx` | Formulaire changement MDP fonctionnel |
| `src/hooks/useProfile.ts` | Ajout champ `must_change_password` au type `Profile` |

## Flux utilisateur

```text
Admin cree joueur "Jean"
  → Compte cree avec email + mot de passe "BuenasuerteJean"
  → Admin communique les identifiants au joueur

Jean se connecte
  → Modal obligatoire : "Changez votre mot de passe"
  → Jean saisit un nouveau mot de passe
  → must_change_password passe a false
  → Jean accede a l'application normalement

Admin supprime un joueur
  → Verification : pas de grilles pending
  → Si OK : suppression complete (auth + profile en cascade)
  → Si grilles en cours : message d'erreur
```

