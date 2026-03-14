# 📊 Diagrammes en Haute Résolution

Voir **ALL_DIAGRAMS.html** pour la visualisation complète interactive avec tous les diagrammes.

---

## 🎨 Fichiers Disponibles

### Format Mermaid (`.mmd`)
- `01_Sequence_Login.mmd` - Flux d'authentification
- `02_ERD_Tables.mmd` - Diagramme ER (tables & relations)
- `03_UseCases.mmd` - Cas d'utilisation
- `04_ClassDiagram.mmd` - Diagramme de classes
- `05_Sequence_Mouvement.mmd` - Flux création mouvement stock

### Format HTML (`.html`)
- **`ALL_DIAGRAMS.html`** ⭐ **PRINCIPAL**
  - Tous les diagrammes en une seule page
  - Interactif avec zoom/pan
  - Imprimable en PDF haute qualité
  - Responsive (mobile-friendly)

---

## 🚀 Comment Utiliser pour le Rapport

### **Option 1 : Visualisation Interactive (Recommandée)**

1. **Ouvrir le fichier** :
   ```bash
   # Windows
   double-click ALL_DIAGRAMS.html
   # Ou clic droit → Ouvrir avec navigateur
   ```

2. **Affichage** : Tous les diagrammes s'affichent avec navigation fluide

3. **Imprimer en PDF** :
   - Clic bouton 🖨️ "Imprimer / Exporter en PDF"
   - **Ou** : Ctrl+P → "Enregistrer en PDF"
   - Format : 100% optimisé pour rapport professionnel

### **Option 2 : Exporter depuis Mermaid Live** (Si vous voulez PNG/SVG)

Pour chaque fichier `.mmd` :

1. Aller sur [mermaid.live](https://mermaid.live)
2. Copier le contenu du fichier `.mmd`
3. Coller dans l'éditeur
4. **Exporter** : 
   - PNG (clic droit → Télécharger l'image)
   - SVG (haute résolution)
   - Copier comme image

### **Option 3 : Utiliser Mermaid-CLI** (Command Line)

Si vous avez Node.js :

```bash
# Installer mermaid-cli
npm install -g @mermaid-js/mermaid-cli

# Générer PNG à partir de .mmd
mmdc -i 01_Sequence_Login.mmd -o 01_Sequence_Login.png

# Générer SVG (meilleure qualité)
mmdc -i 01_Sequence_Login.mmd -o 01_Sequence_Login.svg -t dark
```

---

## 📋 Diagrammes dans le Rapport

### Structure Recommandée

```
RAPPORT
├── Semaine 2 : Conception Technique
│   ├── 1. Diagramme ER (ERD)
│   │   └── Image depuis ALL_DIAGRAMS.html
│   ├── 2. Cas d'Utilisation
│   │   └── Image depuis ALL_DIAGRAMS.html
│   ├── 3. Diagramme de Classes
│   │   └── Image depuis ALL_DIAGRAMS.html
│   ├── 4. Flux Séquence (4 flux principaux)
│   │   └── Images depuis ALL_DIAGRAMS.html
│   └── 5. Tableau Endpoints/RBAC
│       └── Copier-coller depuis HTML
```

---

## 🎯 Points Clés à Documenter

### ✅ À inclure dans le rapport

1. **ERD** :
   - 3 tables + relations 1:N
   - FK RESTRICT (intégrité)
   - Stock calculé dynamiquement

2. **Use Cases** :
   - 2 rôles (EMPLOYE vs RESPONSABLE)
   - 9 use cases couvrant tous besoins
   - RBAC sur chaque endpoint

3. **Classes** :
   - 7 entités + 3 services
   - Relations composition/dépendance
   - Repository Pattern

4. **Séquence** :
   - Login / Registration
   - CRUD Produits
   - Créer Mouvement (complexe)
   - Dashboard

5. **Endpoints** :
   - 7 endpoints principal
   - GET, POST, PUT, DELETE
   - RBAC enforcement
   - Authentication JWT

---

## 🖼️ Tips pour Captures d'Écran

### Meilleure Qualité

1. **Ouvrir ALL_DIAGRAMS.html** dans navigateur moderne
2. **Full page screenshot** :
   - Firefox : Clic droit → "Prendre une capture de page entière"
   - Chrome : DevTools (F12) → ⋮ → Capture de page entière
3. **Ou** : Imprimer en PDF → Très haute qualité

### Diagramme Individuel

1. Ouvrir ALL_DIAGRAMS.html
2. Scroll vers le diagramme souhaité
3. Clic droit → Inspecter
4. Copier le SVG (meilleure qualité)
5. Coller dans éditeur (Figma, Paint, etc.)

---

## 📐 Dimensions Recommandées pour Rapport

| Élément | Largeur | Hauteur | Format |
|---------|---------|---------|--------|
| **ERD** | 1000px | 600px | PNG/SVG |
| **Use Cases** | 1200px | 700px | PNG/SVG |
| **Classes** | 1400px | 800px | PNG/SVG |
| **Séquence** | 1000px | 900px | PNG/SVG |
| **Full Page** | A4 (210mm) | Variable | PDF |

---

## 🎨 Personnalisation des Couleurs

Si vous voulez modifier les couleurs dans le HTML :

```html
<!-- Dans ALL_DIAGRAMS.html, section <style> -->

.header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.diagram-card h2 {
    color: #667eea;  /* Changer la couleur des titres */
}

/* Ou directement dans les diagrammes Mermaid */
style Node fill:#couleur
```

---

## ✅ Checklist Rapport

- [ ] Tous les 5 diagrammes présents
- [ ] Haute résolution (min 150 DPI)
- [ ] Numérotés et légendés
- [ ] Explications texte pour chaque
- [ ] Cohérence visuelle (couleurs)
- [ ] PDF exporté avec succès
- [ ] Tailles fichiers raisonnables (< 5MB)

---

## 📞 Support Visibilité

Navigateur recommandé : **Chrome / Firefox / Edge**
- ✅ Support Mermaid
- ✅ Impression PDF stable
- ✅ Export haute qualité

---

**Dernière mise à jour : 11/03/2026**

Pour toute question, consultez les fichiers `.md` principaux :
- `CONCEPTION/01_ERD_Tables_Relations.md`
- `CONCEPTION/02_Diagramme_Cas_Utilisation.md`
- `CONCEPTION/03_Diagramme_Classes.md`
- `CONCEPTION/04_Diagrammes_Sequence.md`
