# Partie Simulateur

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

Et il inclurait une **comparaison contextuelle avec Ramify** (”Avec Ramify vous auriez…”) en mettant en avant vos performances / frais, et quelques graphs pour aider à la visualisation des résultats.

Ce simulateur pourrait être très compliqué donc j’ai fait une série d’hypothèses et approximations pour essayer d’en faire au moins une première version plus “simple”.

Si possible, l’idée serait d’itérer plus tard en étant plus précis.

`Note` : vous avez potentiellement déjà certaines des formules dans le simulateur fiscalité, est-ce qu’on pourrait les réutiliser ?

---

<aside>

## Tableau des règles, données, approx., hypothèses et références

`(à vérifier par expert Ramify)`

| Catégorie | Élément | Règle / Donnée / Hypothèse | Source / Justification | Commentaire / Simplification |
| --- | --- | --- | --- | --- |
| Âge de départ à la retraite | Âge de départ | 64 ans | Réforme des retraites 2023 (âge légal pour les personnes nées à partir de 1968). | Hypothèse fixe pour simplifier. Avertissement : L'âge légal de départ augmente progressivement pour les générations nées entre 1961 et 1967. |
| Durée d’épargne | Calcul de la durée | Durée = 64 - Âge | Basé sur l’âge de départ à la retraite. | - |
| Situation professionnelle | Options | Salarié / Retraité / Indépendant | Couvre les cas principaux pour ajuster les plafonds de déductibilité et abattements. | Simplification : regroupe BNC/BIC/BA sous "Indépendant". |
| Évolution des revenus | Progression (Retraité) | 1,5 %/an (inflation) | Hypothèse basée sur l’inflation moyenne (INSEE, inflation 2023-2025 ≈ 1,5 %/an). | Simplification : progression fixe pour les retraités (pas d’ajustement pour politiques futures). |
|  | Progression (Salarié/Indépendant) | Faible (1 %) / Moyenne (3 %) / Forte (5 %) | Hypothèse réaliste : 3 % = inflation (1,5 %) + augmentation moyenne (1,5 %). | Simplification : choix prédéfinis pour éviter des estimations complexes par l’utilisateur. |
|  | Calcul du revenu moyen | Revenu moyen = Revenu initial × [(1 + Progression)^Durée - 1] / (Durée × Progression) | Formule standard pour une série géométrique (approximation). | Simplification : utilisé pour les calculs moyens, mais calcul année par année recommandé pour l’avantage fiscal. |
|  | Calcul du revenu annuel | Revenu année n = Revenu initial × (1 + Progression)^(n-1) | Formule de progression géométrique. | - |
| Type de contrat | Courtier en ligne | Frais d’entrée : 0 % | Standard pour les courtiers en ligne (Linxea, Meilleurtaux Placement, web ID: 2). | - |
|  |  | Défensif : Perf brute 2,8 %, Frais 0,7 %, Net 2,1 % | Basé sur les rendements moyens des fonds euros (2,5 % en 2023, ajusté à 2,8 % pour 2025). | Hypothèse conservatrice. |
|  |  | Équilibré : Perf brute 4,15 %, Frais 1,15 %, Net 3,0 % | Moyenne de fonds euros (2,8 %) et UC (5,5 %), ajustée pour frais. | - |
|  |  | Agressif : Perf brute 5,5 %, Frais 1,6 %, Net 3,9 % | Rendement moyen des UC (actions/ETF), ajusté pour frais (assureur + gestionnaire). | Hypothèse conservatrice (rendement brut de 5,5 % vs 6-7 % historique sur 20 ans). |
|  | Banque/Assureur traditionnel | Frais d’entrée : 2 % | Standard pour les banques traditionnelles (Retraite.com, web ID: 2). | - |
|  |  | Défensif : Perf brute 2,8 %, Frais 1,0 %, Net 1,8 % | Basé sur les rendements moyens des fonds euros, ajusté pour frais plus élevés. | - |
|  |  | Équilibré : Perf brute 4,15 %, Frais 1,45 %, Net 2,7 % | Moyenne de fonds euros et UC, ajusté pour frais plus élevés. | - |
|  |  | Agressif : Perf brute 5,5 %, Frais 1,9 %, Net 3,6 % | Rendement moyen des UC, ajusté pour frais plus élevés (assureur + gestionnaire). | - |
| Profil / Répartition | Défensif | 100 % fonds euros | Standard pour un profil défensif (sécurité maximale). | - |
|  | Équilibré | 50 % fonds euros / 50 % UC | Standard pour un profil équilibré (compromis sécurité/performance). | - |
|  | Agressif | 100 % UC | Standard pour un profil agressif (rendement élevé, risque élevé). | - |
| Revenus nets avant impôts | Définition | Revenus nets annuels avant impôt sur le revenu (après prélèvements sociaux). | Définition standard (avis d’imposition). | - |
| Nombre de parts fiscales | Définition | Nombre de parts fiscales du foyer (1 pour célibataire, 2 pour couple, +0,5 par enfant, etc.). | Définition fiscale standard (Service-Public.fr). | Si > 1 part, hypothèse de répartition 50/50 des revenus pour le calcul du plafond PER individualisé (à préciser). |
| Frais réels | Abattement forfaitaire (si Non) | 10 %, min 504 €, max 14 426 € | Seuils officiels 2025 (DGFiP, ajustés pour inflation). | - |
|  | Frais réels (si Oui) | Déduire le montant annuel des frais réels indiqué par l’utilisateur. | Règle fiscale standard. | - |
| PER déjà ouvert | Investissement initial | Capital initial (déjà investi ou prévu). | - | - |
|  | Versements 2025 | Versements effectués en 2025 (si PER déjà ouvert). | - | - |
|  | Versements mensuels | Convertir en versement annuel : Versement annuel = Versement mensuel × 12. | Simplification pour uniformiser les calculs. | - |
|  | Ajustement des versements | Versement année n = Versement initial × (1 + Progression)^(n-1). | Ajustement proportionnel à l’évolution des revenus. | Simplification : suppose une progression linéaire des versements. |
| Plafond de déduction | Salarié / Retraité | 10 % × Revenu imposable N-1, min 4 637 €, max 37 094 € (pour 2025, basés sur PASS 2024). OU 10 % PASS N-1 si plus favorable (4 637 €). | Règle fiscale standard (CGI art. 163 quatervicies, PASS 2024 = 46 368 €). | Plafonds 2025. Note : le brief initial utilisait des valeurs basées sur PASS N au lieu de N-1. |
|  | Indépendant | Calcul réglementaire TNS : 10% du bénéfice imposable (limité à 8 PASS N-1) + 15% de la quote-part du bénéfice comprise entre 1 et 8 PASS N-1. Plancher spécifique TNS (4 637 € pour 2025) et Plafond spécifique TNS (85 780 € pour 2025). Note: Utiliser le revenu net fourni comme proxy du bénéfice imposable. | Règle fiscale TNS (Code général des impôts, basé sur PASS N-1 = 46 368 € pour 2025). | Remplacement de l'approximation par le calcul réglementaire pour plus de précision. |
| Impôt sur le revenu | Barème 2025 | • 0 % : ≤ 11 497 € • 11 % : 11 498–29 315 € • 30 % : 29 316–83 823 € • 41 % : 83 824–180 294 € • 45 % : > 180 294 € | Barème officiel 2025 (revenus 2024), revalorisé de +1,8% vs 2024. economie.gouv.fr | - |
|  | Ajustement des tranches | Augmentation de 1,5 %/an (inflation). | Hypothèse basée sur l’inflation moyenne (INSEE). | Simplification : progression fixe (pas d’ajustement pour politiques fiscales futures). |
| Capital total brut/net | Formule | Capital initial = Investissement initial × (1 - Frais d’entrée) × (1 + Rendement net)^Durée. Versements = Somme des versements annuels composés (après frais d’entrée). | Formule standard des rentes composées. | Ajout de la prise en compte des frais d’entrée avant le calcul. |
| Fiscalité à la sortie | TMI à la retraite | TMI finale (après progression des revenus). | Hypothèse simplifiée (pas de prise en compte des revenus spécifiques à la retraite). Alternative: appliquer un taux de remplacement (~70%) au dernier revenu puis calculer l'impôt correspondant. | Simplification : évite de demander les revenus futurs (pensions, etc.). |
|  | Plus-value | PFU de 30 % (12,8 % impôt + 17,2 % prélèvements sociaux). | Règle fiscale standard (option PFU choisie pour simplifier). Précision : Option pour le barème progressif possible. | Simplification : suppose l’option PFU. |
|  | Versements | Imposés à la TMI à la retraite (barème progressif). Exonérés de prélèvements sociaux. | Règle fiscale standard (versements déductibles à l’entrée). | Correction: pas de PS sur les versements. |
|  | Rente | Rente brute soumise au barème IR comme une pension de retraite, après abattement de 10 % (plafonné, ~4 200 € en 2025). Soumise aux prélèvements sociaux sur les pensions (CSG 8,3 %/3,8 %/0 %, CRDS 0,5 %, Casa 0,3 % = 9,1 % / 4,3 % / 0 % selon revenu fiscal de référence). | Règle fiscale des pensions de retraite (Service-Public.fr). Le régime RVTO (40 % à 64 ans) ne s'applique pas. | Simplification : Utiliser un taux de PS fixe (ex: 9,1 %) ou indiquer que cela dépendra des revenus futurs. |
| Comparaison avec Ramify | Rendements nets | Défensif : 2,1 % ; Équilibré : 6,1 % ; Agressif : 10,51 %. Note : Performance annuelle historique, nette de frais de gestion et de supports d'investissement, non garantie et ne préjuge pas des performances futures. | Données fournies par Ramify (screenshot : Profil 9/10 = 10,51 %). Équilibré estimé (moyenne entre fonds euros et profil agressif). | Ajouter la mention réglementaire. |
|  | Frais d’entrée | 0 % | Données fournies par Ramify. | - |
|  | Frais totaux | 1,15 % (moyenne de 1 % à 1,3 %) | Données fournies par Ramify. | Simplification : moyenne pour uniformiser les calculs. |
|  | Outputs comparés | Total versements, Capital total brut, Plus-value, Capital net de frais et impôts, Impact frais, Impact impôts, 3 types de sortie (rente, capital, fractionné). | Couvre tous les outputs impactés par les frais et performances. | Comparaison ajoutée pour tous les outputs pertinents (et non visible dans l’input Type de contrat). |
</aside>

