"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { MdFlag } from "@/components/MdFlag";
import { useTaxStore } from "@/lib/store";

/* ── Static form sections (demo data, overridden by computed store values) ── */
const FEDERAL_SECTIONS = [
  { title: "Income", rows: [
    { num: "1a",  label: "Wages, salaries, tips",   kind: "prefill", src: "W-2 Box 1",  val: "18400" },
    { num: "2b",  label: "Taxable interest",         kind: "user",                       val: "0" },
    { num: "8",   label: "Additional income",        kind: "user",                       val: "0" },
    { num: "9",   label: "Total income",             kind: "calc",                       val: "18400" },
  ]},
  { title: "Adjustments", rows: [
    { num: "10",  label: "Adjustments to income",   kind: "user",   val: "0" },
    { num: "11",  label: "Adjusted Gross Income",   kind: "calc",   val: "18400" },
  ]},
  { title: "Standard Deduction", rows: [
    { num: "12",  label: "Standard deduction",      kind: "calc",   val: "14600", note: "2025 single" },
    { num: "13",  label: "QBI deduction",           kind: "user",   val: "0" },
    { num: "15",  label: "Taxable income",          kind: "calc",   val: "3800" },
  ]},
  { title: "Tax & Credits", rows: [
    { num: "16",  label: "Tax",                     kind: "calc",   val: "380" },
    { num: "27",  label: "Earned Income Credit",    kind: "calc",   val: "0" },
    { num: "37",  label: "Total tax",               kind: "calc",   val: "380" },
  ]},
  { title: "Payments & Refund", rows: [
    { num: "25a", label: "Federal tax withheld",    kind: "prefill", src: "W-2 Box 2", val: "1227" },
    { num: "32",  label: "Total payments",          kind: "calc",   val: "1227" },
    { num: "35a", label: "Amount of Refund",        kind: "calc",   val: "847",  highlight: true },
  ]},
];

const MD_SECTIONS = [
  { title: "Maryland Income", rows: [
    { num: "1",   label: "Federal AGI (from line 11)",             kind: "prefill", src: "Federal line 11", val: "18400" },
    { num: "4",   label: "Maryland additions",                     kind: "user",    val: "0" },
    { num: "5",   label: "Total Maryland income",                  kind: "calc",    val: "18400" },
  ]},
  { title: "Subtractions", rows: [
    { num: "13",  label: "Maryland standard deduction (15%)",      kind: "calc",    val: "2550" },
    { num: "17",  label: "Maryland taxable net income",            kind: "calc",    val: "15850" },
  ]},
  { title: "Tax Computation", rows: [
    { num: "21",  label: "Maryland state tax",                     kind: "calc",    val: "476",  note: "MD Tax Table" },
    { num: "22",  label: "Local tax — Prince George's Co. (3.2%)", kind: "calc",    val: "507" },
    { num: "27",  label: "Total Maryland tax",                     kind: "calc",    val: "983" },
  ]},
  { title: "Payments & Refund", rows: [
    { num: "32",  label: "Maryland tax withheld",                  kind: "prefill", src: "W-2 Box 17", val: "1295" },
    { num: "43",  label: "Maryland Refund",                        kind: "calc",    val: "312",  highlight: true },
  ]},
];

