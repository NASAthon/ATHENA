# Agent Workflow (all AI agents: Claude Code, Codex, Cursor, Copilot, etc.)

**This is the entry point for every agent.** Codex, Cursor, Copilot, Windsurf and
Gemini CLI (with `contextFileName: "AGENTS.md"`) load it automatically. Claude Code loads it
through `CLAUDE.md`. For chat-only tools, start with: *"Read `AGENTS.md` in
github.com/NASAthon/ATHENA first and follow it."*

GitHub is the single source of truth, so always branch from the latest `main`.

## 1. Before starting any task

1. `git checkout main && git pull`, then create a branch for the task:
   `git checkout -b feature/<short-name>` (or `fix/<short-name>`). Never commit straight to `main`.
2. Read these files in this order:
   1. `context.md`: the official event brief. It covers the rules, submission
      deliverables, judging rubric, challenge text, NASA data sources and the
      data caveat. Section 6.1 holds the ATHENA product spec: vision, crew, features
      and stack.
   2. `CHECKLIST.md`: what to build and hand in, with priorities (M = must, S = should).
      Pick your task from here.
   3. `judging.md`: the official Space Apps submission and judging guide. It
      covers deadlines, the project page fields, demo limits, AI/SI rules, global
      eligibility, the 1–5 judging criteria and the 10 global awards. Check work
      against the criteria (Impact, Creativity, Validity, Relevance, Presentation).
   4. `DECISIONS.md`: locked decisions. Do not reverse a LOCKED decision.
   5. `docs/`: `SOURCES.md` (every source used), `AI_USAGE.md` (AI log), `BODY_MAP.md`
      (verified body regions mapped to the 17 NASA risks and 5 hazards), and other files as they are added.
3. If two files conflict:
   - Submission, demo, AI/SI rules and judging: `judging.md` wins.
   - Challenge, data and citations: the official sections of `context.md` win.
   - Product scope and architecture: `DECISIONS.md` wins, then `CHECKLIST.md`, then `context.md` Section 6.1.
   - Anything still unclear: ask the team. Do not guess.

## 2. While working

- **Base template already exists:** a basic Next.js 16 app (JavaScript, App Router,
  Tailwind, static export, dark theme) in `app/`. **Build on top of it; don't re-create
  the project.** The "NASAthon - Athena" text in `app/page.js` is only there to prove
  the site runs on localhost. Whoever pushes real code can replace or remove it.
- Run it with `npm install`, then `npm run dev`, and open http://localhost:3000. `npm run build` creates the
  static export in `out/`.

- **Do not redesign the architecture.** Stack: offline-first PWA,
  Next.js (JavaScript) + Tailwind + ShadCN, SQLite in the browser (sql.js +
  IndexedDB), JS rules engine, 2D SVG body map. No backend and no
  runtime internet dependency. No hosting or deployment work.
- Priorities: hackathon speed, then NASA relevance, then demo quality, then simplicity. Prefer MVP solutions.
- **Every health rule shown to users must cite its source URL.** NASA pages
  are qualitative, so numeric thresholds come from general clinical reference
  ranges (`DECISIONS.md` › Thresholds). Emergency steps use NASA where a NASA page
  gives them, otherwise AHA or CDC guidance in our own words (`DECISIONS.md` › Emergency
  Step Sources). These are the only two exceptions to "official sources only". Label them "general clinical reference range",
  never as NASA flight standards.
- **Health content: accurate, informative and in plain English.** Astronauts aren't doctors,
  so give them more understanding, but simply. Simplify the words, not the facts.
  Show a glanceable summary first, with a "Learn more" layer for the full plain-English
  detail. Explain medical terms in brackets (`DECISIONS.md` › Content Style).
- Track the 6 indicators the official challenge names (heart rate, blood pressure,
  blood glucose, body temperature, sleep hours, mood) before adding extras.