<aside>

## Inputs et Outputs du simulateur

`Note : en bullets points d’abord avec qques indications, puis il y a un tableau, puis formules et pseudo-code après pour faciliter l’implémentation`

### Inputs

- Âge
    - Hypothèse d’âge départ retraite : 64 ans (**Avertissement** : valable pour nés ≥ 1968)
- Situation professionnelle
    - Salarié
    - Retraité
    - Indépendant
        - Tooltip pour clarifier "Indépendant" ("Par exemple : professions libérales, commerçants, artisans, agriculteurs").
- Frais réels (oui/non)
    - Si non, abattement forfaitaire de 10 % (mais maximum = 14 426 €; minimum 504 €) sur les revenus
    - Si oui, demander le montant annuel des frais réels, et en faire la déduction sur les revenus
    - Tooltip : "Si vous optez pour les frais réels lors de votre déclaration d’impôt (par exemple, frais de trajet, repas), cochez ‘Oui’ et indiquez le montant annuel.”
- Revenus nets avant impôts du foyer
- Nombre parts fiscales foyer
    - Tooltip : "Le nombre de parts dépend de votre situation familiale (1 pour un célibataire, 2 pour un couple, +0,5 par enfant, etc.). **Note** : Pour les couples (>1 part), le plafond de déduction PER est calculé en supposant une répartition égale (50/50) des revenus."
- Evolution revenu
    - Pour Retraité supposer progression 1,5% / an pour inflation
    - Pour Salarié ou indépendant
        - Faible (1%)
        - Moyenne (3%)
        - Forte (5 %)
    - Calcul : Approximation du revenu moyen sur la période mais si possible calculer l’avantage fiscal année par année (en ajustant les tranches fiscales pour l’inflation, par exemple 1,5 %/an).
    - Tooltip : “L’évolution de vos revenus dépend de votre situation. Par exemple, 3 % correspond à l’inflation + une augmentation annuelle. Si vous ne savez pas, choisissez ‘Moyenne’.”
- PER déjà ouvert ou pas
    - Si oui :
        - Investissement initial
        - versements déjà effectués en 2025
        - versements mensuels prévus jusqu’à votre retraite
            - convertir en versement annuel pour simplifier calcul (x12)
    - Si non :
        - Investissement initial prévu
        - Versements mensuels prévus jusqu’à votre retraite
            - convertir en versement annuel pour simplifier calcul (x12)
    - Note : Si possible, augmenter les versements proportionnellement à l’augmentation estimée des revenus
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
    - Ramify n’est pas visible comme option dans l’input "Type de contrat", mais est utilisé en interne pour la comparaison.
- Profil / Répartition
    - Défensif (100% fonds euros)
    - Equilibré (50% fonds euros / 50 % UC)
    - Agressif (100 % UC)
    - Tooltip : ("Défensif : sécurité maximale, mais rendement plus faible ; Équilibré : compromis entre sécurité et performance ; Agressif : potentiel de rendement élevé, mais plus risqué").

### Outputs

- Sur l’année en cours
    - Impôts sur l’année sans / avec PER, effort épargne réel correspondant
    - TMI et taux moyen d’imposition
    - Plafond déduction
        - Utilisation du calcul réglementaire TNS (basé sur bénéfice imposable N-1, proxifié par revenu net N). Plafonds min/max 2025 appliqués.
- A l’échéance (retraite)
    - Capital total brut
        - Total versements
        - Plus value
    - Capital net frais et impôts
        - Impact frais
        - Impact impôts (calculé en séparant IR sur versements et PFU/barème + PS sur plus-value)
        - Economie d’impôt réalisée
        - Effort épargne réel
        - Supposer TMI à la retraite = à la TMI actuelle, ajustée pour l’évolution des revenus (ou méthode alternative du taux de remplacement).
