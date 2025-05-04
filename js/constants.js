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