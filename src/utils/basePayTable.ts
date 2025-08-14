// src/utils/basePayTable.ts
// 2025 DFAS base pay (MONTHLY) by paygrade and YOS band.
// Sources: DFAS 2025 Basic Pay tables for Enlisted, Warrant Officers, and Officers.
// Notes:
// - Bands used here: 0,2,3,4,6,8,10,12,14,16,18,20,22
// - For grades where DFAS does not publish early YOS cells (e.g., E8/E9, W5),
//   we backfill earlier bands with the first available value so the app never
//   returns 0 for an unrealistic grade/YOS combo. You can tighten this later.

export type YosBand =
  0 | 2 | 3 | 4 | 6 | 8 | 10 | 12 | 14 | 16 | 18 | 20 | 22;

export type Enlisted = "E1" | "E2" | "E3" | "E4" | "E5" | "E6" | "E7" | "E8" | "E9";
export type Warrant  = "W1" | "W2" | "W3" | "W4" | "W5";
export type Officer  = "O1" | "O2" | "O3" | "O4" | "O5" | "O6";
export type PayGrade = Enlisted | Warrant | Officer;

export function toYosBand(yos: number): YosBand {
  const bands: YosBand[] = [0,2,3,4,6,8,10,12,14,16,18,20,22];
  let out: YosBand = 0;
  for (let i = 0; i < bands.length; i++) {
    if (yos >= bands[i]) out = bands[i];
  }
  return out;
}

