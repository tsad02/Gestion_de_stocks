-- Migration: Ajouter la colonne phone à la table users
-- Date: 2026-03-21

ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(30);
