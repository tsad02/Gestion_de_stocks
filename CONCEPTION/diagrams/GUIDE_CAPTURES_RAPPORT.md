# 📸 Guide Captures & Export pour Rapport

Pour votre rapport de progression (Semaine 2), suivez ce guide pour extraire les diagrammes en haute qualité.

---

## 🎯 Méthode Rapide (5 minutes)

### Étape 1 : Ouvrir le fichier

- **Windows** : Double-cliquez sur `ALL_DIAGRAMS.html`
- Le navigateur s'ouvre automatiquement

### Étape 2 : Exporter en PDF (Meilleure Option)

1. Appuyez sur 🖨️ bouton **"Imprimer / Exporter en PDF"** en haut
2. **Ou** : `Ctrl+P`
3. Choisir : 
   - **Imprimante** : "Enregistrer en PDF"
   - **Format** : A4 ou Légal
   - **Orientation** : Portrait
   - **Marges** : Normal
4. **Enregistrer** : `Rapport_Conception_Semaine2.pdf`

**Résultat** : PDF professionnel avec tous les diagrammes ✅

---

## 📸 Méthode Alternative : Captures Individuelles

### Pour chaque diagramme :

#### **1. Depuis ALL_DIAGRAMS.html**

**Firefox** :
1. Ouvrir `ALL_DIAGRAMS.html`
2. Scroll jusqu'au diagramme
3. Clic droit → **"Prendre une capture de page"**
4. Sélectionner la région du diagramme
5. **Enregistrer l'image**

**Chrome/Edge** :
1. Ouvrir `ALL_DIAGRAMS.html`
2. Appuyer sur `F12` (DevTools)
3. Clic ⋮ (menu) → **"Capture de page complète"**
4. Crop la zone du diagramme dans l'image générée

#### **2. Depuis mermaid.live (Plus haute résolution)**

Pour les diagrammes `.mmd` individuels :

