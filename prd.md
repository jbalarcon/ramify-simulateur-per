# Product Requirements Document (PRD) - Simulateur PER Ramify

## 1. Introduction

Ce document décrit les exigences fonctionnelles et non fonctionnelles pour le simulateur de Plan d'Épargne Retraite (PER) destiné à Ramify. L'objectif est de fournir un outil interactif permettant aux utilisateurs d'estimer les avantages fiscaux, le capital accumulé et les options de sortie d'un PER, tout en comparant les résultats potentiels avec une offre Ramify. Le simulateur sera intégré à une page Webflow via un Code Embed.

## 2. Objectifs

-   **Informer :** Éduquer les utilisateurs sur le fonctionnement du PER, ses avantages fiscaux et son potentiel de croissance.
-   **Simuler :** Permettre aux utilisateurs de projeter les résultats financiers d'un investissement PER basé sur leur situation personnelle.
-   **Comparer :** Mettre en évidence les avantages potentiels de l'offre Ramify (performances, frais) par rapport aux offres standards du marché (courtiers en ligne, banques/assureurs traditionnels).
-   **Convertir :** Inciter les utilisateurs à ouvrir un PER chez Ramify ou à prendre contact avec un conseiller.

## 3. Personas Cibles

-   Particuliers (salariés, indépendants, retraités) souhaitant préparer leur retraite.
-   Personnes cherchant à optimiser leur fiscalité via des versements déductibles.
-   Individus comparant différentes offres PER sur le marché.

## 4. Exigences Fonctionnelles

### 4.1. Inputs Utilisateur

Le simulateur requiert les informations suivantes de l'utilisateur (détaillées dans `info-dump.md`) :

-   Âge actuel
-   Situation professionnelle (Salarié, Retraité, Indépendant)
-   Revenus nets annuels avant impôts du foyer
-   Nombre de parts fiscales du foyer
-   Option pour les frais réels (Oui/Non)
    -   Si Oui : Montant annuel des frais réels
-   Évolution annuelle estimée des revenus (Faible, Moyenne, Forte - sauf pour Retraité où elle est fixe)
-   Existence d'un PER (Oui/Non)
    -   Si Oui : Investissement initial, versements 2025, versements mensuels prévus
    -   Si Non : Investissement initial prévu, versements mensuels prévus
-   Type de contrat PER envisagé (Courtier en ligne, Banque/Assureur traditionnel)
-   Profil de risque / Répartition (Défensif, Équilibré, Agressif)

Des tooltips explicatifs seront présents pour guider l'utilisateur.

### 4.2. Calculs et Logique Métier

Le simulateur effectuera les calculs suivants (basés sur les formules et hypothèses de `info-dump.md`) :

-   Durée d'épargne (jusqu'à 64 ans).
-   Évolution annuelle des revenus et des versements.
-   Revenu imposable annuel (avec/sans abattement forfaitaire ou frais réels).
-   Calcul de l'impôt sur le revenu annuel (avant et après versements PER) en utilisant le barème progressif ajusté pour l'inflation.
-   Calcul de la Tranche Marginale d'Imposition (TMI) et du taux moyen d'imposition annuels.
-   Calcul du plafond de déduction PER annuel (selon statut professionnel).
-   Calcul de l'économie d'impôt annuelle et totale.
-   Calcul de l'effort d'épargne réel annuel et total.
-   Calcul du capital accumulé à la retraite (brut et net de frais/impôts) pour le contrat choisi ET pour Ramify, en considérant :
    -   Frais d'entrée (selon type de contrat).
    -   Rendements nets (selon type de contrat et profil).
    -   Versements initiaux et périodiques (capitalisés).
-   Calcul de la plus-value brute.
-   Calcul de l'impact des frais et des impôts à la sortie (TMI à la retraite estimée, PFU sur plus-values).
-   Calcul des montants pour les 3 options de sortie (Rente viagère, Capital unique, Capital fractionné sur 10 ans) après impôts.

### 4.3. Outputs Affichés

Le simulateur présentera les résultats suivants :

-   **Pour l'année en cours :**
    -   Impôts avant/après versements PER.
    -   Économie d'impôt réalisée.
    -   Effort d'épargne réel.
    -   TMI et Taux moyen d'imposition.
    -   Plafond de déduction PER.
