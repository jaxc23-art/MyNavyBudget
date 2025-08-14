// src/lib/calc.ts
// Centralized calculations for Pay & Budget pages (with FICA support)

import { getBasePayMonthly, type PayGrade } from "@/utils/basePayTable";

/* =========================
   Constants & Helpers
   ========================= */

export const PAY_STORAGE_KEY = "navy-budget:payInputs:v1";

// BAS (monthly)
export const BAS_ENLISTED = 465.77;
export const BAS_OFFICER  = 319.04;

// SGLI premium ~ $0.06 per $1,000 + $1 TSGLI admin
export const SGLI_RATE_PER_1000 = 0.06;
export const SGLI_ADMIN = 1.0;

// AFRH (flat monthly if checked)
export const AFRH_RATE = 0.50;

// FICA (employee portion)
export const FICA_SS_RATE = 0.062;     // Social Security 6.2%
export const FICA_MED_RATE = 0.0145;   // Medicare 1.45%
// 2025 Social Security annual wage base cap
export const FICA_SS_WAGE_BASE_ANNUAL = 168_600;
export const FICA_SS_WAGE_BASE_MONTHLY = FICA_SS_WAGE_BASE_ANNUAL / 12; // 14,050

export const currency = (n: number) =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });

export function isOfficer(grade: PayGrade): boolean {
  return grade.startsWith("O");
}
export function isEnlisted(grade: PayGrade): boolean {
  return grade.startsWith("E");
}
export function isWarrant(grade: PayGrade): boolean {
  return grade.startsWith("W");
}

const clamp = (n: number, min = 0, max = Number.MAX_SAFE_INTEGER) =>
  Math.min(max, Math.max(min, Number.isFinite(n) ? n : 0));

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/* =========================
   Pay Types
   ========================= */

export type WithOrWithout = "with" | "without";

export type Allot = { id: string; name: string; amount: number };

// Inputs matched to your Pay page UI
export type PayInputs = {
  grade: PayGrade;
  yos: number;

  // BAH controls
  bahOn: boolean;
  depStatus: WithOrWithout;      // "with" dependents vs "without"
  bahZip: string;                // "", "custom", or a real zip
  bahCustom: number;             // used iff bahZip === "custom"

  // Deductions (manual entry)
  federalMonthly: number;        // user-entered
  stateMonthly: number;          // user-entered

  // TSP
  tspPercent: number;            // % of base pay

  // Insurance
  sgliOn: boolean;
  sgliCoverage: number;          // 0..500_000
  afrh: boolean;

  // Allotments
  allotments: Allot[];
};

// Outputs used by Pay page summary + Budget page import
export type PayOutputs = {
  // Entitlements
  base: number;                  // monthly
  bah: number;                   // monthly (0 if bahOn=false)
  bas: number;                   // monthly (0 if bas excluded via opts)
  specialMonthly: number;        // monthly special pay (sea/sub/etc.)

  // Deductions (positive numbers)
  federalMonthly: number;
  stateMonthly: number;
  tspMonthly: number;
  insuranceMonthly: number;      // sgli + afrh
  ficaSocialMonthly: number;     // 6.2% up to wage base (base + special only)
  ficaMedicareMonthly: number;   // 1.45% (base + special)
  allotmentsMonthly: number;

  // Roll-ups
  totalEntitlements: number;         // base + bah + bas(when included) + special
  totalDeductionsExclAllot: number;  // taxes + tsp + insurance + FICA
  netMonthlyExclAllot: number;       // entitlements - (above)
};

/* =========================
   Core compute
   ========================= */

/**
 * Compute monthly pay numbers.
 * @param inputs        Pay inputs (see PayInputs)
 * @param bahFromTable  BAH chosen via UI (already resolved for with/without/custom)
 * @param opts          Options: basOn (default true), specialMonthly (default 0)
 */
