"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { useTaxStore } from "@/lib/store";
import { W2Schema } from "@/lib/schemas/w2";
import { Form1098TSchema } from "@/lib/schemas/1098t";
import { Form1042SSchema } from "@/lib/schemas/1042s";

interface DocRow {
  id: string;
  label: string;
  desc: string;
  icon: string;
  required: boolean;
}

const ALL_DOCS: DocRow[] = [
  { id: "w2",    label: "W-2",      desc: "Wage & Tax Statement",        required: true,  icon: "💼" },
  { id: "1098t", label: "1098-T",   desc: "Tuition Statement",           required: false, icon: "🎓" },
  { id: "1042s", label: "1042-S",   desc: "Foreign Person's US Income",  required: false, icon: "🌐" },
  { id: "1099",  label: "1099-INT", desc: "Interest Income",             required: false, icon: "🏦" },
];

export default function DocumentsPage() {
  const router = useRouter();
  const {
    filerType,
    w2, form1098t, form1042s,
    setW2, set1098T, set1042S,
    setComputedFederal, setComputedMD,
    county, residencyAnswers,
  } = useTaxStore();

  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [dragging, setDragging] = useState(false);

  const docs = filerType === "resident"
    ? ALL_DOCS.filter((d) => d.id !== "1042s")
    : ALL_DOCS.filter((d) => d.id !== "1098t");

  async function handleUpload(docId: string, file?: File) {
    if (done[docId]) return;
    setUploading((u) => ({ ...u, [docId]: true }));

    if (file) {
      try {
        const form = new FormData();
        form.append("file", file);
        form.append("formType", docId);
        const res = await fetch("/api/extract", { method: "POST", body: form });
        if (res.ok) {
          const { data } = await res.json();
          if (docId === "w2") {
            const parsed = W2Schema.safeParse(data);
            setW2(parsed.success ? parsed.data : (data as Parameters<typeof setW2>[0]));
          } else if (docId === "1098t") {
            const parsed = Form1098TSchema.safeParse(data);
            set1098T(parsed.success ? parsed.data : (data as Parameters<typeof set1098T>[0]));
          } else if (docId === "1042s") {
            const parsed = Form1042SSchema.safeParse(data);
            set1042S(parsed.success ? parsed.data : (data as Parameters<typeof set1042S>[0]));
          }
        }
      } catch {
        // ignore extract errors — still mark done
      }
    }

    setTimeout(() => {
      setUploading((u) => ({ ...u, [docId]: false }));
      setDone((d) => ({ ...d, [docId]: true }));
    }, file ? 0 : 1600);
  }

  function handleDemo() {
    handleUpload("w2");
    setTimeout(() => handleUpload("1042s"), 700);
  }

  async function handleContinue() {
    const res = await fetch("/api/compute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filerType: filerType ?? "nonresident",
        w2,
        form1098t,
        form1042s,
        county,
        filingStatus: "single",
        countryOfCitizenship: residencyAnswers.countryOfCitizenship ?? "",
        treatyExemptAmount: 0,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setComputedFederal(data.federal ?? {});
      setComputedMD(data.md ?? {});
    }
    router.push("/forms");
  }

  const hasAny = Object.keys(done).length > 0;

  return (
    <div>
      <TopBar />
      <div
        style={{
          minHeight: "100vh",
          paddingTop: 56,
          padding: "80px 24px 60px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ width: "100%", maxWidth: 560 }}>
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
            Step 2 — Documents
          </p>
          <h2
            style={{
              fontFamily: "var(--ff-display, serif)",
              fontSize: 28,
              fontWeight: 600,
              marginBottom: 6,
            }}
          >
            Upload your tax documents
          </h2>
          <p style={{ color: "var(--ink-light)", fontSize: 13.5, marginBottom: 28 }}>
            Click Upload on each form or drop a file below. Fields are extracted automatically.
          </p>

          {/* Doc rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {docs.map((doc) => (
              <DocRowItem
                key={doc.id}
                doc={doc}
                uploading={!!uploading[doc.id]}
                done={!!done[doc.id]}
                onUpload={(file) => handleUpload(doc.id, file)}
              />
            ))}
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const file = e.dataTransfer.files[0];
              handleUpload("w2", file);
            }}
            style={{
              background: dragging ? "var(--umd-red-light)" : "var(--cream-dark)",
              border: `2px dashed ${dragging ? "var(--umd-red)" : "var(--cream-border)"}`,
              borderRadius: 13,
              padding: 28,
              textAlign: "center",
              cursor: "pointer",
              marginBottom: 24,
              transition: "all .2s",
            }}
          >
            <div style={{ fontSize: 26, marginBottom: 8 }}>📂</div>
            <p style={{ fontWeight: 500, fontSize: 14, marginBottom: 3 }}>Drop any document here</p>
            <p style={{ fontSize: 12.5, color: "var(--ink-light)" }}>
              PDF or image — form type detected automatically
            </p>
          </div>

          {/* Continue button */}
          <button
            disabled={!hasAny}
            onClick={() => hasAny && handleContinue()}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              background: hasAny ? "var(--umd-red)" : "var(--cream-border)",
              color: hasAny ? "#fff" : "var(--ink-light)",
              border: "none",
              borderRadius: 8,
              padding: "13px",
              fontFamily: "var(--ff-body, sans-serif)",
              fontSize: 15,
              fontWeight: 600,
              cursor: hasAny ? "pointer" : "not-allowed",
            }}
          >
            {hasAny ? "View Prefilled Forms →" : "Upload at least one document to continue"}
          </button>

          {/* Demo + skip */}
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            {!hasAny && (
              <button
                onClick={handleDemo}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  fontSize: 13,
                  color: "var(--ink-light)",
                  cursor: "pointer",
                  padding: "8px",
                  textAlign: "center",
                  fontFamily: "var(--ff-body, sans-serif)",
                }}
              >
                Use sample documents (W-2 + 1042-S demo)
              </button>
            )}
            <button
              onClick={() => router.push("/forms")}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                fontSize: 13,
                color: "var(--ink-light)",
                cursor: "pointer",
                padding: "8px",
                textAlign: "center",
                fontFamily: "var(--ff-body, sans-serif)",
              }}
            >
              Skip — enter manually →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocRowItem({
  doc,
  uploading,
  done,
  onUpload,
}: {
  doc: DocRow;
  uploading: boolean;
  done: boolean;
  onUpload: (file?: File) => void;
}) {
  return (
    <div
      style={{
        background: "white",
        border: `1.5px solid ${done ? "var(--umd-green)" : "var(--cream-border)"}`,
        borderRadius: 11,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        transition: "border-color .2s",
      }}
    >
      <span style={{ fontSize: 18, width: 32, textAlign: "center" }}>{doc.icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
          <span style={{ fontWeight: 600, fontSize: 13.5 }}>{doc.label}</span>
          {doc.required && (
            <span className="terp-chip terp-chip-red">Required</span>
          )}
          {done && (
            <span className="terp-chip terp-chip-green">✓ Extracted</span>
          )}
        </div>
        <p style={{ fontSize: 12, color: "var(--ink-light)" }}>{doc.desc}</p>
      </div>
      {uploading ? (
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            border: "2px solid var(--cream-border)",
            borderTopColor: "var(--umd-red)",
          }}
          className="terp-spin"
        />
      ) : done ? (
        <svg width="22" height="22" viewBox="0 0 22 22">
          <circle cx="11" cy="11" r="10" fill="var(--umd-green)" />
          <path
            d="M7 11l3 3 5-5"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "transparent",
            color: "var(--ink-mid)",
            border: "1.5px solid var(--cream-border)",
            borderRadius: 8,
            padding: "5px 12px",
            fontFamily: "var(--ff-body, sans-serif)",
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Upload
          <input
            type="file"
            accept="application/pdf,image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
            }}
          />
        </label>
      )}
    </div>
  );
}
