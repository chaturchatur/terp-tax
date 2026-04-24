Last verified: 2026-04-24

# .agent — Documentation Index

This folder contains living documentation for the `claude-hackathon` project. Start here.

## Quick orientation

**Initial implementation complete as of 2026-04-24.** The full CampusTax app is scaffolded under `campustax/` with a clean build and dev server running at `http://localhost:3000`. Immediate next steps: add `ANTHROPIC_API_KEY` to `campustax/.env.local` and drop official IRS/MD PDFs into `campustax/public/forms/`.

## Document Index

| File | What's in it |
|------|-------------|
| [System.md](./System.md) | Architecture overview, **actual** project structure, tech stack, integration points, env vars, and Glossary |
| [SOP.md](./SOP.md) | Best practices: Claude API usage, form layout pattern, tax computation rules, code style, deployment |
| [Tasks.md](./Tasks.md) | PRDs, active work, backlog (PDF field names, fixture tests, explain wiring), and completed features |
| [Decisions.md](./Decisions.md) | Architectural and design decisions — what was chosen, why, and any reversals |
| [Gotchas.md](./Gotchas.md) | Known landmines: shadcn `Select` null, `TooltipTrigger asChild`, zod-to-json-schema incompatibility, IRS PDF licensing, AcroForm placeholder field names |

## How to keep docs fresh

- After any meaningful change: run `/update-docs` to update the relevant files above.
- The `/init-docs` command re-scaffolds from scratch (use only if starting over).
- Bump `Last verified: YYYY-MM-DD` on every file you touch.
