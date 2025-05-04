import { FISCAL_2025 } from './constants.js';
import { getNetReturn as getRamifyNetReturn, getGrossReturn as getRamifyGrossReturn } from './providers/ramify.js';

// --- CONSTANTS & CONFIG --- //
const RETIREMENT_AGE = 64;
const CURRENT_YEAR = 2025;
const INDEPENDANT_ABATTEMENT = 0.40; // Average 40% for independents
const ANNUITY_TAXABLE_FRACTION = 0.40; // Taxable fraction at 64

// Real expenses parameters (abattement forfaitaire)
const FORFAIT_RATE = 0.10;
const FORFAIT_MIN = 504;
const FORFAIT_MAX = 14426;

// Contract specific data (Based on info-dump.md)
const CONTRACT_DATA = {
    'Courtier en ligne': {
        entryFee: 0.00,
        profiles: {
            'Défensif': { netReturn: 0.021, grossReturn: 0.028 },
            'Équilibré': { netReturn: 0.030, grossReturn: 0.0415 },
            'Agressif': { netReturn: 0.039, grossReturn: 0.055 }
        }
    },
    'Banque ou Assureur traditionnel': {
        entryFee: 0.02,
        profiles: {
            'Défensif': { netReturn: 0.018, grossReturn: 0.028 },
            'Équilibré': { netReturn: 0.027, grossReturn: 0.0415 },
            'Agressif': { netReturn: 0.036, grossReturn: 0.055 }
        }
    }
};

// --- DOM Elements --- //
const form = document.getElementById('simulator-form');
const resultsDiv = document.getElementById('results');
const stepElements = document.querySelectorAll('.step');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const chartContainer = document.querySelector('.chart-container');
const ctaContainer = document.querySelector('.cta-container');
const progressIndicator = document.querySelector('.progress-indicator'); // Progress Indicator container
const progressSteps = document.querySelectorAll('.progress-step');
// Tab Elements
const tabNavigation = document.querySelector('.tabs-navigation');
const tabLinks = document.querySelectorAll('.tab-link');
const tabContents = document.querySelectorAll('.tab-content');
const dataFormContainer = document.getElementById('data-content'); // Container for the data form

// Input Elements
const ageInput = document.getElementById('age');
const statusInput = document.getElementById('professionalStatus');
const netIncomeInput = document.getElementById('netIncome');
const fiscalPartsInput = document.getElementById('fiscalParts');
const fraisReelsNoRadio = document.getElementById('fraisReelsNo');
const fraisReelsYesRadio = document.getElementById('fraisReelsYes');
const fraisReelsAmountDiv = document.getElementById('fraisReelsAmountDiv');
const fraisReelsAmountInput = document.getElementById('fraisReelsAmount');
const incomeEvolutionSelect = document.getElementById('incomeEvolution');
const incomeEvolutionGroup = document.getElementById('incomeEvolutionGroup');
const perExistingNoRadio = document.getElementById('perExistingNo');
const perExistingYesRadio = document.getElementById('perExistingYes');
const initialInvestmentInput = document.getElementById('initialInvestment');
const initialInvestmentLabel = document.getElementById('initialInvestmentLabel');
const payments2025Group = document.getElementById('payments2025Group');
const payments2025Input = document.getElementById('payments2025');
const monthlyPaymentInput = document.getElementById('monthlyPayment');
const contractTypeInput = document.getElementById('contractType');
const riskProfileInput = document.getElementById('riskProfile');

// Output Elements
const taxWithoutPerSpan = document.getElementById('taxWithoutPer');
const taxWithPerSpan = document.getElementById('taxWithPer');
const taxSavingCurrentYearSpan = document.getElementById('taxSavingCurrentYear');
const realEffortCurrentYearSpan = document.getElementById('realEffortCurrentYear');
const tmiSpan = document.getElementById('tmi');
const averageTaxRateSpan = document.getElementById('averageTaxRate');
const deductionCeilingSpan = document.getElementById('deductionCeiling');
const grossCapitalSpan = document.getElementById('grossCapital');
const grossCapitalRamifySpan = document.getElementById('grossCapitalRamify');
const totalPaymentsSpan = document.getElementById('totalPayments');
const totalPaymentsRamifySpan = document.getElementById('totalPaymentsRamify');
const grossGainSpan = document.getElementById('grossGain');
const grossGainRamifySpan = document.getElementById('grossGainRamify');
const netCapitalSpan = document.getElementById('netCapital');
const netCapitalRamifySpan = document.getElementById('netCapitalRamify');
const totalFeesImpactSpan = document.getElementById('totalFeesImpact');
const totalFeesImpactRamifySpan = document.getElementById('totalFeesImpactRamify');
const totalTaxesImpactSpan = document.getElementById('totalTaxesImpact');
const totalTaxesImpactRamifySpan = document.getElementById('totalTaxesImpactRamify');
const totalTaxSavingSpan = document.getElementById('totalTaxSaving');
const totalRealEffortSpan = document.getElementById('totalRealEffort');
const annuityOptionSpan = document.getElementById('annuityOption');
const annuityOptionRamifySpan = document.getElementById('annuityOptionRamify');
const lumpSumOptionSpan = document.getElementById('lumpSumOption');
const lumpSumOptionRamifySpan = document.getElementById('lumpSumOptionRamify');
const fractionalOptionSpan = document.getElementById('fractionalOption');
const fractionalOptionRamifySpan = document.getElementById('fractionalOptionRamify');
// Add new spans for annual impact section
const tmiWithoutPerSpan = document.getElementById('tmiWithoutPer');
const averageTaxRateWithoutPerSpan = document.getElementById('averageTaxRateWithoutPer');
const tmiWithPerSpan = document.getElementById('tmiWithPer');
const averageTaxRateWithPerSpan = document.getElementById('averageTaxRateWithPer');
const averageTaxRateDiffSpan = document.getElementById('averageTaxRateDiff');

// Alert messages
const alertCeiling = document.getElementById('alert-ceiling');
const alertAggressive = document.getElementById('alert-aggressive');

// Chart
const ctx = document.getElementById('capitalChart').getContext('2d');
let capitalChart = null;

// --- Global State --- //
let currentStep = 1;
const totalSteps = 2; // Total number of form steps (updated from 3 to 2)
let initialFormData = {}; // To store data from the initial multi-step form
let lastShownResults = null; // Store the last calculated results object
let dataModified = false; // Flag to track if data was changed in the 'Data' tab
let currentActiveTab = 'results-content'; // Track the currently active tab
let activeProgressLine = null; // To hold the dynamic active line element

// Initialize global settings object
window.settings = {
    inflation: FISCAL_2025.DEFAULT_INFLATION,
    annuityRate: FISCAL_2025.DEFAULT_CONV_RATE
};

// --- UTILITY FUNCTIONS --- //

/**
 * Formats a number as Euro currency.
 * @param {number} value - The number to format.
 * @returns {string} Formatted currency string.
 */