export function computePay(
  inputs: PayInputs,
  bahFromTable: number,
  opts?: { basOn?: boolean; specialMonthly?: number }
): PayOutputs {
  const basOn = opts?.basOn ?? true;
  const specialMonthly = clamp(opts?.specialMonthly ?? 0);

  const g = inputs.grade;
  const yos = clamp(Math.round(inputs.yos), 0, 40);

  // Base pay from official table (already monthly)
  const base = clamp(getBasePayMonthly(g, yos));

  // BAS auto-calculated from paygrade (officer vs enlisted), applied iff basOn
  const basRaw = isOfficer(g) ? BAS_OFFICER : BAS_ENLISTED;
  const bas = basOn ? basRaw : 0;

  // BAH (from UI selection or custom)
  const bah = inputs.bahOn
    ? clamp(inputs.bahZip === "custom" ? Number(inputs.bahCustom || 0) : bahFromTable)
    : 0;

  // Taxes (manual entry/pass-through)
  const federalMonthly = clamp(inputs.federalMonthly || 0);
  const stateMonthly   = clamp(inputs.stateMonthly || 0);

  // TSP — % of BASE pay only (standard)
  const tspMonthly = clamp(base * (clamp(inputs.tspPercent, 0, 100) / 100));

  // Insurances
  const sgliPrem = inputs.sgliOn
    ? clamp((clamp(inputs.sgliCoverage, 0, 500_000) / 1000) * SGLI_RATE_PER_1000 + SGLI_ADMIN)
    : 0;
  const afrhPrem = inputs.afrh ? AFRH_RATE : 0;
  const insuranceMonthly = clamp(sgliPrem + afrhPrem);

  // FICA — applied to BASE + SPECIAL (BAH/BAS not subject)
  const ficaTaxable = clamp(base + specialMonthly);
  const ssTaxable   = Math.min(ficaTaxable, FICA_SS_WAGE_BASE_MONTHLY);
  const ficaSocialMonthly   = round2(ssTaxable * FICA_SS_RATE);
  const ficaMedicareMonthly = round2(ficaTaxable * FICA_MED_RATE);

  // Allotments
  const allotmentsMonthly = clamp(
    (Array.isArray(inputs.allotments) ? inputs.allotments : [])
      .reduce((sum, a) => sum + (Number(a.amount) || 0), 0)
  );

  // Totals
  const totalEntitlements = clamp(base + bah + bas + specialMonthly);
  const totalDeductionsExclAllot = clamp(
    federalMonthly + stateMonthly + tspMonthly + insuranceMonthly + ficaSocialMonthly + ficaMedicareMonthly
  );
  const netMonthlyExclAllot = clamp(totalEntitlements - totalDeductionsExclAllot);

  return {
    base,
    bah,
    bas,
    specialMonthly,
    federalMonthly,
    stateMonthly,
    tspMonthly,
    insuranceMonthly,
    ficaSocialMonthly,
    ficaMedicareMonthly,
    allotmentsMonthly,
    totalEntitlements,
    totalDeductionsExclAllot,
    netMonthlyExclAllot,
  };
}

/* =========================
   Budget helpers
   ========================= */

export type BudgetSnapshot = {
  incomeLines: Array<{ name: string; amount: number }>;
  expenseLines: Array<{ name: string; amount: number }>;
  totals: {
    incomeMonthly: number;
    expensesMonthly: number;
    netMonthly: number;
  };
};

export function snapshotForBudget(payOut: PayOutputs, inputs?: PayInputs): BudgetSnapshot {
  const incomeLines = [
    { name: "Base Pay", amount: clamp(payOut.base) },
    { name: "BAH",     amount: clamp(payOut.bah) },
    { name: "BAS",     amount: clamp(payOut.bas) },
    { name: "Special", amount: clamp(payOut.specialMonthly) },
  ];

  const expenseCore = [
    { name: "Federal Tax",        amount: clamp(payOut.federalMonthly) },
    { name: "State Tax",          amount: clamp(payOut.stateMonthly) },
    { name: "FICA Social Sec.",   amount: clamp(payOut.ficaSocialMonthly) },
    { name: "FICA Medicare",      amount: clamp(payOut.ficaMedicareMonthly) },
    { name: "TSP",                amount: clamp(payOut.tspMonthly) },
    { name: "Insurance",          amount: clamp(payOut.insuranceMonthly) },
  ];

  const allotmentLines =
    Array.isArray(inputs?.allotments)
      ? inputs!.allotments.map((a) => ({
          name: (a.name && a.name.trim()) || "Allotment",
          amount: clamp(Number(a.amount) || 0),
        }))
      : [];

  const expenseLines = [...expenseCore, ...allotmentLines];

  const incomeMonthly = incomeLines.reduce((s, l) => s + l.amount, 0);
  const expensesMonthly = expenseLines.reduce((s, l) => s + l.amount, 0);
  const netMonthly = incomeMonthly - expensesMonthly;

  return {
    incomeLines,
    expenseLines,
    totals: {
      incomeMonthly: clamp(incomeMonthly),
      expensesMonthly: clamp(expensesMonthly),
      netMonthly: clamp(netMonthly),
    },
  };
}

/**
 * Convenience for the Budget page to compute a snapshot using saved Pay inputs.
 * Assumes the caller supplies a BAH resolver that mirrors the Pay page.
 */
export function computeSnapshotFromStorage(
  getBahByUi: (grade: PayGrade, dep: WithOrWithout, bahZip: string, custom: number) => number
): BudgetSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PAY_STORAGE_KEY);
    if (!raw) return null;
    const inputs = JSON.parse(raw) as PayInputs & {
      basOn?: boolean;
      specialOn?: boolean;
      specialAmount?: number;
    };

    const bah = inputs.bahZip === "custom"
      ? clamp(inputs.bahCustom || 0)
      : getBahByUi(inputs.grade, inputs.depStatus, inputs.bahZip, inputs.bahCustom);

    const out = computePay(inputs, bah, {
      basOn: inputs.basOn ?? true,
      specialMonthly: inputs.specialOn ? clamp(inputs.specialAmount || 0) : 0,
    });

    return snapshotForBudget(out, inputs);
  } catch {
    return null;
  }
}
