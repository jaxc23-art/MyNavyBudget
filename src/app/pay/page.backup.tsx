"use client";
import BAHPicker from "@/components/BAHPicker";
import { useEffect, useMemo, useState } from "react";
import { computePay, type PayInputs } from "@/lib/calc";
import bahTop from "@/utils/bah_top100.json";
import { load, save } from "@/utils/local";

export default function PayPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [inputs, setInputs] = useState<PayInputs>(() =>
    load("pay.inputs", {
      grade: "E6", yos: 6,
      bahOn: true, depStatus: "with", bahZip: "32218",
      basMode: "enlisted",
      tspTraditionalPct: 0, tspRothPct: 5,
      federalMode: "manual", filingStatus: "single", step2: false, extraPerPaycheck: 0,
      federalManualMonthly: 350, stateMonthly: 0,
      sgliCoverage: 0, afrh: false,
      allot1: 0, allot2: 0, allot3: 0,
    } as any)
  );
  useEffect(()=>{ save("pay.inputs", inputs); }, [inputs]);

  const currentBah = useMemo(() => {
    if (inputs.bahCustom != null && inputs.bahCustom >= 0) return inputs.bahCustom;
    const found = bahTop.find(b => b.zip === inputs.bahZip);
    if (!found) return 0;
    return inputs.depStatus === "with" ? found.withDep : found.withoutDep;
  }, [inputs.bahZip, inputs.depStatus, inputs.bahCustom]);

  const out = computePay(inputs, currentBah);

  if (!mounted) return null;
  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Pay setup</h1>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-3xl border bg-white">
          <h2 className="font-medium mb-3">Paygrade & YOS</h2>
          <label className="block text-sm">Paygrade</label>
          <select className="w-full border rounded p-2"
            value={inputs.grade}
            onChange={e=>setInputs(p=>({...p, grade: e.target.value as any}))}>
            {["E1","E2","E3","E4","E5","E6","E7","E8","E9","W1","W2","W3","W4","W5","O1","O2","O3","O4","O5","O6","O7","O8","O9","O10"].map(g=>
              <option key={g}>{g}</option>
            )}
          </select>
          <label className="block text-sm mt-3">Years of Service</label>
<select
  className="w-full border rounded p-2"
  value={inputs.yos}
  onChange={e => setInputs(p => ({ ...p, yos: Number(e.target.value) as any }))}
>
  {[0, 2, 3, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 30].map(y => (
    <option key={y} value={y}>
      {y}
    </option>
  ))}
</select>
          <p className="text-xs text-gray-500 mt-1">Base pay pulled from local table (monthly).</p>
        </div>

        <div className="p-4 rounded-3xl border bg-white">
          <h2 className="font-medium mb-3">BAH</h2>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={inputs.bahOn} onChange={e=>setInputs(p=>({...p, bahOn:e.target.checked}))}/> Include BAH
          </label>
          <label className="inline-flex items-center gap-2 mt-2">
  <input type="checkbox" checked={inputs.depStatus === "with"} onChange={e=>setInputs(p=>({...p, depStatus: e.target.checked ? "with" : "without"}))} />
  With dependents