function formatCurrency(value) {
    if (isNaN(value)) return 'N/A';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

/**
 * Formats a number as a percentage.
 * @param {number} value - The number (e.g., 0.11 for 11%).
 * @returns {string} Formatted percentage string.
 */
function formatPercentage(value, decimals = 1) {
     if (isNaN(value)) return 'N/A';
    return new Intl.NumberFormat('fr-FR', { style: 'percent', minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
}

/**
 * Calculates income tax based on taxable income, fiscal parts, and the year (for bracket inflation).
 * @param {number} taxableIncome - Taxable income for the year.
 * @param {number} fiscalParts - Number of fiscal parts.
 * @param {number} yearIndex - The index of the simulation year (0 for current year, 1 for next, etc.).
 * @returns {{taxAmount: number, tmi: number, averageRate: number}} Object containing tax amount, TMI rate, and average tax rate.
 */
function calculateIncomeTax(taxableIncome, fiscalParts, yearIndex) {
    if (taxableIncome <= 0 || fiscalParts <= 0) {
        return { taxAmount: 0, tmi: 0, averageRate: 0 };
    }

    const quotientFamilial = taxableIncome / fiscalParts;
    let taxAmount = 0;
    let cumulativeLimit = 0;
    let currentTmi = 0;

    // Use imported constants and adjust brackets for inflation from settings
    const inflation = window.settings.inflation; // Read from global settings
    const inflationFactor = Math.pow(1 + inflation, yearIndex);

    const brackets = FISCAL_2025.TAX_BRACKETS.map(bracket => ({
        ...bracket,
        ceiling: bracket.ceiling === Infinity ? Infinity : bracket.ceiling * inflationFactor
    }));

    // Rename 'limit' to 'ceiling' to match constants.js
    for (const bracket of brackets) {
        if (quotientFamilial > cumulativeLimit) {
            const taxableInBracket = Math.min(quotientFamilial, bracket.ceiling) - cumulativeLimit;
            taxAmount += taxableInBracket * bracket.rate;
            if (quotientFamilial <= bracket.ceiling) {
                currentTmi = bracket.rate;
                break; // Found the TMI
            }
        }
        cumulativeLimit = bracket.ceiling;
    }

    taxAmount *= fiscalParts;
    const averageRate = taxableIncome > 0 ? taxAmount / taxableIncome : 0;

    return { taxAmount: Math.max(0, taxAmount), tmi: currentTmi, averageRate: averageRate };
}

/**
 * Calculates the PER deduction ceiling for a given year.
 * @param {number} netIncome - Net income for the year (used as proxy for TNS benefit).
 * @param {number} taxableIncomeForSalaryCalc - Taxable income for the year (ONLY used for Salarié/Retraité calculation BEFORE 10% deduction).
 * @param {string} status - Professional status ('Salarié', 'Retraité', 'Indépendant').
 * @param {number} yearIndex - The index of the simulation year (0 for current year, 1 for next, etc.).
 * @returns {number} The calculated deduction ceiling.
 */
function calculateDeductionCeiling(netIncome, taxableIncomeForSalaryCalc, status, yearIndex) {
    let ceiling = 0;
    // No inflation adjustment needed for ceilings in year 0 (2025) as constants are for 2025
    // Apply inflation only for future years (yearIndex > 0) ? The plan doesn't specify. Assuming constants are fixed for now.
    // ~~TODO: Clarify if PASS and ceilings need inflation adjustment in the simulation loop. For now, using fixed 2025 values.~~

    const currentPass = FISCAL_2025.PASS;
    const currentPass8 = currentPass * 8;
    const currentCeilingMinSal = FISCAL_2025.PLAFOND_MIN_SAL;
    const currentCeilingMaxSal = FISCAL_2025.PLAFOND_MAX_SAL;
    const currentCeilingMinTNS = FISCAL_2025.PLAFOND_MIN_TNS;
    const currentCeilingMaxTNS = FISCAL_2025.PLAFOND_MAX_TNS;

    if (status === 'Salarié' || status === 'Retraité') {
        // 10% of N-1 taxable income (using taxableIncomeForSalaryCalc as N-1 approx)
        // Plan says "borne min/max FISCAL_2025", implies 10% of income capped by these.
        ceiling = taxableIncomeForSalaryCalc * 0.10;
        ceiling = Math.max(currentCeilingMinSal, ceiling);
        ceiling = Math.min(currentCeilingMaxSal, ceiling);
    } else { // Indépendant (TNS)
        // Plan: "formule 10 % + 15 % avec bornes ; utiliser revenu **avant** abattement de 10 %."
        // Assuming 'netIncome' passed is the reference income *before* any specific TNS abattement for this calculation.
        const benefit = netIncome; // Use netIncome as the base for calculation

        // Part 1: 10% of benefit, capped at 10% of 8 PASS (which is PLAFOND_MAX_TNS based on its calculation?)
        // Let's recalculate explicitly based on the formula "10% + 15%":
        // 10% of the fraction of professional income not exceeding 1 PASS
        // + 15% of the fraction exceeding 1 PASS but not exceeding 8 PASS
        const ceilingPart1 = 0.10 * Math.min(benefit, currentPass);
        let ceilingPart2 = 0;
        if (benefit > currentPass) {
            const benefitFraction = Math.min(benefit, currentPass8) - currentPass;
            ceilingPart2 = 0.15 * Math.max(0, benefitFraction);
        }

        ceiling = ceilingPart1 + ceilingPart2;

        // Apply TNS specific floor and ceiling from constants
        ceiling = Math.max(currentCeilingMinTNS, ceiling);
        ceiling = Math.min(currentCeilingMaxTNS, ceiling); // Max is explicit 87135
    }

    return ceiling;
}

/**
 * Calculates the future value of an initial capital and a series of annual payments.
 * @param {number} initialCapital - The starting capital.
 * @param {Array<number>} annualPayments - An array of payments for each year.
 * @param {number} returnRate - The annual rate of return (net or gross depending on context).
 * @param {number} duration - The total number of years.
 * @param {number} entryFee - The entry fee rate (e.g., 0.02 for 2%).
 * @returns {{ finalCapital: number, totalNetInvested: number, totalGrossGain: number, totalPrincipalInvested: number }}
 */
function calculateCapitalGrowth(initialCapital, annualPayments, returnRate, duration, entryFee) {
    let currentCapital = initialCapital * (1 - entryFee);
    let totalNetInvested = initialCapital * (1 - entryFee); // Capital actually invested after entry fees
    let totalPrincipalInvested = initialCapital; // Principal amount before any fees

    for (let year = 0; year < duration; year++) {
        currentCapital *= (1 + returnRate);
        const paymentThisYear = annualPayments[year] || 0;
        const netPayment = paymentThisYear * (1 - entryFee);
        currentCapital += netPayment;
        totalNetInvested += netPayment;
        totalPrincipalInvested += paymentThisYear;
    }

    // Gross gain is the final capital minus the capital actually invested (after entry fees)
    const totalGrossGain = currentCapital - totalNetInvested;

    return { finalCapital: currentCapital, totalNetInvested: totalNetInvested, totalGrossGain: totalGrossGain, totalPrincipalInvested: totalPrincipalInvested };
}

// --- Step Navigation & Data Collection --- //

/**
 * Updates the visual state of the progress indicator.
 * @param {number} activeStepIndex - The 1-based index of the currently active step.
 */
function updateProgressIndicator(activeStepIndex) {
    progressSteps.forEach((step, index) => {
        const stepNumber = index + 1;
        if (stepNumber <= activeStepIndex) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });

    // Update dynamic active line width
    if (!activeProgressLine) {
        activeProgressLine = document.createElement('div');
        activeProgressLine.className = 'progress-line-active';
        const mainLine = progressIndicator.querySelector('.progress-line');
        if (mainLine) progressIndicator.insertBefore(activeProgressLine, mainLine.nextSibling);
    }

    // Calculate width percentage
    // With 2 steps total:
    // Step 1 active -> 0% width (0 segments complete)
    // Step 2 active -> 100% width (1 segment complete out of 1 total segment)
    const totalSegments = totalSteps - 1;
    const completedSegments = Math.max(0, activeStepIndex - 1);
    const activeLineWidthPercent = totalSegments > 0 ? (completedSegments / totalSegments) * 100 : 0;

    // Apply width relative to the container (now 60% wide with 15% margin each side)
    // The line itself spans the central 70% (100% - 15% left - 15% right)
    activeProgressLine.style.width = `${activeLineWidthPercent}%`;

}

/**
 * Shows the specified step and hides others.
 * @param {number} stepIndex - The 1-based index of the step to show.
 */
function showStep(stepIndex) {
    stepElements.forEach((step, index) => {
        if (index + 1 === stepIndex) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    updateNavButtons();
    updateProgressIndicator(stepIndex); // Update progress bar
}

/**
 * Updates the visibility and text of navigation buttons based on the current step.
 */
function updateNavButtons() {
    if (currentStep === 1) {
        prevBtn.classList.remove('visible');
    } else {
        prevBtn.classList.add('visible');
    }

    if (currentStep === totalSteps) {
        nextBtn.textContent = 'Simuler mon PER';
    } else {
        nextBtn.textContent = 'Suivant';
    }
}

/**
 * Collects data from the initial multi-step form.
 * @param {number} stepIndex - The 1-based index of the current step.
 * @returns {boolean} true if successful, false otherwise
 */
function collectInitialStepData(stepIndex) {
    const currentStepElement = document.getElementById(`step-${stepIndex}`);
    if (!currentStepElement) return false;

    const inputsInStep = currentStepElement.querySelectorAll('input, select');
    inputsInStep.forEach(input => {
        if (input.name) {
            if (input.type === 'radio') {
                if (input.checked) {
                    initialFormData[input.name] = input.value;
                }
            } else if (input.type === 'checkbox') {
                initialFormData[input.name] = input.checked;
            } else {
                initialFormData[input.name] = input.value;
            }
        }
    });
    return true;
}

// Optional: Basic validation per step (can be expanded)
function validateStep(stepIndex) {
     const currentStepElement = document.getElementById(`step-${stepIndex}`);
     if (!currentStepElement) return false;
     const requiredInputs = currentStepElement.querySelectorAll('[required]');
     for (const input of requiredInputs) {
        if (!input.value || (input.type === 'number' && isNaN(parseFloat(input.value)))) {
             // Find the corresponding label or use a generic message
             const labelElement = currentStepElement.querySelector(`label[for='${input.id}']`);
             const fieldName = labelElement ? labelElement.textContent.replace(' ?', '').trim() : 'Ce champ';
             alert(`Veuillez remplir le champ obligatoire : ${fieldName}`);
             input.focus();
             return false;
         }
        // Add more specific validation if needed (e.g., age range)
        if (input.id === 'age' && (parseInt(input.value) < 18 || parseInt(input.value) >= RETIREMENT_AGE)){
             alert(`L'âge doit être compris entre 18 et ${RETIREMENT_AGE - 1} ans.`);
             input.focus();
             return false;
        }
         if (input.id === 'fiscalParts' && parseFloat(input.value) < 1){
             alert("Le nombre de parts fiscales doit être au moins 1.");
             input.focus();
             return false;
         }
        // Add more validations as needed...
     }
     return true;
 }

// --- Tab Management --- //

/**
 * Shows the specified tab content and hides others.
 * @param {string} tabId - The ID of the tab content to show.
 */
function showTabContent(tabId) {
    tabContents.forEach(content => {
        if (content.id === tabId) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
    tabLinks.forEach(link => {
        if (link.getAttribute('data-tab') === tabId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    currentActiveTab = tabId;
}

/**
 * Populates the 'Data' tab form with the initially submitted data.
 */
function populateDataTab() {
    if (!lastShownResults || !lastShownResults.inputsForChart) {
        console.error("Cannot populate data tab, initial results/inputs missing.");
        return;
    }
    const initialInputs = lastShownResults.inputsForChart;
    console.log("Populating data tab with:", initialInputs); // Log for debugging

    // Loop through the keys of the initial inputs object
    for (const key in initialInputs) {
        // Construct the ID for the corresponding element in the data tab
        const elementId = `data-${key}`;
        const element = document.getElementById(elementId);

        if (element) {
            // Handle different input types
            if (element.type === 'radio') {
                // Radios are handled differently: find the group by name and check the correct value
                const radioGroup = dataFormContainer.querySelectorAll(`input[name='data-${key}']`); // Use the actual name attribute 'data-key'
                radioGroup.forEach(radio => {
                    radio.checked = (radio.value === initialInputs[key]);
                     // Trigger change event ONLY on the specific radio button that gets checked
                    // This helps update conditional visibility (fraisReelsAmount, payments2025)
                     if (radio.checked) {
                         const changeEvent = new Event('change', { bubbles: true });
                         radio.dispatchEvent(changeEvent);
                     }
                });
            } else if (element.type === 'checkbox') {
                element.checked = initialInputs[key];
            } else { // Includes text, number, select
                element.value = initialInputs[key];
                // Trigger change for select elements to potentially update UI state (like professionalStatus)
                if (element.tagName === 'SELECT') {
                    const changeEvent = new Event('change', { bubbles: true });
                    element.dispatchEvent(changeEvent);
                }
            }
        } else {
             // Handle cases where the ID might not directly match (e.g., radio button names)
             if (key === 'fraisReels') {
                 const radioNo = document.getElementById('data-fraisReelsNo');
                 const radioYes = document.getElementById('data-fraisReelsYes');
                 if (radioNo && radioYes) {
                     radioNo.checked = (initialInputs[key] === 'Non');
                     radioYes.checked = (initialInputs[key] === 'Oui');
                     // Ensure visibility is correct based on checked state
                     document.getElementById('data-fraisReelsAmountDiv').style.display = radioYes.checked ? 'block' : 'none';
                      document.getElementById('data-fraisReelsAmount').required = radioYes.checked;
                 }
             } else if (key === 'perExisting') {
                 const radioNo = document.getElementById('data-perExistingNo');
                 const radioYes = document.getElementById('data-perExistingYes');
                 if (radioNo && radioYes) {
                     radioNo.checked = (initialInputs[key] === 'Non');
                     radioYes.checked = (initialInputs[key] === 'Oui');
                     // Ensure visibility is correct based on checked state
                     document.getElementById('data-payments2025Group').style.display = radioYes.checked ? 'block' : 'none';
                     document.getElementById('data-payments2025').required = radioYes.checked;
                     document.getElementById('data-initialInvestmentLabel').textContent = radioYes.checked ? 'Investissement initial (déjà présent)' : 'Investissement initial prévu';
                 }
             }
        }
    }

    // Populate Expert Settings inputs from window.settings
    const inflationInput = document.getElementById('data-inflationInput');
    const inflationValueSpan = document.getElementById('data-inflationValue');
    const annuityRateInput = document.getElementById('data-annuityRateInput');

    if (inflationInput && inflationValueSpan) {
        const currentInflationPercent = (window.settings.inflation * 100).toFixed(1);
        inflationInput.value = currentInflationPercent;
        inflationValueSpan.textContent = `${currentInflationPercent}%`;
    }
    if (annuityRateInput) {
        annuityRateInput.value = (window.settings.annuityRate * 100).toFixed(1);
    }

    // Explicitly ensure conditional visibility based on populated state, in case events didn't fire correctly
    const dataStatusInput = document.getElementById('data-professionalStatus');
    if(dataStatusInput) {
      const dataIncomeEvolutionGroup = document.getElementById('data-incomeEvolutionGroup');
      if(dataIncomeEvolutionGroup) dataIncomeEvolutionGroup.style.display = (dataStatusInput.value === 'Retraité') ? 'none' : 'block';
    }
     // Force update visibility for radio-dependent fields after loop
    const dataFraisReelsYesRadio = document.getElementById('data-fraisReelsYes');
    if(dataFraisReelsYesRadio) dataFraisReelsYesRadio.dispatchEvent(new Event('change', { bubbles: true }));
    const dataPerExistingYesRadio = document.getElementById('data-perExistingYes');
    if(dataPerExistingYesRadio) dataPerExistingYesRadio.dispatchEvent(new Event('change', { bubbles: true }));

    dataModified = false; // Reset modified flag right after populating
}

/**
 * Reads the current values from the 'Data' tab form.
 * @returns {object | null} Object containing current data inputs, or null if validation fails.
 */
function getDataTabInputs() {
    const currentData = {};
    const dataInputs = dataFormContainer.querySelectorAll('#data-form input, #data-form select'); // Select only from the main data form

    dataInputs.forEach(input => {
        if (input.name) {
            // Adjust name to match the keys used in simulation (remove 'data-' prefix)
            let originalName = input.name;
             if (input.name.startsWith('data-')) {
                originalName = input.name.substring(5);
                 if(input.type === 'radio'){
                     if (input.checked) {
                         currentData[originalName] = input.value;
                     }
                 } else {
                     // Use ID for non-radio inputs within data-form
                     originalName = input.id.substring(5);
                     currentData[originalName] = input.type === 'checkbox' ? input.checked : input.value;
                 }
            } else {
                 // Should not happen if we select only within #data-form
                 // currentData[input.name] = input.type === 'checkbox' ? input.checked : input.value;
            }
        }
    });

    // --- Convert types and perform basic validation --- 
    // Expert settings are handled separately via window.settings

    const convertedInputs = {
        age: parseInt(currentData.age),
        professionalStatus: currentData.professionalStatus,
        netIncome: parseFloat(currentData.netIncome),
        fiscalParts: parseFloat(currentData.fiscalParts),
        fraisReels: currentData.fraisReels,
        fraisReelsAmount: parseFloat(currentData.fraisReelsAmount) || 0,
        incomeEvolution: parseFloat(currentData.incomeEvolution) || 0,
        perExisting: currentData.perExisting,
        initialInvestment: parseFloat(currentData.initialInvestment) || 0,
        payments2025: parseFloat(currentData.payments2025) || 0,
        monthlyPayment: parseFloat(currentData.monthlyPayment) || 0,
        contractType: currentData.contractType,
        riskProfile: currentData.riskProfile,
    };

    // Add similar validation as in initial form if needed
    if (isNaN(convertedInputs.age) || convertedInputs.age < 18 || convertedInputs.age > RETIREMENT_AGE - 1) { return null; }
    if (isNaN(convertedInputs.netIncome) || convertedInputs.netIncome < 0) { return null; }
    // ... add other critical validations ...

    // Adjust income evolution for retirees
     if (convertedInputs.professionalStatus === 'Retraité') {
         convertedInputs.incomeEvolution = FISCAL_2025.DEFAULT_INFLATION;
     }

    return convertedInputs;
}

// --- Event Listeners --- //

// Navigation Button Listeners (Initial Form)
nextBtn.addEventListener('click', () => {
    if (!collectInitialStepData(currentStep)) return;
    if (!validateStep(currentStep)) {
        return;
    }

    if (currentStep < totalSteps) {
        currentStep++;
        showStep(currentStep);
    } else {
        // Last step of initial form - Run first simulation
        form.style.display = 'none'; // Hide the initial form container
        document.querySelector('.navigation-buttons').style.display = 'none'; // Hide initial nav buttons
        resultsDiv.style.display = 'block'; // Show results container (with tabs)
        runSimulation(); // Run with initialFormData collected
        showTabContent('results-content'); // Ensure results tab is active first
    }
});

prevBtn.addEventListener('click', () => {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
});

// Tab Link Listener
tabNavigation.addEventListener('click', (event) => {
    if (event.target.classList.contains('tab-link')) {
        const targetTabId = event.target.getAttribute('data-tab');

        if (targetTabId === 'data-content' && currentActiveTab !== 'data-content') {
            // Switching TO Data tab: Populate it
            populateDataTab();
        } else if (targetTabId === 'results-content' && currentActiveTab === 'data-content') {
            // Switching FROM Data tab TO Results tab: Check for modifications and recalculate if needed
            if (dataModified) {
                console.log("Data modified, recalculating...");
                const newDataInputs = getDataTabInputs();
                if (newDataInputs) {
                    runSimulation(newDataInputs); // Pass new inputs to simulation
                } else {
                    console.error("Invalid data in Data tab, cannot recalculate.");
                    // Optionally show an error message to the user
                }
            }
        }
        showTabContent(targetTabId);
    }
});

// Listener for changes within the 'Data' tab form to set the flag
dataFormContainer.addEventListener('change', (event) => {
     // Ignore changes triggered programmatically during population
     if (event.isTrusted) {
         console.log("Data modified by user.");
        dataModified = true;

        // Handle specific input updates for conditional display
        if(event.target.type === 'radio' && event.target.name === 'data-fraisReels'){
            const amountDiv = document.getElementById('data-fraisReelsAmountDiv');
            const amountInput = document.getElementById('data-fraisReelsAmount');
            amountDiv.style.display = event.target.value === 'Oui' ? 'block' : 'none';
            amountInput.required = event.target.value === 'Oui';
        }
         if(event.target.type === 'radio' && event.target.name === 'data-perExisting'){
             const paymentsDiv = document.getElementById('data-payments2025Group');
             const paymentsInput = document.getElementById('data-payments2025');
             paymentsDiv.style.display = event.target.value === 'Oui' ? 'block' : 'none';
             paymentsInput.required = event.target.value === 'Oui';
              document.getElementById('data-initialInvestmentLabel').textContent = event.target.value === 'Oui' ? 'Investissement initial (déjà présent)' : 'Investissement initial prévu';
         }
          if(event.target.id === 'data-professionalStatus'){
              const evoGroup = document.getElementById('data-incomeEvolutionGroup');
              evoGroup.style.display = (event.target.value === 'Retraité') ? 'none' : 'block';
          }

         // Handle expert settings updates -> update window.settings
         if (event.target.id === 'data-inflationInput') {
             const inflationRate = parseFloat(event.target.value) / 100;
             window.settings.inflation = inflationRate;
             // Update the display value next to the slider
             const inflationValueSpan = document.getElementById('data-inflationValue');
             if (inflationValueSpan) {
                 inflationValueSpan.textContent = `${(inflationRate * 100).toFixed(1)}%`;
             }
             dataModified = true; // Mark data as modified when expert settings change
         }
         if (event.target.id === 'data-annuityRateInput') {
             window.settings.annuityRate = parseFloat(event.target.value) / 100;
             dataModified = true; // Mark data as modified when expert settings change
         }

     }
});

// Input-specific listeners FOR INITIAL FORM
fraisReelsYesRadio.addEventListener('change', () => {
    if (fraisReelsYesRadio.checked) {
        fraisReelsAmountDiv.style.display = 'block';
        fraisReelsAmountInput.required = true;
    }
});
fraisReelsNoRadio.addEventListener('change', () => {
    if (fraisReelsNoRadio.checked) {
        fraisReelsAmountDiv.style.display = 'none';
        fraisReelsAmountInput.required = false;
    }
});
perExistingYesRadio.addEventListener('change', () => {
    if (perExistingYesRadio.checked) {
        payments2025Group.style.display = 'block';
        initialInvestmentLabel.textContent = 'Investissement initial (déjà présent)';
        payments2025Input.required = true;
    }
});
perExistingNoRadio.addEventListener('change', () => {
    if (perExistingNoRadio.checked) {
        payments2025Group.style.display = 'none';
        initialInvestmentLabel.textContent = 'Investissement initial prévu';
        payments2025Input.required = false;
    }
});
statusInput.addEventListener('change', (event) => {
    // Keep this listener for the initial form as well
    if (event.target.value === 'Retraité') {
        incomeEvolutionGroup.style.display = 'none';
    } else {
        incomeEvolutionGroup.style.display = 'block';
    }
});

// --- Tooltip Logic --- //
function initializeTooltips() {
    const tooltipIcons = document.querySelectorAll('.tooltip-icon');
    let activeTooltip = null; // To store the currently displayed tooltip element

    tooltipIcons.forEach(icon => {
        const titleText = icon.getAttribute('title');
        icon.removeAttribute('title'); // Remove native title to avoid conflict

        icon.addEventListener('mouseenter', (event) => {
            // Remove any existing tooltip first
            if (activeTooltip) {
                activeTooltip.remove();
                activeTooltip = null;
            }

            // Create the tooltip element
            const tooltip = document.createElement('span');
            tooltip.className = 'custom-tooltip';
            tooltip.textContent = titleText;

            // Position relative to the icon
            const iconRect = icon.getBoundingClientRect();
            const containerRect = icon.closest('.simulator-container').getBoundingClientRect();

            // Append to the icon's parent initially to calculate position correctly
            icon.parentNode.appendChild(tooltip);
            activeTooltip = tooltip; // Store reference

            // Calculate position - appended temporarily to get dimensions
            const tooltipRect = tooltip.getBoundingClientRect();

            // Adjust position (simplified example: above the icon)
            // We position relative to the page, considering scroll offset
            let top = iconRect.top + window.scrollY - tooltipRect.height - 10; // 10px spacing
            let left = iconRect.left + window.scrollX + (iconRect.width / 2) - (tooltipRect.width / 2);

            // Ensure tooltip stays within viewport bounds (basic check)
            if (left < 0) left = 5;
            if (left + tooltipRect.width > window.innerWidth) left = window.innerWidth - tooltipRect.width - 5;
            if (top < window.scrollY) { // If it goes off-screen top, position below
                top = iconRect.bottom + window.scrollY + 10;
                // Adjust arrow direction if needed (requires more complex CSS)
                tooltip.style.bottom = 'auto';
                tooltip.style.top = `${top}px`;
                 // Remove or change the ::after arrow style if positioned below
            } else {
                 tooltip.style.top = `${top}px`;
            }

             tooltip.style.left = `${left}px`;
             tooltip.style.position = 'absolute'; // Ensure position is absolute
             tooltip.style.bottom = 'auto'; // Override default bottom positioning

             // Move to body to avoid container clipping issues
             document.body.appendChild(tooltip);

            // Trigger fade-in via CSS
            setTimeout(() => { // Timeout ensures styles are applied before transition starts
                 if (activeTooltip === tooltip) { // Check if still the active tooltip
                    tooltip.style.opacity = '1';
                    tooltip.style.visibility = 'visible';
                 }
            }, 10);
        });

        icon.addEventListener('mouseleave', () => {
            if (activeTooltip) {
                // Start fade-out
                activeTooltip.style.opacity = '0';
                activeTooltip.style.visibility = 'hidden';
                // Remove after transition
                setTimeout(() => {
                    if (activeTooltip && activeTooltip.style.opacity === '0') {
                         activeTooltip.remove();
                         activeTooltip = null;
                    }
                }, 300); // Match CSS transition duration
            }
        });
    });
}

// --- Initialization --- //

// Initialize Chart (empty at first)
function initializeChart() {
    if (capitalChart) {
        capitalChart.destroy();
    }
    capitalChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: []
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                     ticks: { callback: value => formatCurrency(value) }
                },
                 x: {
                     title: { display: true, text: 'Années' }
                 }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += formatCurrency(context.parsed.y);
                            }
                            return label;
                        }
                    }
                },
                 legend: {
                     position: 'top',
                 }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initializeChart(); // Initialize custom tooltips
    initializeTooltips();
    showStep(1); // Also calls updateProgressIndicator(1)
    resultsDiv.style.display = 'none';
    tabNavigation.style.display = 'none';
    statusInput.dispatchEvent(new Event('change'));
    perExistingNoRadio.dispatchEvent(new Event('change'));
    fraisReelsNoRadio.dispatchEvent(new Event('change'));
});

// --- Main Simulation Logic --- //

// MODIFIED: Accepts optional 'newInputs' object for recalculation
function runSimulation(newInputs = null) {

    let inputs;
    if (newInputs) {
        // Use inputs passed from the 'Data' tab for recalculation
        inputs = newInputs;
        lastShownResults = null; // Clear last results as we are recalculating
    } else {
        // First run: use data collected from the initial steps
        inputs = {
            age: parseInt(initialFormData.age),
            professionalStatus: initialFormData.professionalStatus,
            netIncome: parseFloat(initialFormData.netIncome),
            fiscalParts: parseFloat(initialFormData.fiscalParts),
            fraisReels: initialFormData.fraisReels,
            fraisReelsAmount: parseFloat(initialFormData.fraisReelsAmount) || 0,
            incomeEvolution: parseFloat(initialFormData.incomeEvolution) || 0,
            perExisting: initialFormData.perExisting,
            initialInvestment: parseFloat(initialFormData.initialInvestment) || 0,
            payments2025: parseFloat(initialFormData.payments2025) || 0,
            monthlyPayment: parseFloat(initialFormData.monthlyPayment) || 0,
            contractType: initialFormData.contractType,
            riskProfile: initialFormData.riskProfile,
        };
         // Adjust income evolution for retirees if needed
         if (inputs.professionalStatus === 'Retraité') {
             inputs.incomeEvolution = FISCAL_2025.DEFAULT_INFLATION;
         }
    }

     // Validate the final inputs object just in case
    if (!inputs || isNaN(inputs.age) || isNaN(inputs.netIncome) /* ... add other critical checks ...*/) {
         console.error("Invalid inputs object for simulation.", inputs);
         alert("Une erreur s'est produite lors de la récupération des données. Veuillez vérifier vos saisies.");
         return; // Prevent simulation with bad data
     }


    // --- Simulation Setup ---
    const duration = Math.max(0, RETIREMENT_AGE - inputs.age);
    if (duration === 0) {
        alert("L'âge doit être inférieur à l'âge de la retraite (64 ans).");
        return;
    }

    // --- Annual Calculation Loop & Final Calculations --- //
    const annualData = [];
    let totalTaxSaving = 0;
    const annualPERPayments = [];
    const initialAnnualPayment = inputs.monthlyPayment * 12;

    for (let yearIndex = 0; yearIndex < duration; yearIndex++) {
         const year = CURRENT_YEAR + yearIndex;
        let currentNetIncome = inputs.netIncome * Math.pow(1 + inputs.incomeEvolution, yearIndex);
        let abattement = 0;
        if (inputs.fraisReels === 'Oui') {
            abattement = inputs.fraisReelsAmount;
        } else {
            abattement = Math.max(FORFAIT_MIN, Math.min(FORFAIT_MAX, currentNetIncome * FORFAIT_RATE));
        }
        const taxableIncome = Math.max(0, currentNetIncome - abattement);
        const taxInfoWithoutPer = calculateIncomeTax(taxableIncome, inputs.fiscalParts, yearIndex);
        const ceiling = calculateDeductionCeiling(currentNetIncome, taxableIncome, inputs.professionalStatus, yearIndex);
        const currentAnnualPayment = initialAnnualPayment * Math.pow(1 + inputs.incomeEvolution, yearIndex);
        annualPERPayments.push(currentAnnualPayment);
        let paymentForCurrentYearCalc = currentAnnualPayment;
        if (yearIndex === 0 && inputs.perExisting === 'Oui') {
             paymentForCurrentYearCalc = inputs.payments2025;
        }
        const deductiblePayment = Math.min(paymentForCurrentYearCalc, ceiling);
        const taxableIncomeWithPer = Math.max(0, taxableIncome - deductiblePayment);
        const taxInfoWithPer = calculateIncomeTax(taxableIncomeWithPer, inputs.fiscalParts, yearIndex);
        const averageRateWithPer = taxableIncome > 0 ? taxInfoWithPer.taxAmount / taxableIncome : 0;
        const annualTaxSaving = Math.max(0, taxInfoWithoutPer.taxAmount - taxInfoWithPer.taxAmount);
        const annualRealEffort = paymentForCurrentYearCalc - annualTaxSaving;

        annualData.push({
            year: year,
            taxWithoutPer: taxInfoWithoutPer.taxAmount,
            taxWithPer: taxInfoWithPer.taxAmount,
            tmiWithoutPer: taxInfoWithoutPer.tmi,
            tmiWithPer: taxInfoWithPer.tmi,
            averageRateWithoutPer: taxInfoWithoutPer.averageRate,
            averageRateWithPer: averageRateWithPer,
            ceiling: ceiling,
            payment: paymentForCurrentYearCalc,
            deductiblePayment: deductiblePayment,
            taxSaving: annualTaxSaving,
            realEffort: annualRealEffort
        });
        totalTaxSaving += annualTaxSaving;
     }

     const userContractDetails = CONTRACT_DATA[inputs.contractType];
    const userProfileDetails = userContractDetails.profiles[inputs.riskProfile];
    // Get Ramify returns using the provider functions
    const ramifyNetReturn = getRamifyNetReturn(inputs.riskProfile);
    const ramifyGrossReturn = getRamifyGrossReturn(inputs.riskProfile);

    const userGrowthGross = calculateCapitalGrowth(inputs.initialInvestment, annualPERPayments, userProfileDetails.grossReturn, duration, userContractDetails.entryFee);
    // Assuming Ramify entry fee is 0 as per old constant
    const ramifyGrowthGross = calculateCapitalGrowth(inputs.initialInvestment, annualPERPayments, ramifyGrossReturn, duration, 0.00);
     const userGrowthNet = calculateCapitalGrowth(inputs.initialInvestment, annualPERPayments, userProfileDetails.netReturn, duration, userContractDetails.entryFee);
    const ramifyGrowthNet = calculateCapitalGrowth(inputs.initialInvestment, annualPERPayments, ramifyNetReturn, duration, 0.00);
    const userFeeImpact = Math.max(0, userGrowthGross.finalCapital - userGrowthNet.finalCapital);
    const ramifyFeeImpact = Math.max(0, ramifyGrowthGross.finalCapital - ramifyGrowthNet.finalCapital);
    const tmiAtRetirement = annualData[duration - 1].tmiWithPer;

    // Calculate Net Capital after Tax on Exit (Lump Sum Scenario)
    const totalSocialLeviesRate = FISCAL_2025.PS; // 17.2%
    const flatTaxRate = FISCAL_2025.PFU; // 12.8%
    const totalFlatTaxRate = totalSocialLeviesRate + flatTaxRate; // 30%

    // Tax applies to gains only for lump sum exit
    const userTaxOnGainsLumpSum = userGrowthNet.totalGrossGain * totalFlatTaxRate;
    // Tax applies to payments based on TMI at retirement
    const userTaxOnPaymentsLumpSum = userGrowthNet.totalNetInvested * tmiAtRetirement;
    const userTotalTaxImpactLumpSum = userTaxOnPaymentsLumpSum + userTaxOnGainsLumpSum;
    const userNetCapital = userGrowthNet.finalCapital - userTotalTaxImpactLumpSum;

    const ramifyTaxOnGainsLumpSum = ramifyGrowthNet.totalGrossGain * totalFlatTaxRate;
    const ramifyTaxOnPaymentsLumpSum = ramifyGrowthNet.totalNetInvested * tmiAtRetirement;
    const ramifyTotalTaxImpactLumpSum = ramifyTaxOnPaymentsLumpSum + ramifyTaxOnGainsLumpSum;
    const ramifyNetCapital = ramifyGrowthNet.finalCapital - ramifyTotalTaxImpactLumpSum;

    // Calculate Net Annuity after Tax on Exit (Annuity Scenario)
    // Use dynamic rate from settings
    const annuityConversionRate = window.settings.annuityRate;
    const userAnnuityGross = userNetCapital * annuityConversionRate;
    const ramifyAnnuityGross = ramifyNetCapital * annuityConversionRate;

    // Apply pension taxation rules as per plan
    const pensionAbatement = FISCAL_2025.RENTE_PENSION_ABATTEMENT; // 10%
    const pensionSocialLeviesRate = FISCAL_2025.CSG_RET + FISCAL_2025.CRDS_RET + FISCAL_2025.CASA_RET; // 9.1%

    // Social levies applied on gross annuity
    const userAnnuitySocialLevies = userAnnuityGross * pensionSocialLeviesRate;
    // IR applied on the portion after abatement, using TMI at retirement
    const userAnnuityTaxableBase = userAnnuityGross * (1 - pensionAbatement);
    const userAnnuityIR = userAnnuityTaxableBase * tmiAtRetirement;
    const userAnnuityNet = Math.max(0, userAnnuityGross - userAnnuitySocialLevies - userAnnuityIR);

    const ramifyAnnuitySocialLevies = ramifyAnnuityGross * pensionSocialLeviesRate;
    const ramifyAnnuityTaxableBase = ramifyAnnuityGross * (1 - pensionAbatement);
    const ramifyAnnuityIR = ramifyAnnuityTaxableBase * tmiAtRetirement;
    const ramifyAnnuityNet = Math.max(0, ramifyAnnuityGross - ramifyAnnuitySocialLevies - ramifyAnnuityIR);

    // Lump Sum Net Capital is already calculated
    const userLumpSumNet = userNetCapital;
    const ramifyLumpSumNet = ramifyNetCapital;

    // Fractional exit (assume same net capital as lump sum, divided over years - simplistic)
    // TODO: Refine fractional exit tax if needed - assuming simple division for now
    const userFractionalNet = userNetCapital / 10;
    const ramifyFractionalNet = ramifyNetCapital / 10;

    const totalPrincipalInvestedByUser = userGrowthNet.totalPrincipalInvested;
    const totalRealEffort = totalPrincipalInvestedByUser - totalTaxSaving;

    // --- Prepare results object --- //
    const results = {
        currentYearData: annualData[0],
        duration: duration,
        tmiAtRetirement: tmiAtRetirement,
        userGrossCapital: userGrowthGross.finalCapital,
        ramifyGrossCapital: ramifyGrowthGross.finalCapital,
        userTotalPayments: totalPrincipalInvestedByUser,
        ramifyTotalPayments: ramifyGrowthNet.totalPrincipalInvested, // Note: Ramify total payments principal might differ if fees applied differently
        userGrossGain: userGrowthGross.finalCapital - totalPrincipalInvestedByUser,
        ramifyGrossGain: ramifyGrowthGross.finalCapital - ramifyGrowthNet.totalPrincipalInvested,
        userNetCapital: userNetCapital, // Net capital after lump sum tax
        ramifyNetCapital: ramifyNetCapital, // Net capital after lump sum tax
        userFeeImpact: userFeeImpact,
        ramifyFeeImpact: ramifyFeeImpact,
        userTaxImpact: userTotalTaxImpactLumpSum, // Report lump sum tax impact
        ramifyTaxImpact: ramifyTotalTaxImpactLumpSum, // Report lump sum tax impact
        totalTaxSaving: totalTaxSaving, // Cumulative tax saving during accumulation
        totalRealEffort: totalRealEffort, // Cumulative real effort during accumulation
        userAnnuity: userAnnuityNet, // Net annual annuity
        userLumpSum: userLumpSumNet, // Net lump sum capital
        userFractional: userFractionalNet, // Net annual fractional withdrawal
        ramifyAnnuity: ramifyAnnuityNet,
        ramifyLumpSum: ramifyLumpSumNet,
        ramifyFractional: ramifyFractionalNet,
        chartLabels: Array.from({ length: duration + 1 }, (_, i) => CURRENT_YEAR + i),
        riskProfile: inputs.riskProfile,
        currentYearPayment: annualData[0].payment,
        currentYearCeiling: annualData[0].ceiling,
        inputsForChart: inputs,
        annualPERPayments: annualPERPayments, // Array of annual payments over duration
    };

    lastShownResults = results;
    dataModified = false;

    // --- Display Results & Update Chart --- //
    progressIndicator.style.display = 'none';
    tabNavigation.style.display = 'flex';
    displayResults(results);
    updateChart(results);

}

// --- UI Update Function ---
function displayResults(results) {
    const cy = results.currentYearData;
    if (!cy) {
        console.error("Current year data is missing in results!");
        return;
    }

    // Helper to format percentage diff for badges
    const formatPercentDiff = (userValue, ramifyValue) => {
        if (isNaN(userValue) || isNaN(ramifyValue) || Math.abs(userValue) < 0.001) {
            return '';
        }
        const diff = ramifyValue - userValue;
        const percentDiff = diff / Math.abs(userValue);
        const sign = percentDiff >= 0 ? '+' : '';
        return `${sign}${formatPercentage(percentDiff, 1)}`;
    };

    // --- Update Current Year Section (New Structure) --- 
    // Use helper function for cleaner display updates
    const displayElement = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
        else console.warn(`Element with ID ${id} not found for display.`);
    };

    displayElement('deductionCeiling', formatCurrency(cy.ceiling));
    displayElement('totalPaymentsCurrentYear', formatCurrency(results.currentYearPayment)); // Display total payments

    // Populate Tax Blocks & Values
    const taxBlockFull = document.querySelector('.tax-block-full');
    const taxBlockRemaining = document.querySelector('.tax-block-remaining');
    const taxBlockSaving = document.querySelector('.tax-block-saving');
    const taxValWithoutSpan = document.getElementById('taxWithoutPerValue');
    const taxValWithSpan = document.getElementById('taxWithPerValue');
    const taxValSavingSpan = document.getElementById('taxSavingValueInBar');

    // Display the value for the 'sans PER' block
    if (taxValWithoutSpan) {
        taxValWithoutSpan.textContent = formatCurrency(cy.taxWithoutPer);
    }

    // Set widths and values for 'avec PER' blocks
    if (taxBlockRemaining && taxBlockSaving && taxValWithSpan && taxValSavingSpan) {
        const maxTax = Math.max(cy.taxWithoutPer, 1); // Avoid division by zero

        // Calculate percentages for flex-basis
        const remainingTaxPercentage = Math.max(0, Math.min(100, (cy.taxWithPer / maxTax) * 100));
        const savingTaxPercentage = Math.max(0, Math.min(100, (cy.taxSaving / maxTax) * 100));

        // Apply flex-basis to block elements
        taxBlockRemaining.style.flexBasis = `${remainingTaxPercentage}%`;
        taxBlockSaving.style.flexBasis = `${savingTaxPercentage}%`;

        // Display values within the blocks
        taxValWithSpan.textContent = formatCurrency(cy.taxWithPer);
        taxValSavingSpan.textContent = formatCurrency(cy.taxSaving);

    } else {
        console.warn("One or more elements for the 'avec PER' tax blocks are missing.");
    }

    // Populate Tax Saving Highlight card (now in the grid)
    displayElement('taxSavingCurrentYear', formatCurrency(cy.taxSaving));

    // Populate Bottom Metrics Grid
    displayElement('realEffortCurrentYear', formatCurrency(cy.realEffort));
    displayElement('tmiWithPer', formatPercentage(cy.tmiWithPer, 0));
    displayElement('averageTaxRateWithPer', formatPercentage(cy.averageRateWithPer, 1));
    const avgRateDiff = cy.averageRateWithoutPer - cy.averageRateWithPer;
    displayElement('averageTaxRateDiff', `${avgRateDiff >= 0 ? '-' : '+'}${formatPercentage(Math.abs(avgRateDiff), 1)}`);
    // Ensure badge has correct class (already done in CSS, but can be reinforced)
    const badgeElement = document.getElementById('averageTaxRateDiff');
    if(badgeElement) badgeElement.className = 'tax-rate-diff-badge';

    // Alerts (remain the same)
    alertCeiling.style.display = cy.payment > cy.ceiling ? 'block' : 'none';
    alertAggressive.style.display = results.riskProfile === 'Agressif' ? 'block' : 'none';

    // New Alert: Savings Effort > 40% of Net Income
    const alertEffort = document.getElementById('alert-effort');
    if (alertEffort && results.inputsForChart && results.inputsForChart.netIncome > 0) {
        const netIncome = results.inputsForChart.netIncome;
        const annualPayment = results.currentYearPayment; // Already calculated in runSimulation
        const effortRatio = annualPayment / netIncome;
        alertEffort.style.display = effortRatio > 0.40 ? 'block' : 'none';
    } else if (alertEffort) {
        alertEffort.style.display = 'none'; // Hide if income is zero or missing
    }

    // --- Update Retirement Projection Section --- 
    // Row 1: User values
    displayElement('grossCapital', formatCurrency(results.userGrossCapital));
    displayElement('totalPayments', formatCurrency(results.userTotalPayments));
    displayElement('grossGain', formatCurrency(results.userGrossGain));
    displayElement('netCapital', formatCurrency(results.userNetCapital));

    // Row 2: Ramify values & comparison badges
    displayElement('ramifyGrossCapitalValue', formatCurrency(results.ramifyGrossCapital));
    displayElement('ramifyGrossCapitalPercent', formatPercentDiff(results.userGrossCapital, results.ramifyGrossCapital));

    const userNetInvested = calculateCapitalGrowth(results.inputsForChart.initialInvestment, results.annualPERPayments, 0, results.duration, CONTRACT_DATA[results.inputsForChart.contractType].entryFee).totalNetInvested;
    const ramifyNetInvested = calculateCapitalGrowth(results.inputsForChart.initialInvestment, results.annualPERPayments, 0, results.duration, 0.00).totalNetInvested;
    displayElement('ramifyTotalPaymentsValue', formatCurrency(ramifyNetInvested));
    displayElement('ramifyTotalPaymentsPercent', formatPercentDiff(userNetInvested, ramifyNetInvested));
    // Hide comparison if values are essentially the same
    const totalPaymentsSubcard = document.getElementById('totalPaymentsRamifySubcard');
    if (totalPaymentsSubcard) {
        totalPaymentsSubcard.style.display = (Math.abs(userNetInvested - ramifyNetInvested) <= 1) ? 'none' : 'flex';
    }

    displayElement('ramifyGrossGainValue', formatCurrency(results.ramifyGrossGain));
    displayElement('ramifyGrossGainPercent', formatPercentDiff(results.userGrossGain, results.ramifyGrossGain));

    displayElement('ramifyNetCapitalValue', formatCurrency(results.ramifyNetCapital));
    displayElement('ramifyNetCapitalPercent', formatPercentDiff(results.userNetCapital, results.ramifyNetCapital));

    // Row 3: User impact values
    displayElement('totalFeesImpact', formatCurrency(results.userFeeImpact));
    displayElement('totalTaxesImpact', formatCurrency(results.userTaxImpact));
    displayElement('totalTaxSaving', formatCurrency(results.totalTaxSaving));
    displayElement('totalRealEffort', formatCurrency(results.totalRealEffort));

    // Row 4: Ramify impact values & comparison badges
    displayElement('ramifyTotalFeesImpactValue', formatCurrency(results.ramifyFeeImpact));
    displayElement('ramifyTotalFeesImpactPercent', formatPercentDiff(results.userFeeImpact, results.ramifyFeeImpact));

    displayElement('ramifyTotalTaxesImpactValue', formatCurrency(results.ramifyTaxImpact));
    displayElement('ramifyTotalTaxesImpactPercent', formatPercentDiff(results.userTaxImpact, results.ramifyTaxImpact));

    // --- Update Exit Options Section --- 
    // Row 1: User values
    displayElement('annuityOption', formatCurrency(results.userAnnuity));
    displayElement('lumpSumOption', formatCurrency(results.userLumpSum));
    displayElement('fractionalOption', formatCurrency(results.userFractional));

    // Row 2: Ramify values & comparison badges
    displayElement('ramifyAnnuityOptionValue', formatCurrency(results.ramifyAnnuity));
    displayElement('ramifyAnnuityOptionPercent', formatPercentDiff(results.userAnnuity, results.ramifyAnnuity));

    displayElement('ramifyLumpSumOptionValue', formatCurrency(results.ramifyLumpSum));
    displayElement('ramifyLumpSumOptionPercent', formatPercentDiff(results.userLumpSum, results.ramifyLumpSum));

    displayElement('ramifyFractionalOptionValue', formatCurrency(results.ramifyFractional));
    displayElement('ramifyFractionalOptionPercent', formatPercentDiff(results.userFractional, results.ramifyFractional));
}

// --- Chart Update Function --- //
function updateChart(results) {
    const inputs = results.inputsForChart;
    if (!inputs) {
        console.error("Inputs for chart missing in results object.");
        return;
    }

    const duration = results.duration;
    const labels = results.chartLabels;
    const userCapitalAnnualGross = []; // Initialize with length 0
    const ramifyCapitalAnnualGross = []; // Initialize with length 0

    const userContractDetails = CONTRACT_DATA[inputs.contractType];
    const userProfileDetails = userContractDetails.profiles[inputs.riskProfile];
    const ramifyReturnRate = getRamifyGrossReturn(inputs.riskProfile); // Use provider

    let userCurrentCapital = inputs.initialInvestment * (1 - userContractDetails.entryFee);
    let ramifyCurrentCapital = inputs.initialInvestment * (1 - 0.00); // Assuming Ramify entry fee is 0
    // Push initial capital state AFTER applying entry fee
    userCapitalAnnualGross.push(userCurrentCapital);
    ramifyCapitalAnnualGross.push(ramifyCurrentCapital);

    const annualPERPayments = results.annualPERPayments;

    for (let yearIndex = 0; yearIndex < duration; yearIndex++) {
        userCurrentCapital *= (1 + userProfileDetails.grossReturn);
        const userPaymentThisYear = annualPERPayments[yearIndex] || 0;
        userCurrentCapital += userPaymentThisYear * (1 - userContractDetails.entryFee);
        userCapitalAnnualGross.push(userCurrentCapital);

        ramifyCurrentCapital *= (1 + ramifyReturnRate);
        const ramifyPaymentThisYear = annualPERPayments[yearIndex] || 0;
        ramifyCurrentCapital += ramifyPaymentThisYear * (1 - 0.00);
        ramifyCapitalAnnualGross.push(ramifyCurrentCapital);
    }

    // Find max value for suggested Y-axis max
    const maxYValue = Math.max(...userCapitalAnnualGross, ...ramifyCapitalAnnualGross);
    // Suggest a max slightly above the highest point (e.g., 10% higher or rounded)
    const suggestedYMax = Math.ceil((maxYValue * 1.1) / 10000) * 10000; // Round up to nearest 10k after adding 10%

    if (capitalChart) {
        capitalChart.data.labels = labels;
        capitalChart.data.datasets = [
            {
                label: `${inputs.contractType} (${inputs.riskProfile}) - Brut`,
                data: userCapitalAnnualGross,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            },
            {
                label: `Ramify (${inputs.riskProfile}) - Brut`,
                data: ramifyCapitalAnnualGross,
                borderColor: 'rgb(239, 194, 126)',
                tension: 0.1
            }
        ];
        // Update Y-axis options
        capitalChart.options.scales.y.suggestedMax = suggestedYMax;
        capitalChart.update();
    } else {
        console.error("Chart instance not found.");
        initializeChart();
    }
}

// Remove the placeholder function for getUserInputs
/*
function getUserInputs() {
    // ... This function is no longer used ...
}
*/ 

/**
 * Initializes all event listeners for the simulator.
 */
function initializeEventListeners() {
    // Initial Form Navigation
    // ... existing code ...

    // Update Results Button in Data Tab
    const recalculateBtn = document.getElementById('recalculate-btn');
    if (recalculateBtn) {
        recalculateBtn.addEventListener('click', () => {
            // Collect current inputs from the data tab
            const currentInputs = getDataTabInputs();
            if (currentInputs && lastShownResults) {
                // Merge with essential non-editable initial data if needed (like age?)
                // Or better: pass the full structure expected by runSimulation
                const simulationInputs = {
                    ...lastShownResults.inputsForChart, // Keep original structure
                    ...currentInputs // Overwrite with new values from data tab
                };
                 console.log("Recalculating with:", simulationInputs); // Log for debugging
                runSimulation(simulationInputs); // Run simulation with updated data
                showTabContent('results-content'); // Switch back to results tab
            } else {
                console.error("Could not get inputs from data tab or last results missing.");
                 alert("Erreur lors de la récupération des données modifiées.");
            }
        });
    }

    // Input change listeners in the Data Tab (to set dataModified flag)
    const dataInputs = dataFormContainer.querySelectorAll('input, select');
    dataInputs.forEach(input => {
        input.addEventListener('change', () => {
            dataModified = true;
            // Dynamic updates based on changes in the data tab
            if (input.name === 'data-fraisReels') {
                const fraisAmountDiv = document.getElementById('data-fraisReelsAmountDiv');
                const fraisAmountInput = document.getElementById('data-fraisReelsAmount');
                 const isYes = document.getElementById('data-fraisReelsYes').checked;
                if (fraisAmountDiv) fraisAmountDiv.style.display = isYes ? 'block' : 'none';
                if (fraisAmountInput) fraisAmountInput.required = isYes;
            }
            if (input.name === 'data-perExisting') {
                 const isYes = document.getElementById('data-perExistingYes').checked;
                 const initialGroup = document.getElementById('data-initialInvestmentGroup');
                 const paymentsGroup = document.getElementById('data-payments2025Group');
                 if(initialGroup) initialGroup.style.display = isYes ? 'block' : 'none';
                 if(paymentsGroup) paymentsGroup.style.display = isYes ? 'block' : 'none';
                 document.getElementById('data-initialInvestment').required = isYes;
                 document.getElementById('data-payments2025').required = isYes;
                 // Also update label for initial investment based on perExisting choice
                 const initialLabel = document.getElementById('data-initialInvestmentLabel');
                 if (initialLabel) initialLabel.textContent = isYes ? "Investissement initial PER existant (€)" : "Premier versement PER (€)";
            }
             if (input.id === 'data-professionalStatus') {
                 const evolutionGroup = document.getElementById('data-incomeEvolutionGroup');
                 if (evolutionGroup) {
                    evolutionGroup.style.display = (input.value === 'Retraité') ? 'none' : 'block';
                 }
                 // Also update frais reels options visibility maybe? Depends on rules.
             }
             // Update risk profile options based on contract type
             if (input.id === 'data-contractType') {
                updateRiskProfileOptions(input.value, 'data-riskProfile');
             }
        });
    });

    // Initial form input listeners (for dynamic UI changes)
    if(fraisReelsYesRadio) {
        fraisReelsYesRadio.addEventListener('change', () => {
            fraisReelsAmountDiv.style.display = 'block';
            fraisReelsAmountInput.required = true;
        });
    }
     if(fraisReelsNoRadio) {
        fraisReelsNoRadio.addEventListener('change', () => {
            fraisReelsAmountDiv.style.display = 'none';
            fraisReelsAmountInput.required = false;
             fraisReelsAmountInput.value = ''; // Clear value if hidden
        });
     }
     if (perExistingYesRadio) {
         perExistingYesRadio.addEventListener('change', () => {
             initialInvestmentLabel.textContent = "Investissement initial PER existant (€)";
             payments2025Group.style.display = 'block';
             payments2025Input.required = true;
         });
     }
     if (perExistingNoRadio) {
         perExistingNoRadio.addEventListener('change', () => {
             initialInvestmentLabel.textContent = "Premier versement PER (€)";
             payments2025Group.style.display = 'none'; // Hide N-1 payments if no existing PER
             payments2025Input.required = false;
             payments2025Input.value = ''; // Clear value
         });
     }
     if(statusInput) {
         statusInput.addEventListener('change', (e) => {
             if (incomeEvolutionGroup) {
                 incomeEvolutionGroup.style.display = (e.target.value === 'Retraité') ? 'none' : 'block';
             }
         });
     }
     if (contractTypeInput) {
         contractTypeInput.addEventListener('change', (e) => {
            updateRiskProfileOptions(e.target.value, 'riskProfile'); // Update profiles in initial form
         });
     }
}

/**
 * Updates the options available in the risk profile select dropdown based on the chosen contract type.
 * Handles both the initial form and the data tab form using the selectElementId.
 * @param {string} contractType - The selected contract type ('Courtier en ligne' or 'Banque ou Assureur traditionnel').
 * @param {string} selectElementId - The ID of the select element to update ('riskProfile' or 'data-riskProfile').
 */
function updateRiskProfileOptions(contractType, selectElementId) {
    const riskProfileSelect = document.getElementById(selectElementId);
    if (!riskProfileSelect) return;

    const currentProfileValue = riskProfileSelect.value; // Save current selection

    // Determine available profiles based on contract type (use CONTRACT_DATA as source)
    let availableProfiles = [];
    if (contractType === 'Courtier en ligne' && CONTRACT_DATA['Courtier en ligne']) {
        availableProfiles = Object.keys(CONTRACT_DATA['Courtier en ligne'].profiles);
    } else if (contractType === 'Banque ou Assureur traditionnel' && CONTRACT_DATA['Banque ou Assureur traditionnel']) {
        availableProfiles = Object.keys(CONTRACT_DATA['Banque ou Assureur traditionnel'].profiles);
    } else {
        // Default or fallback if contract type is unknown or data is missing
        availableProfiles = ['Défensif', 'Équilibré', 'Agressif'];
    }

    // Clear existing options
    riskProfileSelect.innerHTML = '';

    // Add new options
    availableProfiles.forEach(profile => {
        const option = document.createElement('option');
        option.value = profile;
        option.textContent = profile;
        riskProfileSelect.appendChild(option);
    });

     // Try to restore previous selection if it's still valid
     if (availableProfiles.includes(currentProfileValue)) {
         riskProfileSelect.value = currentProfileValue;
     } else if (availableProfiles.length > 0) {
         // Otherwise, select the first available option
         riskProfileSelect.value = availableProfiles[0];
     }
     // Trigger change event on the risk profile select to ensure consistency if needed elsewhere
     // const changeEvent = new Event('change', { bubbles: true });
     // riskProfileSelect.dispatchEvent(changeEvent);
}


// --- INITIALIZATION --- //
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");
    initializeTooltips();
    showStep(1); // Show the first step initially
    // Ensure initial state of conditional fields is correct
    if (fraisReelsAmountDiv) fraisReelsAmountDiv.style.display = 'none'; // Hide frais reels amount initially
    if (fraisReelsAmountInput) fraisReelsAmountInput.required = false;
    if (payments2025Group) payments2025Group.style.display = 'none'; // Hide N-1 payment initially
    if (payments2025Input) payments2025Input.required = false;
    if (incomeEvolutionGroup && statusInput && statusInput.value === 'Retraité') { // Hide evolution if default is Retraité
        incomeEvolutionGroup.style.display = 'none';
    }
     if(initialInvestmentLabel) initialInvestmentLabel.textContent = "Premier versement PER (€)"; // Set initial label text
    updateRiskProfileOptions(contractTypeInput.value, 'riskProfile'); // Set initial risk profiles

    // Setup tab navigation
    showTabContent('results-content'); // Show results tab by default after form completion
    tabNavigation.style.display = 'none'; // Hide tabs initially
    resultsDiv.style.display = 'none'; // Hide results area initially
    chartContainer.style.display = 'none';
    ctaContainer.style.display = 'none'; // Hide CTA initially


    initializeEventListeners(); // Set up all event listeners

    // Prevent default form submission
    form.addEventListener('submit', (e) => e.preventDefault());
});

// DEBUG: Expose runSimulation to global scope for testing
// window.runSimulation = runSimulation;
// window.FISCAL_2025 = FISCAL_2025; // Expose constants for debugging
// window.lastShownResults = () => lastShownResults; // Function to get last results

// --- END OF js/main.js --- 