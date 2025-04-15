# Plan d'Implémentation - Simulateur PER Ramify

## 1. Objectif

Implémenter le simulateur PER conformément au PRD (`prd.md`), en utilisant HTML, CSS (fourni), et JavaScript Vanilla. Le simulateur sera intégrable dans Webflow via un Code Embed.

## 2. Structure des Fichiers

```
/
├── index.html             # Structure HTML du simulateur
├── js/
│   └── main.js            # Logique JavaScript (calculs, UI, graphique)
├── css-ramify.css         # Fichier CSS fourni par le client (NE PAS MODIFIER)
├── info-dump.md           # Données brutes, règles, contexte (source d'information)
├── prd.md                 # Product Requirements Document (généré)
└── plan.md                # Ce fichier
```

*Note : Le fichier `css-ramify.css` est à la racine car il est fourni et on évite de le déplacer. `index.html` le liera directement.* 
*Aucun fichier `css/main.css` ne sera créé, car le style principal est fourni.*

## 3. Technologies

-   **HTML5:** Pour la structure sémantique.
-   **CSS3:** Utilisation du fichier `css-ramify.css` fourni pour le style principal. Styles additionnels minimes si nécessaires via balises `<style>` dans l'HTML ou directement en inline (à éviter).
-   **JavaScript (ES6+):** Pour toute la logique de calcul, la manipulation du DOM, la gestion des événements et la génération du graphique.
-   **Chart.js (v4.x):** Bibliothèque JavaScript pour afficher le graphique comparatif de l'évolution du capital. Elle sera chargée via CDN dans `index.html`.

## 4. Étapes d'Implémentation

1.  **Structure HTML (`index.html`) - Refonte Multi-étapes:**
    *   **Diviser le formulaire :** Réorganiser les `div.form-group` existantes en sections logiques (ex: Infos Perso, Revenus, Projet PER, Contrat) et les encapsuler dans des `div` distinctes avec la classe `step` et un ID unique (ex: `id="step-1"`).
    *   **Affichage Initial :** Configurer le CSS (voir étape CSS) pour que seule la première étape (`step-1`) soit visible initialement.
    *   **Navigation :** Ajouter une `div` pour les boutons de navigation sous le formulaire (ou dynamiquement dans chaque étape via JS). Inclure les boutons `<button type="button" id="prev-btn" class="button is-light">Précédent</button>` et `<button type="button" id="next-btn" class="button">Suivant</button>`.
    *   **Zone de Résultats :** Garder la `div#results` en dehors des étapes, elle sera affichée après la dernière étape.
    *   Conserver le `<canvas>`, les liens CSS/JS et CDN Chart.js.

2.  **Styles CSS (`<style>` dans `index.html` ou fichier séparé si besoin) - Gestion des Étapes:**
    *   **Visibilité :** Ajouter la règle de base : `.step { display: none; }`.
    *   **Étape Active :** Ajouter une classe `.active` (ex: `.step.active { display: block; /* ou grid/flex si layout complexe */ }`) qui sera gérée par JavaScript.
    *   **Style Navigation :** Styliser les boutons Précédent/Suivant en utilisant les classes Ramify (`.button`, `.is-light`, `.is-gold`) ou des styles personnalisés si nécessaire pour s'aligner sur le design premium.
    *   **(Optionnel) Transitions :** Ajouter des transitions CSS (ex: `opacity`, `transform`) pour un changement d'étape plus fluide.

