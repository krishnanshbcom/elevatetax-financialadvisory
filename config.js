/**
 * config.js
 * -----------------------------------------------------------------
 * Every piece of information you might want to change lives here.
 * Update this file only — you should never need to touch HTML/CSS/JS
 * elsewhere to rebrand or re-price this site.
 * -----------------------------------------------------------------
 */

const CONFIG = {
  // ---- Identity -----------------------------------------------------
  consultantName: "ELEVATE",
  designation: "Tax Consultant",
  subtitle: "Tax & Financial Advisory",
  location: "YOUR CITY",

  // ---- Contact --------------------------------------------------------
  email: "hello@example.com",
  phone: "+91 00000 00000",
  whatsapp: "910000000000", // digits only, country code first, no + or spaces
  whatsappDefaultMessage: "Hello, I would like to discuss my tax requirements.",

  // ---- Form submission -------------------------------------------------
  // Leave formEndpoint blank to disable server submission and fall back
  // gracefully to WhatsApp / Email consultation buttons.
  // Works out of the box with Formspree, Supabase Edge Functions, or any
  // endpoint that accepts a JSON POST body.
  formEndpoint: "",

  // ---- Trust bar (do not invent numbers — replace placeholders only) --
  trustStats: [
    { value: 2, suffix: "+", label: "Years Experience", placeholder: "2+" },
    { value: 50, suffix: "+", label: "Clients Advised", placeholder: "50+" },
    { value: 98, suffix: "%", label: "Client Satisfaction", placeholder: "98%" }
  ],

  // ---- Theme ------------------------------------------------------------
  accentColor: "#00bf63",

  // ---- Sample dashboard figures (for illustrative "Financial Dashboard"
  // section only — clearly a worked example, not a client's real data) ---
  sampleDashboard: {
    annualIncome: 1840000,
    taxLiability: 210000,
    effectiveRate: 11.4,
    potentialOptimization: 34500,
    series: {
      income:  [8, 10, 11.5, 13, 15, 16.2, 18.4],
      tax:     [0.6, 0.9, 1.1, 1.4, 1.7, 1.9, 2.1],
      savings: [0.1, 0.15, 0.18, 0.22, 0.27, 0.31, 0.345]
    },
    years: ["FY19", "FY20", "FY21", "FY22", "FY23", "FY24", "FY25"]
  }
};

/**
 * TAX_RULES
 * -----------------------------------------------------------------
 * Centralized tax-slab configuration (India, individual taxpayers).
 * These figures are illustrative defaults modeled on recently
 * published slab structures and MUST be reviewed and updated by a
 * qualified professional before this information is relied upon.
 * Nothing elsewhere in the codebase hardcodes slab numbers — update
 * only here.
 * -----------------------------------------------------------------
 */
const TAX_RULES = {
  lastReviewed: "Please verify against the current Finance Act before publishing.",

  newRegime: {
    standardDeduction: 75000,
    rebateThreshold: 1200000, // taxable income at/below which rebate zeroes out tax
    slabs: [
      { upTo: 400000, rate: 0 },
      { upTo: 800000, rate: 0.05 },
      { upTo: 1200000, rate: 0.10 },
      { upTo: 1600000, rate: 0.15 },
      { upTo: 2000000, rate: 0.20 },
      { upTo: 2400000, rate: 0.25 },
      { upTo: Infinity, rate: 0.30 }
    ]
  },

  oldRegime: {
    standardDeduction: 50000,
    ageSlabs: {
      below60: [
        { upTo: 250000, rate: 0 },
        { upTo: 500000, rate: 0.05 },
        { upTo: 1000000, rate: 0.20 },
        { upTo: Infinity, rate: 0.30 }
      ],
      senior: [ // 60–79
        { upTo: 300000, rate: 0 },
        { upTo: 500000, rate: 0.05 },
        { upTo: 1000000, rate: 0.20 },
        { upTo: Infinity, rate: 0.30 }
      ],
      superSenior: [ // 80+
        { upTo: 500000, rate: 0 },
        { upTo: 1000000, rate: 0.20 },
        { upTo: Infinity, rate: 0.30 }
      ]
    },
    rebateThreshold: 500000
  },

  // Health & education cess applied to tax under both regimes
  cessRate: 0.04
};
