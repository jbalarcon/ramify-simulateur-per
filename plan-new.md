
**Target branch :** `2025-05-update`

---

## Project layout (2025-05)

```

index.html                 # Structure HTML du simulateur
js/
└── main.js              # Logique JavaScript (calculs, UI, graphiques)
css-ramify.css             # CSS global Ramify (ne pas modifier)
simulateur-css.css         # CSS spécifique au simulateur
info-dump-old.md           # Ancien brief (obsolète)
info-dump-new.md           # Brief corrigé (source de vérité)
prd.md                     # Product Requirements Document (obsolète)
plan-old.md                # Plan initial (obsolète)
plan-new.md                # Plan d’attaque mis à jour

````

> **NB :** Les noms/fichiers ci-dessus sont la référence officielle pour toutes les étapes qui suivent.

---

## Pull-Request order & Definition of Done (DoD)

| PR | Intitulé (résumé)                                    | DoD – le PR est valide quand…                                                  |
|----|------------------------------------------------------|--------------------------------------------------------------------------------|
| **PR 1** | **Centraliser les constantes réglementaires**  | `js/constants.js` existe et **aucune valeur “hard-codée”** ne subsiste dans `js/main.js`. Les tests de calcul IR passent. |
| **PR 2** | **Refactor moteur fiscal**                     | `computeTax()` & `computeDeductionCeiling()` lisent `constants.js` ; logique TNS & salarié conforme aux règles 2025 ; tous tests “Fiscal” verts. |
| **PR 3** | **Nouveaux paramètres utilisateur**            | Inputs “Inflation” et “Taux de conversion rente” apparaissent dans l’UI (accordéon “Expert”) et alimentent le calcul. Snapshot UI identique hors ajout. |
| **PR 4** | **Mise à jour UI & tooltips**                  | Tous textes (tooltips, disclaimers) reflètent les nouvelles règles ; alertes plafond/effort fonctionnelles ; score Lighthouse et layout inchangés. |
| **PR 5** | **Provider Ramify & comparaison**              | `js/providers/ramify.js` isolé ; sorties comparatives identiques au tableur d’exemple ; tests “RamifyDiff” verts. |

*Chaque PR doit :*  
1. Lancer `npm test` (ou `pnpm test`) → 0 échec.  
2. Faire passer ESLint / Prettier sans warning bloquant.  
3. Conserver le rendu visuel actuel (sauf ajouts prévus).  

---

## Test cases

> Les trois cas ci-dessous **doivent** être encodés dans `/tests/simulator.spec.js`.

| # | Scénario (entrée) | Sorties de référence |
|---|-------------------|----------------------|
| **1** | Salarié, 40 ans, 60 000 € net/an, 2 parts, frais réels 5 000 €, évolution 3 %, versement initial 10 000 €, 500 €/mois, courtier en ligne, profil Équilibré | `capitalBrut` = **204 261 €** |
| **2** | Indépendant (TNS), 35 ans, 90 000 € net/an, 1,5 part, frais réels **non** utilisés, évolution 5 %, versement initial 15 000 €, 1 000 €/mois, profil Agressif, courtier en ligne | `plafondDeductionAnnée1` = **≈ 8 045 €** |
| **3** | Retraité, 62 ans, 48 000 € net/an, 2 parts, progression fixée 1,5 %, versement initial 5 000 €, 0 €/mois, profil Défensif, banque traditionnelle | `taxOnPension` (rente nette) conforme au régime pension (abattement 10 %, PS 9,1 %) |

*(Tolérance ±1 € pour arrondis.)*

---

## Étapes détaillées (copier-coller dans chaque Pull-Request)

### PR 1 – `constants.js`

1. Créer `js/constants.js` exportant :

   ```js
   export const FISCAL_2025 = {
     TAX_BRACKETS: [
       { ceiling: 11_497, rate: 0.00 },
       { ceiling: 29_315, rate: 0.11 },
       { ceiling: 83_823, rate: 0.30 },
       { ceiling: 180_294, rate: 0.41 },
       { ceiling: Infinity, rate: 0.45 }
     ],
     PASS: 47_100,
     PLAFOND_MIN_SAL: 0.1 * 47_100,              // 4 710 €
     PLAFOND_MAX_SAL: 0.1 * 8 * 47_100,          // 37 680 €
     PLAFOND_MIN_TNS: 0.1 * 47_100,              // 4 710 €
     PLAFOND_MAX_TNS: 87_135,                    // calcul 2025
     RENTE_PENSION_ABATTEMENT: 0.10,
     CSG_RET: 0.083,
     CRDS_RET: 0.005,
     CASA_RET: 0.003,
     PFU: 0.128,
     PS: 0.172,
     DEFAULT_INFLATION: 0.018,
     DEFAULT_CONV_RATE: 0.04
   };
