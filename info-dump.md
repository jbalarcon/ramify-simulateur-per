# Contexte
Le client est Ramify : https://www.ramify.fr/

# Simulateur

Le simulateur permettrait de calculer

- Sur l’année en cours
    - Plafond déduction
    - Impôts sur l’année sans / avec PER, effort épargne réel correspondant
    - TMI et taux moyen d’imposition
- A l’échéance (retraite)
    - Capital total brut
        - Total versements
        - Plus value
    - Capital net frais et impôts
        - Impact frais
        - Impact impôts
        - Economie d’impôt réalisée
        - Effort épargne réel
    - Montant capital pour les 3 types de sortie
        - 100% en Rente
        - 100% en Capital
        - Capital fractionné sur 10 ans

Et il inclurait une **comparaison avec Ramify** (”Avec Ramify vous auriez…”) en mettant en avant vos performances / frais.

Ce simulateur pourrait être très compliqué donc j’ai fait une série d’hypothèses et approximations pour essayer d’en faire au moins une première version plus "simple".

Si possible, l’idée serait d’itérer plus tard en étant plus précis.


---

<aside>

## Tableau des règles, données, approx., hypothèses et références

`(à vérifier par expert Ramify)`

| **Catégorie** | **Élément** | **Règle / Donnée / Hypothèse** | **Source / Justification** | **Commentaire / Simplification** |
| --- | --- | --- | --- | --- |
| **Âge de départ à la retraite** | Âge de départ | 64 ans | Réforme des retraites 2023 (âge légal pour les personnes nées après 1968) | Hypothèse fixe pour simplifier (pas de prise en compte des carrières longues ou spécifiques). |
| **Durée d’épargne** | Calcul de la durée | Durée = 64 - Âge | Basé sur l’âge de départ à la retraite. | - |
| **Situation professionnelle** | Options | Salarié / Retraité / Indépendant | Couvre les cas principaux pour ajuster les plafonds de déductibilité et abattements. | Simplification : regroupe BNC/BIC/BA sous "Indépendant". |
| **Évolution des revenus** | Progression (Retraité) | 1,5 %/an (inflation) | Hypothèse basée sur l’inflation moyenne (INSEE, inflation 2023-2025 ≈ 1,5 %/an). | Simplification : progression fixe pour les retraités (pas d’ajustement pour politiques futures). |
|  | Progression (Salarié/Indépendant) | Faible (1 %) / Moyenne (3 %) / Forte (5 %) | Hypothèse réaliste : 3 % = inflation (1,5 %) + augmentation moyenne (1,5 %). | Simplification : choix prédéfinis pour éviter des estimations complexes par l’utilisateur. |
|  | Calcul du revenu moyen | Revenu moyen = Revenu initial × [(1 + Progression)^Durée - 1] / (Durée × Progression) | Formule standard pour une série géométrique (approximation). | Simplification : utilisé pour les calculs moyens, mais calcul année par année recommandé pour l’avantage fiscal. |
|  | Calcul du revenu annuel | Revenu année n = Revenu initial × (1 + Progression)^(n-1) | Formule de progression géométrique. | - |
| **Type de contrat** | Courtier en ligne | Frais d’entrée : 0 % | Standard pour les courtiers en ligne (Linxea, Meilleurtaux Placement, web ID: 2). | - |
|  |  | Défensif : Perf brute 2,8 %, Frais 0,7 %, Net 2,1 % | Basé sur les rendements moyens des fonds euros (2,5 % en 2023, ajusté à 2,8 % pour 2025). | Hypothèse conservatrice. |
|  |  | Équilibré : Perf brute 4,15 %, Frais 1,15 %, Net 3,0 % | Moyenne de fonds euros (2,8 %) et UC (5,5 %), ajustée pour frais. | - |
|  |  | Agressif : Perf brute 5,5 %, Frais 1,6 %, Net 3,9 % | Rendement moyen des UC (actions/ETF), ajusté pour frais (assureur + gestionnaire). | Hypothèse conservatrice (rendement brut de 5,5 % vs 6-7 % historique sur 20 ans). |
|  | Banque/Assureur traditionnel | Frais d’entrée : 2 % | Standard pour les banques traditionnelles ([Retraite.com](http://retraite.com/), web ID: 2). | - |
|  |  | Défensif : Perf brute 2,8 %, Frais 1,0 %, Net 1,8 % | Basé sur les rendements moyens des fonds euros, ajusté pour frais plus élevés. | - |
|  |  | Équilibré : Perf brute 4,15 %, Frais 1,45 %, Net 2,7 % | Moyenne de fonds euros et UC, ajusté pour frais plus élevés. | - |
|  |  | Agressif : Perf brute 5,5 %, Frais 1,9 %, Net 3,6 % | Rendement moyen des UC, ajusté pour frais plus élevés (assureur + gestionnaire). | - |
| **Profil / Répartition** | Défensif | 100 % fonds euros | Standard pour un profil défensif (sécurité maximale). | - |
|  | Équilibré | 50 % fonds euros / 50 % UC | Standard pour un profil équilibré (compromis sécurité/performance). | - |
|  | Agressif | 100 % UC | Standard pour un profil agressif (rendement élevé, risque élevé). | - |
| **Revenus nets avant impôts** | Définition | Revenus nets annuels avant impôt sur le revenu (après prélèvements sociaux). | Définition standard (avis d’imposition). | - |
| **Nombre de parts fiscales** | Définition | Nombre de parts fiscales du foyer (1 pour célibataire, 2 pour couple, +0,5 par enfant, etc.). | Définition fiscale standard ([Service-Public.fr](http://service-public.fr/)). | - |
| **Frais réels** | Abattement forfaitaire (si Non) | 10 %, min 504 €, max 14 426 € | Seuils officiels 2025 (DGFiP, ajustés pour inflation). | - |
|  | Frais réels (si Oui) | Déduire le montant annuel des frais réels indiqué par l’utilisateur. | Règle fiscale standard. | - |
| **PER déjà ouvert** | Investissement initial | Capital initial (déjà investi ou prévu). | - | - |
|  | Versements 2025 | Versements effectués en 2025 (si PER déjà ouvert). | - | - |
|  | Versements mensuels | Convertir en versement annuel : Versement annuel = Versement mensuel × 12. | Simplification pour uniformiser les calculs. | - |
|  | Ajustement des versements | Versement année n = Versement initial × (1 + Progression)^(n-1). | Ajustement proportionnel à l’évolution des revenus. | Simplification : suppose une progression linéaire des versements. |
| **Plafond de déduction** | Salarié / Retraité | 10 % × Revenu imposable, min 4 114 €, max 35 194 €. | Règle fiscale standard (DGFiP, 2025). | - |
|  | Indépendant | **Calcul réglementaire TNS :** 10% du bénéfice imposable (limité à 8 PASS) + 15% de la quote-part du bénéfice comprise entre 1 et 8 PASS. Minimum spécifique TNS (~4.6k€) et Plafond spécifique TNS (~85k€). **Note:** Utiliser le revenu net fourni comme proxy du bénéfice imposable. | Règle fiscale TNS (Code général des impôts). Calcul plus précis mais utilise le revenu net comme base (approximation). | Remplacement de l'approximation par le calcul réglementaire pour plus de précision. |
| **Impôt sur le revenu** | Barème 2025 | 0 € - 11 294 € : 0 % ; 11 294 € - 28 797 € : 11 % ; 28 797 € - 82 341 € : 30 % ; 82 341 € - 177 106 € : 41 % ; > 177 106 € : 45 %. | Barème officiel 2025 (DGFiP, ajusté pour inflation). | - |
|  | Ajustement des tranches | Augmentation de 1,5 %/an (inflation). | Hypothèse basée sur l’inflation moyenne (INSEE). | Simplification : progression fixe (pas d’ajustement pour politiques fiscales futures). |
| **Capital total brut/net** | Formule | Capital initial = Investissement initial × (1 - Frais d’entrée) × (1 + Rendement net)^Durée. Versements = Somme des versements annuels composés (après frais d’entrée). | Formule standard des rentes composées. | Ajout de la prise en compte des frais d’entrée avant le calcul. |
| **Fiscalité à la sortie** | TMI à la retraite | TMI finale (après progression des revenus). | Hypothèse simplifiée (pas de prise en compte des revenus à la retraite). | Simplification : évite de demander les revenus futurs (pensions, etc.). |
|  | Plus-value | PFU de 30 % (12,8 % impôt + 17,2 % prélèvements sociaux). | Règle fiscale standard (option PFU choisie pour simplifier). | Simplification : suppose l’option PFU (pas de barème progressif). |
|  | Versements | Imposés à la TMI à la retraite. | Règle fiscale standard (versements déductibles à l’entrée). | - |
|  | Rente | Taux de conversion = 4 %, fraction imposable = 40 %, prélèvements sociaux = 17,2 %. | Hypothèse standard (taux de conversion moyen à 64 ans, fraction imposable à 64 ans). | Simplification : taux fixe (pas d’ajustement pour espérance de vie ou taux de marché). |
| **Comparaison avec Ramify** | Rendements nets | Défensif : 2,1 % ; Équilibré : 6,1 % ; Agressif : 10,51 %. | Données fournies par Ramify (screenshot : Profil 9/10 = 10,51 %). | Équilibré estimé (moyenne entre fonds euros et profil agressif). |
|  | Frais d’entrée | 0 % | Données fournies par Ramify. | - |
|  | Frais totaux | 1,15 % (moyenne de 1 % à 1,3 %) | Données fournies par Ramify. | Simplification : moyenne pour uniformiser les calculs. |
|  | Outputs comparés | Total versements, Capital total brut, Plus-value, Capital net de frais et impôts, Impact frais, Impact impôts, 3 types de sortie (rente, capital, fractionné). | Couvre tous les outputs impactés par les frais et performances. | Comparaison ajoutée pour tous les outputs pertinents (et non visible dans l’input Type de contrat). |
</aside>

<aside>

## Inputs et Outputs du simulateur

`Note : en bullets points d'abord avec qques indications, puis il y a un tableau, puis formules et pseudo-code après pour faciliter l'implémentation`

### Inputs

- Âge
    - Hypothèse d'âge départ retraite : 64 ans
- Situation professionnelle
    - Salarié
    - Retraité
    - Indépendant
        - Tooltip pour clarifier "Indépendant" ("Par exemple : professions libérales, commerçants, artisans, agriculteurs").
- Frais réels (oui/non)
    - Si non, abattement forfaitaire de 10 % (mais maximum = 14 426 €; minimum 504 €) sur les revenus
    - Si oui, demander le montant annuel des frais réels, et en faire la déduction sur les revenus
    - Tooltip : "Si vous optez pour les frais réels lors de votre déclaration d'impôt (par exemple, frais de trajet, repas), cochez 'Oui' et indiquez le montant annuel."
- Revenus nets avant impôts du foyer
- Nombre parts fiscales foyer
    - Tooltip : "Le nombre de parts dépend de votre situation familiale (1 pour un célibataire, 2 pour un couple, +0,5 par enfant, etc.)."
- Evolution revenu
    - Pour Retraité supposer progression 1,5% / an pour inflation
    - Pour Salarié ou indépendant
        - Faible (1%)
        - Moyenne (3%)
        - Forte (5 %)
    - Calcul : Approximation du revenu moyen sur la période mais si possible calculer l'avantage fiscal année par année (en ajustant les tranches fiscales pour l'inflation, par exemple 1,5 %/an).
    - Tooltip : "L'évolution de vos revenus dépend de votre situation. Par exemple, 3 % correspond à l'inflation + une augmentation annuelle. Si vous ne savez pas, choisissez 'Moyenne'.
- PER déjà ouvert ou pas
    - Si oui :
        - Investissement initial
        - versements déjà effectués en 2025
        - versements mensuels prévus jusqu'à votre retraite
            - convertir en versement annuel pour simplifier calcul (x12)
    - Si non :
        - Investissement initial prévu
        - Versements mensuels prévus jusqu'à votre retraite
            - convertir en versement annuel pour simplifier calcul (x12)
    - Note : Si possible, augmenter les versements proportionnellement à l'augmentation estimée des revenus
- Type de contrat
    - Courtier en ligne
        - Frais entrée = 0 %
        - Performances et de frais par profil
            - Défensif : Perf : 2,8 % ; frais : 0,7 % ; net : 2,1 %
            - Equilibré : Perf : 4,15 % ; frais : 1,15 % ; net : 3 %
            - Agressif : Perf : 5,5 % ; frais : 1,6 % ; net : 3,9 %
    - Banque ou Assureur traditionnel
        - Frais entrée = 2 %
        - Performances nettes de frais par profile
            - Défensif : Perf : 2,8 % ; frais : 1 % ; net : 1,8 %
            - Equilibré : Perf : 4,15 % ; frais : 1,45 % ; net : 2,7 %
            - Agressif : Perf : 5,5 % ; frais : 1,9 % ; net : 3,6 %
    - Ramify n'est pas visible comme option dans l'input "Type de contrat", mais est utilisé en interne pour la comparaison.
- Profil / Répartition
    - Défensif (100% fonds euros)
    - Equilibré (50% fonds euros / 50 % UC)
    - Agressif (100 % UC)
    - Tooltip : ("Défensif : sécurité maximale, mais rendement plus faible ; Équilibré : compromis entre sécurité et performance ; Agressif : potentiel de rendement élevé, mais plus risqué").

### Outputs

- Sur l'année en cours
    - Impôts sur l'année sans / avec PER, effort épargne réel correspondant
    - TMI et taux moyen d'imposition
    - Plafond déduction
        - Supposer un abattement moyen de 40 % sur les revenus des indépendants (approximation pour BNC/BIC/BA) et calculer le plafond sur cette base.
- A l'échéance (retraite)
    - Capital total brut
        - Total versements
        - Plus value
    - Capital net frais et impôts
        - Impact frais
        - Impact impôts
        - Economie d'impôt réalisée
        - Effort épargne réel
        - Supposer TMI à la retraite = à la TMI actuelle, ajustée pour l'évolution des revenus
- Montant capital pour the 3 types de sortie
    - 100% en Rente
    - 100% en Capital
    - Capital fractionné sur 10 ans
    - Pour simplifier fiscalité :
        - PFU (30 %) pour la plus-value dans tous les cas.
        - TMI à la retraite égale à la TMI finale (après progression des revenus).
        - Pour la rente, taux de conversion fixe (par exemple, 4 %) et appliquez une fiscalité simplifiée (40 % imposable au barème + 17,2 % de prélèvements sociaux).
- Comparaison avec Ramify à inclure pour tous les outputs impactés ("Avec Ramify vous auriez…" )
    - Défensif : 2,1 % ; frais : 0,7 % ; Net : 2,1 %
    - Équilibré : 7,23 % ; frais : 1,15 % ; Net : 6,1 %
    - Agressif : 11,66 % ; frais : 1,15 % ; Net : 10,51 %
    

### Tableau des Inputs/Outputs

| **Nom** | **Type** | **Tooltip** | **Description** | **Valeurs possibles** | **Dépendances** |
| --- | --- | --- | --- | --- | --- |
| Âge | Input | Indiquez votre âge actuel. | Âge de l'utilisateur, utilisé pour calculer la durée d'épargne jusqu'à la retraite. | 18-64 ans | - |
| Situation professionnelle | Input | Quelle est votre situation professionnelle ? | Permet d'ajuster le plafond de déductibilité et les abattements sur les revenus. | Salarié / Retraité / Indépendant | - |
|  |  | Par exemple : professions libérales, commerçants, artisans, agriculteurs. | (Tooltip spécifique pour "Indépendant") |  |  |
| Évolution des revenus | Input | Quelle est l'évolution annuelle estimée de vos revenus ? | Permet d'ajuster les revenus et les versements futurs pour refléter la progression des revenus. | Faible (1 %) / Moyenne (3 %) / Forte (5 %) | Situation professionnelle (non demandé pour Retraité, progression fixée à 1,5 %) |
|  |  | L'évolution de vos revenus dépend de votre situation. Par exemple, 3 % correspond à l'inflation + une augmentation annuelle. Si vous ne savez pas, choisissez 'Moyenne'. | (Tooltip pour l'utilisateur) |  |  |
| Type de contrat | Input | Quel type de contrat PER choisissez-vous ? | Détermine les frais d'entrée et les rendements nets en fonction du type de contrat. Ramify est utilisé en interne pour la comparaison, mais non visible comme option. | Courtier en ligne / Banque ou Assureur traditionnel | - |
| Profil / Répartition | Input | Quel est votre profil de risque ? | Détermine le rendement net en fonction de la répartition entre fonds euros et unités de compte (UC). | Défensif (100 % fonds euros) / Équilibré (50 % fonds euros / 50 % UC) / Agressif (100 % UC) | Type de contrat |
|  |  | Défensif : sécurité maximale, mais rendement plus faible ; Équilibré : compromis entre sécurité et performance ; Agressif : potentiel de rendement élevé, mais plus risqué. | (Tooltip pour l'utilisateur) |  |  |
| Revenus nets avant impôts du foyer | Input | Indiquez vos revenus nets annuels avant impôt sur le revenu (après prélèvements sociaux, comme indiqué sur votre avis d'imposition). | Revenus nets du foyer, utilisés pour calculer le revenu imposable et la TMI. | 0 € et plus | - |
| Nombre de parts fiscales du foyer | Input | Indiquez le nombre de parts fiscales de votre foyer. | Permet de calculer la TMI et le taux moyen d'imposition. | 1 et plus (décimales possibles, ex. 1,5) | - |
|  |  | Le nombre de parts dépend de votre situation familiale (1 pour un célibataire, 2 pour un couple, +0,5 par enfant, etc.). | (Tooltip pour l'utilisateur) |  |  |
| Frais réels | Input | Optez-vous pour les frais réels lors de votre déclaration d'impôt ? | Permet de calculer le revenu imposable en déduisant les frais professionnels. | Oui / Non | Revenus nets avant impôts du foyer |
|  |  | Si vous optez pour les frais réels lors de votre déclaration d'impôt (par exemple, frais de trajet, repas), cochez 'Oui' et indiquez le montant annuel. | (Tooltip pour l'utilisateur) |  |  |
| Montant des frais réels | Input | Indiquez le montant annuel de vos frais réels. | Montant des frais réels à déduire des revenus nets pour calculer le revenu imposable. | 0 € et plus (si Frais réels = Oui) | Frais réels |
| PER déjà ouvert | Input | Avez-vous déjà ouvert un PER ? | Permet de distinguer les utilisateurs avec un PER existant de ceux qui envisagent d'en ouvrir un. | Oui / Non | - |
| Investissement initial | Input | Quel est l'investissement initial de votre PER ? (si PER déjà ouvert) | Capital initial déjà investi dans le PER (si PER déjà ouvert). | 0 € et plus | PER déjà ouvert |
|  |  | Quel est l'investissement initial prévu pour votre PER ? (si PER non ouvert) | Capital initial prévu pour le PER (si PER non ouvert). |  |  |
| Versements déjà effectués en 2025 | Input | Quel est le montant des versements déjà effectués en 2025 ? | Versements effectués dans l'année en cours (2025), pour les PER déjà ouverts. | 0 € et plus | PER déjà ouvert |
| Versements mensuels prévus | Input | Combien prévoyez-vous de verser chaque mois jusqu'à votre départ à la retraite ? | Versements mensuels prévus jusqu'à la retraite, convertis en versements annuels pour les calculs. | 0 € et plus | - |
| Impôts sur l'année sans PER | Output | Impôt sur le revenu estimé pour l'année en cours sans PER. | Impôt calculé sur le revenu imposable sans déduction des versements PER. | - | Revenus nets, Nombre de parts fiscales, Frais réels, Montant des frais réels |
| Impôts sur l'année avec PER | Output | Impôt sur le revenu estimé pour l'année en cours avec PER. | Impôt calculé après déduction des versements PER pour l'année en cours. | - | Impôts sans PER, Versements annuels (2025) |
| Effort d'épargne réel (année en cours) | Output | Effort d'épargne réel pour l'année en cours. | Versements effectués dans l'année en cours, ajustés pour l'économie d'impôt. | - | Impôts sans/avec PER, Versements annuels (2025) |
| TMI | Output | Votre tranche marginale d'imposition (TMI) pour l'année en cours. | TMI basée sur le revenu imposable et le nombre de parts fiscales. | - | Revenus nets, Nombre de parts fiscales, Frais réels, Montant des frais réels |
| Taux moyen d'imposition | Output | Votre taux moyen d'imposition pour l'année en cours. | Taux moyen d'imposition basé sur l'impôt total et le revenu imposable. | - | Impôts sans PER, Revenus nets, Frais réels, Montant des frais réels |
| Plafond de déduction | Output | Votre plafond de déductibilité pour les versements PER. | Plafond de déduction fiscale pour les versements PER, basé sur les revenus et la situation professionnelle (Calcul réglementaire TNS appliqué si Indépendant). | - | Situation professionnelle, Revenus nets, Frais réels, Montant des frais réels |
| Capital total brut | Output | Capital accumulé à la retraite (brut). | Somme des versements et des gains, avant frais et impôts. | - | Âge, Type de contrat, Profil, Investissement initial, Versements annuels |
|  |  | Comparaison avec Ramify : Avec Ramify, vous auriez… | Comparaison avec Ramify pour le capital brut, total versements, plus-value, capital net, impact frais, impact impôts, et types de sortie. | - | Type de contrat |
| Total versements | Output | Total des versements effectués jusqu'à la retraite. | Somme de tous les versements (initial + annuels) sur la durée d'épargne. | - | Investissement initial, Versements annuels, Âge, Type de contrat |
|  |  | Comparaison avec Ramify : Avec Ramify, vous auriez… | Comparaison avec Ramify pour le total des versements. | - | Type de contrat |
| Plus-value | Output | Plus-value générée par votre PER à la retraite. | Gains générés par les investissements (capital total brut - total versements). | - | Capital total brut, Total versements |
|  |  | Comparaison avec Ramify : Avec Ramify, vous auriez… | Comparaison avec Ramify pour la plus-value. | - | Type of contrat |
| Capital net de frais et impôts | Output | Capital net après frais et impôts à la retraite. | Capital total brut, ajusté pour les frais (déjà inclus dans le rendement net) et les impôts à la sortie. | - | Capital total brut, TMI à la retraite |
|  |  | Comparaison avec Ramify : Avec Ramify, vous auriez… | Comparaison avec Ramify pour le capital net. | - | Type de contrat |
| Impact frais | Output | Impact des frais sur votre capital à la retraite. | Différence entre le capital brut sans frais et le capital net (frais déjà inclus dans le rendement net). | - | Capital total brut, Type de contrat, Profil |
|  |  | Comparaison avec Ramify : Avec Ramify, l'impact des frais serait… | Comparaison avec Ramify pour l'impact des frais. | - | Type de contrat |
| Impact impôts | Output | Impact des impôts à la sortie sur votre capital. | Impôts estimés à la sortie (sur les versements et la plus-value). | - | Capital total brut, Total versements, TMI à la retraite |
|  |  | Comparaison avec Ramify : Avec Ramify, l'impact des impôts serait… | Comparaison avec Ramify pour l'impact des impôts. | - | Type de contrat |
| Économie d'impôt réalisée | Output | Économie d'impôt totale réalisée sur toute la période. | Somme des économies d'impôt annuelles sur toute la durée d'épargne. | - | Impôts sans/avec PER (chaque année), Âge |
| Effort d'épargne réel (total) | Output | Effort d'épargne réel sur toute la période. | Total des versements, ajusté pour l'économie d'impôt totale. | - | Total versements, Économie d'impôt réalisée |
| Capital en rente (100 %) | Output | Montant annuel si sortie 100 % en rente. | Rente annuelle estimée à partir du capital net, avec un taux de conversion fixe. | - | Capital net de frais et impôts |
|  |  | Comparaison avec Ramify : Avec Ramify, vous auriez… | Comparaison avec Ramify pour la rente. | - | Type de contrat |
| Capital en capital (100 %) | Output | Montant si sortie 100 % en capital. | Capital net après impôts, si sortie en une seule fois. | - | Capital net de frais et impôts |
|  |  | Comparaison avec Ramify : Avec Ramify, vous auriez… | Comparaison avec Ramify pour le capital. | - | Type de contrat |
| Capital fractionné sur 10 ans | Output | Montant annuel si sortie fractionnée sur 10 ans. | Capital net après impôts, divisé sur 10 ans. | - | Capital net de frais et impôts |
|  |  | Comparaison avec Ramify : Avec Ramify, vous auriez… | Comparaison avec Ramify pour le capital fractionné. | - | Type de contrat |
</aside>

<aside>

## Flux de calcul (étapes séquentielles, formules)

`(Formules à vérifier par expert Ramify également svp)`

**Étape 1 : Calculer la durée d'épargne**

- **Formule** : Durée = 64 - Âge.
- **Hypothèse** : Âge de départ à la retraite = 64 ans.
- **Exemple** : Âge = 40 → Durée = 64 - 40 = 24 ans.
- **Pseudo-code** :
    
    `durée = 64 - âge`
    

**Étape 2 : Calculer l'évolution des revenus et le revenu moyen**

- **Règle** :
    - Si Situation professionnelle = Retraité : Progression = 1,5 %/an (inflation).
    - Sinon : Progression = Évolution des revenus (1 %, 3 %, ou 5 %).
- **Formule (revenu moyen)** : Revenu moyen = Revenu initial × [(1 + Progression)^Durée - 1] / (Durée × Progression).
- **Formule (revenu annuel)** : Revenu année n = Revenu initial × (1 + Progression)^(n-1).
- **Exemple** :
    - Revenu initial = 60 000 €, Progression = 3 %, Durée = 20 ans.
    - Revenu moyen = 60 000 € × [(1,03)^20 - 1] / (20 × 0,03) ≈ 80 600 €.
    - Revenu année 1 = 60 000 €, année 2 = 60 000 € × 1,03 = 61 800 €, année 20 = 60 000 € × (1,03)^19 ≈ 108 400 €.
- **Pseudo-code** :
    
    ```
    if (situation_professionnelle == "Retraité") {
      progression = 0.015
    } else {
      progression = évolution_revenus // 0.01, 0.03, ou 0.05
    }
    revenu_moyen = revenu_initial * ((1 + progression)^durée - 1) / (durée * progression)
    for (année = 1; année <= durée; année++) {
      revenu[année] = revenu_initial * (1 + progression)^(année-1)
    }
    ```
    

**Étape 3 : Calculer le revenu imposable (chaque année)**

- **Règle** :
    - Si Frais réels = Non : Abattement = Revenu année n × 10 %, avec min 504 €, max 14 426 €.
    - Si Frais réels = Oui : Abattement = Montant des frais réels.
- **Formule** : Revenu imposable année n = Revenu année n - Abattement.
- **Exemple** :
    - Revenu année 1 = 60 000 €, Frais réels = Non → Abattement = 6 000 € → Revenu imposable = 54 000 €.
    - Revenu année 20 = 108 400 €, Frais réels = Non → Abattement = 10 840 € → Revenu imposable = 97 560 €.
- **Pseudo-code** :
    
    ```
    for (année = 1; année <= durée; année++) {
      if (frais_réels == "Non") {
        abattement = revenu[année] * 0.1
        if (abattement < 504) abattement = 504
        if (abattement > 14426) abattement = 14426
      } else {
        abattement = montant_frais_réels
      }
      revenu_imposable[année] = revenu[année] - abattement
    }
    ```
    

**Étape 4 : Calculer la TMI et le taux moyen d'imposition (chaque année)**

- **Formule** :
    - Quotient familial année n = Revenu imposable année n ÷ Nombre de parts fiscales.
    - Appliquer le barème progressif de l'impôt sur le revenu (ajusté pour l'inflation : tranches augmentent de 1,5 %/an).
    - TMI = tranche correspondant au quotient familial.
    - Impôt année n = Somme des tranches appliquées au revenu imposable.
    - Taux moyen = Impôt année n ÷ Revenu imposable année n.
- **Exemple (année 1)** :
    - Revenu imposable = 54 000 €, Nombre de parts = 2 → Quotient = 27 000 €.
    - Barème 2025 : 0 € - 11 294 € : 0 % ; 11 294 € - 28 797 € : 11 % ; 28 797 € - 82 341 € : 30 %.
    - TMI = 11 % (27 000 € < 28 797 €).
    - Impôt = (11 294 € × 0 %) + (27 000 € - 11 294 €) × 11 % × 2 = 0 + 15 706 € × 11 % × 2 ≈ 3 455 €.
    - Taux moyen = 3 455 € / 54 000 € ≈ 6,4 %.
- **Pseudo-code** :
    
    ```
    for (année = 1; année <= durée; année++) {
      quotient = revenu_imposable[année] / nombre_parts
      // Ajuster les tranches pour l'inflation (1,5 %/an)
      tranche_0_11294 = 11294 * (1 + 0.015)^(année-1)
      tranche_11294_28797 = 28797 * (1 + 0.015)^(année-1)
      tranche_28797_82341 = 82341 * (1 + 0.015)^(année-1)
      tranche_82341_177106 = 177106 * (1 + 0.015)^(année-1)
      // Calculer la TMI
      if (quotient <= tranche_0_11294) tmi[année] = 0
      else if (quotient <= tranche_11294_28797) tmi[année] = 0.11
      else if (quotient <= tranche_28797_82341) tmi[année] = 0.30
      else if (quotient <= tranche_82341_177106) tmi[année] = 0.41
      else tmi[année] = 0.45
      // Calculer l'impôt
      impôt = 0
      if (quotient > tranche_0_11294) {
        impôt += (min(quotient, tranche_11294_28797) - tranche_0_11294) * 0.11
      }
      if (quotient > tranche_11294_28797) {
        impôt += (min(quotient, tranche_28797_82341) - tranche_11294_28797) * 0.30
      }
      if (quotient > tranche_28797_82341) {
        impôt += (min(quotient, tranche_82341_177106) - tranche_28797_82341) * 0.41
      }
      if (quotient > tranche_82341_177106) {
        impôt += (quotient - tranche_82341_177106) * 0.45
      }
      impôt *= nombre_parts
      impôt_sans_PER[année] = impôt
      taux_moyen[année] = impôt / revenu_imposable[année]
    }
    
    ```
    

**Étape 5 : Calculer le plafond de déduction (chaque année)**

- **Règle** :
    - Si Salarié ou Retraité : Plafond = 10 % × Revenu imposable année n, min 4 114 €, max 35 194 €.
    - Si Indépendant (TNS) : 
        - Bénéfice imposable = Revenu année n (approximation utilisant le revenu net fourni).
        - Plafond partie 1 = 10 % × Bénéfice imposable, limité à 10% × 8 × PASS.
        - Plafond partie 2 = 15 % × (Bénéfice imposable - PASS), si Bénéfice imposable > PASS. Cette partie est limitée à 15% × (8 × PASS - PASS).
        - Plafond Total = Plafond partie 1 + Plafond partie 2.
        - Appliquer Plafond minimum TNS (ex: 4 637 € pour 2024, utiliser ~4.9k€ pour 2025 approx) et Plafond maximum TNS (ex: 85 780 € pour 2024, utiliser ~91k€ pour 2025 approx).
- **Exemple (année 1)** :
    - Salarié, Revenu imposable = 54 000 € → Plafond = 10 % × 54 000 € = 5 400 €.
    - Indépendant, Revenu année 1 = 60 000 € (proxy bénéfice), PASS = 46 368 €
        - Partie 1 = 10% * 60 000 = 6 000 € (inférieur à 10% * 8 * PASS, donc OK)
        - Partie 2 = 15% * (60 000 - 46 368) = 15% * 13 632 = 2 044,8 €
        - Plafond Total = 6 000 + 2 044,8 = 8 044,8 € (Supérieur au min TNS, inférieur au max TNS)
- **Pseudo-code** :
    
    ```
    PASS_COURANT = 46368 * (1 + INFLATION_RATE)^(année-1) // Ajuster PASS pour l'année
    PASS_8 = PASS_COURANT * 8
    PLAFOND_MIN_SALARIE = 4114 * (1 + INFLATION_RATE)^(année-1)
    PLAFOND_MAX_SALARIE = 35194 * (1 + INFLATION_RATE)^(année-1)
    // Utiliser les valeurs 2024 comme ref, ajustées pour 2025+ inflation
    PLAFOND_MIN_TNS = 4637 * (1 + INFLATION_RATE)^(année-1) 
    PLAFOND_MAX_TNS = 85780 * (1 + INFLATION_RATE)^(année-1)
    
    for (année = 1; année <= durée; année++) {
      if (situation_professionnelle == "Salarié" || situation_professionnelle == "Retraité") {
        plafond = 0.1 * revenu_imposable[année]
        if (plafond < PLAFOND_MIN_SALARIE) plafond = PLAFOND_MIN_SALARIE
        if (plafond > PLAFOND_MAX_SALARIE) plafond = PLAFOND_MAX_SALARIE
      } else { // Indépendant (TNS)
        benefice_imposable = revenu[année] // Approximation
        plafond_partie1 = 0.10 * min(benefice_imposable, PASS_8)
        plafond_partie2 = 0
        if (benefice_imposable > PASS_COURANT) {
           tranche_partie2 = min(benefice_imposable, PASS_8) - PASS_COURANT
           plafond_partie2 = 0.15 * max(0, tranche_partie2) 
        }
        plafond = plafond_partie1 + plafond_partie2
        if (plafond < PLAFOND_MIN_TNS) plafond = PLAFOND_MIN_TNS
        if (plafond > PLAFOND_MAX_TNS) plafond = PLAFOND_MAX_TNS
      }
      plafond_déduction[année] = plafond
    }
    
    ```
    

**Étape 6 : Calculer les versements annuels**

- **Règle** :
    - Versement annuel = Versement mensuel × 12.
    - Si possible, augmenter proportionnellement à l'évolution des revenus : Versement année n = Versement initial × (1 + Progression)^(n-1).
- **Exemple** :
    - Versement mensuel = 500 € → Versement initial = 500 € × 12 = 6 000 €.
    - Progression = 3 % → Versement année 1 = 6 000 €, année 2 = 6 000 € × 1,03 = 6 180 €, année 20 = 6 000 € × (1,03)^19 ≈ 10 840 €.
- **Pseudo-code** :
    
    ```
    versement_initial = versement_mensuel * 12
    for (année = 1; année <= durée; année++) {
      versement[année] = versement_initial * (1 + progression)^(année-1)
    }
    
    ```
    

**Étape 7 : Calculer l'impôt avec PER et l'effort d'épargne (chaque année)**

- **Règle** :
    - Versement déductible année n = min(Versement année n, Plafond déduction année n).
    - Revenu imposable avec PER = Revenu imposable année n - Versement déductible année n.
    - Recalculer l'impôt avec le nouveau revenu imposable (même méthode qu'à l'étape 4).
- **Exemple (année 1)** :
    - Versement = 6 000 €, Plafond = 5 400 € → Versement déductible = 5 400 €.
    - Revenu imposable avec PER = 54 000 € - 5 400 € = 48 600 €.
    - Impôt sans PER = 3 455 € → Quotient avec PER = 48 600 € ÷ 2 = 24 300 € → Impôt avec PER = (11 294 € × 0 %) + (24 300 € - 11 294 €) × 11 % × 2 ≈ 2 860 €.
    - Économie d'impôt = 3 455 € - 2 860 € = 595 €.
    - Effort d'épargne = 6 000 € - 595 € = 5 405 €.
- **Pseudo-code** :
    
    ```
    for (année = 1; année <= durée; année++) {
      versement_déductible = min(versement[année], plafond_déduction[année])
      revenu_imposable_avec_PER = revenu_imposable[année] - versement_déductible
      // Recalculer l'impôt (même méthode qu'à l'étape 4)
      quotient = revenu_imposable_avec_PER / nombre_parts
      impôt = 0
      if (quotient > tranche_0_11294) {
        impôt += (min(quotient, tranche_11294_28797) - tranche_0_11294) * 0.11
      }
      if (quotient > tranche_11294_28797) {
        impôt += (min(quotient, tranche_28797_82341) - tranche_11294_28797) * 0.30
      }
      if (quotient > tranche_28797_82341) {
        impôt += (min(quotient, tranche_82341_177106) - tranche_28797_82341) * 0.41
      }
      if (quotient > tranche_82341_177106) {
        impôt += (quotient - tranche_82341_177106) * 0.45
      }
      impôt *= nombre_parts
      impôt_avec_PER[année] = impôt
      économie_impôt[année] = impôt_sans_PER[année] - impôt_avec_PER[année]
      effort_épargne[année] = versement[année] - économie_impôt[année]
    }
    
    ```
    

**Étape 8 : Calculer le capital total brut**

- **Formule** :
    - Capital initial = Investissement initial × (1 - Frais d'entrée) × (1 + Rendement net)^Durée.
    - Versements = Somme des versements annuels, chacun composé : Versement année n × (1 - Frais d'entrée) × (1 + Rendement net)^(Durée - n).
    - Capital total brut = Capital initial + Versements.
- **Rendement net de frais** (dépend de Type de contrat et Profil) :
    - Courtier en ligne : Défensif 2,1 %, Équilibré 3,0 %, Agressif 3,9 %.
    - Banque/assureur traditionnel : Défensif 1,8 %, Équilibré 2,7 %, Agressif 3,6 %.
- **Frais d'entrée** :
    - Courtier en ligne : 0 %.
    - Banque/assureur traditionnel : 2 %.
- **Exemple** :
    - Âge = 40, Durée = 20 ans, Courtier en ligne, Profil Équilibré (3,0 %), Investissement initial = 10 000 €, Versement mensuel = 500 € (6 000 €/an), Progression = 3 %.
    - Capital initial = 10 000 € × (1 - 0) × (1,03)^20 ≈ 18 061 €.
    - Versements : Versement année 1 = 6 000 € × (1 - 0) × (1,03)^19 ≈ 10 230 €, …, Versement année 20 = 10 840 € × (1 - 0) × (1,03)^0 = 10 840 € → Total versements composés ≈ 186 200 €.
    - Capital total brut = 18 061 € + 186 200 € ≈ 204 261 €.
- **Pseudo-code** :
    
    ```
    if (type_contrat == "Courtier en ligne") {
      if (profil == "Défensif") rendement_net = 0.021
      else if (profil == "Équilibré") rendement_net = 0.03
      else rendement_net = 0.039
      frais_entrée = 0
    } else {
      if (profil == "Défensif") rendement_net = 0.018
      else if (profil == "Équilibré") rendement_net = 0.027
      else rendement_net = 0.036
      frais_entrée = 0.02
    }
    investissement_initial_net = investissement_initial * (1 - frais_entrée)
    capital_initial = investissement_initial_net * (1 + rendement_net)^durée
    total_versements = 0
    capital_versements = 0
    for (année = 1; année <= durée; année++) {
      versement_net = versement[année] * (1 - frais_entrée)
      total_versements += versement_net
      capital_versements += versement_net * (1 + rendement_net)^(durée - année)
    }
    capital_total_brut = capital_initial + capital_versements
    plus_value = capital_total_brut - (investissement_initial_net + total_versements)
    
    ```
    

**Étape 9 : Calculer l'économie d'impôt totale et l'effort d'épargne réel**

- **Formule** :
    - Économie d'impôt totale = Somme des économies d'impôt annuelles.
    - Effort d'épargne réel = Total versements - Économie d'impôt totale.
- **Exemple** :
    - Économie d'impôt année 1 = 595 €, …, année 20 (TMI 30 %) = 10 840 € × 30 % ≈ 3 252 €.
    - Total (approximation) : 1 767 €/an (moyen) × 20 = 35 340 €.
    - Effort d'épargne = (10 000 € + 161 614 €) - 35 340 € = 136 274 €.
- **Pseudo-code** :
    
    ```
    économie_impôt_totale = 0
    for (année = 1; année <= durée; année++) {
      économie_impôt_totale += économie_impôt[année]
    }
    effort_épargne_réel = (investissement_initial_net + total_versements) - économie_impôt_totale
    
    ```
    

**Étape 10 : Calculer le capital net de frais et impôts**

- **Règle** :
    - Impact Frais : Capital net de frais - Capital brut
    - Impact impôts (sortie en capital) :
        - Versements : Imposés à la TMI à la retraite (TMI finale, après progression des revenus).
        - Plus-value : PFU de 30 %.
- **Rendements bruts** :
    - Courtier en ligne : Défensif 2,8 %, Équilibré 4,15 %, Agressif 5,5 %.
    - Banque/assureur traditionnel : Défensif 2,8 %, Équilibré 4,15 %, Agressif 5,5 %.
- **Exemple** :
    - Capital total brut = 204 261 €, Total versements = 171 614 €, Plus-value = 32 647 €.
    - TMI finale (année 20) = 30 % (revenu imposable = 97 560 €, 2 parts).
    - Capital sans frais (rendement brut 4,15 %) :
        - Capital initial = 10 000 € × (1,0415)^20 ≈ 22 505 €.
        - Versements = 8 081 € × [(1,0415)^20 - 1] / 0,0415 × 1,0415 ≈ 206 500 €.
        - Capital sans frais = 22 505 € + 206 500 € ≈ 229 005 €.
    - Impact frais = 229 005 € - 204 261 € = 24 744 €.
    - Impôt sur versements = 171 614 € × 30 % = 51 484 €.
    - Impôt sur plus-value = 32 647 € × 30 % = 9 794 €.
    - Capital net = 204 261 € - 51 484 € - 9 794 € = 142 983 €.
- **Pseudo-code** :
    
    ```
    // Calcul de l'impact des frais
    if (type_contrat == "Courtier en ligne") {
      if (profil == "Défensif") rendement_brut = 0.028
      else if (profil == "Équilibré") rendement_brut = 0.0415
      else rendement_brut = 0.055
    } else if (type_contrat == "Banque ou Assureur traditionnel") {
      if (profil == "Défensif") rendement_brut = 0.028
      else if (profil == "Équilibré") rendement_brut = 0.0415
      else rendement_brut = 0.055
    }
    capital_initial_sans_frais = investissement_initial * (1 + rendement_brut)^durée
    capital_versements_sans_frais = 0
    for (année = 1; année <= durée; année++) {
      capital_versements_sans_frais += versement[année] * (1 + rendement_brut)^(durée - année)
    }
    capital_sans_frais = capital_initial_sans_frais + capital_versements_sans_frais
    impact_frais = capital_sans_frais - capital_total_brut
    // Calcul du capital net
    tmi_retraite = tmi[durée]
    impôt_versements = (investissement_initial_net + total_versements) * tmi_retraite
    impôt_plus_value = plus_value * 0.3
    impact_impôts = impôt_versements + impôt_plus_value
    capital_net = capital_total_brut - impact_impôts
    
    ```
    

**Étape 11 : Comparaison avec Ramify**

- **Rendements nets (Ramify)** :
    - Défensif : 2,1 %.
    - Équilibré : 6,1 %.
    - Agressif : 10,51 %.
- **Frais d'entrée** : 0 %.
- **Outputs concernés** : Total versements, Capital total brut, Plus-value, Capital net de frais et impôts, Impact frais, Impact impôts, 3 types of sortie.
- **Formule** :
    - Recalculer chaque output pour Ramify en utilisant le rendement net correspondant
        - Total versements : Comparer directement (frais d'entrée identiques).
        - Plus-value : plus_value_ramify = capital_total_brut_ramify - total_versements.
        - Capital net : Recalculer avec la fiscalité (même TMI et PFU).
        - Impact frais : Recalculer avec le rendement brut de Ramify (7,23 %).
        - Types de sortie : Recalculer à partir du capital net de Ramify.
    - Calculer la différence en pourcentage par rapport à l'output de l'utilisateur.
- **Exemple** :
    - Ramify, Profil Équilibré (6,1 %) :
        - Capital initial = 10 000 € × (1,061)^20 ≈ 32 071 €.
        - Versements = 8 081 € (versement moyen) × [(1,061)^20 - 1] / 0,061 × 1,061 ≈ 250 000 €.
        - Capital total brut = 32 071 € + 250 000 € ≈ 282 071 €.
    - Comparaison : "Avec Ramify, vous auriez 282 071 € (soit +38 % par rapport à votre contrat)."
- **Pseudo-code** :
    
    ```
    // Comparaison pour Total versements
    total_versements_ramify = total_versements // Frais d'entrée identiques (0 %)
    différence_total_versements = (total_versements_ramify - total_versements) / total_versements * 100
    
    // Comparaison pour Capital total brut
    if (profil == "Défensif") rendement_ramify = 0.021
    else if (profil == "Équilibré") rendement_ramify = 0.061
    else rendement_ramify = 0.1051
    capital_initial_ramify = investissement_initial * (1 + rendement_ramify)^durée
    capital_versements_ramify = 0
    for (année = 1; année <= durée; année++) {
      capital_versements_ramify += versement[année] * (1 + rendement_ramify)^(durée - année)
    }
    capital_total_brut_ramify = capital_initial_ramify + capital_versements_ramify
    différence_capital_brut = (capital_total_brut_ramify - capital_total_brut) / capital_total_brut * 100
    
    // Comparaison pour Plus-value
    plus_value_ramify = capital_total_brut_ramify - total_versements_ramify
    différence_plus_value = (plus_value_ramify - plus_value) / plus_value * 100
    
    // Comparaison pour Capital net
    impôt_versements_ramify = (investissement_initial + total_versements_ramify) * tmi_retraite
    impôt_plus_value_ramify = plus_value_ramify * 0.3
    impact_impôts_ramify = impôt_versements_ramify + impôt_plus_value_ramify
    capital_net_ramify = capital_total_brut_ramify - impact_impôts_ramify
    différence_capital_net = (capital_net_ramify - capital_net) / capital_net * 100
    
    // Comparaison pour Impact frais
    rendement_brut_ramify = 0
    if (profil == "Défensif") rendement_brut_ramify = 0.028
    else if (profil == "Équilibré") rendement_brut_ramify = 0.0723
    else rendement_brut_ramify = 0.1166
    capital_initial_sans_frais_ramify = investissement_initial * (1 + rendement_brut_ramify)^durée
    capital_versements_sans_frais_ramify = 0
    for (année = 1; année <= durée; année++) {
      capital_versements_sans_frais_ramify += versement[année] * (1 + rendement_brut_ramify)^(durée - année)
    }
    capital_sans_frais_ramify = capital_initial_sans_frais_ramify + capital_versements_sans_frais_ramify
    impact_frais_ramify = capital_sans_frais_ramify - capital_total_brut_ramify
    différence_impact_frais = (impact_frais_ramify - impact_frais) / impact_frais * 100
    
    // Comparaison pour Impact impôts
    différence_impact_impôts = (impact_impôts_ramify - impact_impôts) / impact_impôts * 100
    
    // Comparaison pour Types de sortie
    rente_brute_ramify = capital_net_ramify * 0.04
    rente_nette_ramify = rente_brute_ramify * (1 - (0.4 * tmi_retraite + 0.172 * 0.4))
    différence_rente = (rente_nette_ramify - rente_nette) / rente_nette * 100
    capital_100_ramify = capital_net_ramify
    différence_capital_100 = (capital_100_ramify - capital_100) / capital_100 * 100
    capital_fractionné_ramify = capital_net_ramify / 10
    différence_capital_fractionné = (capital_fractionné_ramify - capital_fractionné) / capital_fractionné * 100
    
    ```
    

**Étape 12 : Calculer les montants pour les 3 types de sortie**

- **100 % en Rente** :
    - Taux de conversion = 4 %.
    - Fraction imposable = 40 %, prélèvements sociaux = 17,2 %.
    - Rente brute = Capital net × 4 %.
    - Rente nette = Rente brute × (1 - (40 % × TMI + 17,2 % × 40 %)).
- **100 % en Capital** : Capital net (déjà calculé).
- **Capital fractionné sur 10 ans** : Capital net ÷ 10.
- **Exemple** :
    - Capital net = 142 983 €.
    - Rente brute = 142 983 € × 4 % = 5 719 €/an.
    - Rente nette (TMI 30 %) = 5 719 € × (1 - (0,4 × 0,3 + 0,172 × 0,4)) ≈ 4 680 €/an.
    - Capital fractionné = 142 983 € ÷ 10 = 14 298 €/an.
- **Pseudo-code** :
    
    ```
    rente_brute = capital_net * 0.04
    rente_nette = rente_brute * (1 - (0.4 * tmi_retraite + 0.172 * 0.4))
    capital_100 = capital_net
    capital_fractionné = capital_net / 10
    
    ```
    
</aside>

<aside>

## Annexe : Références et hypothèses globales

- **Barème de l'impôt sur le revenu 2025** :
    - 0 € - 11 294 € : 0 %.
    - 11 294 € - 28 797 € : 11 %.
    - 28 797 € - 82 341 € : 30 %.
    - 82 341 € - 177 106 € : 41 %.
    - 177 106 € : 45 %.
- **PASS 2025** : 46 368 €.
- **Inflation annuelle** : 1,5 %/an (pour ajuster les tranches fiscales).
- **Taux de conversion pour la rente** : 4 % à 64 ans.
- **Plafond de déductibilité** : Min 4 114 €, Max 35 194 €.
- **PFU** : 30 % (12,8 % impôt + 17,2 % prélèvements sociaux).
- **Fraction imposable pour la rente** : 40 % (à 64 ans).
- **Prélèvements sociaux** : 17,2 %.
- **Rendements nets et frais par type de contrat et profil** :
    - **Courtier en ligne** :
        - Défensif : Rendement brut 2,8 %, Frais 0,7 %, Net 2,1 %.
        - Équilibré : Rendement brut 4,15 %, Frais 1,15 %, Net 3,0 %.
        - Agressif : Rendement brut 5,5 %, Frais 1,6 %, Net 3,9 %.
        - Frais d'entrée : 0 %.
    - **Banque ou Assureur traditionnel** :
        - Défensif : Rendement brut 2,8 %, Frais 1,0 %, Net 1,8 %.
        - Équilibré : Rendement brut 4,15 %, Frais 1,45 %, Net 2,7 %.
        - Agressif : Rendement brut 5,5 %, Frais 1,9 %, Net 3,6 %.
        - Frais d'entrée : 2 %.
    - **Ramify** (utilisé en interne pour la comparaison) :
        - Défensif : Rendement brut 2,8 %, Frais 0,7 %, Net 2,1 %.
        - Équilibré : Rendement brut 7,23 %, Frais 1,15 %, Net 6,1 %.
        - Agressif : Rendement brut 11,66 %, Frais 1,15 %, Net 10,51 %.
        - Frais d'entrée : 0 %.
</aside>

<aside>

## Exemple complet d'une utilisation du simulateur

**Utilisateur** : 40 ans, salarié, revenu net de 60 000 €/an, progression de 3 %/an, 2 parts fiscales, frais réels de 5 000 €, courtier en ligne, profil Équilibré, PER non ouvert, investissement initial de 10 000 €, versements mensuels de 500 € (6 000 €/an).

- **Durée** : 20 ans (simplifié).
- **Sur l'année en cours (2025)** :
    - Impôts sans PER : 3 565 €.
    - Impôts avec PER : 2 959 €.
    - Effort d'épargne réel : 5 394 €.
    - TMI : 11 %.
    - Taux moyen d'imposition : 6,5 %.
    - Plafond de déduction : 5 500 €.
- **À l'échéance (retraite)** :
    - Capital total brut : 204 261 €.
        - Comparaison avec Ramify (Équilibré) : 282 071 € (+38 %).
    - Total versements : 171 614 €.
        - Comparaison avec Ramify : 171 614 € (0 %, frais d'entrée identiques).
    - Plus-value : 32 647 €.
        - Comparaison avec Ramify : 110 457 € (+238 %).
    - Capital net de frais et impôts : 142 983 €.
        - Comparaison avec Ramify : 197 450 € (+38 %).
    - Impact frais : 24 744 €.
        - Comparaison avec Ramify : 28 679 € (+16 %).
    - Impact impôts : 61 278 €.
        - Comparaison avec Ramify : 84 621 € (+38 %).
    - Économie d'impôt réalisée : 35 340 €.
    - Effort d'épargne réel (total) : 136 274 €.
- **Montants pour les 3 types de sortie** :
    - 100 % en Rente : 4 680 €/an.
        - Comparaison avec Ramify : 6 460 €/an (+38 %).
    - 100 % en Capital : 142 983 €.
        - Comparaison avec Ramify : 197 450 € (+38 %).
    - Capital fractionné sur 10 ans : 14 298 €/an.
        - Comparaison avec Ramify : 19 745 €/an (+38 %).
</aside>

<aside>

## Qques demandes/suggestions UI/UX

## UI

- Avoir un ❓(icone pas emoji ofc) à côté des éléments non évidents qui affiche un tooltip explicatif
- CTAs de fin : Ouvrir un PER / Echanger avec un Conseiller et 3eme en lien texte dessous vers la page produit

## UX

- Si la personne clique "ouvrir un PER avec Ramify", si possible que les données récupérées ne doivent pas être renseignées à nouveau (pour fluidifier l'onboarding / augmenter le % de conversion)
- Si la personne prend RDV p'tet automatiquement joindre le résumé de sa simulation pour le commercial qui répondra et répondre automatiquement à la première question du flow RDV ?
- Messages d'alertes
    - Si les versements dépassent le plafond de déductibilité : "Vos versements dépassent votre plafond de déductibilité. L'excédent ne sera pas déductible."
    - Si le profil est agressif : "Le profil Agressif offre un rendement plus élevé, mais comporte des risques. Les performances passées ne garantissent pas les résultats futurs."
</aside>