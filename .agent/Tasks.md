Last verified: 2026-04-24

# Tasks & PRDs

> This document tracks planned features, in-progress work, and product requirements. Add entries here before starting significant work.

## Active

_None — initial build complete. See Backlog for next priorities._

## Backlog

### PDF Field Name Verification
**Status:** Backlog
**Goal:** Verify AcroForm field names in each official IRS/MD PDF so `fill-pdf/route.ts` populates fields correctly.
**Scope:**
- [ ] Download `f1040.pdf`, `f1040nr.pdf`, `f8843.pdf`, `md502.pdf`, `md505.pdf` from irs.gov / marylandtaxes.gov into `public/forms/`
- [ ] Script or manually inspect field names with pdf-lib's `getFields()` method
- [ ] Update `FIELD_MAP_1040`, `FIELD_MAP_1040NR`, `FIELD_MAP_8843` in `fill-pdf/route.ts`
- [ ] Add field maps for MD 502 and MD 505
**Out of scope:** All non-required form fields.
**Success criteria:** Download a filled PDF in browser, open in Acrobat/Preview — all key income/tax/refund lines are populated correctly.

### Explain Endpoint — Attach Instructions PDFs
**Status:** Backlog
**Goal:** Wire up the explain endpoint to actually read instruction PDFs so Claude can cite page numbers.
**Scope:**
- [ ] Download `i1040.pdf`, `i1040nr.pdf`, `i8843.pdf`, `md-resident-booklet.pdf`, `md-nonresident-booklet.pdf` into `public/forms/`
- [ ] Verify `INSTRUCTIONS_MAP` in `explain/route.ts` matches actual filenames
- [ ] Test: click ⓘ on Line 1a — confirm Claude cites a real page number
**Out of scope:** Chunking/embedding (full PDF passes to Claude natively).
**Success criteria:** 10 random field clicks return explanations with page citations.

### Fixture Verification Tests
**Status:** Backlog
**Goal:** Cross-check all 3 fixture scenarios against hand-computed values (per plan).
**Scope:**
- [ ] Scenario 1: US student W-2 only → 1040 + MD 502 (federal refund + county tax)
- [ ] Scenario 2: Student with 1098-T → AOTC credit calculation
- [ ] Scenario 3: F-1 with W-2 + 1042-S + treaty → 1040-NR + 8843 + MD 505
**Out of scope:** UI automation — manual browser verification is acceptable for hackathon.
**Success criteria:** All computed line values match hand-calculated expected values to the dollar.

### ANTHROPIC_API_KEY Setup
**Status:** Backlog
**Goal:** Configure real API key so extraction, explain, and compute work end-to-end.
**Scope:**
- [ ] Add real key to `campustax/.env.local`
- [ ] Test full flow: upload W-2 → extract → compute → forms view → download
**Success criteria:** Full non-resident demo flow (per plan §Demo story) completes without errors.

## Completed

### Initial Application Scaffold
**Status:** Done (2026-04-24)
**Goal:** Build the full CampusTax application from the Plan.md spec.
**Scope:**
- [x] Next.js 16 + TypeScript + Tailwind + shadcn/ui project created under `campustax/`
- [x] Zod schemas for W-2, 1098-T, 1042-S, 1040, 1040-NR, 8843, MD 502, MD 505
- [x] Deterministic tax computation: SPT, compute-1040, compute-1040nr, compute-md502, compute-md505, md-local-rates
- [x] API routes: `/api/extract`, `/api/explain`, `/api/compute`, `/api/fill-pdf`
- [x] Zustand store for cross-page state
- [x] Declarative form layouts for all 5 forms
- [x] FormRenderer, FormLine, ExplainPanel, DocumentDropzone components
- [x] 5 pages: landing, residency wizard, documents, forms, download
- [x] Zero TypeScript errors, clean production build, dev server running at localhost:3000

---

## PRD Template

When adding a new feature or initiative, use this structure:

```
### [Feature Name]
**Status:** Backlog | In Progress | Done
**Goal:** One sentence on what this achieves and why.
**Scope:**
- [ ] Sub-task 1
- [ ] Sub-task 2
**Out of scope:** What explicitly won't be built now.
**Success criteria:** How we'll know it's done.
```
