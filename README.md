# 📚 TIPE Logbook - Version Améliorée avec Gestion de Fichiers

Site web pour le suivi opérationnel d'un TIPE (Travail d'Initiative Personnelle Encadré) en classe préparatoire MPI, avec système de gestion de fichiers intégré.

## 🚀 Nouvelles Fonctionnalités

### ✨ Gestion de Fichiers
- **Upload de fichiers multiples** : PDF, code source, CSV, images, liens externes
- **Visualisation intégrée** : 
  - PDFs dans un viewer intégré
  - Code avec coloration syntaxique (Python, JavaScript, C++, Java, C, etc.)
  - **CSV avec tableau interactif et recherche**
  - **Code C avec compilation et exécution en temps réel**
  - Images en pleine résolution
  - Liens externes avec ouverture en nouvel onglet
- **Bibliothèque de fichiers** : Page dédiée avec tous les fichiers regroupés
- **Fichiers attachés aux articles** : Liez des fichiers à vos articles pour une organisation optimale
- **Filtrage par type** : Filtrez facilement par PDF, Code, CSV, Images, etc.

### 📝 Améliorations Articles
- Système de badges/tags colorisés
- Résumés courts pour chaque article
- Sections repliables (style VSCode)
- Tri par date ou titre
- Filtrage par tags

### 🔐 Administration
- Interface d'administration sécurisée par mot de passe
- Onglets séparés pour Articles et Fichiers
- Édition sans suppression
- Publication GitHub en un clic

## 📁 Structure des Fichiers

```
volte-main/
├── index.html          # Page principale (logbook)
├── files.html          # Bibliothèque de fichiers
├── admin.html          # Panel d'administration
├── style.css           # Styles CSS
├── script.js           # Logique JavaScript
├── data.json           # Base de données des articles
└── files.json          # Base de données des fichiers
```

## 🛠️ Installation et Déploiement

### Déploiement sur GitHub Pages

