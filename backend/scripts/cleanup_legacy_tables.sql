-- ==========================================================
-- 🐘 Script de Nettoyage des Tables Django Héroes (Légacy)
-- ==========================================================
-- Ce script supprime toutes les tables créées par l'ancienne
-- version Django qui ne sont plus utilisées par le projet Node.js.

-- ATTENTION : Ces actions sont irréversibles.

BEGIN;

-- 1. Suppression des tables applicatives Django
DROP TABLE IF EXISTS api_inventorymovement CASCADE;
DROP TABLE IF EXISTS api_notification CASCADE;
DROP TABLE IF EXISTS api_product CASCADE;
DROP TABLE IF EXISTS api_user_groups CASCADE;
DROP TABLE IF EXISTS api_user_user_permissions CASCADE;
DROP TABLE IF EXISTS api_user CASCADE;

-- 2. Suppression des tables d'authentification Django
DROP TABLE IF EXISTS auth_group_permissions CASCADE;
DROP TABLE IF EXISTS auth_group CASCADE;
DROP TABLE IF EXISTS auth_permission CASCADE;

-- 3. Suppression des tables système Django
DROP TABLE IF EXISTS django_admin_log CASCADE;
DROP TABLE IF EXISTS django_content_type CASCADE;
DROP TABLE IF EXISTS django_migrations CASCADE;
DROP TABLE IF EXISTS django_session CASCADE;

-- 4. Nettoyage des types/enums orphelins (si applicable)
-- Note : Les enums comme 'movement_type' sont partagés, on ne les touche pas s'ils sont encore utilisés.

COMMIT;

-- Résultat attendu : Propreté totale !
SELECT 'Nettoyage terminé avec succès' AS Status;