3.  **Logique JavaScript (`js/main.js`) - Gestion des Étapes et Données:**
    *   **Variables Globales :** Ajouter des variables pour suivre l'étape actuelle (`let currentStep = 1;`), stocker les éléments d'étape (`const stepElements = document.querySelectorAll('.step');`), les boutons de nav, et un objet pour stocker les données (`let formData = {};`).
    *   **Fonction `showStep(stepIndex)` :**
        *   Masquer toutes les étapes.
        *   Afficher l'étape `stepIndex` en ajoutant la classe `.active`.
        *   Mettre à jour l'état des boutons de navigation (voir fonction suivante).
    *   **Fonction `updateNavButtons()` :**
        *   Masquer/afficher/désactiver le bouton "Précédent" (invisible à l'étape 1).
        *   Changer le texte du bouton "Suivant" en "Simuler mon PER" à la dernière étape du formulaire.
    *   **Fonction `collectStepData(stepIndex)` :**
        *   Sélectionner les inputs de l'étape `stepIndex`.
        *   Lire leurs valeurs et les stocker dans l'objet `formData`.
        *   **Validation (Optionnel mais recommandé) :** Ajouter une fonction `validateStep(stepIndex)` qui vérifie les inputs de l'étape avant de permettre de passer à la suivante.
    *   **Écouteurs d'Événements (Navigation) :**
        *   Sur clic "Suivant":
            *   Appeler `collectStepData(currentStep)`.
            *   (Optionnel : Appeler `validateStep(currentStep)`. Si invalide, stopper).
            *   Si ce n'est pas la dernière étape : `currentStep++`, `showStep(currentStep)`.
            *   Si c'est la dernière étape : Appeler `runSimulation()`.
        *   Sur clic "Précédent": `currentStep--`, `showStep(currentStep)`.
    *   **Modification de `runSimulation()` :**
        *   **Supprimer l'appel à `getUserInputs()` au début.**
        *   **Utiliser `formData` :** Modifier la fonction pour qu'elle lise les valeurs nécessaires directement depuis l'objet global `formData` qui a été rempli progressivement.
        *   Le reste de la logique de calcul et l'appel à `displayResults` / `updateChart` restent inchangés.
    *   **Initialisation :** Appeler `showStep(1)` au chargement de la page pour afficher la première étape.

4.  **Affichage des Résultats (`js/main.js`, `index.html`):**
    *   La fonction `displayResults` reste la même pour remplir les spans de résultats.
    *   **Structure à Onglets Post-Simulation :** La `div#results` sera restructurée pour contenir :
        *   Une navigation par onglets ("Résultats", "Données").
        *   Un conteneur pour le contenu de l'onglet "Résultats" (celui actuellement généré).
        *   Un conteneur pour le contenu de l'onglet "Données" (duplication des champs du formulaire initial).
    *   La `div#results` et ses onglets sont masqués initialement et affichés uniquement après la *première* exécution réussie de `runSimulation`.
    *   Ajouter une note dans l'onglet "Résultats" expliquant comment modifier les données.

5.  **Logique JavaScript (`js/main.js`) - Gestion des Onglets et Recalcul:**
    *   **Gestion des Onglets :**
        *   Ajouter des écouteurs d'événements sur les boutons d'onglets.
        *   Fonction `showTabContent(tabId)` pour afficher/masquer les conteneurs de contenu correspondants.
        *   Mettre à jour l'état actif/inactif des boutons d'onglets.
    *   **Stockage/Remplissage Données :**
        *   Après la première `runSimulation`, stocker l'objet `inputs` utilisé.
        *   Lorsque l'onglet "Données" est affiché pour la première fois, remplir les champs dupliqués avec les valeurs stockées.
    *   **Recalcul Conditionnel :**
        *   Ajouter un flag (`let dataModified = false;`) ou un mécanisme pour détecter les changements dans les champs de l'onglet "Données" (via écouteurs `change` sur ces inputs dupliqués).
        *   Modifier l'écouteur du clic sur l'onglet "Résultats":
            *   Si l'onglet précédent était "Données" ET `dataModified` est `true`:
                *   Lire les nouvelles valeurs de l'onglet "Données".
                *   Convertir ces valeurs en un nouvel objet `inputs`.
                *   Appeler `runSimulation(newInputs)`.
                *   Réinitialiser `dataModified = false;`.
            *   Afficher le contenu de l'onglet "Résultats".
    *   **Modification de `runSimulation(inputs)`:**
        *   La fonction acceptera maintenant un objet `inputs` en paramètre.
        *   Si appelée sans paramètre (première exécution), elle lira les données depuis `formData` comme avant.
        *   Si appelée avec `inputs` (recalcul), elle utilisera cet objet directement.
        *   S'assurer que `inputs` est bien stocké pour le pré-remplissage ultérieur.

6.  **Graphique (`js/main.js`):**
    *   La fonction `updateChart` reste la même, appelée par `runSimulation`.

7.  **Finalisation et Tests:**
    *   Tester le parcours initial multi-étapes.
    *   Tester l'affichage des résultats et des onglets.
    *   Tester le passage à l'onglet "Données" et la modification des champs.
    *   Tester le retour à l'onglet "Résultats" et la mise à jour (ou non-mise à jour si rien n'a changé).
    *   Vérifier la cohérence des calculs après modification.

## 6. Considérations

-   **Validation des Étapes :** Implémenter une validation à chaque clic sur "Suivant" améliorera l'UX en signalant les erreurs tôt.
-   **Performance :** L'impact sur la performance devrait être minime car les calculs lourds ne sont effectués qu'à la fin.
-   **Intégrité des Calculs :** Porter une attention particulière à la modification de `runSimulation` pour s'assurer qu'elle utilise correctement les données de `formData` sans altérer les algorithmes de calcul.

## 7. Étapes d'Implémentation

1.  **Structure HTML (`index.html`):**
    *   Créer la structure de base du formulaire avec tous les champs d'input définis dans le PRD (âge, revenus, situation, etc.). Utiliser les types d'input appropriés (`number`, `select`, `radio`, `checkbox`).
    *   Ajouter des `div` ou autres conteneurs pour afficher les résultats (Année en cours, Échéance, Comparaison Ramify).
    *   Inclure des `<span>` avec des IDs spécifiques pour chaque valeur de sortie (ex: `<span id="tmi-output"></span>`).
    *   Intégrer un élément `<canvas>` pour le graphique Chart.js.
    *   Ajouter les tooltips (potentiellement avec des `<span>` ou `<div>` cachés/affichés en JS ou via des attributs `title`).
    *   Lier le fichier `css-ramify.css`.
    *   Inclure la bibliothèque Chart.js via CDN.
    *   Lier le fichier `js/main.js` à la fin du `<body>`.
    *   Ajouter les CTAs.

