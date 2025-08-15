export const dynamic = 'force-dynamic';
export const revalidate = 0;

// src/app/budget/page.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  computePay,
  type PayInputs,
  type WithOrWithout,
} from "@/lib/calc";
import { makeBahOptions, type PayGradeBAH } from "@/utils/bahTop";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

/* =========================
   Styles (borderless)
========================= */
const cx = (...xs: (string | false | undefined)[]) => xs.filter(Boolean).join(" ");
const currency = (n: number) =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });

const card =
  "rounded-2xl shadow-sm bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60";
const softBox = "rounded-xl p-4 bg-white/70";
const label = "block text-sm font-medium text-slate-700";
const inputBase =
  "w-full rounded-lg p-2.5 text-sm outline-none border-0 ring-1 ring-transparent focus:ring-4 focus:ring-sky-200 transition bg-white";
const selectBase =
  "w-full rounded-lg p-2.5 text-sm outline-none border-0 ring-1 ring-transparent focus:ring-4 focus:ring-sky-200 transition bg-white";
const pill = (from: string, to: string) =>
  `inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow bg-gradient-to-r ${from} ${to}`;

const BUDGET_STORAGE_KEY = "navy-budget:budget:v2";
const PAY_STORAGE_KEY = "navy-budget:payInputs:v1";

/* =========================
   Types & helpers
========================= */
type WantNeedSave = "need" | "want" | "savings";
type Expense = { id: string; name: string; amount: number; kind: WantNeedSave; color: string };
type PayAllot = { id?: string; name?: string; amount?: number };

const makeId = () => Math.random().toString(36).slice(2) + "-" + Date.now().toString(36);

const PALETTE = [
  "#2563eb", "#22c55e", "#f59e0b", "#ef4444", "#a855f7",
  "#06b6d4", "#84cc16", "#e11d48", "#fb7185", "#14b8a6",
  "#8b5cf6", "#f97316", "#10b981", "#f43f5e", "#0ea5e9",
];

function toBahGrade(grade: string): PayGradeBAH {
  if (["E1", "E2", "E3", "E4"].includes(grade)) return "E1–E4";
  if (
    ["E5","E6","E7","E8","E9","W1","W2","W3","W4","W5","O1","O2","O3","O4","O5","O6"].includes(grade)
  ) return grade as PayGradeBAH;
  return "O6";
}

function resolveBah(
  grade: string,
  dep: WithOrWithout,
  bahZip: string,
  custom: number
): number {
  if (bahZip === "custom") return Math.max(0, Number(custom || 0));
  if (!bahZip) return 0;
  const opts = makeBahOptions(toBahGrade(grade));
  const found = opts.find((o) => o.zip === bahZip);
  if (!found) return 0;
  return dep === "with" ? found.withDep : found.withoutDep;
}

/** Read ONLY allotments directly from Pay page localStorage. */
function readPayAllotments(): PayAllot[] {
  try {
    const raw = window.localStorage.getItem(PAY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed.allotments) ? parsed.allotments : [];
    return list.filter((a: any) => a && (a.name || a.amount));
  } catch {
    return [];
  }
}

/** One-time cleaner: drop any expense that looks like FICA/Tax/Insurance. */
function stripNonAllotments(list: Expense[]): Expense[] {
  const BAD = /(fica|medicare|social\s*sec|federal\s*tax|insurance)/i;
  return list.filter((e) => !BAD.test(String(e.name || "")));
}

const sumTspPercent = (obj: any) =>
  Math.min(
    100,
    Math.max(
      0,
      Number(obj?.tspTraditionalPercent || 0) + Number(obj?.tspRothPercent || 0)
    )
  );

