
-- Désactiver temporairement RLS pour group_members
ALTER TABLE group_members DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les politiques existantes pour group_members
DROP POLICY IF EXISTS "Users can view group members" ON group_members;
DROP POLICY IF EXISTS "Users can insert group members" ON group_members;
DROP POLICY IF EXISTS "Users can update group members" ON group_members;
DROP POLICY IF EXISTS "Users can delete group members" ON group_members;

-- Créer des politiques RLS simples et non récursives
CREATE POLICY "Allow select group_members" ON group_members
    FOR SELECT USING (true);

CREATE POLICY "Allow insert group_members" ON group_members
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update group_members" ON group_members
    FOR UPDATE USING (true);

CREATE POLICY "Allow delete group_members" ON group_members
    FOR DELETE USING (true);

-- Réactiver RLS
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Faire de même pour la table groups si nécessaire
ALTER TABLE groups DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view groups" ON groups;
DROP POLICY IF EXISTS "Users can insert groups" ON groups;
DROP POLICY IF EXISTS "Users can update groups" ON groups;
DROP POLICY IF EXISTS "Users can delete groups" ON groups;

CREATE POLICY "Allow select groups" ON groups
    FOR SELECT USING (true);

CREATE POLICY "Allow insert groups" ON groups
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update groups" ON groups
    FOR UPDATE USING (true);

CREATE POLICY "Allow delete groups" ON groups
    FOR DELETE USING (true);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
