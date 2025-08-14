// src/app/pay/page.tsx
"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { computePay, type PayInputs } from "@/lib/calc";
import { makeBahOptions, type PayGradeBAH } from "@/utils/bahTop";

const PAY_STORAGE_KEY = "navy-budget:payInputs:v1";

const cx = (...xs: (string | false | undefined)[]) => xs.filter(Boolean).join(" ");
const currency = (n: number) =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
const makeId = () => Math.random().toString(36).slice(2) + "-" + Date.now().toString(36);

function toBahGrade(grade: PayInputs["grade"]): PayGradeBAH {
  if (grade === "E1" || grade === "E2" || grade === "E3" || grade === "E4") return "E1–E4";
  if (
    ["E5","E6","E7","E8","E9","W1","W2","W3","W4","W5","O1","O2","O3","O4","O5","O6"].includes(grade)
  ) {
    return grade as PayGradeBAH;
  }
  return "O6";
}

type Allot = { id: string; name: string; amount: number };

// No borders: soft backgrounds + rounded corners.
const card =
  "rounded-2xl shadow-sm bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60";
const label = "block text-sm font-medium text-slate-700";
const inputBase =
  "w-full rounded-lg p-2.5 text-sm outline-none border-0 ring-1 ring-transparent focus:ring-4 focus:ring-sky-200 transition bg-white";
const selectBase =
  "w-full rounded-lg p-2.5 text-sm outline-none border-0 ring-1 ring-transparent focus:ring-4 focus:ring-sky-200 transition bg-white";
const checkbox =
  "h-4 w-4 rounded-md text-sky-600 focus:ring-2 focus:ring-offset-0 focus:ring-sky-300";
const softBox = "rounded-xl p-4 bg-white/70";
const pill = (from: string, to: string) =>
  `inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow bg-gradient-to-r ${from} ${to}`;