2.  **Logique de Base (`js/main.js`):**
    *   **Récupération des Inputs :** Fonction pour lire et valider les valeurs des champs du formulaire.
    *   **Constantes et Hypothèses :** Définir les constantes (âge retraite, taux fixes, barèmes fiscaux initiaux, données Ramify, etc.) basées sur `info-dump.md` et le PRD.
    *   **Fonctions Utilitaires :**
        *   `calculateIncomeTax(income, parts, fiscalYear)`: Calcule l'impôt sur le revenu pour une année donnée, en ajustant le barème pour l'inflation.
        *   `calculateDeductionCeiling(income, taxableIncome, status, pass)`: Calcule le plafond de déduction PER.
        *   `calculateCapitalGrowth(initialCapital, annualPayments, netReturn, duration, entryFee)`: Calcule la croissance du capital sur une durée donnée (formule des versements périodiques composés). *Attention : S'assurer que cette fonction calcule correctement la somme des versements capitalisés année par année.* 
        *   `formatCurrency(value)`: Met en forme un nombre en devise (€).

3.  **Logique de Simulation (`js/main.js`):**
    *   **Fonction Principale `runSimulation()`:**
        *   Récupère les inputs.
        *   Calcule la durée d'épargne.
        *   Initialise les tableaux/objets pour stocker les résultats annuels (revenus, impôts, versements, capital, etc.).
        *   **Boucle Annuelle (de 1 à `duration`):**
            *   Calcule le revenu de l'année `n` (selon progression).
            *   Calcule le revenu imposable (selon frais réels/forfait).
            *   Ajuste le barème fiscal pour l'année `n` (inflation).
            *   Calcule l'impôt *sans* PER.
            *   Calcule le plafond de déduction pour l'année `n`.
            *   Calcule le versement PER pour l'année `n` (selon progression).
            *   Détermine le versement déductible (min du versement et du plafond).
            *   Calcule le revenu imposable *avec* PER.
            *   Calcule l'impôt *avec* PER.
            *   Stocke l'économie d'impôt de l'année `n`.
            *   Stocke l'effort d'épargne réel de l'année `n`.
            *   Stocke TMI et taux moyen (sans PER) pour l'année `n`.
        *   Calcule le capital total brut et net (contrat utilisateur ET Ramify) à l'échéance en utilisant `calculateCapitalGrowth` avec les bons paramètres (rendements nets respectifs, frais d'entrée).
        *   Calcule la plus-value brute (contrat utilisateur ET Ramify).
        *   Calcule l'impact total des frais (en comparant avec un calcul *sans* frais de gestion, donc rendement brut).
        *   Calcule l'impact total des impôts à la sortie (TMI retraite estimée sur versements + PFU sur plus-value).
        *   Calcule l'économie d'impôt totale.
        *   Calcule l'effort d'épargne réel total.
        *   Calcule les 3 options de sortie (Rente, Capital, Fractionné).
        *   Prépare les données pour le graphique.
        *   Appelle la fonction d'affichage des résultats.
        *   Appelle la fonction de mise à jour du graphique.

4.  **Mise à Jour de l'UI (`js/main.js`):**
    *   **Fonction `displayResults(results)`:**
        *   Met à jour le contenu des `<span>` ou `<div>` dédiés avec les résultats formatés (année en cours, échéance, comparaison).
        *   Gère l'affichage des messages d'alerte.
    *   Ajouter des écouteurs d'événements (`event listeners`) sur le formulaire (submit) ou les champs (change/input) pour déclencher `runSimulation()`.

5.  **Graphique (`js/main.js`):**
    *   **Fonction `updateChart(chartData)`:**
        *   Prépare les `datasets` pour Chart.js : un pour le contrat utilisateur, un pour Ramify, montrant l'évolution du capital *brut* année par année.
        *   **Correction Cruciale :** La boucle pour générer les données annuelles du graphique doit utiliser `calculateCapitalGrowth` correctement pour *chaque année intermédiaire*, en passant la durée cumulée (1, 2, ..., `duration`) et les versements correspondants jusqu'à cette année-là. Ne pas recalculer pour la durée totale à chaque itération.
        *   Crée ou met à jour l'instance Chart.js avec les nouvelles données.
    *   Initialiser le graphique avec des données vides ou un message par défaut.

6.  **Finalisation et Tests:**
    *   Tester exhaustivement avec différents scénarios d'input.
    *   Vérifier la cohérence des calculs avec les exemples de `info-dump.md`.
    *   Valider l'affichage responsive.
    *   Nettoyer le code et ajouter des commentaires si nécessaire.

## 7. Considérations

-   **Performance des Calculs :** La boucle annuelle peut être intensive. Optimiser si nécessaire (éviter recalculs redondants).
-   **Gestion des Erreurs :** Ajouter une validation basique des inputs (ex: âge > 18, revenus >= 0) et afficher des messages d'erreur clairs si nécessaire.
-   **Complexité des Formules :** Double-vérifier l'implémentation des formules fiscales et financières fournies.
-   **Dépendance CDN :** S'assurer que la connexion Internet est disponible pour charger Chart.js. Alternative : inclure la librairie localement. 