- The challenge video adds two requirements (`context.md` Section 6.1):
  **emergency guidance** (including for a crewmate) and a **measurement guide for
  every indicator** covering how to take it, why it matters and what to do if it's abnormal.
  Every indicator you add needs its guide.
- **Inclusive design is required** (`DECISIONS.md` › Inclusive Design). Build every screen
  for different knowledge levels and abilities: plain English, colour plus icon plus label,
  large tap targets, high contrast, keyboard and screen-reader support, and reduced motion.
- **Adaptive search** is required (`DECISIONS.md` › Search). Every indicator, guide and
  emergency entry you add must include search keywords: synonyms, plain-English terms
  and symptoms, so search can find it.
- **Measurement reminders** are also required (team decision). Lunar Surface Base is out of scope.
- Mark assumptions explicitly. Never present an assumption as an official NASA value.
- The repo is **public**. No secrets, API keys, personal data, or anyone's
  photo, voice or likeness. Some participants may be under 18.
- Build only during the event (from 09:00, 14 Nov 2026). Do not import
  pre-existing project code.
- Ask the team before any hard-to-reverse decision.
- AI may speed up building but **must not generate the core idea**. AI-generated
  media must never use or modify NASA logos, flags or mission identifiers, and
  must carry a visible "AI-generated" watermark (`judging.md` 1C.6).
- Cite every external library, tool, text and image used (`judging.md` 1C.8).
- **Licensing: only use what is open source, openly licensed or public domain**,
  so we can name its licence. See `DECISIONS.md` › Licensing. In short:
  - Code libraries, fonts and icons need an open licence (e.g. MIT, Apache-2.0,
    BSD, ISC, OFL). Check before installing and record it in `docs/SOURCES.md`.
  - NASA text and data are public domain (US Government works). Cite them, but
    **never use NASA logos or insignia**, never imply NASA endorsement, and skip
    any nasa.gov image credited to a third party.
  - Canadian Space Agency and other non-US agencies: cite and link only, unless
    their site terms allow reuse.
  - Clinical ranges are published facts. Cite the guideline they come from.
  - No copyrighted images, text or media without a licence that allows it.
  - If the licence is unclear, don't use it and ask the team.

## 3. Before finishing a task

1. Tick the items you completed in `CHECKLIST.md`.
2. If you made or changed a decision, add it to `DECISIONS.md` with a reason.
3. Log how AI was used in `docs/AI_USAGE.md` (required for submission). List
   any AI-generated image or media there, because it must be watermarked or credited.
4. If you used a new data source, add it to `docs/SOURCES.md`.
5. Commit small, focused changes with clear messages. Run `git pull --rebase origin main`,
   push your branch, and open a pull request (`gh pr create`). Ideally let another
   teammate's agent review and merge it (see 3b).

## 3b. Reviewing a PR

**Ideally** the reviewer is **another teammate's agent**, run by a different person than
the PR author (it's fine if they also use Claude). If no one else is free, the author
may review and merge their own PR, but still go through the checks below.

1. Read the PR diff (`gh pr diff <number>`) against this file and `DECISIONS.md`.
2. Check that:
   - it builds and works offline;
   - it doesn't change the locked stack;
   - every health rule cites a source;
   - health text is accurate, sourced and in plain English, with a glance summary plus "Learn more";
   - the inclusive design checklist passes (colour isn't the only signal, tap targets are large,
     it works by keyboard, images have labels, contrast is OK);
   - new libraries, fonts and icons are open-licensed and listed in `docs/SOURCES.md`;
   - it adds no secrets, NASA logos or likenesses;
   - AI use is logged in `docs/AI_USAGE.md`.
3. Leave comments on anything that fails. If it all passes, approve it and merge
   (`gh pr merge <number> --squash --delete-branch`).

## 4. Build and submission checklist

Everything to build and hand in is in **`CHECKLIST.md`** (sections 1–7, with M/S priorities).
Pick tasks from it, and tick items off in your PR when they're done.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