export default function PayPage() {
  const [hydrated, setHydrated] = useState(false);

  // UI-only fields included: basOn, tspTraditionalPercent, tspRothPercent, specialOn, specialAmount
  const [inputs, setInputs] = useState<PayInputs>(() => {
    const init = {
      grade: "E1",
      yos: 0,
      bahOn: true,
      depStatus: "with",
      bahZip: "",
      bahCustom: 0,

      // calc.ts uses tspPercent (we synthesize from two sliders)
      tspPercent: 0,
      federalMonthly: 0,
      stateMonthly: 0,
      sgliOn: true,
      sgliCoverage: 500_000,
      afrh: true,

      // UI extras
      basOn: true,
      tspTraditionalPercent: 0,
      tspRothPercent: 0,
      specialOn: false,
      specialAmount: 0,

      allotments: [] as Allot[],
    } as unknown as PayInputs;
    return init;
  });

  const [openGross, setOpenGross] = useState(false);
  const [openDed, setOpenDed] = useState(false);
  const [openAllot, setOpenAllot] = useState(false);
  const [openNet, setOpenNet] = useState(false);

  const allotments: Allot[] = useMemo(
    () =>
      (Array.isArray((inputs as any).allotments)
        ? (inputs as any).allotments
        : []) as Allot[],
    [inputs]
  );

  useEffect(() => {
    setHydrated(true);
    try {
      const raw = window.localStorage.getItem(PAY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setInputs((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(PAY_STORAGE_KEY, JSON.stringify(inputs));
    } catch {}
  }, [inputs, hydrated]);

  // ---------- BAH ----------
  const bahGrade = toBahGrade(inputs.grade);
  const bahOptions = makeBahOptions(bahGrade); // {zip, name, withDep, withoutDep}
  const selectedBah = useMemo(
    () => bahOptions.find((o) => o.zip === (inputs as any).bahZip),
    [bahOptions, inputs]
  );
  const tableBah = useMemo(() => {
    if ((inputs as any).bahZip === "custom")
      return Math.max(0, Number((inputs as any).bahCustom || 0));
    if (selectedBah) {
      return (inputs as any).depStatus === "with"
        ? selectedBah.withDep
        : selectedBah.withoutDep;
    }
    return 0;
  }, [inputs, selectedBah]);

  // ---------- Output ----------
  const tspTraditional = Number((inputs as any).tspTraditionalPercent || 0);
  const tspRoth = Number((inputs as any).tspRothPercent || 0);
  const tspTotal = Math.min(100, Math.max(0, tspTraditional + tspRoth));
  const inputsForCalc = useMemo(
    () => ({ ...inputs, tspPercent: tspTotal }) as PayInputs,
    [inputs, tspTotal]
  );

  const out = useMemo(
    () =>
      computePay(inputsForCalc, tableBah, {
        basOn: !!(inputs as any).basOn,
        specialMonthly: (inputs as any).specialOn
          ? Math.max(0, Number((inputs as any).specialAmount || 0))
          : 0,
      }),
    [inputsForCalc, tableBah, inputs]
  );

  const gross = Number(out.totalEntitlements || 0);
  const deductions =
    Number(out.federalMonthly || 0) +
    Number(out.stateMonthly || 0) +
    Number(out.ficaSocialMonthly || 0) +
    Number(out.ficaMedicareMonthly || 0) +
    Number(out.tspMonthly || 0) +
    Number(out.insuranceMonthly || 0);

  const allotTotal = Number(out.allotmentsMonthly || 0);

  // ✅ Net pay NOW EXCLUDES allotments:
  const netBeforeAllot = Number(out.netMonthlyExclAllot || gross - deductions);
  const perPaycheck = netBeforeAllot / 2; // twice-monthly assumption

  // ---------- Handlers ----------
  const set = useCallback(<K extends string>(k: K, v: any) => {
    setInputs((prev) => ({ ...prev, [k]: v }));
  }, []);

  const updateAllot = (id: string, field: "name" | "amount", val: string) => {
    setInputs((prev) => {
      const list: Allot[] = Array.isArray((prev as any).allotments)
        ? ((prev as any).allotments as Allot[])
        : [];
      const next = list.map((a) =>
        a.id === id
          ? { ...a, [field]: field === "amount" ? Number(val || 0) : val }
          : a
      );
      return { ...prev, allotments: next } as PayInputs;
    });
  };
  const addAllot = () =>
    setInputs((prev) => ({
      ...prev,
      allotments: [
        ...(Array.isArray((prev as any).allotments) ? (prev as any).allotments : []),
        { id: makeId(), name: "", amount: 0 },
      ],
    })) as any;
  const removeAllot = (id: string) =>
    setInputs((prev) => ({
      ...prev,
      allotments: (Array.isArray((prev as any).allotments)
        ? (prev as any).allotments
        : []
      ).filter((a: Allot) => a.id !== id),
    })) as any;

  // ---------- UI ----------
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-indigo-50 to-emerald-50">
      <main className="max-w-5xl mx-auto p-6 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-700 to-emerald-600 bg-clip-text text-transparent">
            Pay Setup
          </h1>
        </header>

        {/* ENTITLEMENTS */}
        <section className={cx(card, "p-5")}>
          <div className={pill("from-sky-500", "to-emerald-500")}>Entitlements</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Paygrade */}
            <div>
              <label className={label}>Paygrade</label>
              <select
                className={selectBase}
                value={inputs.grade}
                onChange={(e) => set("grade", e.target.value)}
              >
                {[
                  "E1","E2","E3","E4","E5","E6","E7","E8","E9",
                  "W1","W2","W3","W4","W5",
                  "O1","O2","O3","O4","O5","O6",
                ].map((g, i) => (
                  <option key={`grade-${g}-${i}`} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* YOS slider */}
            <div>
              <label className={label}>Years of Service</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={30}
                  step={1}
                  className="w-full accent-sky-600"
                  value={Number((inputs as any).yos || 0)}
                  onChange={(e) => set("yos", Number(e.target.value))}
                />
                <div className="w-12 text-right tabular-nums">{Number((inputs as any).yos || 0)}</div>
              </div>
            </div>
          </div>

          {/* BAH + BAS */}
          <div className="mt-6 grid grid-cols-1 gap-4">
            <div className={softBox}>
              <div className="flex items-center justify-between">
                <div className="font-semibold text-slate-800">BAH</div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className={checkbox}
                      checked={!!(inputs as any).bahOn}
                      onChange={(e) => set("bahOn", e.target.checked)}
                    />
                    Include BAH
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className={checkbox}
                      checked={!!(inputs as any).basOn}
                      onChange={(e) => set("basOn", e.target.checked)}
                    />
                    Include BAS
                  </label>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Dependent status */}
                <div className="md:col-span-1">
                  <label className={label}>Dependent Status</label>
                  <label className="inline-flex items-center gap-2 mt-1">
                    <input
                      type="checkbox"
                      className={checkbox}
                      checked={(inputs as any).depStatus === "with"}
                      onChange={(e) => set("depStatus", e.target.checked ? "with" : "without")}
                    />
                    <span className="text-sm text-slate-700">With Dependents</span>
                  </label>
                </div>

                {/* Locality */}
                <div className="md:col-span-2">
                  <label className={label}>Locality</label>
                  <div className="flex gap-2">
                    <select
                      className={selectBase}
                      value={(inputs as any).bahZip || ""}
                      onChange={(e) => set("bahZip", e.target.value)}
                    >
                      <option key="__blank" value="">
                        Pick a city or choose “Custom Amount…”
                      </option>
                      <option key="__custom" value="custom">
                        Custom Amount…
                      </option>
                      {bahOptions.map((o, idx) => (
                        <option key={`bah-${o.zip}-${o.name}-${idx}`} value={o.zip}>
                          {o.name}
                        </option>
                      ))}
                    </select>
                    {(inputs as any).bahZip !== "custom" && (
                      <div className="shrink-0 self-center text-xs text-slate-500">
                        {(inputs as any).depStatus === "with"
                          ? currency(selectedBah?.withDep || 0)
                          : currency(selectedBah?.withoutDep || 0)}
                      </div>
                    )}
                  </div>

                  {(inputs as any).bahZip === "custom" && (
                    <div className="mt-2">
                      <label className={label}>Custom BAH Amount (monthly)</label>
                      <input
                        type="number"
                        className={inputBase}
                        value={Number((inputs as any).bahCustom || 0)}
                        onChange={(e) => set("bahCustom", Number(e.target.value || 0))}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SPECIAL PAY */}
          <div className="mt-4 grid grid-cols-1 gap-4">
            <div className={softBox}>
              <div className="flex items-center justify-between">
                <div className="font-semibold text-slate-800">Special Pay</div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className={checkbox}
                    checked={!!(inputs as any).specialOn}
                    onChange={(e) => set("specialOn", e.target.checked)}
                  />
                  Enable
                </label>
              </div>

              {(inputs as any).specialOn && (
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-1">
                    <label className={label}>Custom Amount (monthly)</label>
                    <input
                      type="number"
                      className={inputBase}
                      value={Number((inputs as any).specialAmount || 0)}
                      onChange={(e) => set("specialAmount", Number(e.target.value || 0))}
                      placeholder="e.g., Sea Pay, Sub Pay"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* DEDUCTIONS */}
        <section className={cx(card, "p-5")}>
          <div className={pill("from-rose-500", "to-pink-500")}>Deductions</div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {/* TSP (two sliders) */}
            <div className={softBox}>
              <div className="font-semibold text-slate-800 mb-3">TSP</div>

              <label className={label}>Traditional</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  className="w-full accent-rose-600"
                  value={Number((inputs as any).tspTraditionalPercent || 0)}
                  onChange={(e) => set("tspTraditionalPercent", Number(e.target.value))}
                />
                <div className="w-16 text-right tabular-nums">
                  {Number((inputs as any).tspTraditionalPercent || 0)}%
                </div>
              </div>

              <label className={cx(label, "mt-3")}>Roth</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  className="w-full accent-fuchsia-600"
                  value={Number((inputs as any).tspRothPercent || 0)}
                  onChange={(e) => set("tspRothPercent", Number(e.target.value))}
                />
                <div className="w-16 text-right tabular-nums">
                  {Number((inputs as any).tspRothPercent || 0)}%
                </div>
              </div>

              <div className="mt-3 text-sm text-slate-600">
                Total TSP:{" "}
                <span className="font-semibold tabular-nums">
                  {Math.min(
                    100,
                    Math.max(
                      0,
                      Number((inputs as any).tspTraditionalPercent || 0) +
                        Number((inputs as any).tspRothPercent || 0)
                    )
                  )}
                  %
                </span>
              </div>
            </div>

            {/* Taxes */}
            <div className={softBox}>
              <div className="font-semibold text-slate-800 mb-3">Taxes</div>
              <label className={label}>Federal</label>
              <input
                type="number"
                className={inputBase}
                value={Number((inputs as any).federalMonthly || 0)}
                onChange={(e) => set("federalMonthly", Number(e.target.value || 0))}
              />
              <label className={cx(label, "mt-3")}>State</label>
              <input
                type="number"
                className={inputBase}
                value={Number((inputs as any).stateMonthly || 0)}
                onChange={(e) => set("stateMonthly", Number(e.target.value || 0))}
              />
            </div>

            {/* Insurances */}
            <div className={softBox}>
              <div className="font-semibold text-slate-800 mb-3">Insurances</div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className={checkbox}
                  checked={!!(inputs as any).sgliOn}
                  onChange={(e) => set("sgliOn", e.target.checked)}
                />
                <span className="text-sm text-slate-700">SGLI</span>
              </label>

              <label className={cx(label, "mt-2")}>SGLI Coverage</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={500_000}
                  step={50_000}
                  className="w-full accent-indigo-600"
                  value={Number((inputs as any).sgliCoverage || 0)}
                  onChange={(e) => set("sgliCoverage", Number(e.target.value))}
                  disabled={!(inputs as any).sgliOn}
                />
                <div className="w-28 text-right tabular-nums">
                  {currency(Number((inputs as any).sgliCoverage || 0))}
                </div>
              </div>

              <label className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  className={checkbox}
                  checked={!!(inputs as any).afrh}
                  onChange={(e) => set("afrh", e.target.checked)}
                />
                <span className="text-sm text-slate-700">AFRH</span>
              </label>
            </div>
          </div>
        </section>

        {/* ALLOTMENTS */}
        <section className={cx(card, "p-5")}>
          <div className={pill("from-amber-500", "to-yellow-500")}>Allotments</div>

          <div className="flex items-center justify-end mt-3">
            <button
              type="button"
              onClick={addAllot}
              className="px-3 py-1.5 rounded-lg shadow-sm text-sm bg-white/80 hover:bg-white"
            >
              + Add
            </button>
          </div>

          <div className="space-y-3 mt-3">
            {allotments.map((a, idx) => (
              <div key={`allot-${a.id || a.name || "row"}-${idx}`} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                <div className="md:col-span-8">
                  <label className={label}>Name</label>
                  <input
                    className={inputBase}
                    value={a.name}
                    onChange={(e) => updateAllot(a.id, "name", e.target.value)}
                    placeholder="e.g., Rent"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className={label}>Amount (monthly)</label>
                  <input
                    type="number"
                    className={inputBase}
                    value={Number(a.amount || 0)}
                    onChange={(e) => updateAllot(a.id, "amount", e.target.value)}
                  />
                </div>
                <div className="md:col-span-1">
                  <button
                    type="button"
                    onClick={() => removeAllot(a.id)}
                    className="w-full rounded-lg p-2 hover:bg-red-50"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            {allotments.length === 0 && (
              <div key="allot-empty" className="text-sm text-slate-500">No allotments added.</div>
            )}
          </div>
        </section>

        {/* SUMMARY (compact with dropdowns) */}
        <section className={cx(card, "p-5")}>
          <div className={pill("from-indigo-500", "to-purple-500")}>Summary</div>

          <div className="mt-4 space-y-2 text-sm">
            {/* Gross */}
            <div className={softBox}>
              <button
                type="button"
                onClick={() => setOpenGross((v) => !v)}
                className="w-full flex items-center justify-between"
              >
                <span className="font-semibold text-slate-700">Gross Income</span>
                <span className="font-semibold tabular-nums">{currency(gross)}</span>
              </button>
              {openGross && (
                <div className="mt-2 grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Base</span>
                    <span className="tabular-nums">{currency((out as any).base || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">BAH</span>
                    <span className="tabular-nums">{currency((out as any).bah || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">BAS</span>
                    <span className="tabular-nums">{currency((out as any).bas || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Special</span>
                    <span className="tabular-nums">{currency((out as any).specialMonthly || 0)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Deductions */}
            <div className={softBox}>
              <button
                type="button"
                onClick={() => setOpenDed((v) => !v)}
                className="w-full flex items-center justify-between"
              >
                <span className="font-semibold text-slate-700">Deductions</span>
                <span className="font-semibold tabular-nums">{currency(deductions)}</span>
              </button>
              {openDed && (
                <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Federal</span>
                    <span className="tabular-nums">{currency((out as any).federalMonthly || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">State</span>
                    <span className="tabular-nums">{currency((out as any).stateMonthly || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">FICA Social Security</span>
                    <span className="tabular-nums">{currency((out as any).ficaSocialMonthly || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">FICA Medicare</span>
                    <span className="tabular-nums">{currency((out as any).ficaMedicareMonthly || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">TSP (Total)</span>
                    <span className="tabular-nums">{currency((out as any).tspMonthly || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Insurances</span>
                    <span className="tabular-nums">{currency((out as any).insuranceMonthly || 0)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Allotments */}
            <div className={softBox}>
              <button
                type="button"
                onClick={() => setOpenAllot((v) => !v)}
                className="w-full flex items-center justify-between"
              >
                <span className="font-semibold text-slate-700">Allotments</span>
                <span className="font-semibold tabular-nums">{currency(allotTotal)}</span>
              </button>
              {openAllot && (
                <div className="mt-2 space-y-1">
                  {allotments.length === 0 && (
                    <div className="text-slate-500">No allotments</div>
                  )}
                  {allotments.map((a, i) => (
                    <div key={`sum-allot-${a.id || a.name}-${i}`} className="flex items-center justify-between">
                      <span className="text-slate-500">{a.name || "Allotment"}</span>
                      <span className="tabular-nums">{currency(Number(a.amount || 0))}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Net Pay (EXCLUDES allotments) */}
            <div className={softBox}>
              <button
                type="button"
                onClick={() => setOpenNet((v) => !v)}
                className="w-full flex items-center justify-between"
              >
                <span className="font-semibold text-slate-700">Net Pay</span>
                <span className="font-semibold tabular-nums text-emerald-700">{currency(netBeforeAllot)}</span>
              </button>
              {openNet && (
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Monthly Net</span>
                    <span className="tabular-nums">{currency(netBeforeAllot)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Per Paycheck (twice‑monthly)</span>
                    <span className="tabular-nums">{currency(perPaycheck)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
