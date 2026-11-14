# Agent Workflow (all AI agents: Claude Code, Codex, Cursor, Copilot, etc.)

Every agent working in this repo follows this workflow. GitHub is the single
source of truth, so always work from the latest `main`.

## 1. Before starting any task

1. `git pull` to get the latest docs and code.
2. Read these files in this order:
   1. `context.md`: the official event brief. It covers the rules, submission
      deliverables, judging rubric, challenge text, NASA data sources and the
      data caveat. It is the **source of truth for rules and data**.
   2. `ATHENA_MASTER_SPEC.md`: product vision, MVP scope, demo flow.
   3. `DECISONS.md`: locked decisions. Do not reverse a LOCKED decision.
   4. `Project_Context.md`: problem, users, core features, tech stack.
   5. `NASA_Challenge.md`: challenge summary and feature targets.
   6. `docs/` (once it exists): plan, data model, sources, storyboard, AI log.
3. If two files conflict:
   - Rules, deliverables, data and citations: `context.md` wins.
   - Product scope and architecture: `ATHENA_MASTER_SPEC.md` and `DECISONS.md` win.
   - Anything still unclear: ask the team. Do not guess.

## 2. While working

- **Do not redesign the architecture.** Stack: Next.js + Tailwind (frontend),
  FastAPI (backend), SQLite (database), 2D SVG body map.
- Priorities: hackathon speed, then NASA relevance, then demo quality, then simplicity. Prefer MVP solutions.
- **Every health rule shown to users must cite its source URL.** Label
  numeric thresholds that are not from NASA as "general clinical reference
  ranges", not NASA flight standards (see `context.md` Section 8).
- Mark assumptions explicitly. Never present an assumption as an official NASA value.
- The repo is **public**. No secrets, API keys, personal data, or anyone's
  photo, voice or likeness. Some participants may be under 18.
- Build only during the event (from 09:00, 14 Nov 2026). Do not import
  pre-existing project code.
- Ask the team before any hard-to-reverse decision.

## 3. Before finishing a task

1. If you made or changed a decision, add it to `DECISONS.md` with a reason.
2. Log how AI was used in `docs/AI_USAGE.md` (required for submission). List
   any AI-generated image or media there, because it must be watermarked or credited.
3. If you used a new data source, add it to `docs/SOURCES.md`.
4. Commit small, focused changes with clear messages, `git pull --rebase`, then push.

## 4. Submission checklist (from `context.md` Section 4)

- Project name and summary
- Public demo: a video of 30 seconds or less, or a deck of 7 slides or fewer
- Public link to the final project (repo or live app)
- Detailed description with **at least one official NASA data source** identified
- AI-usage disclosure plus credits for NASA data and any AI media