#### Étape 1 : Créer un dépôt GitHub
1. Allez sur [GitHub](https://github.com) et connectez-vous
2. Cliquez sur **"New"** pour créer un nouveau dépôt
3. Nommez votre dépôt (ex: `tipe-logbook`)
4. Cochez **"Public"**
5. Cliquez sur **"Create repository"**

#### Étape 2 : Uploader les fichiers
Uploadez **tous** les fichiers suivants :
- `index.html`
- `files.html`
- `admin.html`
- `style.css`
- `script.js`
- `data.json`
- `files.json`

#### Étape 3 : Activer GitHub Pages
1. Dans **Settings** → **Pages**
2. Source : **main** branch
3. Sauvegardez et attendez 2-5 minutes
4. Site disponible à : `https://[username].github.io/[repo-name]/`

## 🔑 Configuration

### Mot de passe administrateur
**Mot de passe par défaut : `mpi2025`**

Pour le changer :
1. Ouvrez `script.js`
2. Ligne 19 : changez `"mpi2025"` dans `checkAdmin()`
3. Ligne 151 : changez `"mpi2025"` dans `initAdmin()`

### Configuration GitHub API
Dans le panel admin, renseignez :
- **User** : Votre username GitHub
- **Repo** : Nom de votre dépôt
- **Token** : Votre token GitHub ([créer un token](https://github.com/settings/tokens))
  - Permissions requises : `repo` (full control)

## 📖 Guide d'Utilisation

### Accéder à l'Administration
1. Cliquez sur la zone rouge en bas à droite (invisible mais cliquable)
2. Entrez le mot de passe : `mpi2025`
3. Vous accédez au panel d'administration

### Gérer les Articles

#### Ajouter un article
1. Dans l'onglet **"Articles"**
2. Remplissez :
   - Titre de l'étape
   - Date
   - Balises/tags (nom + couleur)
   - Résumé court
   - Contenu (HTML accepté)
3. Attachez des fichiers (optionnel)
4. Cliquez sur **"Sauvegarder en mémoire"**
5. Cliquez sur **"POUSSER LES MODIFICATIONS"** pour publier

#### Modifier un article
1. Dans la liste "Historique", cliquez sur l'article
2. Modifiez les champs
3. Sauvegardez et poussez

### Gérer les Fichiers

#### Ajouter un fichier
1. Onglet **"Fichiers"**
2. Nom du fichier
3. Type :
   - **📄 PDF** : Collez l'URL du PDF ou le contenu Base64
   - **💻 Code** : Choisissez le langage et collez le code
   - **🖼️ Image** : URL de l'image
   - **🔗 Lien externe** : URL du lien
4. Description (optionnelle)
5. Cliquez sur **"Enregistrer le fichier"**

#### Exemples de fichiers

**PDF depuis URL :**
```
https://example.com/document.pdf
```

**PDF en Base64 :**
```
data:application/pdf;base64,JVBERi0xLjQKJeLjz9MK...
```

**Code Python :**
```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))
```

**Image :**
```
https://example.com/image.png
```

**CSV :**
```csv
nom,prenom,age,ville
Dupont,Jean,25,Paris
Martin,Sophie,30,Lyon
Durand,Pierre,28,Marseille
```

**Code C avec exécution :**
```c
#include <stdio.h>

int main() {
    int n;
    printf("Entrez un nombre: ");
    scanf("%d", &n);
    printf("Fibonacci(%d) = %d\n", n, fibonacci(n));
    return 0;
}

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n-1) + fibonacci(n-2);
}
```

#### Visualiser un fichier CSV
Le viewer CSV offre :
- **Tableau interactif** avec colonnes triables
- **Barre de recherche** pour filtrer les données
- **Statistiques** : nombre de lignes et colonnes
- Support des virgules et guillemets dans les données

#### Exécuter du code C
Pour les fichiers de code C :
1. Le code s'affiche avec coloration syntaxique
2. Un **runner interactif** apparaît en dessous
3. Vous pouvez fournir des entrées (stdin)
4. Cliquez sur **"▶️ Compiler et Exécuter"**
5. La sortie s'affiche avec :
   - Messages de compilation
   - Temps d'exécution
   - Utilisation mémoire
   - Sortie du programme

**Note** : Le runner C utilise l'API JDoodle (nécessite Internet)

#### Attacher des fichiers aux articles
1. Dans l'édition d'un article
2. Section **"📎 Fichiers attachés"**
3. Cliquez sur **"+ Attacher un fichier"**
4. Cochez les fichiers à attacher
5. Cliquez sur **"Attacher les fichiers sélectionnés"**

### Visualiser les Fichiers

#### Depuis un article
- Cliquez sur le nom du fichier dans la section "📎 Fichiers joints"

#### Depuis la bibliothèque
1. Cliquez sur **"📚 Bibliothèque de fichiers"** (en haut)
2. Filtrez par type si nécessaire
3. Cliquez sur **"👁️ Visualiser"**

## 💡 Astuces et Bonnes Pratiques

### 📊 Travailler avec des fichiers CSV
- **Format standard** : Utilisez des virgules comme séparateurs
- **En-têtes** : La première ligne doit contenir les noms de colonnes
- **Guillemets** : Utilisez des guillemets pour les valeurs contenant des virgules
- **Exemple** :
  ```csv
  date,experience,resultat,commentaire
  2026-02-10,Mesure de résistance,45.2,"Conditions normales, température 20°C"
  2026-02-15,Test de conductivité,12.8,Échantillon A
  ```
- La recherche fonctionne sur toutes les colonnes

### 🔧 Exécuter du code C
- **Limites** : Temps d'exécution max ~5 secondes (API JDoodle)
- **Bibliothèques** : stdio.h, stdlib.h, math.h, string.h disponibles
- **Entrées** : Utilisez scanf() et fournissez les données dans "Entrée standard"
- **Exemple avec stdin** :
  ```c
  // Code
  int n;
  scanf("%d", &n);
  printf("Résultat: %d\n", n * 2);
  
  // Dans "Entrée standard", tapez:
  42
  
  // Sortie:
  // Résultat: 84
  ```
- **Debugging** : Les erreurs de compilation s'affichent en rouge
- **Alternatives** : Pour des programmes complexes, utilisez un IDE local

### Organisation des fichiers
- Utilisez des noms descriptifs : `rapport_semaine_3.pdf` plutôt que `doc.pdf`
- Ajoutez des descriptions pour faciliter la recherche
- Liez les fichiers aux articles correspondants

### Rédaction des articles
- Utilisez des balises cohérentes : "Biblio", "Expérimentation", "Résultats"
- Écrivez des résumés courts et clairs
- Utilisez le HTML pour la mise en forme :
  ```html
  <p>Paragraphe</p>
  <strong>Gras</strong>
  <br> <!-- Saut de ligne -->
  <a href="url">Lien</a>
  <ul><li>Liste</li></ul>
  ```

### Upload de PDFs
Pour convertir un PDF en Base64 :
1. Utilisez un service en ligne : [base64.guru](https://base64.guru/converter/encode/pdf)
2. Ou utilisez JavaScript dans la console :
   ```javascript
   // Sélectionnez un fichier PDF
   const file = document.querySelector('input[type="file"]').files[0];
   const reader = new FileReader();
   reader.onload = () => console.log(reader.result);
   reader.readAsDataURL(file);
   ```

### Code avec coloration syntaxique
Les langages supportés :
- Python, JavaScript, Java, C++, C
- HTML, CSS, SQL
- Bash, MATLAB
- Et bien d'autres via Highlight.js

## 🔧 Personnalisation

### Changer les couleurs
Dans `style.css`, modifiez les variables :
```css
:root { 
    --bg: #1e1e1e;        /* Fond principal */
    --sidebar: #252526;   /* Fond cartes */
    --text: #d4d4d4;      /* Texte */
    --accent: #007acc;    /* Couleur accent */
    --border: #3c3c3c;    /* Bordures */
}
```

### Modifier les icônes de fichiers
Dans `script.js`, fonction `getFileIcon()` :
```javascript
function getFileIcon(type) {
    const icons = {
        'pdf': '📄',
        'code': '💻',
        'image': '🖼️',
        'link': '🔗',
        'other': '📎'
    };
    return icons[type] || '📎';
}
```

## 🐛 Dépannage

### Les fichiers ne s'affichent pas
- Vérifiez que `files.json` existe et contient des données
- Vérifiez que vous avez bien poussé sur GitHub
- Videz le cache du navigateur (Ctrl+Shift+R)

### Le PDF ne se charge pas
- Si c'est une URL, vérifiez qu'elle est accessible
- Si c'est du Base64, vérifiez qu'il commence par `data:application/pdf;base64,`
- Certains navigateurs bloquent les iframes, utilisez plutôt des URLs

### La coloration syntaxique ne fonctionne pas
- Vérifiez que Highlight.js est bien chargé
- Vérifiez que le langage est correctement sélectionné
- Rechargez la page

### Erreur lors du push GitHub
- Vérifiez votre token GitHub
- Vérifiez que le token a les bonnes permissions (`repo`)
- Vérifiez que le nom d'utilisateur et du dépôt sont corrects

## 📊 Structure des Données

### Article (data.json)
```json
{
  "id": 1234567890,
  "title": "Titre de l'article",
  "date": "2026-02-13",
  "badges": [
    {"text": "Biblio", "color": "#c01c28"}
  ],
  "summary": "Résumé court",
  "content": "<p>Contenu HTML</p>",
  "attachedFiles": [9876543210]
}
```

### Fichier (files.json)
```json
{
  "id": 9876543210,
  "name": "Mon fichier",
  "type": "pdf",
  "content": "https://... ou data:...",
  "description": "Description du fichier",
  "language": "python",
  "createdAt": "2026-02-13T10:30:00Z"
}
```

## 🎯 Fonctionnalités Futures (Suggestions)

- Export en PDF du logbook complet
- Recherche full-text dans les articles
- Graphiques de progression
- Tags automatiques basés sur le contenu
- Upload direct de fichiers (sans passer par Base64)
- Versionning des articles

## 📝 Licence

Ce projet est libre d'utilisation pour un usage personnel et éducatif.

## 👤 Auteur

Version améliorée créée pour Natan Ruiz - MPI 2025
Avec système de gestion de fichiers intégré

---

**🎓 Bon courage pour votre TIPE !**
