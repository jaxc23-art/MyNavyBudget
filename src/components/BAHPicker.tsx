"use client";

import React from "react";

export type DepStatus = "with" | "without";

type BahOption = {
  zip: string;               // key used in state and lookup
  withDep: number;           // monthly
  withoutDep: number;        // monthly
  label?: string;            // nice label (falls back to zip)
};

type Props = {
  bahOn: boolean;
  depStatus: DepStatus;
  zip?: string;              // city key or "custom"
  custom?: number;           // custom monthly when zip === "custom"
  options: BahOption[];

  onChangeBahOn: (on: boolean) => void;
  onChangeDepStatus: (v: DepStatus) => void;
  onChangeZip: (zip: string) => void;
  onChangeCustom: (amt?: number) => void;
};

export default function BAHPicker({
  bahOn,
  depStatus,
  zip,
  custom,
  options,
  onChangeBahOn,
  onChangeDepStatus,
  onChangeZip,
  onChangeCustom,
}: Props) {
  const card = "rounded-xl border border-slate-200 bg-white/70 p-4";
  const label = "text-sm font-medium text-slate-700";
  const inputBase =
    "w-full border rounded-lg p-2.5 text-sm outline-none border-slate-300 focus:ring-4 focus:ring-sky-200 focus:border-sky-400 transition";

  return (
    <div className={card}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">BAH</h3>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4 accent-indigo-600"
            checked={bahOn}
            onChange={(e) => onChangeBahOn(e.target.checked)}
          />
          <span className="text-sm font-medium text-slate-700">Include BAH</span>
        </label>
      </div>

      {bahOn && (
        <div className="mt-3 space-y-3">
          {/* Dependents toggle (single checkbox) */}
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 accent-indigo-600"
              checked={depStatus === "with"}
              onChange={(e) => onChangeDepStatus(e.target.checked ? "with" : "without")}
            />
            <span className="text-sm text-slate-700">With Dependents</span>
          </label>

          {/* Locality select (no "Locality" label and no helper text) */}
          <div className="relative">
            <select
              className={`${inputBase} pr-24`}
              value={zip ?? ""}
              onChange={(e) => onChangeZip(e.target.value)}
            >
              {options.map((o) => (
                <option key={o.zip} value={o.zip}>
                  {(o.label ?? o.zip)}
                </option>
              ))}
              <option value="custom">Custom Amount…</option>
            </select>
          </div>

          {/* Custom amount (only when chosen). No extra captions. */}
          {zip === "custom" && (
            <div>
              <input
                type="number"
                className={inputBase}
                placeholder="Enter monthly BAH"
                value={Number.isFinite(custom as number) ? (custom as number) : 0}
                onChange={(e) => onChangeCustom(Number(e.target.value))}
                min={0}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