- Montant capital pour les 3 types de sortie
    - 100% en Rente (fiscalité des pensions : barème IR après abattement 10% + PS spécifiques)
    - 100% en Capital (fiscalité : IR sur versements, PFU/barème + PS sur plus-value)
    - Capital fractionné sur 10 ans (fiscalité : idem sortie en capital, **simplification** : impôt calculé sur la totalité au moment du premier retrait partiel, au lieu d'un calcul prorata à chaque retrait).
    - Pour simplifier fiscalité :
        - PFU (30 %) par défaut pour la plus-value (option barème possible mais non simulée ici).
        - TMI à la retraite égale à la TMI finale (après progression des revenus).
        - Pour la rente, taux de conversion fixe (par exemple, 4 %, **note** : ce taux dépendra des conditions futures) et appliquer la fiscalité des pensions (abattement 10 % + barème IR + PS ~9.1 %).
- Comparaison avec Ramify à inclure pour tous les outputs impactés (”Avec Ramify vous auriez…” )
    - Défensif : 2,1 % ; frais : 0,7 % ; Net : 2,1 %
    - Équilibré : 7,23 % ; frais : 1,15 % ; Net : 6,1 %
    - Agressif : 11,66 % ; frais : 1,15 % ; Net : 10,51 %
    - **Note** : Performance historique non garantie.
- Graphs dans le style des simulateurs concurrents pour aider à la visualisation, + autres graphs que vous pensez être pertinents

### Tableau des Inputs/Outputs

| Nom | Type | Tooltip | Description | Valeurs possibles | Dépendances |
| --- | --- | --- | --- | --- | --- |
| Âge | Input | Indiquez votre âge actuel. | Âge de l’utilisateur, utilisé pour calculer la durée d’épargne jusqu’à la retraite (fixée à 64 ans, avertissement pour nés < 1968). | 18-64 ans | - |
| Situation professionnelle | Input | Quelle est votre situation professionnelle ? | Permet d’ajuster le plafond de déductibilité (selon règles Salarié/TNS) et les abattements sur les revenus. | Salarié / Retraité / Indépendant | - |
|  |  | Par exemple : professions libérales, commerçants, artisans, agriculteurs. | (Tooltip spécifique pour "Indépendant") |  |  |
| Évolution des revenus | Input | Quelle est l’évolution annuelle estimée de vos revenus ? | Permet d’ajuster les revenus et les versements futurs pour refléter la progression des revenus. | Faible (1 %) / Moyenne (3 %) / Forte (5 %) | Situation professionnelle (non demandé pour Retraité, progression fixée à 1,5 %) |
|  |  | L’évolution de vos revenus dépend de votre situation. Par exemple, 3 % correspond à l’inflation + une augmentation annuelle. Si vous ne savez pas, choisissez ‘Moyenne’. | (Tooltip pour l’utilisateur) |  |  |
| Type de contrat | Input | Quel type de contrat PER choisissez-vous ? | Détermine les frais d’entrée et les rendements nets en fonction du type de contrat. Ramify est utilisé en interne pour la comparaison, mais non visible comme option. | Courtier en ligne / Banque ou Assureur traditionnel | - |
| Profil / Répartition | Input | Quel est votre profil de risque ? | Détermine le rendement net en fonction de la répartition entre fonds euros et unités de compte (UC). | Défensif (100 % fonds euros) / Équilibré (50 % fonds euros / 50 % UC) / Agressif (100 % UC) | Type de contrat |
|  |  | Défensif : sécurité maximale, mais rendement plus faible ; Équilibré : compromis entre sécurité et performance ; Agressif : potentiel de rendement élevé, mais plus risqué. | (Tooltip pour l’utilisateur) |  |  |
| Revenus nets avant impôts du foyer | Input | Indiquez vos revenus nets annuels avant impôt sur le revenu (après prélèvements sociaux, comme indiqué sur votre avis d’imposition). | Revenus nets du foyer, utilisés pour calculer le revenu imposable et la TMI. Base pour calcul plafond PER. | 0 € et plus | - |
| Nombre de parts fiscales du foyer | Input | Indiquez le nombre de parts fiscales de votre foyer. | Permet de calculer la TMI et le taux moyen d’imposition. | 1 et plus (décimales possibles, ex. 1,5) | - |
|  |  | Le nombre de parts dépend de votre situation familiale (1 pour un célibataire, 2 pour un couple, +0,5 par enfant, etc.). Note : Pour les couples (>1 part), le plafond de déduction PER est calculé en supposant une répartition égale (50/50) des revenus. | (Tooltip pour l’utilisateur) |  |  |
| Frais réels | Input | Optez-vous pour les frais réels lors de votre déclaration d’impôt ? | Permet de calculer le revenu imposable en déduisant les frais professionnels. | Oui / Non | Revenus nets avant impôts du foyer |
|  |  | Si vous optez pour les frais réels lors de votre déclaration d’impôt (par exemple, frais de trajet, repas), cochez ‘Oui’ et indiquez le montant annuel. | (Tooltip pour l’utilisateur) |  |  |
| Montant des frais réels | Input | Indiquez le montant annuel de vos frais réels. | Montant des frais réels à déduire des revenus nets pour calculer le revenu imposable. | 0 € et plus (si Frais réels = Oui) | Frais réels |
| PER déjà ouvert | Input | Avez-vous déjà ouvert un PER ? | Permet de distinguer les utilisateurs avec un PER existant de ceux qui envisagent d’en ouvrir un. | Oui / Non | - |
| Investissement initial | Input | Quel est l’investissement initial de votre PER ? (si PER déjà ouvert) | Capital initial déjà investi dans le PER (si PER déjà ouvert). | 0 € et plus | PER déjà ouvert |
|  |  | Quel est l’investissement initial prévu pour votre PER ? (si PER non ouvert) | Capital initial prévu pour le PER (si PER non ouvert). |  |  |
| Versements déjà effectués en 2025 | Input | Quel est le montant des versements déjà effectués en 2025 ? | Versements effectués dans l’année en cours (2025), pour les PER déjà ouverts. | 0 € et plus | PER déjà ouvert |
| Versements mensuels prévus | Input | Combien prévoyez-vous de verser chaque mois jusqu’à votre départ à la retraite ? | Versements mensuels prévus jusqu’à la retraite, convertis en versements annuels pour les calculs. | 0 € et plus | - |
| Impôts sur l’année sans PER | Output | Impôt sur le revenu estimé pour l’année en cours sans PER. | Impôt calculé sur le revenu imposable sans déduction des versements PER (barème 2025). | - | Revenus nets, Nombre de parts fiscales, Frais réels, Montant des frais réels |
| Impôts sur l’année avec PER | Output | Impôt sur le revenu estimé pour l’année en cours avec PER. | Impôt calculé après déduction des versements PER pour l’année en cours (dans la limite du plafond). | - | Impôts sans PER, Versements annuels (2025), Plafond de déduction |
| Effort d’épargne réel (année en cours) | Output | Effort d’épargne réel pour l’année en cours. | Versements effectués dans l’année en cours, ajustés pour l’économie d’impôt. | - | Impôts sans/avec PER, Versements annuels (2025) |
| TMI | Output | Votre tranche marginale d’imposition (TMI) pour l’année en cours. | TMI basée sur le revenu imposable et le nombre de parts fiscales (barème 2025). | - | Revenus nets, Nombre de parts fiscales, Frais réels, Montant des frais réels |
| Taux moyen d’imposition | Output | Votre taux moyen d’imposition pour l’année en cours. | Taux moyen d’imposition basé sur l’impôt total et le revenu imposable. | - | Impôts sans PER, Revenus nets, Frais réels, Montant des frais réels |
| Plafond de déduction | Output | Votre plafond de déductibilité pour les versements PER pour 2025. | Plafond de déduction fiscale pour les versements PER, basé sur les revenus N-1 (proxifiés par N), la situation professionnelle (règles Salarié/TNS 2025) et éventuellement plafonds reportables (non simulé V1). | - | Situation professionnelle, Revenus nets, Frais réels, Montant des frais réels |
| Capital total brut | Output | Capital accumulé à la retraite (brut). | Somme des versements et des gains, avant impôts à la sortie (mais après frais de gestion inclus dans le rendement net). | - | Âge, Type de contrat, Profil, Investissement initial, Versements annuels |
|  |  | Comparaison avec Ramify : Avec Ramify, vous auriez… (performance historique non garantie) | Comparaison avec Ramify pour le capital brut, total versements, plus-value, capital net, impact frais, impact impôts, et types de sortie. | - | Type de contrat |
| Total versements | Output | Total des versements effectués jusqu’à la retraite (nets de frais d'entrée). | Somme de tous les versements (initial + annuels, après frais d'entrée) sur la durée d’épargne. | - | Investissement initial, Versements annuels, Âge, Type de contrat |
|  |  | Comparaison avec Ramify : Avec Ramify, vous auriez… | Comparaison avec Ramify pour le total des versements. | - | Type de contrat |
| Plus-value | Output | Plus-value générée par votre PER à la retraite. | Gains générés par les investissements (capital total brut - total versements nets de frais d'entrée). | - | Capital total brut, Total versements |
|  |  | Comparaison avec Ramify : Avec Ramify, vous auriez… (performance historique non garantie) | Comparaison avec Ramify pour la plus-value. | - | Type of contrat |
| Capital net de frais et impôts | Output | Capital net après impôts à la retraite (sortie en capital). | Capital total brut, ajusté pour les impôts à la sortie (IR sur versements + PFU/barème et PS sur plus-value). Frais déjà déduits via rendement net. | - | Capital total brut, Total versements, Plus-value, TMI à la retraite |
|  |  | Comparaison avec Ramify : Avec Ramify, vous auriez… (performance historique non garantie) | Comparaison avec Ramify pour le capital net. | - | Type de contrat |
| Impact frais | Output | Impact des frais de gestion sur votre capital à la retraite. | Différence entre le capital brut qui aurait été obtenu sans frais de gestion (calculé avec rendement brut) et le capital brut obtenu (calculé avec rendement net). | - | Capital total brut, Type de contrat, Profil |
|  |  | Comparaison avec Ramify : Avec Ramify, l’impact des frais serait… | Comparaison avec Ramify pour l’impact des frais. | - | Type de contrat |
| Impact impôts | Output | Impact des impôts à la sortie sur votre capital (sortie en capital). | Impôts estimés à la sortie : IR sur versements (TMI retraite) + PFU/barème sur plus-value (12.8% IR) + PS sur plus-value (17.2%). | - | Total versements, Plus-value, TMI à la retraite |
|  |  | Comparaison avec Ramify : Avec Ramify, l’impact des impôts serait… | Comparaison avec Ramify pour l’impact des impôts. | - | Type de contrat |
| Économie d’impôt réalisée | Output | Économie d’impôt totale réalisée sur toute la période. | Somme des économies d’impôt annuelles sur toute la durée d’épargne. | - | Impôts sans/avec PER (chaque année), Âge |
| Effort d’épargne réel (total) | Output | Effort d’épargne réel sur toute la période. | Total des versements bruts (avant frais d'entrée), ajusté pour l’économie d’impôt totale. | - | Total versements (bruts), Économie d’impôt réalisée |
| Capital en rente (100 %) | Output | Montant annuel net estimé si sortie 100 % en rente. | Rente annuelle estimée (taux de conversion ~4%), nette de fiscalité des pensions (IR après abattement 10% + PS ~9.1%). | - | Capital net de frais et impôts, TMI à la retraite |
|  |  | Comparaison avec Ramify : Avec Ramify, vous auriez… (performance historique non garantie) | Comparaison avec Ramify pour la rente nette. | - | Type de contrat |
| Capital en capital (100 %) | Output | Montant net si sortie 100 % en capital. | Capital net après impôts (IR sur versements, PFU/barème + PS sur plus-value), si sortie en une seule fois. | - | Capital net de frais et impôts |
|  |  | Comparaison avec Ramify : Avec Ramify, vous auriez… (performance historique non garantie) | Comparaison avec Ramify pour le capital net. | - | Type de contrat |
| Capital fractionné sur 10 ans | Output | Montant annuel brut si sortie fractionnée sur 10 ans (avant impôts annuels). | Capital total brut divisé par 10. Note fiscale simplifiée : L'impôt (IR sur part versement, PFU/barème+PS sur part PV) est calculé sur le total au début et déduit du capital net présenté, alors qu'en réalité il est dû au prorata à chaque retrait. | - | Capital total brut |
|  |  | Comparaison avec Ramify : Avec Ramify, vous auriez… (performance historique non garantie) | Comparaison avec Ramify pour le capital fractionné brut annuel. | - | Type de contrat |
</aside>

<aside>

## Flux de calcul (étapes séquentielles, formules)

`(Formules à vérifier par expert Ramify également svp)`

**Étape 1 : Calculer la durée d’épargne**

- **Formule** : Durée = 64 - Âge.
- **Hypothèse** : Âge de départ à la retraite = 64 ans. **Avertissement** : Valable pour les assurés nés à partir de 1968.
- **Exemple** : Âge = 40 → Durée = 64 - 40 = 24 ans.
- **Pseudo-code** :
    
    `// Afficher avertissement si âge implique naissance < 1968
    durée = 64 - âge`
    

**Étape 2 : Calculer l’évolution des revenus et le revenu annuel**

- **Règle** :
    - Si Situation professionnelle = Retraité : Progression = 1,5 %/an (inflation).
    - Sinon : Progression = Évolution des revenus (1 %, 3 %, ou 5 %).
- **Formule (revenu annuel)** : Revenu année n = Revenu initial × (1 + Progression)^(n-1).
- **Exemple** :
    - Revenu initial = 60 000 €, Progression = 3 %, Durée = 24 ans.
    - Revenu année 1 = 60 000 €, année 2 = 60 000 € × 1,03 = 61 800 €, année 24 = 60 000 € × (1,03)^23 ≈ 118 387 €.
- **Pseudo-code** :
    
    ```
    if (situation_professionnelle == "Retraité") {
      progression = 0.015
    } else {
      progression = évolution_revenus // 0.01, 0.03, ou 0.05
    }
    revenus_annuels = []
    for (année = 1; année <= durée; année++) {
      revenu_annee = revenu_initial * (1 + progression)^(année-1)
      revenus_annuels.push(revenu_annee)
    }
    ```
    

**Étape 3 : Calculer le revenu imposable (chaque année)**

- **Règle** :
    - Si Frais réels = Non : Abattement = Revenu année n × 10 %, avec min 504 €, max 14 426 € (seuils 2025).
    - Si Frais réels = Oui : Abattement = Montant des frais réels.
- **Formule** : Revenu imposable année n = Revenu année n - Abattement.
- **Exemple (Année 1)** :
    - Revenu année 1 = 60 000 €, Frais réels = Oui, Montant = 5 000 € → Revenu imposable = 60 000 - 5 000 = 55 000 €.
- **Pseudo-code** :
    
    ```
    revenus_imposables_annuels = []
    abattement_forfaitaire_min = 504
    abattement_forfaitaire_max = 14426
    for (année = 1; année <= durée; année++) {
      revenu_an = revenus_annuels[année-1]
      abattement = 0
      if (frais_réels == "Non") {
        abattement = revenu_an * 0.1
        if (abattement < abattement_forfaitaire_min) abattement = abattement_forfaitaire_min
        if (abattement > abattement_forfaitaire_max) abattement = abattement_forfaitaire_max
      } else {
        abattement = montant_frais_réels // Supposer fixe pour V1, ou prévoir input d'évolution?
      }
      revenu_imposable = revenu_an - abattement
      revenus_imposables_annuels.push(revenu_imposable)
    }
    ```
    

**Étape 4 : Calculer la TMI et le taux moyen d’imposition (chaque année)**

- **Formule** :
    - Quotient familial année n = Revenu imposable année n ÷ Nombre de parts fiscales.
    - Appliquer le barème progressif de l’impôt sur le revenu 2025 (ajusté pour l’inflation future : tranches augmentent de 1,5 %/an).
    - TMI = tranche correspondant au quotient familial.
    - Impôt année n = Somme des tranches appliquées au revenu imposable.
    - Taux moyen = Impôt année n ÷ Revenu imposable année n.
- **Barème 2025 (base)**: 0%: ≤11497€, 11%: 11498-29315€, 30%: 29316-83823€, 41%: 83824-180294€, 45%: >180294€.
- **Exemple (Année 1)** :
    - Revenu imposable = 55 000 €, Nombre de parts = 2 → Quotient = 27 500 €.
    - Barème 2025 : 11 % (27 500 € < 29 315 €). → TMI = 11 %.
    - Impôt = (27 500 € - 11 497 €) × 11 % × 2 = 16 003 € × 11 % × 2 ≈ 3 521 €.
    - Taux moyen = 3 521 € / 55 000 € ≈ 6,4 %.
- **Pseudo-code** :
    
    ```
    tmi_annuel = []
    taux_moyen_annuel = []
    impot_sans_per_annuel = []
    inflation_fiscale = 0.015 // Hypothèse
    base_tranches_2025 = [0, 11497, 29315, 83823, 180294]
    taux_tranches = [0, 0.11, 0.30, 0.41, 0.45]
    
    function calculer_impot(revenu_imp, nb_parts, annee) {
        quotient = revenu_imp / nb_parts
        tranches_annee = base_tranches_2025.map(t => t * (1 + inflation_fiscale)^(annee-1))
        impot_par_part = 0
        current_tmi = 0
        for (i = 1; i < tranches_annee.length; i++) {
            if (quotient > tranches_annee[i-1]) {
                base_tranche = tranches_annee[i-1]
                plafond_tranche = tranches_annee[i]
                montant_dans_tranche = min(quotient, plafond_tranche) - base_tranche
                impot_par_part += montant_dans_tranche * taux_tranches[i]
                if (quotient <= plafond_tranche) {
                  current_tmi = taux_tranches[i]
                  break; // Sortir si on a trouvé la tranche max
                }
            }
             if (i == tranches_annee.length - 1 && quotient > tranches_annee[i]) { // Dernière tranche
                 montant_dans_tranche = quotient - tranches_annee[i]
                 impot_par_part += montant_dans_tranche * taux_tranches[i+1] // Utilise le dernier taux
                 current_tmi = taux_tranches[i+1]
             }
        }
         // Correction pour la dernière tranche 45%
         if (quotient > tranches_annee[4]) {
             montant_dans_tranche = quotient - tranches_annee[4]
             impot_par_part += montant_dans_tranche * taux_tranches[4] // Appliquer 45%
             current_tmi = taux_tranches[4]
         }
    
        impot_total = impot_par_part * nb_parts
        current_taux_moyen = (revenu_imp > 0) ? impot_total / revenu_imp : 0
        return {impot: impot_total, tmi: current_tmi, taux_moyen: current_taux_moyen}
    }
    
    for (année = 1; année <= durée; année++) {
        revenu_imp = revenus_imposables_annuels[année-1]
        resultat_impot = calculer_impot(revenu_imp, nombre_parts, année)
        impot_sans_per_annuel.push(resultat_impot.impot)
        tmi_annuel.push(resultat_impot.tmi)
        taux_moyen_annuel.push(resultat_impot.taux_moyen)
    }
    ```
    

**Étape 5 : Calculer le plafond de déduction (chaque année)**

- **Règle (pour versements 2025)** : Basé sur revenus et PASS **2024** (N-1). Pour années suivantes, N+1 basé sur N.
    - **Salarié ou Retraité** : Max(10% Revenu imposable N-1 ; 10% PASS N-1). Plafonné à 10% de 8 PASS N-1. (Pour 2025: Min 4 637 €, Max 37 094 €).
    - **Indépendant (TNS)** : 10% Bénéfice imposable N-1 (limité à 8 PASS N-1) + 15% (Bénéfice N-1 - PASS N-1) (cette part limitée à 15% de 7 PASS N-1). Plancher TNS (4 637 €), Plafond TNS (85 780 € pour 2025). Utiliser Revenu Net N comme proxy pour Bénéfice N-1.
    - **Couple (>1 part)** : Plafond individualisé. Hypothèse 50/50 des revenus pour V1.
- **PASS 2024 (pour calculs 2025)** = 46 368 €.
- **Exemple (Année 1 - Versement 2025)** :
    - Salarié, Revenu imposable N (proxy N-1) = 55 000 € → Plafond = 10% * 55 000 € = 5 500 €. (Entre min 4 637 € et max 37 094 €).
    - Indépendant, Revenu N (proxy N-1) = 60 000 €, PASS 2024 = 46 368 €.
        - Partie 1 = 10% * 60 000 = 6 000 € (inférieur à 10% * 8 * PASS N-1).
        - Partie 2 = 15% * (60 000 - 46 368) = 15% * 13 632 = 2 044.8 €.
        - Plafond Total = 6 000 + 2 044.8 = 8 044.8 €. (Supérieur au min 4 637 €, inférieur au max 85 780 €).
- **Pseudo-code (calcul pour l'année `annee_versement`)** :
    
    ```
    plafond_deduction_annuel = []
    
    function calculer_plafond(annee_versement) {
        // Utiliser revenus N-1 (ou N comme proxy) et PASS N-1
        // Pour 2025, PASS_N_1 = 46368. Pour 2026, PASS_N_1 = 47100 * (1+inflation)^0 ? Utiliser 47100? Simplifions: utiliser PASS de l'année N-1 (ex: 46368 pour 2025)
        PASS_N_1 = 46368 * (1 + inflation_fiscale)^(annee_versement - 2) // Approximation PASS N-1
        PASS_8_N_1 = PASS_N_1 * 8
    
        PLAFOND_MIN_SALARIE = 0.1 * PASS_N_1 // 4637 for 2025
        PLAFOND_MAX_SALARIE = 0.1 * PASS_8_N_1 // 37094 for 2025
        PLAFOND_MIN_TNS = PLAFOND_MIN_SALARIE // 4637 for 2025 (peut être spécifique)
        PLAFOND_MAX_TNS = 0.10 * PASS_8_N_1 + 0.15 * (PASS_8_N_1 - PASS_N_1) // 85780 for 2025
    
        // Utiliser revenu N-1. Approximation: utiliser revenu N de l'année précédente.
        revenu_n_1 = (annee_versement > 1) ? revenus_annuels[annee_versement-2] : revenu_initial // Proxy très simplifié
        revenu_imposable_n_1 = (annee_versement > 1) ? revenus_imposables_annuels[annee_versement-2] : revenus_imposables_annuels[0] // Proxy
    
        plafond = 0
        revenu_calc = revenu_n_1 // Pour TNS, utiliser revenu brut avant abattement
    
        // Gérer couple 50/50 si > 1 part
        revenu_indiv = (nombre_parts > 1) ? revenu_calc / 2 : revenu_calc
        revenu_imp_indiv = (nombre_parts > 1) ? revenu_imposable_n_1 / 2 : revenu_imposable_n_1
    
        if (situation_professionnelle == "Salarié" || situation_professionnelle == "Retraité") {
          plafond = max(0.1 * revenu_imp_indiv, PLAFOND_MIN_SALARIE)
          plafond = min(plafond, PLAFOND_MAX_SALARIE)
        } else { // Indépendant (TNS)
          benefice_imposable = revenu_indiv // Approximation
          plafond_partie1 = 0.10 * min(benefice_imposable, PASS_8_N_1)
          plafond_partie2 = 0
          if (benefice_imposable > PASS_N_1) {
              tranche_partie2 = min(benefice_imposable, PASS_8_N_1) - PASS_N_1
              plafond_partie2 = 0.15 * max(0, tranche_partie2)
          }
          plafond = plafond_partie1 + plafond_partie2
          plafond = max(plafond, PLAFOND_MIN_TNS)
          plafond = min(plafond, PLAFOND_MAX_TNS)
        }
        // Si couple, plafond total = plafond_indiv * 2 (simplifié)
        plafond_final = (nombre_parts > 1) ? plafond * nombre_parts : plafond
        return plafond_final
    }
    
     for (année = 1; année <= durée; année++) {
         plafond = calculer_plafond(année) // Plafond pour versements de l'année 'année'
         plafond_deduction_annuel.push(plafond)
     }
    ```
    

**Étape 6 : Calculer les versements annuels**

- **Règle** :
    - Versement annuel = Versement mensuel × 12.
    - Augmenter proportionnellement à l’évolution des revenus : Versement année n = Versement initial × (1 + Progression)^(n-1).
- **Exemple** :
    - Versement mensuel = 500 € → Versement initial = 500 € × 12 = 6 000 €.
    - Progression = 3 % → Versement année 1 = 6 000 €, année 2 = 6 000 € × 1,03 = 6 180 €, année 24 = 6 000 € × (1,03)^23 ≈ 11 839 €.
- **Pseudo-code** :
    
    ```
    versements_annuels_bruts = []
    versement_annuel_initial = versement_mensuel * 12
    // Ajouter versement 2025 si PER déjà ouvert
    if (per_deja_ouvert == "Oui") {
        // Gérer cas particulier année 1 si versements 2025 fournis
        // ... logique à affiner ici ...
    }
    
    for (année = 1; année <= durée; année++) {
      versement_an = versement_annuel_initial * (1 + progression)^(année-1)
      // S'assurer que le versement de l'année 1 correspond à ce qui est prévu si déjà ouvert
      versements_annuels_bruts.push(versement_an)
    }
    ```
    

**Étape 7 : Calculer l’impôt avec PER et l’effort d’épargne (chaque année)**

- **Règle** :
    - Versement déductible année n = min(Versement année n (brut), Plafond déduction année n).
    - Revenu imposable avec PER = Revenu imposable année n - Versement déductible année n.
    - Recalculer l’impôt avec le nouveau revenu imposable (même méthode qu’à l’étape 4, avec barème de l'année n).
- **Exemple (Année 1)** :
    - Versement = 6 000 €, Plafond (calculé en Etape 5) = 5 500 € → Versement déductible = 5 500 €.
    - Revenu imposable avec PER = 55 000 € - 5 500 € = 49 500 €.
    - Impôt sans PER = 3 521 €. Recalculer impôt avec 49 500 € : Quotient = 24 750 €. Impôt = (24 750 € - 11 497 €) × 11 % × 2 ≈ 2 915 €.
    - Économie d’impôt = 3 521 € - 2 915 € = 606 €.
    - Effort d’épargne = 6 000 € - 606 € = 5 394 €.
- **Pseudo-code** :
    
    ```
    impot_avec_per_annuel = []
    economie_impot_annuel = []
    effort_epargne_annuel = []
    versements_deductibles_annuels = []
    
    for (année = 1; année <= durée; année++) {
        versement_an = versements_annuels_bruts[année-1]
        plafond_an = plafond_deduction_annuel[année-1]
        versement_deductible = min(versement_an, plafond_an)
        versements_deductibles_annuels.push(versement_deductible)
    
        revenu_imp_avant_deduction = revenus_imposables_annuels[année-1]
        revenu_imposable_avec_PER = revenu_imp_avant_deduction - versement_deductible
    
        resultat_impot_avec_per = calculer_impot(revenu_imposable_avec_PER, nombre_parts, année)
        impot_avec_per_annuel.push(resultat_impot_avec_per.impot)
    
        economie_impot = impot_sans_per_annuel[année-1] - resultat_impot_avec_per.impot
        economie_impot_annuel.push(economie_impot)
    
        effort_epargne = versement_an - economie_impot
        effort_epargne_annuel.push(effort_epargne)
    }
    ```
    

**Étape 8 : Calculer le capital total brut**

- **Formule** :
    - Investissement initial net = Investissement initial × (1 - Frais d’entrée).
    - Capital initial accumulé = Investissement initial net × (1 + Rendement net)^Durée.
    - Versements accumulés = Somme [ Versement année n × (1 - Frais d’entrée) × (1 + Rendement net)^(Durée - n) ] pour n=1 à Durée.
    - Capital total brut = Capital initial accumulé + Versements accumulés.
- **Rendement net de frais** (dépend de Type de contrat et Profil) :
    - Courtier en ligne : Défensif 2,1 %, Équilibré 3,0 %, Agressif 3,9 %.
    - Banque/assureur traditionnel : Défensif 1,8 %, Équilibré 2,7 %, Agressif 3,6 %.
- **Frais d’entrée** :
    - Courtier en ligne : 0 %.
    - Banque/assureur traditionnel : 2 %.
- **Exemple** :
    - Âge = 40, Durée = 24 ans, Courtier en ligne, Profil Équilibré (3,0 %), Investissement initial = 10 000 €, Versement mensuel = 500 € (6 000 €/an initial), Progression = 3 %. Frais entrée = 0%.
    - Capital initial accumulé = 10 000 € × (1 - 0) × (1,03)^24 ≈ 20 328 €.
    - Versements accumulés : Versement année 1 = 6 000 € × (1,03)^23 ≈ 11 839 €, ..., Versement année 24 = 11 839 € × (1,03)^0 = 11 839 €. Total accumulé ≈ 243 850 € (calcul exact requis).
    - Capital total brut ≈ 20 328 € + 243 850 € ≈ 264 178 €.
- **Pseudo-code** :
    
    ```
    rendement_net = 0
    frais_entree = 0
    if (type_contrat == "Courtier en ligne") {
      frais_entree = 0
      if (profil == "Défensif") rendement_net = 0.021
      else if (profil == "Équilibré") rendement_net = 0.030
      else rendement_net = 0.039 // Agressif
    } else { // Banque ou Assureur traditionnel
      frais_entree = 0.02
      if (profil == "Défensif") rendement_net = 0.018
      else if (profil == "Équilibré") rendement_net = 0.027
      else rendement_net = 0.036 // Agressif
    }
    
    investissement_initial_net = investissement_initial * (1 - frais_entree)
    capital_initial_accumule = investissement_initial_net * (1 + rendement_net)^durée
    
    total_versements_nets = 0 // Somme des versements après frais d'entrée
    capital_versements_accumules = 0
    for (année = 1; année <= durée; année++) {
      versement_brut_an = versements_annuels_bruts[année-1]
      versement_net_an = versement_brut_an * (1 - frais_entree)
      total_versements_nets += versement_net_an
      capital_versements_accumules += versement_net_an * (1 + rendement_net)^(durée - année)
    }
    
    capital_total_brut = capital_initial_accumule + capital_versements_accumules
    total_versements_bruts_cumules = sum(versements_annuels_bruts) // Somme des versements avant frais d'entrée
    
    // Total des apports nets de frais d'entrée
    total_apports_nets = investissement_initial_net + total_versements_nets
    plus_value = capital_total_brut - total_apports_nets
    ```
    

**Étape 9 : Calculer l’économie d’impôt totale et l’effort d’épargne réel**

- **Formule** :
    - Économie d’impôt totale = Somme des économies d’impôt annuelles.
    - Effort d’épargne réel total = Somme des versements annuels bruts - Économie d’impôt totale.
- **Exemple** (basé sur chiffres approx. précédents):
    - Économie impôt Année 1 = 606 €, ... Somme sur 24 ans = ? (nécessite calcul complet). Supposons ~ 20 000 €.
    - Total versements bruts = 10 000 (initial) + somme(6000 * 1.03^(n-1)) sur 24 ans ≈ 10000 + 212 500 = 222 500 €.
    - Effort d’épargne réel = 222 500 € - 20 000 € = 202 500 €.
- **Pseudo-code** :
    
    ```
    economie_impot_totale = sum(economie_impot_annuel)
    effort_epargne_reel_total = (investissement_initial + total_versements_bruts_cumules) - economie_impot_totale
    ```
    

**Étape 10 : Calculer le capital net de frais et impôts (sortie en capital)**

- **Règle (Fiscalité sortie capital)** :
    - **Versements** : Imposés au barème IR (TMI à la retraite). Pas de PS.
    - **Plus-value** : Imposée au PFU (12.8% IR + 17.2% PS = 30%) ou sur option au barème (+ 17.2% PS). Hypothèse PFU ici.
- **Calcul TMI Retraite** : Utiliser TMI de la dernière année calculée (année `durée`) ou méthode alternative (taux remplacement).
- **Calcul Impact Frais** : Différence entre simulation avec rendement *brut* et simulation avec rendement *net*.
- **Calcul Impact Impôts** : Impôt sur Versements + Impôt sur Plus-value.
- **Calcul Capital Net** : Capital Total Brut - Impact Impôts.
- **Rendements bruts** :
    - Courtier en ligne / Banque : Défensif 2,8 %, Équilibré 4,15 %, Agressif 5,5 %.
- **Exemple** :
    - Capital total brut = 264 178 €, Total apports nets = 10000 + 208250 = 218250 €, Plus-value = 45 928 €.
    - TMI finale (année 24) = ? Supposons 30 %.
    - **Impact Impôts**:
        - Impôt sur Versements = total_apports_nets * TMI_retraite = 218 250 € * 30% = 65 475 €.
        - Impôt sur Plus-value = plus_value * 30% = 45 928 € * 30% = 13 778 €.
        - Total Impact Impôts = 65 475 € + 13 778 € = 79 253 €.
    - **Capital Net** = 264 178 € - 79 253 € = 184 925 €.
    - **Impact Frais**: Recalculer capital brut avec rendement *brut* (ex: 4.15% pour Équilibré) et faire la différence.
- **Pseudo-code** :
    
    ```
    // Calcul de l’impact des frais
    rendement_brut = 0
    if (type_contrat == "Courtier en ligne" || type_contrat == "Banque ou Assureur traditionnel") {
        if (profil == "Défensif") rendement_brut = 0.028
        else if (profil == "Équilibré") rendement_brut = 0.0415
        else rendement_brut = 0.055 // Agressif
    }
    // Recalculer capital total avec rendement brut (sans frais de gestion, mais AVEC frais d'entrée)
    capital_initial_accumule_brut = investissement_initial_net * (1 + rendement_brut)^durée
    capital_versements_accumules_brut = 0
    for (année = 1; année <= durée; année++) {
        versement_net_an = versements_annuels_bruts[année-1] * (1 - frais_entree)
        capital_versements_accumules_brut += versement_net_an * (1 + rendement_brut)^(durée - année)
    }
    capital_total_brut_sans_frais_gestion = capital_initial_accumule_brut + capital_versements_accumules_brut
    impact_frais_gestion = capital_total_brut_sans_frais_gestion - capital_total_brut
    impact_frais_entree = (investissement_initial + total_versements_bruts_cumules) * frais_entree // Approximation impact frais entrée
    
    // Calcul du capital net
    tmi_retraite = tmi_annuel[durée-1] // Utiliser TMI dernière année comme proxy
    
    impot_sur_versements = total_apports_nets * tmi_retraite
    impot_sur_plus_value_pfu = plus_value * 0.30 // 12.8% IR + 17.2% PS
    // Note: Si option barème: IR_PV = plus_value * tmi_retraite; PS_PV = plus_value * 0.172
    
    impact_impots_total = impot_sur_versements + impot_sur_plus_value_pfu
    capital_net_sortie_capital = capital_total_brut - impact_impots_total
    ```
    

**Étape 11 : Comparaison avec Ramify**

- **Rendements nets (Ramify)** : Défensif 2,1 %, Équilibré 6,1 %, Agressif 10,51 %. (**Mention performance historique non garantie**)
- **Frais d’entrée** : 0 %.
- **Outputs concernés** : Total versements, Capital total brut, Plus-value, Capital net de frais et impôts, Impact frais, Impact impôts, 3 types de sortie.
- **Formule** :
    - Recalculer chaque output pour Ramify en utilisant le rendement net Ramify correspondant et 0% frais d'entrée.
    - Recalculer l'impact frais en utilisant les rendements bruts Ramify.
    - Recalculer capital net et sorties avec la fiscalité appliquée au capital Ramify.
    - Calculer la différence en valeur et pourcentage.
- **Exemple** :
    - Ramify, Profil Équilibré (6,1 %), Frais entrée 0%.
    - Recalculer Capital total brut (Ramify) avec rendement 6.1%.
    - Recalculer Plus-value (Ramify).
    - Recalculer Impact Impôts (Ramify) sur ces montants.
    - Recalculer Capital Net (Ramify).
    - Comparer: "Avec Ramify, vous auriez X € (soit +/- Y % par rapport à votre contrat)."
- **Pseudo-code** :
    
    ```
    // --- Simulation Ramify ---
    rendement_net_ramify = 0
    rendement_brut_ramify = 0
    frais_entree_ramify = 0
    
    if (profil == "Défensif") { rendement_net_ramify = 0.021; rendement_brut_ramify = 0.028; } // Même que courtier? A vérifier
    else if (profil == "Équilibré") { rendement_net_ramify = 0.061; rendement_brut_ramify = 0.0723; }
    else { rendement_net_ramify = 0.1051; rendement_brut_ramify = 0.1166; } // Agressif
    
    // Recalculer Etape 8 avec perf Ramify et 0 frais entrée
    investissement_initial_net_ramify = investissement_initial * (1 - frais_entree_ramify)
    capital_initial_accumule_ramify = investissement_initial_net_ramify * (1 + rendement_net_ramify)^durée
    total_versements_nets_ramify = 0
    capital_versements_accumules_ramify = 0
    for (année = 1; année <= durée; année++) {
        versement_brut_an = versements_annuels_bruts[année-1]
        versement_net_an = versement_brut_an * (1 - frais_entree_ramify)
        total_versements_nets_ramify += versement_net_an
        capital_versements_accumules_ramify += versement_net_an * (1 + rendement_net_ramify)^(durée - année)
    }
    capital_total_brut_ramify = capital_initial_accumule_ramify + capital_versements_accumules_ramify
    total_apports_nets_ramify = investissement_initial_net_ramify + total_versements_nets_ramify
    plus_value_ramify = capital_total_brut_ramify - total_apports_nets_ramify
    
    // Recalculer Etape 10 avec perf Ramify
    // Impact Frais Ramify
     capital_initial_accumule_brut_ramify = investissement_initial_net_ramify * (1 + rendement_brut_ramify)^durée
     capital_versements_accumules_brut_ramify = 0
     for (année = 1; année <= durée; année++) {
         versement_net_an = versements_annuels_bruts[année-1] * (1 - frais_entree_ramify)
         capital_versements_accumules_brut_ramify += versement_net_an * (1 + rendement_brut_ramify)^(durée - année)
     }
     capital_total_brut_sans_frais_gestion_ramify = capital_initial_accumule_brut_ramify + capital_versements_accumules_brut_ramify
     impact_frais_gestion_ramify = capital_total_brut_sans_frais_gestion_ramify - capital_total_brut_ramify
     impact_frais_entree_ramify = 0 // Car frais entrée = 0
    
    // Impact Impots Ramify
    impot_sur_versements_ramify = total_apports_nets_ramify * tmi_retraite
    impot_sur_plus_value_pfu_ramify = plus_value_ramify * 0.30
    impact_impots_total_ramify = impot_sur_versements_ramify + impot_sur_plus_value_pfu_ramify
    capital_net_sortie_capital_ramify = capital_total_brut_ramify - impact_impots_total_ramify
    
    // Calculer différences et pourcentages pour affichage
    // ...
    ```
    

**Étape 12 : Calculer les montants pour les 3 types de sortie**

- **100 % en Capital** : `capital_net_sortie_capital` (déjà calculé à l'étape 10).
- **Capital fractionné sur 10 ans** :
    - Montant brut annuel = `capital_total_brut` / 10.
    - **Note fiscale simplifiée** : En théorie, l'impôt est dû chaque année au prorata. Ici, pour simplifier, on affiche le montant brut annuel et on a déjà calculé le capital net total après impôts (étape 10) comme si tout était sorti en one-shot. Préciser cette simplification.
- **100 % en Rente** :
    - Taux de conversion = 4 % (**Hypothèse**, dépendra des conditions futures).
    - Rente brute annuelle = `capital_net_sortie_capital` × 4 %.
    - Fiscalité pension :
        - Abattement = 10 % × Rente brute (plafonné ~4 200 €).
        - Rente imposable = Rente brute - Abattement.
        - Impôt sur rente = `calculer_impot(Rente imposable, nombre_parts, durée+1)` -> utiliser la fonction impôt avec la TMI retraite approx.
        - Prélèvements sociaux sur rente = Rente brute × 9,1 % (simplifié, dépendra des revenus).
        - Rente nette = Rente brute - Impôt sur rente - Prélèvements sociaux sur rente.
- **Exemple** :
    - Capital net (sortie capital) = 184 925 €.
    - Capital fractionné (brut) = 264 178 € / 10 = 26 418 €/an.
    - Rente brute = 184 925 € × 4 % = 7 397 €/an.
    - Abattement = 7 397 € × 10 % = 740 € (inférieur plafond).
    - Rente imposable = 7 397 € - 740 € = 6 657 €.
    - Impôt sur rente (TMI 30%) = 6 657 € × 30 % ≈ 1 997 € (calcul barème plus précis nécessaire).
    - PS rente = 7 397 € × 9,1 % ≈ 673 €.
    - Rente nette ≈ 7 397 € - 1 997 € - 673 € ≈ 4 727 €/an.
- **Pseudo-code** :
    
    ```
    // Sortie 100% Capital
    sortie_100_capital_net = capital_net_sortie_capital
    
    // Sortie Capital Fractionné sur 10 ans
    sortie_fractionne_brut_annuel = capital_total_brut / 10
    // Afficher avec note sur simplification fiscale
    
    // Sortie 100% Rente
    taux_conversion_rente = 0.04 // Hypothèse
    rente_brute_annuelle = sortie_100_capital_net * taux_conversion_rente // Base de calcul = K net après impôts sortie K? Ou K Brut? A CLARIFIER. Supposons K net.
    
    abattement_rente_plafond = 4200 // Approx 2025
    abattement_rente = min(rente_brute_annuelle * 0.10, abattement_rente_plafond)
    rente_imposable_annuelle = rente_brute_annuelle - abattement_rente
    
    // Calcul impôt sur la rente imposable (Attention: rente s'ajoute aux autres revenus retraite non simulés ici)
    // Approximation: appliquer la TMI retraite au montant imposable ? Ou refaire calcul complet barème ?
    // impot_rente = rente_imposable_annuelle * tmi_retraite // Simplification forte
    // Calcul plus précis: ajouter rente_imposable aux revenus estimés retraite et recalculer IR total
    // Pour V1, simplification:
    impot_rente = calculer_impot(rente_imposable_annuelle, nombre_parts, durée + 1).impot // Approx sur la rente seule
    
    taux_ps_rente = 0.091 // Hypothèse taux plein
    ps_rente = rente_brute_annuelle * taux_ps_rente
    
    rente_nette_annuelle = rente_brute_annuelle - impot_rente - ps_rente
    
    // Faire les mêmes calculs pour Ramify sur la base du capital_net_sortie_capital_ramify
    // ... Calculs rente Ramify ...
    ```
    

</aside>

<aside>

## Annexe : Références et hypothèses globales

- **Barème de l’impôt sur le revenu 2025 (sur revenus 2024)** :
    - 0 % : ≤ 11 497 €
    - 11 % : 11 498 € - 29 315 €
    - 30 % : 29 316 € - 83 823 €
    - 41 % : 83 824 € - 180 294 €
    - 45 % : > 180 294 €
- **PASS 2024 (utilisé pour plafonds 2025)** : 46 368 €.
- **PASS 2025** : 47 100 € (utilisé pour plafonds 2026).
- **Inflation annuelle (hypothèse)** : 1,5 %/an (pour ajuster les tranches fiscales futures).
- **Taux de conversion pour la rente (hypothèse)** : 4 % à 64 ans (variable selon conditions de marché futures).
- **Plafond de déductibilité PER 2025 (Salarié/Retraité)** : Min 4 637 €, Max 37 094 € (basé sur PASS 2024).
- **Plafond de déductibilité PER 2025 (TNS)** : Min 4 637 €, Max 85 780 € (basé sur PASS 2024).
- **PFU (Prélèvement Forfaitaire Unique) sur plus-value** : 30 % (12,8 % impôt + 17,2 % prélèvements sociaux). Option pour le barème possible.
- **Fiscalité Rente PER** : Barème IR après abattement 10 % (plafonné ~4.2k€) + Prélèvements sociaux spécifiques aux pensions (~9,1 % ou taux réduits selon revenus).
- **Prélèvements sociaux (taux standard)** : 17,2 % sur plus-values mobilières / 9,1 % (ou moins) sur rentes type pension.
- **Rendements nets et frais par type de contrat et profil** :
    - **Courtier en ligne** :
        - Défensif : Rendement brut 2,8 %, Frais 0,7 %, Net 2,1 %.
        - Équilibré : Rendement brut 4,15 %, Frais 1,15 %, Net 3,0 %.
        - Agressif : Rendement brut 5,5 %, Frais 1,6 %, Net 3,9 %.
        - Frais d’entrée : 0 %.
    - **Banque ou Assureur traditionnel** :
        - Défensif : Rendement brut 2,8 %, Frais 1,0 %, Net 1,8 %.
        - Équilibré : Rendement brut 4,15 %, Frais 1,45 %, Net 2,7 %.
        - Agressif : Rendement brut 5,5 %, Frais 1,9 %, Net 3,6 %.
        - Frais d’entrée : 2 %.
    - **Ramify** (utilisé en interne pour la comparaison) :
        - Défensif : Rendement brut 2,8 %, Frais 0,7 %, Net 2,1 %.
        - Équilibré : Rendement brut 7,23 %, Frais 1,15 %, Net 6,1 %.
        - Agressif : Rendement brut 11,66 %, Frais 1,15 %, Net 10,51 %.
        - Frais d’entrée : 0 %.
        - **Note** : Les performances passées ne préjugent pas des performances futures et ne sont pas garanties.
</aside>

<aside>

## Exemple complet d’une utilisation du simulateur

**Utilisateur** : 40 ans, salarié, revenu net de 60 000 €/an, progression de 3 %/an, 2 parts fiscales, frais réels de 5 000 €, courtier en ligne, profil Équilibré, PER non ouvert, investissement initial de 10 000 €, versements mensuels de 500 € (6 000 €/an initial).

- **Durée** : 24 ans (jusqu'à 64 ans).
- **Sur l’année en cours (2025)** :
    - Revenu imposable : 55 000 €.
    - Impôts sans PER : ~3 521 € (calculé avec barème 2025).
    - Plafond de déduction : 5 500 € (calculé pour salarié sur revenu N-1 proxifié par N).
    - Versement déductible : 5 500 € (min(6000, 5500)).
    - Impôts avec PER : ~2 915 € (calculé avec barème 2025 sur 49 500 €).
    - Effort d’épargne réel : 6 000 € - (3 521 € - 2 915 €) = ~5 394 €.
    - TMI : 11 %.
    - Taux moyen d’imposition (sans PER) : ~6,4 %.
- **À l’échéance (retraite) - Chiffres Illustratifs** :
*Les chiffres ci-dessous sont basés sur l'exemple initial mais reflètent la logique de calcul mise à jour (fiscalité notamment). Un recalcul complet serait nécessaire pour des valeurs exactes.*
    - Capital total brut : ~264 178 €.
        - Comparaison avec Ramify (Équilibré) : ~375 000 € (+42 %) (**Performance historique non garantie**).
    - Total versements (nets frais entrée) : ~218 250 €.
        - Comparaison avec Ramify : ~222 500 € (+2 %, car 0 frais entrée Ramify vs 0% ici).
    - Plus-value : ~45 928 €.
        - Comparaison avec Ramify : ~152 500 € (+232 %) (**Performance historique non garantie**).
    - Capital net de frais et impôts (sortie capital) : ~184 925 € (calculé avec IR sur versements + PFU sur PV).
        - Comparaison avec Ramify : ~261 000 € (+41 %) (**Performance historique non garantie**).
    - Impact frais (gestion + entrée) : ~28 000 €.
        - Comparaison avec Ramify : ~35 000 € (+25 %).
    - Impact impôts (sortie capital) : ~79 253 €.
        - Comparaison avec Ramify : ~114 000 € (+44 %).
    - Économie d’impôt réalisée : ~20 000 € (somme sur 24 ans).
    - Effort d’épargne réel (total) : ~202 500 €.
- **Montants pour les 3 types de sortie (Illustratif)** :
    - 100 % en Rente (nette) : ~4 727 €/an (calculé avec fiscalité pension).
        - Comparaison avec Ramify : ~6 900 €/an (+46 %) (**Performance historique non garantie**).
    - 100 % en Capital (net) : ~184 925 €.
        - Comparaison avec Ramify : ~261 000 € (+41 %) (**Performance historique non garantie**).
    - Capital fractionné sur 10 ans (brut annuel) : ~26 418 €/an (avec note sur simplification fiscale).
        - Comparaison avec Ramify : ~37 500 €/an (+42 %) (**Performance historique non garantie**).
</aside>

<aside>

## Qques demandes/suggestions UI/UX

## UI

- Avoir un “?” ou “i” en icône à côté des éléments non évidents qui affiche un tooltip explicatif
- CTAs de fin : Ouvrir un PER / Echanger avec un Conseiller et 3eme en lien texte dessous vers la page produit
- Pour les résultats, voir les concurrents mais avec quelques visualisations en plus des résultats chiffrés serait cool

## UX

- Si la personne clique “ouvrir un PER avec Ramify”, si possible que les données récupérées ne doivent pas être renseignées à nouveau (pour fluidifier l’onboarding / augmenter le % de conversion)
    - Quand l’utilisateur clique “Ouvrir un PER”, pré-remplir le formulaire Ramify via payload JSON (âge, versements, profil) par ex
- Si la personne prend RDV p’tet automatiquement joindre le résumé de sa simulation au CRM pour le commercial qui répondra et répondre automatiquement à la première question du flow RDV ?
- Messages d’alertes possibles ?
    - Si les versements dépassent le plafond de déductibilité : "Vos versements dépassent votre plafond de déductibilité. L’excédent ne sera pas déductible."
    - Si le profil est agressif : "Le profil Agressif offre un rendement plus élevé, mais comporte des risques. Les performances passées ne garantissent pas les résultats futurs."
- Résultats condensés sur mobile : accordéons par rubrique, sticky CTA, page-summary toujours visible.
</aside>