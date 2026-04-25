"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { useTaxStore } from "@/lib/store";

const SPT_QS = {
  nonresident: [
    { id: "visa",   q: "What is your visa type?",                          opts: ["F-1 Student", "J-1 Exchange Visitor", "Other"] },
    { id: "years",  q: "How many full tax years have you been in the US on this visa?", opts: ["1st year", "2nd year", "3rd–4th year", "5+ years"] },
    { id: "days",   q: "How many days were you physically present in the US in 2025?", opts: ["Fewer than 31", "31–182", "183+"] },
    { id: "income", q: "Did you have US-source income in 2025?",           opts: ["Yes, campus job (W-2)", "Yes, scholarship/fellowship (1042-S)", "Yes, both", "No income"] },
    { id: "md",     q: "Was any of that income earned in Maryland?",       opts: ["Yes", "No", "Not sure"] },
  ],
  resident: [
    { id: "filing",       q: "What is your filing status?",                opts: ["Single", "Married Filing Jointly", "Married Filing Separately", "Head of Household"] },
    { id: "days",         q: "Were you a Maryland resident for all of 2025?", opts: ["Yes, full year", "Part of the year", "No, I lived elsewhere"] },
    { id: "income",       q: "What types of income did you have in 2025?", opts: ["Wages only (W-2)", "Wages + investment income", "Self-employment income", "Other / multiple sources"] },
    { id: "student_loan", q: "Did you pay student loan interest in 2025?", opts: ["Yes", "No"] },
    { id: "md",           q: "Was any income earned in Maryland?",         opts: ["Yes", "No", "Not sure"] },
  ],
};

export default function ResidencyPage() {
  const router = useRouter();
  const { filerType, setFilerType } = useTaxStore();

  const questions = filerType === "resident" ? SPT_QS.resident : SPT_QS.nonresident;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const done = step >= questions.length;

  const isNR =
    filerType !== "resident" && answers.years !== "5+ years";
  const status = filerType === "resident" ? "resident" : isNR ? "nonresident" : "resident";
  const forms =
    filerType === "resident"
      ? ["Form 1040", "MD Form 502"]
      : isNR
      ? ["Form 1040-NR", "Form 8843", "MD Form 505"]
      : ["Form 1040", "MD Form 502"];

  function pick(val: string) {
    setAnswers((a) => ({ ...a, [questions[step].id]: val }));
    setStep((s) => s + 1);
  }

  function handleContinue() {
    setFilerType(status);
    router.push("/documents");
  }

  return (
    <div>
      <TopBar />
      <div
        style={{
          minHeight: "100vh",
          paddingTop: 56,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 24px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 500 }}>
          <p
            style={{
              fontSize: 11.5,
              fontWeight: 700,
              letterSpacing: ".08em",
              textTransform: "uppercase",
              color: "var(--umd-red)",
              marginBottom: 6,
            }}
          >
            Step 1 — Residency Check
          </p>
          <h2
            style={{
              fontFamily: "var(--ff-display, serif)",
              fontSize: 28,
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            {done ? "Your filing status" : "A few quick questions"}
          </h2>
          {!done && (
            <p style={{ color: "var(--ink-light)", fontSize: 13.5, marginBottom: 24 }}>
              Question {step + 1} of {questions.length}
            </p>
          )}

          {/* Progress bar */}
          {!done && (
            <div
              style={{
                height: 4,
                background: "var(--cream-border)",
                borderRadius: 99,
                marginBottom: 28,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  background: "var(--umd-red)",
                  borderRadius: 99,
                  width: `${(step / questions.length) * 100}%`,
                  transition: "width .3s",
                }}
              />
            </div>
          )}

          {/* Question or result */}
          {!done ? (
            <div className="terp-fadeup" key={step} style={{ animationDelay: ".04s" }}>
              <div
                style={{
                  background: "white",
                  border: "1.5px solid var(--cream-border)",
                  borderRadius: 13,
                  padding: "24px 24px 20px",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--ff-display, serif)",
                    fontSize: 18,
                    fontWeight: 500,
                    marginBottom: 18,
                    lineHeight: 1.4,
                  }}
                >
                  {questions[step].q}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {questions[step].opts.map((opt) => (
                    <OptButton key={opt} label={opt} onClick={() => pick(opt)} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="terp-fadeup">
              <div
                style={{
                  background: "white",
                  border: "1.5px solid var(--cream-border)",
                  borderRadius: 13,
                  padding: 24,
                  marginBottom: 16,
                }}
              >
                <div style={{ display: "flex", gap: 14, marginBottom: 18 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      flexShrink: 0,
                      background:
                        status === "nonresident"
                          ? "var(--umd-blue-light)"
                          : "var(--umd-green-light)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                    }}
                  >
                    {status === "nonresident" ? "🌐" : "🏠"}
                  </div>
                  <div>
                    <p
                      style={{
                        fontFamily: "var(--ff-display, serif)",
                        fontSize: 17,
                        fontWeight: 600,
                        marginBottom: 4,
                      }}
                    >
                      {status === "nonresident" ? "Non-Resident Alien" : "US Tax Resident"}
                    </p>
                    <p style={{ fontSize: 13, color: "var(--ink-mid)", lineHeight: 1.6 }}>
                      {status === "nonresident"
                        ? "F-1/J-1 students in their first 5 years are exempt from the Substantial Presence Test and file as non-resident aliens."
                        : filerType === "resident"
                        ? "As a US citizen or resident, you file a standard resident return."
                        : "You meet the Substantial Presence Test and file as a US tax resident."}
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    background: "var(--cream)",
                    borderRadius: 8,
                    padding: "12px 14px",
                  }}
                >
                  <p
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: ".06em",
                      color: "var(--ink-mid)",
                      marginBottom: 8,
                    }}
                  >
                    Required forms
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {forms.map((f) => (
                      <span key={f} className="terp-chip terp-chip-blue">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={handleContinue}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  background: "var(--umd-red)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "13px",
                  fontFamily: "var(--ff-body, sans-serif)",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Continue to Document Upload →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OptButton({ label, onClick }: { label: string; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "var(--umd-red-light)" : "var(--cream)",
        border: `1.5px solid ${hov ? "var(--umd-red-mid)" : "var(--cream-border)"}`,
        borderRadius: 8,
        padding: "11px 14px",
        textAlign: "left",
        cursor: "pointer",
        fontSize: 13.5,
        fontWeight: 500,
        transition: "all .15s",
        color: hov ? "var(--umd-red)" : "var(--ink)",
        fontFamily: "var(--ff-body, sans-serif)",
      }}
    >
      {label}
    </button>
  );
}
