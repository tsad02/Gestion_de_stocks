# 📦 Système de Gestion de Stocks - Backend (Semaine 6)

Ce projet est une API REST robuste pour la gestion de stocks, développée avec **Node.js**, **Express** et **PostgreSQL**. Il inclut une authentification sécurisée et une gestion des droits par rôles.

## 🚀 Fonctionnalités (Semaine 6)

### 🔐 Authentification & Sécurité
- **Inscription & Connexion** : Gestion complète avec hachage de mot de passe (`bcrypt`) et jetons **JWT**.
- **Contrôle d'Accès (RBAC)** : 
  - **RESPONSABLE** : Accès complet (Ajout, Modification, Suppression).
  - **EMPLOYE** : Consultation uniquement (Lecture).

### 📦 Gestion des Produits (CRUD)
- **Lister** tous les produits.
- **Détails** d'un produit spécifique via son ID.
- **Ajouter** de nouveaux produits (Nom, Catégorie, Unité, Seuil, Quantité).
- **Modifier** les informations ou le niveau de stock.
- **Supprimer** des articles.
- **Validation** : Protection contre les noms vides et les seuils négatifs.

## 🛠️ Installation & Configuration

1. **Installation des dépendances** :
   ```bash
   cd backend
   npm install
   ```

2. **Variables d'environnement** :
   Créez un fichier `.env` dans le dossier `backend` :
   ```env
   PORT=3000
   DATABASE_URL=postgres://utilisateur:motdepasse@localhost:5432/nom_base
   JWT_SECRET=votre_cle_secrete
   JWT_EXPIRE=8h
   ```

3. **Initialisation de la base de données** :
   ```bash
   node src/db/init-db.js
   ```

4. **Lancement du serveur** :
   ```bash
   npm run dev
   ```

## 📚 Documentation Supplémentaire
Pour des instructions détaillées sur les tests avec Postman et le fonctionnement technique, consultez la documentation générée ici :
[Walkthrough.md](file:///C:/Users/PC/.gemini/antigravity/brain/ec8308dd-713a-4f6d-903c-e68a3c7c219a/walkthrough.md)

## 📁 Structure du Projet
- `src/app.js` : Configuration Express.
- `src/controllers/` : Logique métier (Auth & Produits).
- `src/middleware/` : Sécurité JWT et vérification des Rôles.
- `src/routes/` : Définition des points d'entrée de l'API.
- `src/db/` : Configuration et scripts SQL.
