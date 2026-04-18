-- ============================================================================
-- 0006_role_senior_reviewer.sql
--
-- Fuegt die Rollenstufe `senior_reviewer` (Tier 1) zwischen `reviewer` (Tier 2)
-- und `regional_admin` (Tier 0, Laender-Admin) ein.
--
-- Wichtig: Das muss in einer eigenen Migration stehen, weil PostgreSQL einen
-- neuen Enum-Wert nicht im selben Transaktionsblock verwenden laesst, in dem
-- er hinzugefuegt wurde. Alle Bezuege auf 'senior_reviewer' leben daher in
-- 0007.
-- ============================================================================

alter type public.user_role add value if not exists 'senior_reviewer' before 'regional_admin';
