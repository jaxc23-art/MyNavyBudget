// src/utils/bas.ts
// Replace with approved 2025 BAS monthly amounts.
export const BAS_2025 = {
  enlisted: 465.77, // 
  officer:  359.55, //
};

export type BASKind = "enlisted" | "officer";

export function getBASMonthly(kind: BASKind | null, on: boolean): number {
  if (!on || !kind) return 0;
  return BAS_2025[kind] || 0;
}