/** Compute Monthly Net (EXCLUDES allotments) straight from Pay inputs in localStorage. */
function computeMonthlyNetFromPay(): number {
  try {
    const raw = window.localStorage.getItem(PAY_STORAGE_KEY);
    if (!raw) return 0;

    const pay = JSON.parse(raw) as Partial<PayInputs> & {
      bahOn?: boolean;
      basOn?: boolean;
      depStatus?: "with" | "without";
      bahZip?: string;
      bahCustom?: number;
      tspTraditionalPercent?: number;
      tspRothPercent?: number;
      specialOn?: boolean;
      specialAmount?: number;
      federalMonthly?: number;
      stateMonthly?: number;
      sgliOn?: boolean;
      sgliCoverage?: number;
      afrh?: boolean;
      yos?: number;
      grade?: any;
    };

    const grade = String(pay.grade || "E1");
    const tableBah = resolveBah(
      grade,
      (pay.depStatus as WithOrWithout) || "with",
      String(pay.bahZip || ""),
      Number(pay.bahCustom || 0)
    );

    const inputsForCalc: PayInputs = {
      grade: grade as any,
      yos: Number((pay as any).yos || 0),
      bahOn: !!pay.bahOn,
      depStatus: (pay.depStatus as any) || "with",
      bahZip: String(pay.bahZip || ""),
      bahCustom: Number(pay.bahCustom || 0),
      tspPercent: sumTspPercent(pay),
      federalMonthly: Number(pay.federalMonthly || 0),
      stateMonthly: Number(pay.stateMonthly || 0),
      sgliOn: !!pay.sgliOn,
      sgliCoverage: Number(pay.sgliCoverage || 0),
      afrh: !!pay.afrh,
    } as PayInputs;

    const extras = {
      basOn: !!pay.basOn,
      specialMonthly: pay.specialOn ? Math.max(0, Number(pay.specialAmount || 0)) : 0,
    };

    const out = computePay(inputsForCalc, tableBah, extras);

    const gross =
      Number(out.totalEntitlements || 0);

    const deductions =
      Number(out.federalMonthly || 0) +
      Number(out.stateMonthly || 0) +
      Number(out.ficaSocialMonthly || 0) +
      Number(out.ficaMedicareMonthly || 0) +
      Number(out.tspMonthly || 0) +
      Number(out.insuranceMonthly || 0);

    // ✅ Net (EXCLUDES allotments)
    const netExclAllot = Math.max(0, gross - deductions);
    return netExclAllot || 0;
  } catch {
    return 0;
  }
}