</label>
          <div className="mt-2">
            <label className="block text-sm">ZIP (Top 100)</label>
            <select className="w-full border rounded p-2"
              value={inputs.bahZip}
              onChange={e=>setInputs(p=>({...p, bahZip:e.target.value}))}>
              {bahTop.map(b=> <option key={b.zip} value={b.zip}>{b.zip} — {b.name}</option>)}
            </select>
          </div>
          
          <p className="text-xs text-gray-500 mt-1">BAH is non‑taxable; not paygrade‑dependent.</p>
        </div>

        <div className="p-4 rounded-3xl border bg-white">
          <h2 className="font-medium mb-3">BAS</h2>
          <select className="w-full border rounded p-2"
            value={inputs.basMode}
            onChange={e=>setInputs(p=>({...p, basMode: e.target.value as any}))}>
            <option value="enlisted">Enlisted BAS</option>
            <option value="off">Officer BAS</option>
            <option value="none">No BAS</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">BAS is non‑taxable. 2025 fixed rates.</p>
        </div>

        <div className="p-4 rounded-3xl border bg-white">
          <h2 className="font-medium mb-3">TSP</h2>
          <label className="block text-sm">Traditional %</label>
          <input type="number" className="w-full border rounded p-2" min={0} max={100}
            value={inputs.tspTraditionalPct}
            onChange={e=>setInputs(p=>({...p, tspTraditionalPct: Number(e.target.value)}))}/>
          <label className="block text-sm mt-2">Roth %</label>
          <input type="number" className="w-full border rounded p-2" min={0} max={100}
            value={inputs.tspRothPct}
            onChange={e=>setInputs(p=>({...p, tspRothPct: Number(e.target.value)}))}/>
          <p className="text-xs text-gray-500 mt-1">Traditional reduces taxable wages; Roth is post‑tax.</p>
        </div>

        <div className="p-4 rounded-3xl border bg-white">
          <h2 className="font-medium mb-3">Federal Taxes</h2>
          <select className="w-full border rounded p-2"
            value={inputs.federalMode}
            onChange={e=>setInputs(p=>({...p, federalMode: e.target.value as any}))}>
            <option value="auto">Auto (percentage method)</option>
            <option value="manual">Manual monthly</option>
          </select>
          <div className="mt-2">
            <label className="block text-sm">Filing Status</label>
            <select className="w-full border rounded p-2"
              value={inputs.filingStatus}
              onChange={e=>setInputs(p=>({...p, filingStatus: e.target.value as any}))}>
              <option value="single">Single</option>
              <option value="married">Married</option>
            </select>
          </div>
          <label className="inline-flex items-center gap-2 mt-2">
            <input type="checkbox" checked={inputs.step2} onChange={e=>setInputs(p=>({...p, step2:e.target.checked}))}/> Apply Step‑2 (higher withholding)
          </label>
          <div className="mt-2">
            <label className="block text-sm">Extra per paycheck (semi‑monthly)</label>
            <input type="number" className="w-full border rounded p-2" value={inputs.extraPerPaycheck ?? 0}
              onChange={e=>setInputs(p=>({...p, extraPerPaycheck: Number(e.target.value)}))}/>
          </div>
          {inputs.federalMode === "manual" && (
            <div className="mt-2">
              <label className="block text-sm">Manual federal (monthly)</label>
              <input type="number" className="w-full border rounded p-2" value={inputs.federalManualMonthly ?? 0}
                onChange={e=>setInputs(p=>({...p, federalManualMonthly: Number(e.target.value)}))}/>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">Auto = annualize semi‑monthly taxable, apply 2025 tables (to be approved), back to monthly. Manual overrides.</p>
        </div>

        <div className="p-4 rounded-3xl border bg-white">
          <h2 className="font-medium mb-3">State & Insurance</h2>
          <label className="block text-sm">State tax (manual monthly)</label>
          <input type="number" className="w-full border rounded p-2"
            value={inputs.stateMonthly ?? 0}
            onChange={e=>setInputs(p=>({...p, stateMonthly: Number(e.target.value)}))}/>
          <label className="block text-sm mt-2">SGLI Coverage ($0–$500k)</label>
          <input type="range" min={0} max={500000} step={50000} value={inputs.sgliCoverage}
            onChange={e=>setInputs(p=>({...p, sgliCoverage: Number(e.target.value)}))}
            className="w-full"/>
          <div className="text-xs text-gray-600 mt-1">${(inputs.sgliCoverage||0).toLocaleString()}</div>
          <label className="inline-flex items-center gap-2 mt-2">
            <input type="checkbox" checked={inputs.afrh} onChange={e=>setInputs(p=>({...p, afrh:e.target.checked}))}/> AFRH ($0.50)
          </label>
        </div>

        <div className="p-4 rounded-3xl border bg-white">
          <h2 className="font-medium mb-3">Custom Allotments</h2>
          {[1,2,3].map(i=>(
            <div key={i} className="mt-2">
              <label className="block text-sm">Allotment {i} (monthly)</label>
              <input type="number" className="w-full border rounded p-2"
                value={(inputs as any)[`allot${i}`] ?? 0}
                onChange={e=>setInputs(p=>({...p, [`allot${i}`]: Number(e.target.value)} as any))}/>
            </div>
          ))}
          <p className="text-xs text-gray-500 mt-1">Allotments reduce take‑home after net; see paycheck estimate below.</p>
        </div>
      </section>

      <section className="p-4 rounded-3xl border bg-white">
        <h2 className="font-medium mb-3">Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>Gross (monthly): <b>${out.grossMonthly.toFixed(2)}</b></div>
          <div>Deductions (monthly): <b>${out.deductionsMonthly.toFixed(2)}</b></div>
          <div>Net (monthly, excl. allotments): <b>${out.netMonthlyExclAllot.toFixed(2)}</b></div>
          <div>Allotments (monthly): <b>${out.allotmentsMonthly.toFixed(2)}</b></div>
          <div className="md:col-span-2">Estimated paycheck (semi‑monthly): <b>${out.estSemiMonthlyPaycheck.toFixed(2)}</b></div>
        </div>
        <details className="mt-3">
          <summary className="cursor-pointer">How we got this</summary>
          <pre className="text-xs mt-2 bg-gray-50 p-3 rounded overflow-x-auto">{JSON.stringify(out.debug, null, 2)}</pre>
        </details>
        <p className="text-xs text-gray-500 mt-2">
          Taxable wages = Base − Traditional TSP. BAS/BAH non‑taxable.
          FICA: 6.2% SS up to $168,600; Medicare 1.45% + 0.9% over $200k. Federal: Auto uses percentage method (to be approved) or manual monthly.
        </p>
      </section>
    </main>
  );
}