const EXPLAIN: Record<string, { title: string; text: string; cite: string }> = {
  "1a":  { title: "Line 1a — Wages, Salaries, Tips",    text: "This is your total compensation from employment. For UMD students, this includes pay from on-campus jobs (TA, research assistant, dining, etc.). The amount comes directly from Box 1 of your W-2.", cite: "IRS Form 1040 Instructions, p. 24" },
  "11":  { title: "Line 11 — Adjusted Gross Income",    text: "AGI is your total income minus above-the-line deductions like student loan interest (up to $2,500). For most students with only wage income, AGI equals wages on line 9.", cite: "IRS Form 1040 Instructions, p. 35" },
  "12":  { title: "Line 12 — Standard Deduction",       text: "The standard deduction reduces taxable income without itemizing. For 2025, it is $14,600 for single filers. Most students take the standard deduction.", cite: "IRS Form 1040 Instructions, p. 36" },
  "35a": { title: "Line 35a — Federal Refund",          text: "You overpaid taxes by $847. Your employer withheld $1,227 but your actual tax was only $380. You'll receive this as a direct deposit within 21 days of e-filing.", cite: "IRS Form 1040 Instructions, p. 83" },
  "43":  { title: "Line 43 — Maryland Refund",          text: "Maryland withheld $1,295 from your paychecks, but your combined state + Prince George's County local tax is only $983. You overpaid by $312.", cite: "Maryland Resident Booklet Instructions, p. 18" },
};

type Row = {
  num: string;
  label: string;
  kind: string;
  src?: string;
  val?: string;
  note?: string;
  highlight?: boolean;
};

