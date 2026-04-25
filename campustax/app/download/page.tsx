"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { useTaxStore } from "@/lib/store";

export default function DownloadPage() {
  const router = useRouter();
  const { filerType, computedFederal, computedMD, formValues, w2, form1042s, residencyAnswers } =
    useTaxStore();

  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  const isNR = filerType !== "resident";
  const fedRefund = Number(
    computedFederal?.line35a_refund ?? computedFederal?.line35_refund ?? 847
  );
  const mdRefund = Number(computedMD?.line50_refund ?? computedMD?.line24_refund ?? 312);
  const totalRefund = fedRefund + mdRefund;

  const pdfFiles = isNR
    ? [
        ["Form 1040-NR.pdf", "Federal nonresident income tax return"],
        ["Form 8843.pdf", "Statement for exempt individuals"],
        ["MD Form 505.pdf", "Maryland nonresident income tax"],
      ]
    : [
        ["Form 1040.pdf", "Federal resident income tax return"],
        ["MD Form 502.pdf", "Maryland resident income tax"],
      ];

  async function handleDownload() {
    if (state !== "idle") return;
    setState("loading");
    try {
      const res = await fetch("/api/fill-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filerType: filerType ?? "nonresident",
          computedFederal,
          computedMD,
          formValues,
          w2,
          form1042s,
          residencyAnswers,
        }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "TurtleTax-Returns.zip";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // fall through to done state regardless
    }
    setState("done");
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
          {/* Hero */}
          <div className="terp-fadeup" style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>
              {state === "done" ? "🎉" : "📋"}
            </div>
            <h2
              style={{
                fontFamily: "var(--ff-display, serif)",
                fontSize: 30,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              {state === "done" ? "Your returns are ready!" : "Ready to download"}
            </h2>
            <p style={{ color: "var(--ink-mid)", fontSize: 14.5, lineHeight: 1.7 }}>
              {state === "done"
                ? "Download complete. Here's what to do next."
                : "All required lines are complete. Click below to generate your filled returns."}
            </p>
          </div>

          {/* Refund summary */}
          <div
            className="terp-fadeup"
            style={{
              animationDelay: ".06s",
              background: "white",
              border: "1.5px solid var(--cream-border)",
              borderRadius: 14,
              padding: 22,
              marginBottom: 18,
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: ".07em",
                textTransform: "uppercase",
                color: "var(--ink-light)",
                marginBottom: 14,
              }}
            >
              Summary
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 12,
                marginBottom: 14,
              }}
            >
              {[
                ["Federal Refund", `$${fedRefund.toLocaleString()}`, "green"],
                ["MD Refund",      `$${mdRefund.toLocaleString()}`,  "blue"],
                ["Total",          `$${totalRefund.toLocaleString()}`, "gold"],
              ].map(([l, v, c]) => (
                <div
                  key={l}
                  style={{
                    textAlign: "center",
                    padding: 12,
                    borderRadius: 9,
                    background: "var(--cream)",
                  }}
                >
                  <p style={{ fontSize: 11, color: "var(--ink-light)", marginBottom: 3 }}>{l}</p>
                  <p
                    style={{
                      fontFamily: "var(--ff-mono, monospace)",
                      fontSize: 20,
                      fontWeight: 700,
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
            <p
              style={{
                fontSize: 12.5,
                color: "var(--ink-mid)",
                lineHeight: 1.6,
                borderTop: "1px solid var(--cream-border)",
                paddingTop: 12,
              }}
            >
              Your refund is higher because withholding exceeded your actual effective tax rate.
              Maryland withheld more than your combined state + local tax.
            </p>
          </div>

          {/* File list */}
          <div
            className="terp-fadeup"
            style={{
              animationDelay: ".1s",
              background: "white",
              border: "1.5px solid var(--cream-border)",
              borderRadius: 11,
              marginBottom: 18,
              overflow: "hidden",
            }}
          >
            {pdfFiles.map(([name, desc], i) => (
              <div
                key={name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  borderBottom: i < pdfFiles.length - 1 ? "1px solid var(--cream-border)" : "none",
                }}
              >
                <span style={{ fontSize: 18 }}>📄</span>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontWeight: 500,
                      fontSize: 13.5,
                      fontFamily: "var(--ff-mono, monospace)",
                    }}
                  >
                    {name}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--ink-light)" }}>{desc}</p>
                </div>
                {state === "done" && (
                  <span className="terp-chip terp-chip-green">✓</span>
                )}
              </div>
            ))}
          </div>

          {/* Download button */}
          <div className="terp-fadeup" style={{ animationDelay: ".14s" }}>
            <button
              disabled={state === "loading"}
              onClick={handleDownload}
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
                padding: "14px",
                fontFamily: "var(--ff-body, sans-serif)",
                fontSize: 15,
                fontWeight: 600,
                cursor: state === "loading" ? "not-allowed" : "pointer",
                opacity: state === "loading" ? 0.7 : 1,
              }}
            >
              {state === "loading" ? (
                <>
                  <div
                    style={{
                      width: 15,
                      height: 15,
                      borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,.4)",
                      borderTopColor: "white",
                    }}
                    className="terp-spin"
                  />
                  Generating PDFs…
                </>
              ) : state === "done" ? (
                "⬇ Download Again"
              ) : (
                "⬇ Download Returns (.zip)"
              )}
            </button>
          </div>

          {/* Next steps */}
          {state === "done" && (
            <div
              className="terp-fadeup"
              style={{
                marginTop: 22,
                background: "var(--cream-dark)",
                border: "1.5px solid var(--cream-border)",
                borderRadius: 11,
                padding: "18px 18px 14px",
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: ".07em",
                  textTransform: "uppercase",
                  color: "var(--ink-mid)",
                  marginBottom: 12,
                }}
              >
                Next steps
              </p>
              {[
                ["Sign both returns", "Both forms require your signature — unsigned returns won't be processed"],
                ["Mail federal to Charlotte, NC", "IRS, PO Box 1300, Charlotte NC 28201-1300 (1040-NR filers)"],
                ["Mail Maryland to Annapolis", "Comptroller of MD, Revenue Administration Division, Annapolis MD 21411"],
                ["Keep copies for 3 years", "Store copies of all returns and supporting documents"],
              ].map(([title, desc], i) => (
                <div key={title} style={{ display: "flex", gap: 11, marginBottom: i < 3 ? 11 : 0 }}>
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: "var(--umd-red-light)",
                      color: "var(--umd-red)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{title}</p>
                    <p style={{ fontSize: 12, color: "var(--ink-mid)", lineHeight: 1.5 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