````

2. Importer le module dans `js/main.js` et remplacer toutes les valeurs litérales (tranches, PASS, plafonds, PFU, PS, etc.).

3. Mettre à jour les imports HTML/ESM si nécessaire.

---

### PR 2 – Moteur fiscal

1. **`computeTax()`**

   * Parcourt `FISCAL_2025.TAX_BRACKETS` pour déterminer l’impôt et la TMI.
   * Argument `yearOffset` : ajuste `ceiling * (1 + inflation) ** yearOffset`.

2. **`computeDeductionCeiling()`**

   * Salarié/Retraité : borne min/max FISCAL\_2025.
   * TNS : formule 10 % + 15 % avec bornes ; utiliser revenu **avant** abattement de 10 %.

3. **`applyCarryForward()`** (en option) gère le report N-3.

4. Ajouter tests unitaires couvrant cas #1 et #2.

---

### PR 3 – Inputs inflation + taux de conversion

1. Dans `index.html`, ajouter un accordéon `<details>` → deux champs :

   * `inflationInput` (range 0–5 %, default 1,8 %).
   * `annuityRateInput` (number step 0.1 %, default 4 %).

2. Sur `change`, ces valeurs écrasent `FISCAL_2025.DEFAULT_INFLATION` et `DEFAULT_CONV_RATE` stockés en `window.settings`.

3. Snapshot visuel : le layout du formulaire hors accordéon reste inchangé.

---

### PR 4 – UI / Tooltips / Disclaimers

1. Mettre à jour tous les tooltips :

   * Rente = régime pension (abattement 10 %, CSG/CRDS/CASA).
   * Plafonds PER actualisés (4 710 € / 37 680 €).
2. Disclaimers : performances passées, projections simplifiées, règles fiscales 2025.
3. Ajout alertes :

   * Versement > plafond (déjà)
   * Effort d’épargne > 40 % revenu dispo (nouveau).

---

### PR 5 – Provider Ramify & comparateur

1. Créer `js/providers/ramify.js` :

   ```js
   export const getNetReturn = profile => ({
     defensif: 0.021,
     equilibré: 0.061,
     agressif: 0.1051
   })[profile];

   export const getGrossReturn = profile => ({
     defensif: 0.028,
     equilibré: 0.0723,
     agressif: 0.1166
   })[profile];
   ```

2. Remplacer dans `main.js` toute référence directe aux taux Ramify par ces helpers.

3. Ajouter tests “RamifyDiff” : résultats comparatifs #1 identiques au tableur.

---

## Tests & CI

```bash
pnpm install
pnpm test          # Vitest / Jest
pnpm run lint      # ESLint + Prettier
pnpm run build     # build static si nécessaire
```

*(La CI GitHub doit exécuter ces trois commandes sur chaque PR.)*

---

## Done

Une fois les 5 PR fusionnées :

* `index.html` montre les résultats 2025 conformes aux cas de test.
* Aucun “magic number” fiscal ne subsiste hors `constants.js`.
* Les modifications CSS sont limitées à `simulateur-css.css`.
* `info-dump-new.md` devient la **seule** référence documentaire ; archiver les autres fichiers périmés.

---

```
```
