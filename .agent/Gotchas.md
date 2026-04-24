Last verified: 2026-04-24

# Gotchas, Quirks & Known Landmines

> Document non-obvious behaviors, past bugs, and surprises here so others don't re-discover them.

## Claude Code & Skills

- **Directory name with spaces:** The working directory (`Personal /claude-hackathon`) contains a space. Always quote or escape the path in shell commands (e.g., `"/Users/ritvik/Documents/code/Personal /claude-hackathon"`).
- **`.agent/` vs memory:** `.agent/` files are project-scoped documentation for engineers and agents reading the repo. Claude Code's `memory/` folder is a separate, conversation-persistent memory system for the AI assistant itself — they serve different purposes.

---

## Next.js & shadcn

### `shadcn` `Select.onValueChange` returns `string | null`, not `string`
**Symptom:** TypeScript error: `Argument of type 'string | null' is not assignable to parameter of type 'string'`.
**Root cause:** In the installed version of shadcn's Select component, `onValueChange` can return `null` when the selection is cleared.
**Fix / workaround:** Guard at the call site: `onValueChange={(v) => { if (!v) return; doSomething(v); }}`.
**First seen:** 2026-04-24

### `TooltipTrigger` does not support `asChild` in this shadcn version
**Symptom:** TypeScript error: `Property 'asChild' does not exist on type 'IntrinsicAttributes & Props<unknown>'`.
**Root cause:** The installed shadcn `tooltip.tsx` wraps Radix `TooltipTrigger` without forwarding the `asChild` prop through its public surface.
**Fix / workaround:** Drop `asChild` from `<TooltipTrigger>` and put the child element (e.g. `<Button>`) directly inside it without the prop.
**First seen:** 2026-04-24

---

## Claude API / Extraction

### `zod-to-json-schema` incompatible with Zod v4
**Symptom:** TypeScript errors when passing a Zod schema to `zodToJsonSchema()` — schema object is not assignable to `ZodType<any, ZodTypeDef, any>`.
**Root cause:** `zod-to-json-schema` expects the internal Zod v3 class structure; Zod v4 changed internals.
**Fix / workaround:** Remove `zod-to-json-schema`. Write a small `buildInputSchema(schema: z.ZodObject<any>)` that manually iterates `schema.shape` and emits `{type: "object", properties, required}`. Claude's `input_schema` only needs the standard JSON Schema structure, not a full Zod conversion.
**First seen:** 2026-04-24

### Claude `input_schema` must have `type: "object"` at top level
**Symptom:** TypeScript error `Property 'type' is missing in type 'Record<string, unknown>' but required in type 'InputSchema'`.
**Root cause:** The Anthropic SDK types require `input_schema` to be `{type: "object", properties: {...}}` — a plain `Record<string, unknown>` without `type` is rejected.
**Fix / workaround:** Always include `type: "object"` as the first key when constructing a tool's `input_schema` by hand.
**First seen:** 2026-04-24

---

## PDF Filling

### IRS fillable PDFs are NOT included in the repo
**Symptom:** `/api/fill-pdf` returns 404 with message "No PDF templates found."
**Root cause:** Copyright/license prevents bundling official IRS and MD Comptroller PDFs. They must be downloaded manually.
**Fix / workaround:** Download these files and place them in `campustax/public/forms/`:
- `f1040.pdf`, `f1040nr.pdf`, `f8843.pdf` — from irs.gov
- `md502.pdf`, `md505.pdf` — from marylandtaxes.gov
- `i1040.pdf`, `i1040nr.pdf`, `i8843.pdf`, `md-resident-booklet.pdf`, `md-nonresident-booklet.pdf` — instruction PDFs for the explain endpoint
**First seen:** 2026-04-24

### AcroForm field names in `fill-pdf/route.ts` are placeholders
**Symptom:** Fields may not populate correctly in downloaded PDFs even after adding official PDFs.
**Root cause:** AcroForm field names (e.g. `f1_02[0]`) were estimated — actual names depend on the specific PDF version. They must be inspected in the live PDFs.
**Fix / workaround:** Open each official PDF with `pdf-lib` (or Acrobat/Preview field inspector) to list actual field names, then update `FIELD_MAP_1040`, `FIELD_MAP_1040NR`, and `FIELD_MAP_8843` in `fill-pdf/route.ts` accordingly.
**First seen:** 2026-04-24

---

## Gotcha Template

```
### [Short Title]
**Symptom:** What you observe.
**Root cause:** Why it happens.
**Fix / workaround:** What to do.
**First seen:** YYYY-MM-DD
```
