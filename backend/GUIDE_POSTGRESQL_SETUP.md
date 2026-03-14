# 🐘 Guide d'Initialisation PostgreSQL

## ✅ Étape 1 : Vérifier que PostgreSQL est Installé

### Windows (cmd)
```cmd
psql --version
```

**Résultat attendu** :
```
psql (PostgreSQL) 13.x ou supérieur
```

Si PostgreSQL n'est pas installé, téléchargez depuis : https://www.postgresql.org/download/

---

## ✅ Étape 2 : Démarrer PostgreSQL

### Windows

#### **Option A : Service PostgreSQL (Recommandé)**
PostgreSQL s'exécute déjà en tant que service Windows. Vérifiez qu'il est bien lancé :

**Services > PostgreSQL** (ou via cmd Admin) :
```cmd
# Vérifier que le service PostgreSQL est en cours d'exécution
sc query PostgreSQL-x64-13
```

Si le service n'est pas lancé :
```cmd
# Démarrer le service (en Admin)
net start PostgreSQL-x64-13
```

#### **Option B : Lancer psql manuellement**
```cmd
# Ouvrez une invite de commande
psql -U postgres
```

Vous devriez obtenir le prompt PostgreSQL :
```
postgres=#
```

---

## ✅ Étape 3 : Créer la Base de Données

Une fois connecté à PostgreSQL (`psql -U postgres`) :

```sql
-- Créer la base de données
CREATE DATABASE gestion_stocks;

-- Vérifier qu'elle a été créée
\l

-- Se connecter à la base
\c gestion_stocks
```

**Résultat attendu** :
```
You are now connected to database "gestion_stocks" as user "postgres".
```

---

## ✅ Étape 4 : Créer le Schéma (Tables, Vues, etc.)

### Option A : Via Script SQL

```cmd
cd c:\Users\PC\Documents\Hiver 2026\Gestion_de_stocks
psql -U postgres -d gestion_stocks -f database/db_gestion_de_stocks.sql
```

### Option B : Via Node.js

```cmd
cd backend
node src/db/init-db.js
```

---

## ✅ Étape 5 : Vérifier la Connexion

```cmd
cd backend
node check_db_connection.js
```

**Résultat attendu** :
```
✅ Connexion réussie !

Infos serveur :
  - Timestamp : 2026-03-11T23:45:00.000Z
  - Version   : PostgreSQL 13.x ...

📊 Tables existantes : 5
   - users
   - products
   - inventory_movements
```

---

## ❌ Dépannage

### Erreur : "SCRAM-SERVER-FIRST-MESSAGE: client password must be a string"

**Causes** :
- ❌ `.env` n'existe pas
- ❌ `DB_PASSWORD` manquant dans `.env`
- ❌ `pool.js` ne charge pas `dotenv`

**Solution** :
```bash
# 1. Vérifier que .env existe
ls backend/.env

# 2. Vérifier le contenu
cat backend/.env

# 3. Assurez-vous qu'il contient :
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
```

---

### Erreur : "FATAL: password authentication failed"

**Causes** :
- ❌ Mauvais mot de passe
- ❌ Utilisateur PostgreSQL n'existe pas

**Solution** :
```bash
# Connexion avec mot de passe interactif
psql -U postgres
# PostgreSQL vous demandera le mot de passe

# Si vous connaissez le mot de passe :
set PGPASSWORD=votre_mot_de_passe
psql -U postgres
```

---

### Erreur : "could not connect to server"

**Causes** :
- ❌ PostgreSQL n'est pas lancé
- ❌ Mauvais host/port

**Solution** :
```bash
# Vérifier que PostgreSQL est lancé
pg_isready -h localhost -p 5432

# Résultat attendu :
# accepting connections

# Si non, démarrez PostgreSQL :
net start PostgreSQL-x64-13
```

---

### Erreur : "database 'gestion_stocks' does not exist"

**Solution** :
```sql
-- Créer la base manquante
CREATE DATABASE gestion_stocks;
```

---

## ✅ Configuration PostgreSQL Finale

### Fichier `.env` (à adapter)

```env
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gestion_stocks
JWT_SECRET=votre_cle_secrete_super_longue
```

### Vérifier PostgreSQL Version & Utilisateurs

```bash
# Voir la version
psql --version

# Connexion et vérification des utilisateurs
psql -U postgres
postgres=# \du
postgres=# \l
postgres=# \q
```

---

## 🚀 Lancement Complet du Backend

Après configuration :

```bash
cd backend
npm install
npm run dev
```

Puis testez :

```bash
curl http://localhost:3000/api/health
```

**Résultat attendu** :
```json
{
  "status": "✅ OK",
  "timestamp": "2026-03-11T...",
  "message": "Le serveur de gestion de stock est prêt."
}
```

---

**Mise à jour : 11/03/2026**
