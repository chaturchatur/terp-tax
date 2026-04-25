"use client";

import { usePathname, useRouter } from "next/navigation";
import { MdFlag } from "./MdFlag";

const STEPS = ["Residency", "Documents", "Tax Forms", "Download"];
const PATH_ORDER = ["/", "/residency", "/documents", "/forms", "/download"];

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const idx = PATH_ORDER.indexOf(pathname);

  function goBack() {
    if (idx > 0) router.push(PATH_ORDER[idx - 1]);
  }

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "oklch(97% 0.012 70 / .94)",
        backdropFilter: "blur(10px)",
        borderBottom: "1.5px solid var(--cream-border)",
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "0 28px",
        height: 56,
      }}
    >
      {/* Logo */}
      <div
        style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, cursor: "pointer" }}
        onClick={() => router.push("/")}
      >
        <MdFlag size={28} />
        <span
          style={{
            fontFamily: "var(--ff-display, serif)",
            fontWeight: 600,
            fontSize: 16,
            letterSpacing: "-.01em",
          }}
        >
          Turtle<span style={{ color: "var(--umd-red)" }}>Tax</span>
        </span>
      </div>

      {/* Step nav (hidden on landing) */}
      {pathname !== "/" && (
        <nav style={{ display: "flex", alignItems: "center", gap: 0, marginLeft: 8 }}>
          {STEPS.map((s, i) => {
            const si = i + 1;
            const done = idx > si;
            const active = idx === si;
            return (
              <div key={s} style={{ display: "flex", alignItems: "center" }}>
                {i > 0 && (
                  <div
                    style={{
                      width: 24,
                      height: 1.5,
                      background: done ? "var(--umd-red-mid)" : "var(--cream-border)",
                    }}
                  />
                )}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "4px 7px",
                    borderRadius: 6,
                    background: active ? "var(--umd-red-light)" : "transparent",
                  }}
                >
                  <div
                    style={{
                      width: 19,
                      height: 19,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      fontWeight: 700,
                      flexShrink: 0,
                      background:
                        done || active ? "var(--umd-red)" : "var(--cream-border)",
                      color: done || active ? "white" : "var(--ink-light)",
                    }}
                  >
                    {done ? "✓" : si}
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: active ? 600 : 400,
                      color: active
                        ? "var(--umd-red)"
                        : done
                        ? "var(--ink-mid)"
                        : "var(--ink-light)",
                    }}
                  >
                    {s}
                  </span>
                </div>
              </div>
            );
          })}
        </nav>
      )}

      {/* Right side */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        {pathname === "/" ? (
          <>
            <span style={{ fontSize: 12, color: "var(--ink-light)" }}>Tax Year 2025</span>
            <span className="terp-chip terp-chip-green">Free for UMD</span>
          </>
        ) : (
          <button
            onClick={goBack}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "transparent",
              color: "var(--ink-mid)",
              border: "1.5px solid var(--cream-border)",
              borderRadius: 8,
              padding: "6px 14px",
              fontFamily: "var(--ff-body, sans-serif)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            ← Back
          </button>
        )}
      </div>
    </header>
  );
}