-   **À l'échéance (retraite) :**
    -   **Capital Total Brut :** Total Versements, Plus-value.
    -   **Capital Net (après frais et impôts) :** Impact des Frais, Impact des Impôts, Économie d'impôt totale cumulée, Effort d'épargne réel total.
    -   **Options de Sortie (montants nets) :** Rente viagère annuelle, Capital unique, Capital fractionné annuel (sur 10 ans).
-   **Comparaison Ramify :** Pour chaque output pertinent à l'échéance, afficher la valeur simulée avec Ramify et la différence (en % ou valeur absolue) par rapport au contrat choisi par l'utilisateur (ex: "Avec Ramify, vous auriez X € (+Y%)").

### 4.4. Interface Utilisateur (UI) et Expérience Utilisateur (UX)

-   Interface claire et intuitive, intégrée dans le style de Ramify (via `css-ramify.css`).
-   **Expérience Multi-Étapes Initiale :** Le formulaire initial sera divisé en plusieurs étapes logiques (Informations Personnelles, Détails Revenus, Projet PER, Détails Contrat) pour guider l'utilisateur.
-   **Navigation Fluide (Initiale) :** Des boutons "Suivant" et "Précédent" clairs permettront de naviguer entre les étapes initiales. Le bouton "Suivant" de la dernière étape deviendra "Simuler mon PER".
-   **(Optionnel) Transitions :** Des transitions ou animations subtiles pourront être ajoutées entre les étapes.
-   Utilisation d'icônes "❓" pour afficher les tooltips.
-   **Affichage Post-Simulation avec Onglets :** Après la simulation initiale, les résultats seront affichés dans un onglet "Résultats". Un second onglet "Données" permettra à l'utilisateur de revoir et modifier ses informations initiales.
-   **Mise à Jour Dynamique :** En retournant sur l'onglet "Résultats" après avoir modifié des informations dans l'onglet "Données", la simulation sera automatiquement relancée avec les nouvelles valeurs et les résultats/graphique mis à jour.
-   **Information Claire :** Une note dans l'onglet "Résultats" informera l'utilisateur de la possibilité de modifier ses données.
-   Graphique comparatif interactif montrant l'évolution du capital (Contrat choisi vs. Ramify).
-   Messages d'alerte clairs (dépassement plafond, risque profil agressif).
-   Appels à l'action (CTA) clairs en fin de simulation :
    -   "Ouvrir un PER Ramify"
    -   "Échanger avec un Conseiller"
    -   Lien texte vers la page produit PER.
-   **Optimisation UX :** Si possible, pré-remplir les informations du simulateur dans le formulaire d'ouverture de compte ou de prise de RDV si l'utilisateur clique sur les CTAs correspondants.

## 5. Exigences Non Fonctionnelles

-   **Performance :** Calculs rapides et affichage fluide des résultats.
-   **Compatibilité :** Fonctionnement optimal sur les navigateurs web modernes (Chrome, Firefox, Safari, Edge). Responsive design pour affichage sur mobile et tablette.
-   **Intégration :** Facilement intégrable dans une page Webflow via un élément "Code Embed".
-   **Maintenabilité :** Code clair, commenté (si nécessaire pour les parties complexes) et structuré pour faciliter les mises à jour (ex: changement de barème fiscal, taux, etc.).
-   **Sécurité :** Pas de stockage de données personnelles côté client ou serveur (calculs effectués dans le navigateur).

## 6. Hypothèses et Approximations Clés

(Référence : `info-dump.md`)

-   Âge de départ à la retraite fixe : 64 ans.
-   Inflation annuelle fixe (ex: 1.5%) pour l'évolution des revenus des retraités et l'ajustement des tranches fiscales.
-   Abattement moyen de 40% pour les indépendants pour le calcul du plafond.
-   Fiscalité à la sortie simplifiée : TMI à la retraite = TMI finale estimée, PFU de 30% sur plus-values, Rente basée sur taux de conversion fixe et fraction imposable fixe.
-   Rendements et frais fixes basés sur les hypothèses fournies pour chaque type de contrat et profil.
-   Progression des versements proportionnelle à la progression des revenus (si activé).

## 7. Livrables

-   Fichier HTML (`index.html`) contenant la structure du simulateur.
-   Fichier CSS (`css/main.css`) contenant les styles (basé sur `css-ramify.css`).
-   Fichier JavaScript (`js/main.js`) contenant la logique de calcul, l'interaction et l'affichage du graphique.
-   Ce document PRD (`prd.md`).
-   Un plan d'implémentation (`plan.md`). 