/** 2025 DFAS monthly base pay */
export const BASE_PAY_2025: { [K in PayGrade]?: Partial<Record<YosBand, number>> } = {
  // ---------- ENLISTED (DFAS: Basic Pay – Enlisted, Effective Apr 1, 2025) ----------
  // E-1: DFAS note: <4 months = 2144.10. We use standard 2319.00 across bands.
  E1: { 0: 2319.00, 2: 2319.00, 3: 2319.00, 4: 2319.00, 6: 2319.00, 8: 2319.00, 10: 2319.00, 12: 2319.00, 14: 2319.00, 16: 2319.00, 18: 2319.00, 20: 2319.00, 22: 2319.00 },

  // E-2
  E2: { 0: 2599.20, 2: 2599.20, 3: 2599.20, 4: 2599.20, 6: 2599.20, 8: 2599.20, 10: 2599.20, 12: 2599.20, 14: 2599.20, 16: 2599.20, 18: 2599.20, 20: 2599.20, 22: 2599.20 },

  // E-3
  E3: {
    0: 2733.00, 2: 2904.60, 3: 3081.00, 4: 3081.00, 6: 3081.00, 8: 3081.00, 10: 3081.00,
    12: 3081.00, 14: 3081.00, 16: 3081.00, 18: 3081.00, 20: 3081.00, 22: 3081.00
  },

  // E-4
  E4: {
    0: 3027.30, 2: 3182.10, 3: 3354.90, 4: 3524.70, 6: 3675.60, 8: 3675.60, 10: 3675.60,
    12: 3675.60, 14: 3675.60, 16: 3675.60, 18: 3675.60, 20: 3675.60, 22: 3675.60
  },

  // E-5
  E5: {
    0: 3220.50, 2: 3466.50, 3: 3637.50, 4: 3802.20, 6: 3959.40, 8: 4142.40, 10: 4234.50,
    12: 4259.70, 14: 4259.70, 16: 4259.70, 18: 4259.70, 20: 4259.70, 22: 4259.70
  },

  // E-6
  E6: {
    0: 3276.60, 2: 3606.00, 3: 3765.00, 4: 3919.80, 6: 4080.60, 8: 4443.90, 10: 4585.20,
    12: 4858.80, 14: 4942.50, 16: 5003.40, 18: 5074.80, 20: 5074.80, 22: 5074.80
  },

  // E-7
  E7: {
    0: 3788.10, 2: 4134.30, 3: 4293.00, 4: 4502.10, 6: 4666.50, 8: 4947.60, 10: 5106.30,
    12: 5387.10, 14: 5621.40, 16: 5781.30, 18: 5951.10, 20: 6017.10, 22: 6238.20
  },

  // E-8 (DFAS left early bands blank; backfilled 0–8 with first published value)
  E8: {
    0: 5449.50, 2: 5449.50, 3: 5449.50, 4: 5449.50, 6: 5449.50, 8: 5449.50, 10: 5690.70,
    12: 5839.80, 14: 6018.60, 16: 6212.10, 18: 6561.90, 20: 6739.20, 22: 7040.70
  },

  // E-9 (DFAS left early bands blank; backfilled 0–10 with first published value)
  E9: {
    0: 6657.30, 2: 6657.30, 3: 6657.30, 4: 6657.30, 6: 6657.30, 8: 6657.30, 10: 6657.30,
    12: 6807.90, 14: 6997.80, 16: 7221.60, 18: 7447.80, 20: 7808.40, 22: 8114.70
  },

  // ---------- WARRANT OFFICERS (DFAS: Basic Pay – Warrant Officers, Eff. Jan 1, 2025) ----------
  W1: {
    0: 3908.10, 2: 4329.30, 3: 4442.10, 4: 4681.20, 6: 4963.50, 8: 5379.90, 10: 5574.30,
    12: 5847.00, 14: 6114.30, 16: 6324.60, 18: 6518.40, 20: 6753.60, 22: 6753.60
  },
  W2: {
    0: 4452.60, 2: 4873.80, 3: 5003.10, 4: 5092.50, 6: 5380.80, 8: 5829.60, 10: 6052.50,
    12: 6271.20, 14: 6539.10, 16: 6748.50, 18: 6937.80, 20: 7164.60, 22: 7313.70
  },
  W3: {
    0: 5032.20, 2: 5241.30, 3: 5457.00, 4: 5526.90, 6: 5752.20, 8: 6195.60, 10: 6657.60,
    12: 6875.10, 14: 7126.80, 16: 7385.40, 18: 7851.90, 20: 8166.30, 22: 8354.40
  },
  W4: {
    0: 5510.40, 2: 5926.80, 3: 6096.90, 4: 6264.30, 6: 6552.90, 8: 6838.20, 10: 7127.10,
    12: 7560.90, 14: 7941.90, 16: 8304.30, 18: 8601.60, 20: 8891.10, 22: 9315.60
  },
  // W-5 begins publishing at ≥20 YOS; earlier bands backfilled to first available (20)
  W5: {
    0: 9797.40, 2: 9797.40, 3: 9797.40, 4: 9797.40, 6: 9797.40, 8: 9797.40, 10: 9797.40,
    12: 9797.40, 14: 9797.40, 16: 9797.40, 18: 9797.40, 20: 9797.40, 22: 10294.50
  },

  // ---------- OFFICERS (DFAS: Basic Pay – Officers, Effective Jan 1, 2025) ----------
  O1: {
    0: 3998.40, 2: 4161.90, 3: 5031.30, 4: 5031.30, 6: 5031.30, 8: 5031.30, 10: 5031.30,
    12: 5031.30, 14: 5031.30, 16: 5031.30, 18: 5031.30, 20: 5031.30, 22: 5031.30
  },
  O2: {
    0: 4606.80, 2: 5246.70, 3: 6042.90, 4: 6247.20, 6: 6375.30, 8: 6375.30, 10: 6375.30,
    12: 6375.30, 14: 6375.30, 16: 6375.30, 18: 6375.30, 20: 6375.30, 22: 6375.30
  },
  O3: {
    0: 5331.60, 2: 6044.10, 3: 6522.60, 4: 7112.40, 6: 7453.80, 8: 7827.90, 10: 8069.10,
    12: 8466.60, 14: 8674.50, 16: 8674.50, 18: 8674.50, 20: 8674.50, 22: 8674.50
  },
  O4: {
    0: 6064.20, 2: 7019.70, 3: 7488.90, 4: 7592.40, 6: 8027.10, 8: 8493.60, 10: 9075.00,
    12: 9526.20, 14: 9840.60, 16: 10020.90, 18: 10125.00, 20: 10125.00, 22: 10125.00
  },
  O5: {
    0: 7028.40, 2: 7917.30, 3: 8465.40, 4: 8568.60, 6: 8910.90, 8: 9114.90, 10: 9564.90,
    12: 9895.80, 14: 10322.70, 16: 10974.30, 18: 11285.10, 20: 11592.30, 22: 11940.90
  },
  O6: {
    0: 8430.90, 2: 9261.90, 3: 9870.00, 4: 9870.00, 6: 9907.80, 8: 10332.30, 10: 10388.70,
    12: 10388.70, 14: 10979.10, 16: 12022.80, 18: 12635.40, 20: 13247.70, 22: 13596.30
  },
};

// Optional: tiny helper with console warnings if a grade/band is missing.
let warnedGrades: Set<string> = new Set();

export function getBasePayMonthly(grade: PayGrade, yos: number): number {
  const table = BASE_PAY_2025[grade];
  const band = toYosBand(yos);

  if (!table) {
    if (!warnedGrades.has(grade)) {
      console.warn("Unknown paygrade in BASE_PAY_2025:", grade);
      warnedGrades.add(grade);
    }
    return 0;
  }

  const exact = table[band as YosBand];
  if (typeof exact === "number") return exact;

  // Walk down to nearest lower band that exists
  const bands: YosBand[] = [0,2,3,4,6,8,10,12,14,16,18,20,22];
  const idx = bands.indexOf(band);
  for (let i = idx; i >= 0; i--) {
    const v = table[bands[i]];
    if (typeof v === "number") return v;
  }

  if (!warnedGrades.has(grade)) {
    console.warn(`No bands filled for ${grade} in BASE_PAY_2025 (returning 0). Add values.`);
    warnedGrades.add(grade);
  }
  return 0;
}

export default BASE_PAY_2025;
