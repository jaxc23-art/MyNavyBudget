import fs from "fs";

const BANDS = [0,2,3,4,6,8,10,12,14,16,18,20,22];
const GRADES = new Set([
  "E1","E2","E3","E4","E5","E6","E7","E8","E9",
  "W1","W2","W3","W4","W5",
  "O1","O2","O3","O4","O5","O6"
]);

const csvPath = process.argv[2] || "data/base_pay_2025.csv";
if (!fs.existsSync(csvPath)) { console.error("❌ CSV not found:", csvPath); process.exit(1); }

const raw = fs.readFileSync(csvPath, "utf8");
const lines = raw.split(/\r?\n/).filter(l => l.trim() && !l.trim().startsWith("#"));
if (lines.length < 2) { console.error("❌ CSV has no data rows."); process.exit(1); }

const header = lines[0].split(",").map(s=>s.trim());
const expected = ["Grade", ...BANDS.map(String)];
if (header.join(",") !== expected.join(",")) {
  console.error("❌ Bad header. Expected:\n" + expected.join(","));
  process.exit(1);
}

const table = {};
for (let i=1;i<lines.length;i++){
  const cols = lines[i].split(",").map(s=>s.trim());
  const g = (cols[0] || "").toUpperCase();
  if (!g) continue;
  if (!GRADES.has(g)) { console.warn("Skipping unknown grade:", g); continue; }
  const obj = {};
  for (let j=1;j<cols.length;j++){
    const v = cols[j];
    if (v !== "") {
      const n = Number(v);
      if (!Number.isFinite(n)) {
        console.error(`❌ Non-numeric at grade ${g}, band ${BANDS[j-1]}: "${v}"`);
        process.exit(1);
      }
      obj[BANDS[j-1]] = n;
    }
  }
  table[g] = obj;
}

const ts = `// utils/basePayTable.ts (auto-generated from ${csvPath})
export type Enlisted = "E1"|"E2"|"E3"|"E4"|"E5"|"E6"|"E7"|"E8"|"E9";
export type Warrant  = "W1"|"W2"|"W3"|"W4"|"W5";
export type Officer  = "O1"|"O2"|"O3"|"O4"|"O5"|"O6";
export type PayGrade = Enlisted | Warrant | Officer;

export type YosBand = 0|2|3|4|6|8|10|12|14|16|18|20|22;
export const YOS_BANDS: YosBand[] = [0,2,3,4,6,8,10,12,14,16,18,20,22];

export function toYosBand(yos: number): YosBand {
  let out: YosBand = 0;
  for (const b of YOS_BANDS) if (yos >= b) out = b;
  return out;
}

type BandTable = Partial<Record<YosBand, number>>;
export const BASE_PAY_2025: Record<PayGrade, BandTable> =
${JSON.stringify(table, null, 2).replace(/"(\w\d)":/g, "$1:").replace(/"(\d+)":/g, "$1:")};

function nearestLowerBandValue(table: BandTable, band: YosBand): number | undefined {
  if (table[band] != null) return table[band]!;
  const idx = YOS_BANDS.indexOf(band);
  for (let i = idx - 1; i >= 0; i--) {
    const b = YOS_BANDS[i] as YosBand;
    if (table[b] != null) return table[b]!;
  }
  return undefined;
}

const warnedGrades = new Set<string>();

export function getBasePayMonthly(grade: PayGrade, yos: number): number {
  const band = toYosBand(yos);
  const table = BASE_PAY_2025[grade];
  if (!table) {
    if (!warnedGrades.has(grade)) {
      console.warn("Unknown paygrade in BASE_PAY_2025: " + grade);
      warnedGrades.add(grade);
    }
    return 0;
  }
  const val = nearestLowerBandValue(table, band);
  if (val == null) {
    if (!warnedGrades.has(grade)) {
      console.warn("No bands filled for " + grade + " in BASE_PAY_2025 (returning 0). Add values.");
      warnedGrades.add(grade);
    }
    return 0;
  }
  return val;
}

export const PAYGRADES: PayGrade[] = [
  "E1","E2","E3","E4","E5","E6","E7","E8","E9",
  "W1","W2","W3","W4","W5",
  "O1","O2","O3","O4","O5","O6"
];
`;

fs.writeFileSync("src/utils/basePayTable.ts", ts, "utf8");
console.log("✅ Wrote src/utils/basePayTable.ts from", csvPath);