export default function FormsPage() {
  const router = useRouter();
  const { filerType, computedFederal, computedMD } = useTaxStore();
  const [tab, setTab] = useState<"federal" | "maryland">("federal");
  const [explain, setExplain] = useState<string | null>(null);
  const [vals, setVals] = useState<Record<string, string>>({});

  const isNR = filerType !== "resident";
  const sections = tab === "federal" ? FEDERAL_SECTIONS : MD_SECTIONS;
  const allRows = sections.flatMap((s) => s.rows);
  const pct = Math.round(
    (allRows.filter((r) => r.val || vals[r.num]).length / allRows.length) * 100
  );

  // Prefer computed store values if available
  const fedRefund = Number(
    computedFederal?.line35a_refund ?? computedFederal?.line35_refund ?? 847
  );
  const mdRefund = Number(computedMD?.line50_refund ?? computedMD?.line24_refund ?? 312);
  const totalRefund = fedRefund + mdRefund;

  const explainData = explain ? EXPLAIN[explain] : null;

  function getVal(row: Row): string {
    if (vals[row.num] !== undefined) return vals[row.num];
    // Check computed store
    if (tab === "federal" && computedFederal) {
      const key = Object.keys(computedFederal).find((k) => k.includes(`line${row.num}`));
      if (key) return String(computedFederal[key]);
    }
    if (tab === "maryland" && computedMD) {
      const key = Object.keys(computedMD).find((k) => k.includes(`line${row.num}`));
      if (key) return String(computedMD[key]);
    }
    return row.val ?? "";
  }

  return (
    <div>
      <TopBar />
      <div
        style={{
          height: "100vh",
          paddingTop: 56,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Sub-header */}
        <div
          style={{
            background: "var(--cream)",
            borderBottom: "1.5px solid var(--cream-border)",
            padding: "10px 24px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", gap: 6 }}>
            {(
              [
                ["federal", isNR ? "Federal 1040-NR" : "Federal 1040"],
                ["maryland", isNR ? "Maryland 505" : "Maryland 502"],
              ] as [string, string][]
            ).map(([id, lbl]) => (
              <button
                key={id}
                onClick={() => { setTab(id as "federal" | "maryland"); setExplain(null); }}
                style={{
                  padding: "6px 15px",
                  borderRadius: 7,
                  fontSize: 13,
                  fontWeight: tab === id ? 600 : 400,
                  cursor: "pointer",
                  background: tab === id ? "var(--umd-red)" : "transparent",
                  color: tab === id ? "white" : "var(--ink-mid)",
                  border: `1.5px solid ${tab === id ? "var(--umd-red)" : "var(--cream-border)"}`,
                  transition: "all .15s",
                  fontFamily: "var(--ff-body, sans-serif)",
                }}
              >
                {lbl}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                flex: 1,
                height: 5,
                background: "var(--cream-border)",
                borderRadius: 99,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: 99,
                  transition: "width .4s",
                  background: pct === 100 ? "var(--umd-green)" : "var(--umd-red)",
                  width: pct + "%",
                }}
              />
            </div>
            <span style={{ fontSize: 12, color: "var(--ink-light)", whiteSpace: "nowrap" }}>
              {pct}% complete
            </span>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Form column */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px 100px" }}>
            <div style={{ maxWidth: 620, margin: "0 auto" }} className="terp-fadein" key={tab}>
              <h3
                style={{
                  fontFamily: "var(--ff-display, serif)",
                  fontSize: 20,
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                {tab === "federal"
                  ? isNR
                    ? "Form 1040-NR — US Nonresident Alien Income Tax Return"
                    : "Form 1040 — US Individual Income Tax Return"
                  : isNR
                  ? "Maryland Form 505 — Nonresident Income Tax Return"
                  : "Maryland Form 502 — Resident Income Tax Return"}
              </h3>
              <p style={{ fontSize: 12, color: "var(--ink-light)", marginBottom: 22 }}>
                Tax Year 2025 · Prefilled from uploaded documents · Click ⓘ for plain-English explanation
              </p>
              {sections.map((sec) => (
                <div key={sec.title} style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      letterSpacing: ".1em",
                      textTransform: "uppercase",
                      color: "var(--ink-light)",
                      padding: "5px 0",
                      borderBottom: "2px solid var(--ink)",
                      marginBottom: 0,
                    }}
                  >
                    {sec.title}
                  </div>
                  {sec.rows.map((row, ri) => (
                    <FormRow
                      key={row.num}
                      row={row}
                      val={getVal(row)}
                      active={explain === row.num}
                      onChange={(v) => setVals((vs) => ({ ...vs, [row.num]: v }))}
                      onExplain={() => setExplain(explain === row.num ? null : row.num)}
                      isLast={ri === sec.rows.length - 1}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Explain panel */}
          {explain && (
            <div
              className="terp-fadein"
              style={{
                width: 300,
                borderLeft: "1.5px solid var(--cream-border)",
                background: "white",
                overflowY: "auto",
                padding: "22px 20px",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <MdFlag size={22} />
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      letterSpacing: ".06em",
                      textTransform: "uppercase",
                      color: "var(--umd-red)",
                    }}
                  >
                    Claude explains
                  </span>
                </div>
                <button
                  onClick={() => setExplain(null)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 18,
                    color: "var(--ink-light)",
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
              <h4
                style={{
                  fontFamily: "var(--ff-display, serif)",
                  fontSize: 16,
                  fontWeight: 600,
                  marginBottom: 10,
                  lineHeight: 1.35,
                }}
              >
                {explainData ? explainData.title : `Line ${explain}`}
              </h4>
              <p style={{ fontSize: 13, lineHeight: 1.75, color: "var(--ink-mid)", marginBottom: 14 }}>
                {explainData
                  ? explainData.text
                  : "This line relates to a specific tax calculation. Claude pulls the exact explanation from the official IRS instructions PDF, citing the relevant page number."}
              </p>
              {explainData && (
                <div
                  style={{
                    padding: "8px 11px",
                    background: "var(--cream)",
                    borderRadius: 7,
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <rect x="1.5" y="1" width="9" height="10" rx="1" stroke="var(--ink-light)" strokeWidth="1.2" />
                    <path d="M3.5 4h5M3.5 6h5M3.5 8h3" stroke="var(--ink-light)" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  <span style={{ fontSize: 11, color: "var(--ink-light)", fontStyle: "italic" }}>
                    {explainData.cite}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "var(--cream)",
            borderTop: "1.5px solid var(--cream-border)",
            padding: "12px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 50,
          }}
        >
          <div style={{ display: "flex", gap: 24 }}>
            {[
              ["Federal Refund", `$${fedRefund.toLocaleString()}`, "green"],
              ["MD Refund",      `$${mdRefund.toLocaleString()}`,  "blue"],
              ["Total",          `$${totalRefund.toLocaleString()}`, "gold"],
            ].map(([l, v, c]) => (
              <div key={l}>
                <p style={{ fontSize: 11, color: "var(--ink-light)", marginBottom: 1 }}>{l}</p>
                <p
                  style={{
                    fontFamily: "var(--ff-mono, monospace)",
                    fontSize: 17,
                    fontWeight: 600,
                    color:
                      c === "green"
                        ? "var(--umd-green)"
                        : c === "blue"
                        ? "var(--umd-blue)"
                        : "oklch(46% 0.14 82)",
                  }}
                >
                  {v}
                </p>
              </div>
            ))}
          </div>
          <button
            onClick={() => router.push("/download")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              background: "var(--umd-red)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 22px",
              fontFamily: "var(--ff-body, sans-serif)",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Download Returns →
          </button>
        </div>
      </div>
    </div>
  );
}

function FormRow({
  row,
  val,
  active,
  onChange,
  onExplain,
  isLast,
}: {
  row: Row;
  val: string;
  active: boolean;
  onChange: (v: string) => void;
  onExplain: () => void;
  isLast: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const isCalc = row.kind === "calc";
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "38px 1fr auto 28px",
        alignItems: "center",
        gap: 10,
        padding: "8px 4px",
        borderBottom: isLast ? "2px solid var(--ink)" : "1px solid var(--cream-border)",
        background: active
          ? "var(--umd-red-light)"
          : row.highlight
          ? "var(--umd-gold-light)"
          : "transparent",
        transition: "background .15s",
      }}
    >
      <span
        style={{
          fontFamily: "var(--ff-mono, monospace)",
          fontSize: 11.5,
          color: "var(--ink-light)",
          fontWeight: active ? 700 : 400,
        }}
      >
        {row.num}
      </span>
      <div>
        <span style={{ fontSize: 13, color: "var(--ink)", fontWeight: row.highlight ? 600 : 400 }}>
          {row.label}
        </span>
        {row.kind === "prefill" && row.src && (
          <span className="terp-chip terp-chip-green" style={{ marginLeft: 7, fontSize: 10 }}>
            from {row.src}
          </span>
        )}
        {row.note && (
          <span className="terp-chip terp-chip-muted" style={{ marginLeft: 7, fontSize: 10 }}>
            {row.note}
          </span>
        )}
      </div>
      <div style={{ minWidth: 100, textAlign: "right" }}>
        {isCalc ? (
          <span
            style={{
              fontFamily: "var(--ff-mono, monospace)",
              fontSize: 14,
              fontWeight: 600,
              color: row.highlight ? "oklch(46% 0.14 82)" : "var(--ink)",
            }}
          >
            {val ? "$" + Number(val).toLocaleString() : "—"}
          </span>
        ) : (
          <input
            value={val}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              fontFamily: "var(--ff-mono, monospace)",
              fontSize: 13,
              fontWeight: 500,
              width: 100,
              textAlign: "right",
              border: `1.5px solid ${focused ? "var(--umd-red)" : "var(--cream-border)"}`,
              borderRadius: 6,
              padding: "4px 8px",
              outline: "none",
              transition: "border-color .15s",
              background: row.kind === "prefill" ? "var(--umd-green-light)" : "white",
            }}
          />
        )}
      </div>
      <ExplainBtn active={active} onClick={onExplain} />
    </div>
  );
}

function ExplainBtn({ active, onClick }: { active: boolean; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 24,
        height: 24,
        borderRadius: "50%",
        cursor: "pointer",
        fontSize: 11,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        border: `1.5px solid ${active || hov ? "var(--umd-red)" : "var(--cream-border)"}`,
        background: active ? "var(--umd-red)" : "white",
        color: active ? "white" : hov ? "var(--umd-red)" : "var(--ink-light)",
        transition: "all .15s",
        fontFamily: "var(--ff-body, sans-serif)",
      }}
    >
      ⓘ
    </button>
  );
}