1. Aller sur [https://mermaid.live](https://mermaid.live)
2. Ouvrir un fichier `.mmd` :
   ```
   ├── 01_Sequence_Login.mmd
   ├── 02_ERD_Tables.mmd
   ├── 03_UseCases.mmd
   ├── 04_ClassDiagram.mmd
   ├── 05_Sequence_Mouvement.mmd
   ```
3. Copier le contenu → Coller dans l'éditeur
4. **Exporter** :
   - 📥 Download → SVG ou PNG
   - Ou clic droit sur le diagramme → "Copier l'image"

---

## 🎨 Noms des Captures Recommandés

Pour aligner avec votre rapport :

```
Rapport_Semaine2/
├── 01_ERD_Tables_Relations.png
├── 02_UseCase_Diagram.png
├── 03_Class_Diagram.png
├── 04_Sequence_Login.png
├── 05_Sequence_CreateProduct.png
├── 06_Sequence_CreateMovement.png
├── 07_Sequence_Dashboard.png
└── 08_API_Summary_Table.png
```

---

## 📋 Structuration du Rapport

### Recommandation d'organisat

**Semaine 2 – Conception Technique**

```markdown
## 1. Diagramme Entité-Relation

[Insérer image : 01_ERD_Tables_Relations.png]

### Explications :
- 3 tables : USERS, PRODUCTS, INVENTORY_MOVEMENTS
- Relations 1:N (composition)
- FK RESTRICT pour intégrité
- Stock calculé dynamiquement via JOIN

---

## 2. Cas d'Utilisation (Use Cases)

[Insérer image : 02_UseCase_Diagram.png]

### 3 Acteurs :
- 👨‍💼 EMPLOYE : Lecture seule
- 👔 RESPONSABLE : Admin complet
- 🔑 ADMIN : Gestion utilisateurs

### 9 Use Cases couverts

---

## 3. Diagramme de Classes

[Insérer image : 03_Class_Diagram.png]

### Architecture :
- 7 classes métier
- 3 services (Auth, Product, Inventory)
- Service Pattern + Repository Pattern
- 6 relations composition/dépendance

---

## 4. Flux de Séquence

### 4.1 Authentification (Login)
[Insérer image : 04_Sequence_Login.png]

### 4.2 Création Produit
[Insérer image : 05_Sequence_CreateProduct.png]

### 4.3 Ajouter Mouvement (Complexe)
[Insérer image : 06_Sequence_CreateMovement.png]

### 4.4 Dashboard KPI
[Insérer image : 07_Sequence_Dashboard.png]

---

## 5. API REST Résumée

[Insérer image : 08_API_Summary_Table.png]

| Endpoint | Méthode | RBAC | Auth |
|----------|---------|------|------|
| /api/auth/login | POST | - | ❌ |
| ...

---

## Résumé Conception

✅ Tous les diagrammes UML
✅ Intégrité données assurée (FK RESTRICT)
✅ RBAC complétement intégré
✅ Stock dynamique via vues SQL
✅ 10 flux métier documentés
...
```

---

## 🖼️ Recommandations Qualité

### Pour Rapport Professionnel

| Aspect | Setting |
|--------|---------|
| **Résolution** | Minimum 150 DPI, idéalement 300 DPI |
| **Format** | PNG (rapide) ou PDF (verrouillé) |
| **Taille fichier** | < 2MB par image |
| **Couleurs** | RGB (pas CMYK) |
| **Bordures** | Ajouter margin de 10px blanc |
| **Numérotation** | Figure 1, Figure 2, etc. |

### Export depuis mermaid.live

- **SVG** ← Meilleur compromis (vecteur, zoomable)
- **PNG** ← Rapide, classique
- **PDF** ← Pour rapport complet

---

## ✅ Checklist Avant Soumission

- [ ] Tous les diagrammes présents (8 minimum)
- [ ] Numéros d'ordre (Figure 1, Figure 2, etc.)
- [ ] Légendes explicatives sous chaque
- [ ] Police lisible (Taille 12 minimum)
- [ ] Couleurs cohérentes
- [ ] Pas de chevauchements
- [ ] Marges respectées (A4)
- [ ] PDF compilé sans erreurs
- [ ] Fichiers images < 5MB total
- [ ] Table des matières référence les figures

---

## 🚀 Scripts Automatisés (Optionnel)

### Si vous avez Node.js installé

```bash
# Installer mermaid-cli
npm install -g @mermaid-js/mermaid-cli

# Générer toutes les images
mmdc -i 01_Sequence_Login.mmd -o 01_Sequence_Login.png
mmdc -i 02_ERD_Tables.mmd -o 02_ERD_Tables.png
mmdc -i 03_UseCases.mmd -o 03_UseCases.png
mmdc -i 04_ClassDiagram.mmd -o 04_ClassDiagram.png
mmdc -i 05_Sequence_Mouvement.mmd -o 05_Sequence_Mouvement.png

# Avec meilleure qualité (SVG)
mmdc -i *.mmd -o diagrams_output/ -t dark --scale 2
```

Résultat : Dossier `diagrams_output/` avec tous les fichiers PNG/SVG

---

## 📧 Partage du Rapport

**Pour envoyer votre rapport** :

### Option 1 : PDF unique (Recommandé)
- Exporter `ALL_DIAGRAMS.html` → PDF
- Fusionner avec texte rapport
- Fichier `Rapport_Semaine2.pdf` prêt à envoyer

### Option 2 : Dossier complet
```
Rapport_Semaine2/
├── Rapport.docx (avec images intégrées)
├── images/
│   ├── 01_ERD.png
│   ├── 02_UseCase.png
│   └── ...
└── ALL_DIAGRAMS.html (pour référence interactive)
```

### Option 3 : Web (GitHub/Portfolio)
```bash
# Copier le dossier CONCEPTION/ complet
# Accès aux documents MD + HTML interactif
# Partageable via lien
```

---

## 🎓 Format Académique (Université)

Si c'est pour rendre à l'université :

```latex
\documentclass{article}
\usepackage{graphicx}

\section{Conception Technique}

\subsection{1. Diagramme Entité-Relation}
\begin{figure}[h!]
  \centering
  \includegraphics[width=\textwidth]{01_ERD.png}
  \caption{Relations entre tables (USERS, PRODUCTS, INVENTORY\_MOVEMENTS)}
  \label{fig:erd}
\end{figure}

\subsection{2. Cas d'Utilisation}
\begin{figure}[h!]
  \centering
  \includegraphics[width=\textwidth]{02_UseCases.png}
  \caption{12 cas d'utilisation couvrant tous les besoins}
  \label{fig:usecases}
\end{figure}
...
```

---

**Document complété le : 11/03/2026**  
**Prêt à insérer dans votre rapport ! 📄✅**
