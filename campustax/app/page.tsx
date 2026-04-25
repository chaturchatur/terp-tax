"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { useTaxStore } from "@/lib/store";

function FilerCard({
  label,
  desc,
  forms,
  dark,
  onClick,
}: {
  label: string;
  desc: string;
  forms: string[];
  dark: boolean;
  onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov
          ? dark
            ? "var(--umd-red)"
            : "var(--ink)"
          : dark
          ? "var(--ink)"
          : "white",
        border: `2px solid ${
          dark
            ? hov
              ? "var(--umd-red)"
              : "var(--ink)"
            : hov
            ? "var(--ink)"
            : "var(--cream-border)"
        }`,
        borderRadius: 14,
        padding: "24px 22px",
        textAlign: "left",
        cursor: "pointer",
        transition: "all .2s",
        transform: hov ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hov
          ? "0 10px 32px oklch(0% 0 0 / .14)"
          : "0 2px 8px oklch(0% 0 0 / .04)",
      }}
    >
      <p
        style={{
          fontFamily: "var(--ff-display, serif)",
          fontSize: 18,
          fontWeight: 600,
          marginBottom: 8,
          color: dark || hov ? "white" : "var(--ink)",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: 13,
          lineHeight: 1.55,
          marginBottom: 14,
          color: dark || hov ? "oklch(88% 0.01 70)" : "var(--ink-mid)",
        }}
      >
        {desc}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {forms.map((f) => (
          <span
            key={f}
            style={{
              padding: "3px 8px",
              borderRadius: 5,
              fontSize: 11,
              fontFamily: "var(--ff-mono, monospace)",
              background: dark || hov ? "oklch(100% 0 0 / .12)" : "var(--cream-dark)",
              color: dark || hov ? "white" : "var(--ink-mid)",
              border: "1px solid oklch(100% 0 0 / .08)",
            }}
          >
            {f}
          </span>
        ))}
      </div>
    </button>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const setFilerType = useTaxStore((s) => s.setFilerType);

  function handleSelect(type: "resident" | "nonresident") {
    setFilerType(type);
    router.push("/residency");
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
          padding: "72px 24px 48px",
        }}
      >
        {/* Hero */}
        <div
          className="terp-fadeup"
          style={{ textAlign: "center", maxWidth: 520, marginBottom: 44 }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              marginBottom: 18,
              padding: "5px 14px",
              borderRadius: 20,
              background: "var(--umd-red-light)",
              border: "1px solid var(--umd-red-mid)",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "var(--umd-red)",
                display: "inline-block",
              }}
            />
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                color: "var(--umd-red)",
                letterSpacing: ".04em",
                textTransform: "uppercase",
              }}
            >
              Free for UMD Students · Tax Year 2025
            </span>
          </div>
          <h1
            style={{
              fontFamily: "var(--ff-display, serif)",
              fontSize: 44,
              fontWeight: 700,
              lineHeight: 1.12,
              letterSpacing: "-.02em",
              marginBottom: 14,
            }}
          >
            File your taxes
            <br />
            without the{" "}
            <span style={{ color: "var(--umd-red)" }}>stress</span>
          </h1>
          <p
            style={{
              fontSize: 15.5,
              color: "var(--ink-mid)",
              lineHeight: 1.7,
            }}
          >
            Upload your tax documents and we&apos;ll walk you through every line
            — with plain-English explanations at each step.
          </p>
        </div>

        {/* Filer cards */}
        <div
          className="terp-fadeup"
          style={{
            animationDelay: ".08s",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 18,
            width: "100%",
            maxWidth: 620,
            marginBottom: 36,
          }}
        >
          <FilerCard
            label="US Citizen or Resident"
            desc="File Form 1040 + Maryland Form 502"
            forms={["Form 1040", "MD Form 502"]}
            dark={false}
            onClick={() => handleSelect("resident")}
          />
          <FilerCard
            label="International Student"
            desc="F-1 or J-1 visa — File 1040-NR, Form 8843, MD Form 505"
            forms={["Form 1040-NR", "Form 8843", "MD Form 505"]}
            dark={true}
            onClick={() => handleSelect("nonresident")}
          />
        </div>

        {/* Trust badges */}
        <div
          className="terp-fadeup"
          style={{
            animationDelay: ".14s",
            display: "flex",
            gap: 28,
            color: "var(--ink-light)",
            fontSize: 13,
          }}
        >
          {["No account needed", "Documents never stored", "Every line explained"].map(
            (f) => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" stroke="var(--umd-green)" strokeWidth="1.5" />
                  <path
                    d="M4.5 7l2 2 3-3"
                    stroke="var(--umd-green)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {f}
              </div>
            )
          )}
        </div>

        {/* Quote */}
        <div
          className="terp-fadeup"
          style={{
            animationDelay: ".2s",
            marginTop: 32,
            padding: "14px 22px",
            borderRadius: 11,
            background: "var(--cream-dark)",
            border: "1.5px solid var(--cream-border)",
            maxWidth: 460,
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: 13,
              color: "var(--ink-mid)",
              fontStyle: "italic",
              lineHeight: 1.6,
            }}
          >
            &ldquo;Sprintax charges $51 federal + $40 Maryland. TurtleTax is free for UMD
            students, explains every line, and was built in 48 hours.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
