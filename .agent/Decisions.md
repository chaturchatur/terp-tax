Last verified: 2026-04-24

# Architectural & Design Decisions

> Record significant decisions here — what was chosen, what was rejected, and why. Include reversals when they happen.

## Decision Log

| Date | Decision | Rationale | Alternatives Considered |
|------|----------|-----------|------------------------|
| 2026-04-24 | Use `.agent/` folder for project docs | Keeps documentation co-located with code and accessible to Claude Code agents | External wiki, README-only |
| 2026-04-24 | Claude never computes dollar amounts | Tax math must be auditable and deterministic; AI errors on arithmetic would erode user trust and could produce wrong filings | Claude-generated amounts |
| 2026-04-24 | Hand-rolled `buildInputSchema()` instead of `zod-to-json-schema` | `zod-to-json-schema` is incompatible with Zod v4's internals. The hand-rolled function is 30 lines and produces exactly the `{type:"object", properties, required}` Claude expects | `zod-to-json-schema`, `@anatine/zod-openapi` |
| 2026-04-24 | Declarative `FormSection[]` layout files, not JSX per form | 5 forms × ~40 lines each would be 200+ lines of near-identical JSX. Declarative data + one `FormRenderer` is more maintainable and easier to extend to new forms | Hand-coded JSX per form |
| 2026-04-24 | `unstable_cache` for explain responses (not Redis/KV) | Hackathon scope — no external infra needed. Next.js `unstable_cache` is sufficient for single-server demo use. Cache key is `${formId}-${lineId}` since explanations don't vary by user value | Redis, Upstash, in-memory Map |
| 2026-04-24 | IRS/MD PDFs NOT bundled in repo | Copyright/distribution restrictions on official government forms. User must download and place in `public/forms/` manually | Bundle PDFs, fetch at runtime from irs.gov |
| 2026-04-24 | Pages live at flat `/residency`, `/documents`, `/forms`, `/download` (not under `(wizard)/`) | Next.js route groups with `(wizard)/` are a valid pattern but add nesting without UX benefit; flat routes are simpler to navigate and link | `app/(wizard)/` route group |

---

## Decision Template

```
### [Short Decision Title]
**Date:** YYYY-MM-DD
**Status:** Active | Reversed
**Decision:** What was decided.
**Rationale:** Why this was chosen.
**Alternatives considered:** What else was weighed.
**Reversal (if any):** Date + reason if this decision was later undone.
```
