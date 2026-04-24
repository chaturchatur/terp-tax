Last verified: 2026-04-24

# System Architecture

## Project Overview

**Name:** claude-hackathon (product name: **CampusTax**)
**Status:** Initial implementation complete as of 2026-04-24. App scaffolded under `campustax/`, dev server running at `http://localhost:3000`. Next step: add `ANTHROPIC_API_KEY` to `.env.local` and drop IRS fillable PDFs into `public/forms/`.
**Purpose:** AI-powered tax filing tool for **UMD (University of Maryland, College Park) students**, built for the Claude Hackathon Track 2 (Campus Intelligence & Equity). Generates filled federal (1040 / 1040-NR / 8843) and Maryland state (502 / 505) returns from uploaded W-2 / 1098-T / 1042-S documents, with every line explained in plain English from the official IRS and MD Comptroller instructions.

## Target Users

- **US residents** (UMD students) → Federal 1040 + MD Form 502 (+ county/local tax for Prince George's, Montgomery, etc.)
- **International F-1/J-1 students** → Federal 1040-NR + Form 8843 + MD Form 505 (when MD-source income exists)

## Repository Structure (actual, as built)

```
claude-hackathon/
├── .agent/                           # Documentation
├── campustax/                        # Next.js app root (all app code lives here)
│   ├── .env.local                    # ANTHROPIC_API_KEY goes here (not committed)
│   ├── app/
│   │   ├── page.tsx                  # Landing page — filer-type selector (resident vs. NR)
│   │   ├── residency/page.tsx        # SPT wizard (3-step: visa → days → result)
│   │   ├── documents/page.tsx        # Document upload + Claude-vision extraction
│   │   ├── forms/page.tsx            # CORE UX: interactive on-screen forms with ⓘ
│   │   ├── download/page.tsx         # PDF generation + download + next steps
│   │   └── api/
│   │       ├── extract/route.ts      # POST multipart → structured JSON (Claude tool-use)
│   │       ├── explain/route.ts      # POST {formId, lineId} → plain-English (Claude + instructions PDF)
│   │       ├── compute/route.ts      # POST intake data → computed return (deterministic TS)
│   │       └── fill-pdf/route.ts     # POST return data → filled AcroForm PDF bytes
│   ├── lib/
│   │   ├── claude.ts                 # Anthropic client + MODELS constants
│   │   ├── store.ts                  # Zustand store (filerType, docs, computed returns, form overrides)
│   │   ├── schemas/                  # Zod schemas: w2, 1098t, 1042s, return-1040, return-1040nr,
│   │   │                             #   form-8843, return-md502, return-md505
│   │   ├── tax/
│   │   │   ├── spt.ts                # Substantial Presence Test (pure fn)
│   │   │   ├── compute-1040.ts       # Federal tax + AOTC credit (2024 brackets)
│   │   │   ├── compute-1040nr.ts     # NR federal tax + personal exemption + treaty
│   │   │   ├── compute-md502.ts      # MD resident tax: std deduction, brackets, county rate
│   │   │   ├── compute-md505.ts      # MD non-resident tax: state-only on MD-source income
│   │   │   └── md-local-rates.ts     # All 24 Maryland county tax rates (2024)
│   │   └── prompts/
│   │       ├── extract.ts            # Prompt for document field extraction
│   │       └── explain.ts            # Prompt for per-line plain-English explanation
│   ├── components/
│   │   ├── DocumentDropzone.tsx      # Drag-and-drop upload with live extraction status
│   │   ├── FormRenderer.tsx          # Renders a declarative layout as IRS-style form
│   │   ├── FormLine.tsx              # One numbered line: label, input, source badge, ⓘ button
│   │   ├── ExplainPanel.tsx          # Right-side Sheet w/ Claude explanation + citation
│   │   └── forms-layout/
│   │       ├── layout-1040.ts        # Declarative layout + FormLine/FormSection types
│   │       ├── layout-1040nr.ts
│   │       ├── layout-8843.ts
│   │       ├── layout-md502.ts
│   │       └── layout-md505.ts
│   └── public/forms/                 # ⚠️ EMPTY — must manually add IRS + MD fillable PDFs
│                                     #   f1040.pdf, f1040nr.pdf, f8843.pdf, md502.pdf, md505.pdf
│                                     #   i1040.pdf, i1040nr.pdf, md-resident-booklet.pdf, etc.
```

## Tech Stack

| Layer       | Technology | Notes |
|-------------|-----------|-------|
| Framework   | Next.js 16.2.4 (App Router, Turbopack) + TypeScript | Single app, API routes for Claude calls |
| UI          | Tailwind + shadcn/ui | IRS-style form layout rendered from declarative schema |
| State       | Zustand (`lib/store.ts`) | Global store: filerType, uploaded doc data, computed returns, per-field overrides |
| Validation  | Zod | Schemas serve dual purpose: type-safe TS types + hand-rolled JSON Schema for Claude tool-use |
| AI          | `@anthropic-ai/sdk` | Sonnet 4.6 default; Opus 4.7 available for residency/credit reasoning |
| PDF fill    | `pdf-lib` | Writes values into AcroForm fields on official IRS + MD fillable PDFs |
| PDF/image read | Claude native PDF + vision input | No OCR library; multipart POST from browser → API route → Claude |
| File upload | `react-dropzone` | Wraps native file input, supports PDF + image |
| Deployment  | TBD (likely Vercel) | |

## Core Architecture Patterns

**Deterministic math, AI reasoning.** Claude never computes tax amounts. Pure-TS functions in `lib/tax/` own all arithmetic (tax tables, standard deductions, MD county tax, SPT). Claude handles: (a) form extraction via vision + tool use, (b) residency/credit eligibility reasoning, (c) plain-English explanations sourced from instructions PDFs.

**Declarative form layouts.** Each form (1040, 1040-NR, 8843, MD 502, MD 505) is defined in `components/forms-layout/` as `FormSection[]` — arrays of `{id, lineNumber, label, kind: 'input'|'prefill'|'computed', source?, isCurrency?}`. `FormRenderer` walks this to produce the IRS-style on-screen form, avoiding hand-coded JSX per form.

**Lazy explanations with caching.** Claude explanations only fire when a user clicks ⓘ. Results cached per `(formId, lineId)` via Next.js `unstable_cache` — explanations are largely deterministic per line.

**Federal → Maryland chain.** Federal AGI is computed first by `/api/compute`, then fed directly into the MD computation (additions/subtractions → MD std deduction → brackets → county local tax). Both results land in the Zustand store and populate `FormRenderer` automatically.

**Tool-use extraction without external schema libraries.** `zod-to-json-schema` was tried and removed due to version incompatibility with `zod` v4. Instead, a small hand-rolled `buildInputSchema()` function in `api/extract/route.ts` converts Zod object shapes to `{type: "object", properties, required}` — exactly what Claude's `input_schema` needs.

## Integration Points

| External | Purpose |
|---|---|
| Anthropic API | Extraction (vision/tool-use), explanations (PDF context), residency reasoning |
| IRS fillable PDFs (bundled in `public/forms/`) | Target for `pdf-lib` fill |
| IRS instructions PDFs (bundled) | Context source for explain endpoint |
| MD Comptroller fillable PDFs + instructions booklets (bundled) | Same, for state forms |

**Explicitly NOT integrated:** IRS e-file (needs EFIN), payroll portals (ADP/Workday), NotebookLM (no public API — the "explain this field" panel replicates its value natively).

## Environment Variables

| Var | Purpose |
|-----|---------|
| `ANTHROPIC_API_KEY` | Anthropic SDK calls |

## Scope Boundaries

**In scope:** UMD students, US + international, federal + Maryland, upload + manual entry, filled PDF download.
**Out of scope:** E-filing, other states, non-US tax systems, part-year MD residents, payroll OAuth.

---

## Glossary

| Term | Definition |
|------|-----------|
| `.agent` | Documentation folder for this project, used by Claude Code and engineers for context |
| Claude Code | Anthropic's CLI tool for AI-assisted software engineering |
| CampusTax | Product name for this hackathon project |
| 1040 | US federal individual income tax return (residents) |
| 1040-NR | US federal return for non-resident aliens (used by F-1/J-1 international students failing SPT) |
| 8843 | IRS statement that every F-1/J-1 student must file, even with $0 income |
| W-2 | Wage statement from a US employer |
| 1098-T | Tuition statement from a US university |
| 1042-S | Income statement for foreign persons (scholarships, treaty-exempt wages) |
| 1099-INT | Interest income statement |
| MD Form 502 | Maryland resident income tax return |
| MD Form 505 | Maryland non-resident income tax return |
| MD Form 502CR | Maryland credits form (AOTC-style, poverty credit, etc.) |
| SPT | Substantial Presence Test — IRS formula determining resident vs non-resident alien status |
| AOTC / LLC | American Opportunity Tax Credit / Lifetime Learning Credit — education credits on 1040 |
| AcroForm | PDF form-field standard used by IRS/MD fillable PDFs, manipulated via `pdf-lib` |
| Treaty benefit | Tax-treaty reduction/exemption available to non-residents from certain countries (e.g. India, China) |
| Local/county tax | Maryland-specific extra tax on top of state tax, varying by county of residence (Prince George's ~3.2% for College Park) |
| `FormSection[]` / `FormLine` | TypeScript types defined in `layout-1040.ts` that describe a form as declarative data; drives `FormRenderer` |
| `unstable_cache` | Next.js server-side cache primitive used to memoize per-(formId, lineId) Claude explain responses |
| Zustand store | `lib/store.ts` — holds all cross-page client state: filerType, uploaded docs, computed returns, field overrides |
| `buildInputSchema()` | Hand-rolled function in `api/extract/route.ts` that converts a Zod object to Claude-compatible tool `input_schema` |
