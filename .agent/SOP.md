Last verified: 2026-04-24

# Standard Operating Procedures

> This document captures best practices for developing this project. Update as patterns emerge.

## General Development

- Run `/init-docs` when starting a new project from scratch to scaffold documentation.
- Run `/update-docs` after any meaningful change (new feature, schema change, architectural decision, discovered quirk) to keep docs current.
- Keep `.agent/` docs concise — prefer single sources of truth over copying information across files.
- All app code lives under `campustax/` — run `npm` commands from inside that directory, not the repo root.

## Claude API Usage

- Default to `claude-sonnet-4-6` for extraction and explain. Reserve `claude-opus-4-7` for multi-step reasoning (residency determination, credit eligibility).
- **Do not use `zod-to-json-schema`** with Zod v4. Use the hand-rolled `buildInputSchema()` in `api/extract/route.ts` to produce Claude-compatible tool `input_schema` objects.
- Tool `input_schema` must have `type: "object"` at the top level — the Anthropic SDK enforces this at compile time.
- Cache explain responses with `unstable_cache` keyed on `${formId}-${lineId}` — explanations are stable per line and re-generating them on every click is wasteful.
- For document extraction, always use `tool_choice: { type: "any" }` so Claude is forced to call the extraction tool rather than responding in prose.

## Form Layout Pattern

- Define each new tax form as a `FormSection[]` in `components/forms-layout/`. Do not write bespoke JSX.
- Use `kind: 'prefill'` + `source: 'w2.wagesBox1'` for values that come directly from uploaded documents.
- Use `kind: 'computed'` for values that are derived from other lines — `FormRenderer` will show them as read-only with a dashed border.
- `isCurrency: true` on a line causes the input to display a `$` prefix and format with commas/decimals.

## Tax Computation Rules

- **Claude never computes dollar amounts.** All tax math lives in `lib/tax/`. If you need Claude to reason about eligibility (e.g. "does this student qualify for AOTC?"), pass the result back as a boolean/flag, not a computed dollar value.
- Federal computation runs first (`compute-1040.ts` or `compute-1040nr.ts`), then Maryland is seeded from federal AGI (`compute-md502.ts` or `compute-md505.ts`).
- MD standard deduction: 15% of MD AGI, clamped to `[$1,700, $2,550]` for single filers (2024). Verify this range each tax year.
- Non-residents (505) pay **state tax only** — no county/local tax.

## Code Style

- TypeScript strict mode is on. No `as any` unless inside a clearly scoped `eslint-disable` comment.
- Prefer `?? fallback` over `|| fallback` for nullish coalescing — avoids 0/empty-string false-negatives.
- All API routes validate request shape before calling Claude; return descriptive 400 JSON on bad input.

## Testing

> Fixture test scenarios to implement (per plan): (1) US student W-2 only → 1040 + MD 502; (2) student with 1098-T + AOTC → 1040 + MD 502; (3) F-1 with W-2 + 1042-S + treaty → 1040-NR + 8843 + MD 505. Cross-check all computed fields against hand-calculated expected values.

## Deployment

- Requires `ANTHROPIC_API_KEY` in environment.
- `public/forms/` must be populated with IRS + MD Comptroller PDFs (see Gotchas.md — these are not in the repo).
- Vercel: set `ANTHROPIC_API_KEY` as a secret env var in the Vercel project settings.
