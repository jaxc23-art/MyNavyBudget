// src/utils/bahTop.ts

// ===== Types you provided =====
export type PayGradeBAH =
  | "E1–E4" | "E5" | "E6" | "E7" | "E8" | "E9"
  | "W1" | "W2" | "W3" | "W4" | "W5"
  | "O1" | "O2" | "O3" | "O4" | "O5" | "O6";

type Row = { withDependents: number; withoutDependents: number };
export type CityBAH = Record<PayGradeBAH, Row>;
export type BahTable = Record<string, CityBAH>;

// ===== Full data =====
export const bahData: BahTable = {
  "San Diego, CA": {
    "E1–E4": { withDependents: 3579, withoutDependents: 2684 },
    "E5": { withDependents: 3882, withoutDependents: 2964 },
    "E6": { withDependents: 4320, withoutDependents: 3240 },
    "E7": { withDependents: 4344, withoutDependents: 3534 },
    "E8": { withDependents: 4353, withoutDependents: 3972 },
    "E9": { withDependents: 4491, withoutDependents: 4101 },
    "W1": { withDependents: 4413, withoutDependents: 3555 },
    "W2": { withDependents: 4458, withoutDependents: 4068 },
    "W3": { withDependents: 4518, withoutDependents: 4203 },
    "W4": { withDependents: 4716, withoutDependents: 4398 },
    "W5": { withDependents: 4959, withoutDependents: 4449 },
    "O1": { withDependents: 3939, withoutDependents: 3153 },
    "O2": { withDependents: 4317, withoutDependents: 3759 },
    "O3": { withDependents: 4359, withoutDependents: 4161 },
    "O4": { withDependents: 4869, withoutDependents: 4323 },
    "O5": { withDependents: 5244, withoutDependents: 4335 },
    "O6": { withDependents: 5289, withoutDependents: 4338 }
  },
  "Norfolk/Virginia Beach, VA": {
    "E1–E4": { withDependents: 2154, withoutDependents: 1674 },
    "E5": { withDependents: 2325, withoutDependents: 1869 },
    "E6": { withDependents: 2469, withoutDependents: 1995 },
    "E7": { withDependents: 2505, withoutDependents: 2157 },
    "E8": { withDependents: 2544, withoutDependents: 2361 },
    "E9": { withDependents: 2673, withoutDependents: 2391 },
    "W1": { withDependents: 2484, withoutDependents: 2103 },
    "W2": { withDependents: 2523, withoutDependents: 2358 },
    "W3": { withDependents: 2577, withoutDependents: 2397 },
    "W4": { withDependents: 2712, withoutDependents: 2469 },
    "W5": { withDependents: 2877, withoutDependents: 2514 },
    "O1": { withDependents: 2352, withoutDependents: 1977 },
    "O2": { withDependents: 2466, withoutDependents: 2271 },
    "O3": { withDependents: 2574, withoutDependents: 2412 },
    "O4": { withDependents: 2934, withoutDependents: 2499 },
    "O5": { withDependents: 3192, withoutDependents: 2517 },
    "O6": { withDependents: 3219, withoutDependents: 2556 }
  },
  "Washington, D.C.": {
    "E1–E4": { withDependents: 2922, withoutDependents: 2283 },
    "E5": { withDependents: 2952, withoutDependents: 2679 },
    "E6": { withDependents: 3459, withoutDependents: 2892 },
    "E7": { withDependents: 3579, withoutDependents: 2931 },
    "E8": { withDependents: 3702, withoutDependents: 3057 },
    "E9": { withDependents: 3876, withoutDependents: 3204 },
    "W1": { withDependents: 3480, withoutDependents: 2928 },
    "W2": { withDependents: 3630, withoutDependents: 3054 },
    "W3": { withDependents: 3786, withoutDependents: 3222 },
    "W4": { withDependents: 3915, withoutDependents: 3483 },
    "W5": { withDependents: 4068, withoutDependents: 3606 },
    "O1": { withDependents: 2763, withoutDependents: 2349 },
    "O2": { withDependents: 3081, withoutDependents: 2655 },
    "O3": { withDependents: 3447, withoutDependents: 2949 },
    "O4": { withDependents: 3678, withoutDependents: 3222 },
    "O5": { withDependents: 3834, withoutDependents: 3300 },
    "O6": { withDependents: 3870, withoutDependents: 3435 }
  },
  "Jacksonville, FL": {
    "E1–E4": { withDependents: 2100, withoutDependents: 1671 },
    "E5": { withDependents: 2226, withoutDependents: 1860 },
    "E6": { withDependents: 2295, withoutDependents: 1977 },
    "E7": { withDependents: 2343, withoutDependents: 2100 },
    "E8": { withDependents: 2397, withoutDependents: 2247 },
    "E9": { withDependents: 2481, withoutDependents: 2253 },
    "W1": { withDependents: 2310, withoutDependents: 2067 },
    "W2": { withDependents: 2364, withoutDependents: 2244 },
    "W3": { withDependents: 2436, withoutDependents: 2259 },
    "W4": { withDependents: 2502, withoutDependents: 2295 },
    "W5": { withDependents: 2586, withoutDependents: 2355 },
    "O1": { withDependents: 2244, withoutDependents: 1968 },
    "O2": { withDependents: 2292, withoutDependents: 2187 },
    "O3": { withDependents: 2433, withoutDependents: 2265 },
    "O4": { withDependents: 2613, withoutDependents: 2337 },
    "O5": { withDependents: 2736, withoutDependents: 2364 },
    "O6": { withDependents: 2760, withoutDependents: 2415 }
  },
  "Pensacola, FL": {
    "E1–E4": { withDependents: 2100, withoutDependents: 1671 },
    "E5": { withDependents: 2226, withoutDependents: 1860 },
    "E6": { withDependents: 2295, withoutDependents: 1977 },
    "E7": { withDependents: 2343, withoutDependents: 2100 },
    "E8": { withDependents: 2397, withoutDependents: 2247 },
    "E9": { withDependents: 2481, withoutDependents: 2253 },
    "W1": { withDependents: 646, withoutDependents: 537 },
    "W2": { withDependents: 687, withoutDependents: 583 },
    "W3": { withDependents: 728, withoutDependents: 601 },
    "W4": { withDependents: 795, withoutDependents: 685 },
    "W5": { withDependents: 859, withoutDependents: 710 },
    "O1": { withDependents: 624, withoutDependents: 520 },
    "O2": { withDependents: 687, withoutDependents: 583 },
    "O3": { withDependents: 728, withoutDependents: 601 },
    "O4": { withDependents: 795, withoutDependents: 685 },
    "O5": { withDependents: 859, withoutDependents: 710 },
    "O6": { withDependents: 859, withoutDependents: 710 }
  },
  "Charleston, SC": {
    "E1–E4": { withDependents: 2244, withoutDependents: 1905 },
    "E5": { withDependents: 2406, withoutDependents: 2148 },
    "E6": { withDependents: 2610, withoutDependents: 2286 },
    "E7": { withDependents: 2643, withoutDependents: 2367 },
    "E8": { withDependents: 2679, withoutDependents: 2526 },
    "E9": { withDependents: 2757, withoutDependents: 2634 },
    "W1": { withDependents: 2847, withoutDependents: 2352 },
    "W2": { withDependents: 2892, withoutDependents: 2523 },
    "W3": { withDependents: 2955, withoutDependents: 2649 },
    "W4": { withDependents: 3072, withoutDependents: 2835 },
    "W5": { withDependents: 3219, withoutDependents: 2883 },
    "O1": { withDependents: 2499, withoutDependents: 2283 },
    "O2": { withDependents: 2826, withoutDependents: 2424 },
    "O3": { withDependents: 2952, withoutDependents: 2688 },
    "O4": { withDependents: 3267, withoutDependents: 2868 },
    "O5": { withDependents: 3492, withoutDependents: 2892 },
    "O6": { withDependents: 3522, withoutDependents: 2934 }
  },
  "Everett/Seattle, WA": {
    "E1–E4": { withDependents: 2532, withoutDependents: 1935 },
    "E5": { withDependents: 2712, withoutDependents: 2202 },
    "E6": { withDependents: 3084, withoutDependents: 2367 },
    "E7": { withDependents: 3219, withoutDependents: 2538 },
    "E8": { withDependents: 3360, withoutDependents: 2790 },
    "E9": { withDependents: 3513, withoutDependents: 2895 },
    "W1": { withDependents: 3105, withoutDependents: 2481 },
    "W2": { withDependents: 3276, withoutDependents: 2787 },
    "W3": { withDependents: 3453, withoutDependents: 2910 },
    "W4": { withDependents: 3537, withoutDependents: 3111 },
    "W5": { withDependents: 3645, withoutDependents: 3249 },
    "O1": { withDependents: 2763, withoutDependents: 2349 },
    "O2": { withDependents: 3081, withoutDependents: 2655 },
    "O3": { withDependents: 3447, withoutDependents: 2949 },
    "O4": { withDependents: 3678, withoutDependents: 3222 },
    "O5": { withDependents: 3834, withoutDependents: 3300 },
    "O6": { withDependents: 3870, withoutDependents: 3435 }
  },
  "Great Lakes, IL": {
    "E1–E4": { withDependents: 2082, withoutDependents: 1563 },
    "E5": { withDependents: 2274, withoutDependents: 1770 },
    "E6": { withDependents: 2628, withoutDependents: 1971 },
    "E7": { withDependents: 2736, withoutDependents: 2088 },
    "E8": { withDependents: 2844, withoutDependents: 2349 },
    "E9": { withDependents: 3018, withoutDependents: 2448 },
    "W1": { withDependents: 2649, withoutDependents: 2028 },
    "W2": { withDependents: 2781, withoutDependents: 2346 },
    "W3": { withDependents: 2919, withoutDependents: 2463 },
    "W4": { withDependents: 3057, withoutDependents: 2649 },
    "W5": { withDependents: 3228, withoutDependents: 2760 },
    "O1": { withDependents: 2322, withoutDependents: 1890 },
    "O2": { withDependents: 2625, withoutDependents: 2214 },
    "O3": { withDependents: 2916, withoutDependents: 2499 },
    "O4": { withDependents: 3285, withoutDependents: 2736 },
    "O5": { withDependents: 3543, withoutDependents: 2796 },
    "O6": { withDependents: 3576, withoutDependents: 2901 }
  },
  "Monterey, CA": {
    "E1–E4": { withDependents: 3579, withoutDependents: 2684 },
    "E5": { withDependents: 3882, withoutDependents: 2964 },
    "E6": { withDependents: 4320, withoutDependents: 3240 },
    "E7": { withDependents: 4344, withoutDependents: 3534 },
    "E8": { withDependents: 4353, withoutDependents: 3972 },
    "E9": { withDependents: 4491, withoutDependents: 4101 },
    "W1": { withDependents: 4413, withoutDependents: 3555 },
    "W2": { withDependents: 4458, withoutDependents: 4068 },
    "W3": { withDependents: 4518, withoutDependents: 4203 },
    "W4": { withDependents: 4716, withoutDependents: 4398 },
    "W5": { withDependents: 4959, withoutDependents: 4449 },
    "O1": { withDependents: 3939, withoutDependents: 3153 },
    "O2": { withDependents: 4317, withoutDependents: 3759 },
    "O3": { withDependents: 4359, withoutDependents: 4161 },
    "O4": { withDependents: 4869, withoutDependents: 4323 },
    "O5": { withDependents: 5244, withoutDependents: 4335 },
    "O6": { withDependents: 5289, withoutDependents: 4338 }
  },
  "Point Loma, CA": {
    "E1–E4": { withDependents: 3579, withoutDependents: 2684 },
    "E5": { withDependents: 3882, withoutDependents: 2964 },
    "E6": { withDependents: 4320, withoutDependents: 3240 },
    "E7": { withDependents: 4344, withoutDependents: 3534 },
    "E8": { withDependents: 4353, withoutDependents: 3972 },
    "E9": { withDependents: 4491, withoutDependents: 4101 },
    "W1": { withDependents: 4341, withoutDependents: 3396 },
    "W2": { withDependents: 4350, withoutDependents: 3969 },
    "W3": { withDependents: 4362, withoutDependents: 4119 },
    "W4": { withDependents: 4545, withoutDependents: 4320 },
    "W5": { withDependents: 4785, withoutDependents: 4332 },
    "O1": { withDependents: 3939, withoutDependents: 3153 },
    "O2": { withDependents: 4317, withoutDependents: 3759 },
    "O3": { withDependents: 4359, withoutDependents: 4161 },
    "O4": { withDependents: 4869, withoutDependents: 4323 },
    "O5": { withDependents: 5244, withoutDependents: 4335 },
    "O6": { withDependents: 5289, withoutDependents: 4338 }
  }
} as const;

// ===== Small helpers =====

export const listCities = (): string[] => Object.keys(bahData);

export const getBah = (
  city: string,
  grade: PayGradeBAH,
  dep: "with" | "without"
): number => {
  const row = bahData[city]?.[grade];
  if (!row) return 0;
  return dep === "with" ? row.withDependents : row.withoutDependents;
};

// ===== Back‑compat adapter for the existing dropdown/picker =====
// Some parts of the app expect an array of entries with a `zip` field.
// We don’t have ZIPs in this dataset, so we mirror `zip` = city name.

export type BahEntry = {
  zip: string;   // city name as an ID
  name: string;  // friendly display (same as city)
  withDep: number;
  withoutDep: number;
};

/**
 * Build the options array for a specific paygrade
 * (so the UI can show the correct with/without amounts per city).
 */
export const makeBahOptions = (grade: PayGradeBAH): readonly BahEntry[] => {
  return listCities().map((city) => {
    const r = bahData[city][grade];
    return {
      zip: city,
      name: city,
      withDep: r.withDependents,
      withoutDep: r.withoutDependents,
    };
  });
};

// If you need a default list for initial render, use E6 by convention:
export const BAH_TOP = makeBahOptions("E6");