/* =========================
   Component
========================= */
export default function BudgetPage() {
  const [hydrated, setHydrated] = useState(false);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [importedOnce, setImportedOnce] = useState(false);
  const [migrated, setMigrated] = useState(false); // run cleaner once
  const [incomeMonthlyNet, setIncomeMonthlyNet] = useState<number>(0);

  // Ensure every expense has a color
  const ensureColors = useCallback((list: Expense[]) => {
    return list.map((e, i) => ({
      ...e,
      color: e.color && /^#/.test(e.color) ? e.color : PALETTE[i % PALETTE.length],
    }));
  }, []);

  /* Load from storage */
  useEffect(() => {
    setHydrated(true);
    try {
      const raw = window.localStorage.getItem(BUDGET_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const exp = Array.isArray(parsed.expenses) ? parsed.expenses : [];
        setExpenses(
          ensureColors(
            exp.map((x: any) => ({
              id: String(x.id || makeId()),
              name: String(x.name || ""),
              amount: Number(x.amount || 0),
              kind: (x.kind as WantNeedSave) || "need",
              color: String(x.color || ""),
            }))
          )
        );
        if (parsed.importedOnce) setImportedOnce(true);
        if (parsed.migrated) setMigrated(true);
      }
    } catch {}
  }, [ensureColors]);

  /* Always compute Net Monthly directly from PAY storage */
  useEffect(() => {
    if (!hydrated) return;
    setIncomeMonthlyNet(computeMonthlyNetFromPay());

    // Keep in sync if Pay page updates in another tab
    const onStorage = (e: StorageEvent) => {
      if (e.key === PAY_STORAGE_KEY) {
        setIncomeMonthlyNet(computeMonthlyNetFromPay());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [hydrated]);

  /* One-time migration: strip any old FICA/Tax/Insurance lines that were cached */
  useEffect(() => {
    if (!hydrated || migrated) return;
    if (expenses.some((e) => /(fica|federal\s*tax|insurance)/i.test(e.name))) {
      const cleaned = ensureColors(stripNonAllotments(expenses));
      setExpenses(cleaned);
      setMigrated(true);
    }
  }, [hydrated, migrated, expenses, ensureColors]);

  /* Persist */
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        BUDGET_STORAGE_KEY,
        JSON.stringify({ expenses, importedOnce, migrated })
      );
    } catch {}
  }, [expenses, importedOnce, migrated, hydrated]);

  /* First-run import: ONLY allotments */
  useEffect(() => {
    if (!hydrated || importedOnce || expenses.length > 0) return;
    const payAllots = readPayAllotments()
      .map((a, i) => ({
        id: makeId(),
        name: a.name || "Allotment",
        amount: Number(a.amount || 0),
        kind: "need" as WantNeedSave,
        color: PALETTE[i % PALETTE.length],
      }))
      .filter((x) => x.amount > 0);

    if (payAllots.length) {
      setExpenses(ensureColors(payAllots));
      setImportedOnce(true);
    }
  }, [hydrated, importedOnce, expenses.length, ensureColors]);

  /* Derived values */
  const totalExpenses = useMemo(
    () => expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0),
    [expenses]
  );

  const pctByKind = useMemo(() => {
    const sum = totalExpenses || 1;
    const want = expenses.filter((e) => e.kind === "want").reduce((s, e) => s + (e.amount || 0), 0);
    const need = expenses.filter((e) => e.kind === "need").reduce((s, e) => s + (e.amount || 0), 0);
    const save = expenses.filter((e) => e.kind === "savings").reduce((s, e) => s + (e.amount || 0), 0);
    return {
      wantPct: Math.round((want / sum) * 100),
      needPct: Math.round((need / sum) * 100),
      savePct: Math.round((save / sum) * 100),
      want, need, save,
    };
  }, [expenses, totalExpenses]);

  const pieData = useMemo(
    () =>
      ensureColors(expenses)
        .filter((e) => (Number(e.amount) || 0) > 0)
        .map((e) => ({ name: e.name || "Expense", value: Number(e.amount) || 0, color: e.color })),
    [expenses, ensureColors]
  );

  /* Handlers */
  const setExpense = useCallback(
    (id: string, field: keyof Expense, val: string) => {
      setExpenses((prev) =>
        ensureColors(
          prev.map((e, idx) =>
            e.id === id
              ? {
                  ...e,
                  [field]:
                    field === "amount"
                      ? Number(val || 0)
                      : field === "kind"
                      ? (val as WantNeedSave)
                      : field === "color"
                      ? val
                      : val,
                  color: e.color || PALETTE[idx % PALETTE.length],
                }
              : e
          )
        )
      );
    },
    [ensureColors]
  );

  const addExpense = () => {
    setExpenses((prev) => {
      const idx = prev.length;
      return ensureColors([
        ...prev,
        {
          id: makeId(),
          name: "",
          amount: 0,
          kind: "need",
          color: PALETTE[idx % PALETTE.length],
        },
      ]);
    });
  };

  const removeExpense = (id: string) =>
    setExpenses((prev) => prev.filter((e) => e.id !== id));

  const importFromPayAllotmentsOnly = () => {
    const payAllots = readPayAllotments()
      .map((a, i) => ({
        id: makeId(),
        name: a.name || "Allotment",
        amount: Number(a.amount || 0),
        kind: "need" as WantNeedSave,
        color: PALETTE[i % PALETTE.length],
      }))
      .filter((x) => x.amount > 0);

    setExpenses(ensureColors(payAllots));
    setImportedOnce(true);
    setMigrated(true);
  };

  const netAfterExpenses = (incomeMonthlyNet || 0) - (totalExpenses || 0);

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-indigo-50 to-emerald-50">
      <main className="max-w-5xl mx-auto p-6 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-700 to-emerald-600 bg-clip-text text-transparent">
            Budget
          </h1>
          <div className="flex gap-2">
            <button
              onClick={importFromPayAllotmentsOnly}
              className="px-3 py-1.5 rounded-lg shadow-sm text-sm bg-white/80 hover:bg-white"
              title="Clear and import only allotments from Pay"
            >
              Reimport (Allotments only)
            </button>
          </div>
        </header>

        {/* GRAPH */}
        <section className={cx(card, "p-5")}>
          <div className={pill("from-indigo-500", "to-purple-500")}>Spending Overview</div>

          <div className={softBox + " mt-4"}>
            <div className="h-72">
              {hydrated && pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      isAnimationActive={false}
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      stroke="#ffffff"
                      strokeWidth={2}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${entry.name}-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => currency(Number(value) || 0)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full grid place-items-center text-slate-400 text-sm">
                  {pieData.length === 0 ? "Add expenses to see the chart" : "Loading…"}
                </div>
              )}
            </div>
          </div>

          {/* Percentages */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <div className={softBox}>
              <div className="text-slate-500 text-sm">Needs</div>
              <div className="text-xl font-semibold">{pctByKind.needPct}%</div>
              <div className="text-xs text-slate-500 mt-1">{currency(pctByKind.need)}</div>
            </div>
            <div className={softBox}>
              <div className="text-slate-500 text-sm">Wants</div>
              <div className="text-xl font-semibold">{pctByKind.wantPct}%</div>
              <div className="text-xs text-slate-500 mt-1">{currency(pctByKind.want)}</div>
            </div>
            <div className={softBox}>
              <div className="text-slate-500 text-sm">Savings</div>
              <div className="text-xl font-semibold">{pctByKind.savePct}%</div>
              <div className="text-xs text-slate-500 mt-1">{currency(pctByKind.save)}</div>
            </div>
          </div>
        </section>

        {/* EXPENSES */}
        <section className={cx(card, "p-5")}>
          <div className={pill("from-amber-500", "to-yellow-500")}>Expenses</div>

          <div className="space-y-3 mt-3">
            {expenses.map((e, idx) => (
              <div
                key={`exp-${e.id}-${idx}`}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end"
              >
                {/* Color swatch & name */}
                <div className="md:col-span-6">
                  <label className={label}>Name</label>
                  <div className="flex gap-2">
                    <div
                      className="h-9 w-9 rounded-lg shrink-0"
                      style={{ backgroundColor: e.color }}
                      title={e.color}
                    />
                    <input
                      className={inputBase + " flex-1"}
                      value={e.name ?? ""}
                      onChange={(ev) => setExpense(e.id, "name", ev.target.value)}
                      placeholder="e.g., Rent"
                    />
                  </div>
                </div>

                {/* Amount */}
                <div className="md:col-span-3">
                  <label className={label}>Amount (monthly)</label>
                  <input
                    type="number"
                    className={inputBase}
                    value={Number(e.amount || 0)}
                    onChange={(ev) => setExpense(e.id, "amount", ev.target.value)}
                  />
                </div>

                {/* Kind */}
                <div className="md:col-span-2">
                  <label className={label}>Type</label>
                  <select
                    className={selectBase}
                    value={e.kind}
                    onChange={(ev) => setExpense(e.id, "kind", ev.target.value)}
                  >
                    <option value="need">Need</option>
                    <option value="want">Want</option>
                    <option value="savings">Savings</option>
                  </select>
                </div>

                {/* Remove */}
                <div className="md:col-span-1">
                  <button
                    type="button"
                    onClick={() => removeExpense(e.id)}
                    className="w-full rounded-lg p-2 hover:bg-red-50"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}

            {expenses.length === 0 && (
              <div className="text-sm text-slate-500">No expenses added.</div>
            )}
          </div>

          {/* Totals */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className={softBox}>
              <div className="text-slate-500 text-sm">Total Expenses</div>
              <div className="text-xl font-semibold">{currency(totalExpenses)}</div>
            </div>
            <div className={softBox}>
              <div className="text-slate-500 text-sm">Items</div>
              <div className="text-xl font-semibold">{expenses.length}</div>
            </div>
            <div className={softBox}>
              <div className="text-slate-500 text-sm">Avg. per Item</div>
              <div className="text-xl font-semibold">
                {currency(expenses.length ? totalExpenses / expenses.length : 0)}
              </div>
            </div>
          </div>

          {/* + Add Expense at bottom */}
          <div className="flex items-center justify-end mt-4">
            <button
              type="button"
              onClick={addExpense}
              className="px-3 py-1.5 rounded-lg shadow-sm text-sm bg-white/80 hover:bg-white"
            >
              + Add Expense
            </button>
          </div>
        </section>

        {/* INCOME (BOTTOM) */}
        <section className={cx(card, "p-5")}>
          <div className={pill("from-sky-500", "to-emerald-500")}>Income (from Pay)</div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <div className={softBox}>
              <div className="text-slate-500 text-sm">Income Monthly (Net)</div>
              <div className="text-xl font-semibold">
                {hydrated ? currency(incomeMonthlyNet) : "—"}
              </div>
            </div>
            <div className={softBox}>
              <div className="text-slate-500 text-sm">Expenses Monthly</div>
              <div className="text-xl font-semibold">
                {currency(totalExpenses)}
              </div>
            </div>
            <div className={softBox}>
              <div className="text-slate-500 text-sm">Net After Expenses</div>
              <div className="text-xl font-semibold text-emerald-700">
                {hydrated ? currency((incomeMonthlyNet || 0) - (totalExpenses || 0)) : "—"}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
