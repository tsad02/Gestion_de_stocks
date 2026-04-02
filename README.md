# 📦 TTDJAPP - Système de Gestion de Stocks Enterprise (V3)

[![Version](https://img.shields.io/badge/version-3.1.0-emerald.svg)]()
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)]()
[![Stack](https://img.shields.io/badge/stack-React--Node--PostgreSQL-orange.svg)]()

> **TTDJAPP** est une solution logicielle d'entreprise conçue pour optimiser la gestion des stocks en milieu de restauration. Alliant performance, sécurité et esthétique moderne, elle offre une visibilité totale sur vos ressources en temps réel.

---

## ✨ Fonctionnalités Clés

### 📊 Dashboard Intelligent
- **Visualisation Temps Réel** : Indicateurs clés (KPI) sur l'état global du stock.
- **Alertes de Rupture** : Détection automatique des produits sous le seuil critique.
- **Analyses Graphiques** : Suivi des flux (Entrées/Sorties) sur les 7 derniers jours via Chart.js.

### 🔐 Sécurité & Accès (RBAC)
- **Authentification JWT** : Système *Stateless* sécurisé avec signature cryptée.
- **Gestion des Rôles** : Accès différencié entre `RESPONSABLE` (Admin) et `EMPLOYE`.
- **Expiration Intelligente** : Déconnexion automatique après 8h pour protéger vos données.

### 📦 Gestion d'Inventaire Enterprise
- **Mouvements & Flux** : Traçabilité totale (Entrée, Sortie, Perte, Transfert, Ajustement).
- **Multi-Zones Intelligentes** : Gestion massive des produits par zones de stockage (Chambre froide, Réserve, etc.).
- **Bons de Commande PDF** : Génération et impression professionnelle formatée pour PDF.
- **Rapports Analytiques** : Vision hebdomadaire/mensuelle des pertes et du roulement de stock.
- **Moteur de Suggestions** : Algorithme d'aide à la décision pour éviter les ruptures et le gaspillage.
- **Traçabilité & Audit** : Historique complet des actions (Audit Logs) pour la conformité.
- **Notifications Email** : Envoi automatique des bons de commande aux fournisseurs & alertes critiques.

---

## 🛠️ Stack Technique

| Backend | Frontend | Base de Données |
| :--- | :--- | :--- |
| **Node.js** (Express) | **React 18** (Vite) | **PostgreSQL** |
| JWT Authentication | Tailwind CSS 3 | Architecture Relationnelle |
| Bcrypt Hashing | Chart.js | Vues SQL Optimisées |

---

## 🚀 Installation & Démarrage

### 1. Prérequis
- Node.js (v16+)
- PostgreSQL installé et configuré
- Un fichier `.env` à la racine (voir section Configuration)

### 2. Démarrage Rapide (Windows)
Double-cliquez simplement sur le fichier à la racine :
```bash
start-dev.bat
```

### 3. Installation Manuelle
**Backend :**
```bash
cd backend
npm install
npm run dev
```

**Frontend :**
```bash
cd frontend
npm install
npm run dev
```

L'application sera disponible sur `http://localhost:5173`.

---

## ⚙️ Configuration (.env)

Créez un fichier `.env` dans le dossier `backend` :
```env
PORT=3000
DB_USER=votre_utilisateur
DB_PASSWORD=votre_mot_de_passe
DB_NAME=gestion_stocks
JWT_SECRET=votre_cle_secrete_ultra_longue
JWT_EXPIRE=8h
```

---

## 📂 Structure du Projet

- `/backend` : API REST, Contrôleurs et Logique métier.
- `/frontend` : Interface utilisateur moderne avec React et Tailwind.
- `/database` : Scripts SQL d'initialisation et migrations.
- `/CONCEPTION` : Documentation d'architecture et diagrammes UML.

---

## 🛡️ Documentation & Historique

Pour approfondir, consultez nos guides détaillés :
- [🚀 Guide de Démarrage Rapide](DOCS/STARTUP_GUIDE.md)
- [📈 Objectifs Semaine 9 (Actuel)](DOCS/SEMAINE_9_OBJECTIFS.md)
- [📑 Récapitulatif Complet Semaine 8](DOCS/SEMAINE_8_RECAP_COMPLET.md)

---

## 👨‍💻 Auteur
Développé dans le cadre du projet **Gestion de Stocks S6/S7**.

*© 2026 TTDJAPP - Tous droits réservés.*
