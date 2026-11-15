# Agent Workflow (all AI agents: Claude Code, Codex, Cursor, Copilot, etc.)

**This is the entry point for every agent.** Codex, Cursor, Copilot, Windsurf and
Gemini CLI (with `contextFileName: "AGENTS.md"`) load it automatically. Claude Code loads it
through `CLAUDE.md`. For chat-only tools, start with: *"Read `AGENTS.md` in
github.com/NASAthon/ATHENA first and follow it."*

GitHub is the single source of truth, so always branch from the latest `main`.

**Repo layout:**
- **Root:** `AGENTS.md`, `CLAUDE.md` and `README.md` (they must stay at the root, because agents and GitHub look for them there), plus config files.
- `docs/`: project context for agents (`DECISIONS.md`, `SOURCES.md`, `AI_USAGE.md`, `BODY_MAP.md`).
  The event-planning docs (brief, build checklist, judging guide, submission answers) were removed after
  submission and live in git history.
- `src/`: all app code (`src/app/` pages, `src/components/`, `src/lib/`). Import with `@/`, e.g. `@/lib/utils`.
  - `src/lib/engine/`: **all health logic** (baselines, drift, alerts, red limits, health score, search, and so on).
    Import from `@/lib/engine`. Never put health logic in components. Tests sit next to each file (`*.test.js`).
  - `src/lib/regionStatus.js`: body-map display layer (labels, icons, colours, recent-symptom layer) on top of the engine's status order.
  - `src/lib/sim/`: the seeded mission simulator (`simulateAstronaut`, `simulateCrew`) and `loadDemoMission` / `resetData`.
    It seeds the on-device database that every screen reads. `src/lib/live/` is the simulated always-on sensor feed and its rules (Live Monitor, Today's live values, alerts; readings always labelled simulated). Always label simulated data in the UI.
  - `src/components/CrewProvider.js`: the selected astronaut, shared by every page (`useCrew()`).
  - **Reading today's status:** `useTodayEvaluation()` (`src/components/useTodayEvaluation.js`) gives the selected
    astronaut's engine evaluation from stored data (score, alert, red limits, statuses). Today, the alert banner, Body and Summary use it.
  - **Saving:** use `useMissionData()` (`saveCheckIn`, `saveExamResult`) from `src/components/MissionDataProvider.js`.
    Never write to the database directly from a screen. Records are validated first (`src/lib/dailyRecord.js`).
- `src/data/`: all health content (hazards, risks, body regions, indicators with thresholds and
  input limits, emergencies, symptoms, exams, mission modes, sources). Import from `@/data`. Shared UI helpers (e.g. `focusRing`) live in `@/lib/ui`. **Never hard-code health text
  or numbers in components; use these files.** Run `npm run check:content` after editing them.
- `public/`: static files served as-is. `scripts/`: build helper scripts.

## 1. Before starting any task

1. `git checkout main && git pull`, then create a branch for the task:
   `git checkout -b feature/<short-name>` (or `fix/<short-name>`). Never commit straight to `main`.
2. Read these files:
   1. `README.md`: what ATHENA is, its features, the challenge and the NASA data it uses.
   2. `docs/DECISIONS.md`: locked decisions. Do not reverse a LOCKED decision.
   3. `docs/SOURCES.md` (every source used), `docs/AI_USAGE.md` (AI log) and `docs/BODY_MAP.md`
      (verified body regions mapped to the 17 NASA risks and 5 hazards).
3. If anything is unclear, ask the team. Do not guess.

## 2. While working

- **Base template already exists:** a basic Next.js 16 app (JavaScript, App Router,
  Tailwind, static export, dark theme) in `src/app/`. **Build on top of it; don't re-create
  the project.** `/` shows the Today screen (`src/app/page.js` re-exports `src/app/today/page.js`).
- Run it with `npm install`, then `npm run dev`, and open http://localhost:3000. Run the logic tests with `npm test`. `npm run build` creates the
  static export in `out/`.
- **Installed packages** (all open source; licences are in `docs/SOURCES.md`):
  - **shadcn/ui** (Radix base, dark theme): add components with `npx shadcn@latest add <name>`.
    They land in `src/components/ui/`. Use `cn` from `@/lib/utils` and icons from `lucide-react`.
  - **sql.js:** `npm install` copies the engine to `public/sql-wasm.wasm` and `public/sql-wasm.js`
    (`scripts/copy-sqljs-wasm.mjs`), never from a CDN. Don't open it yourself: use the shared
    database from `@/lib/db` (`await getDatabase()`), which loads both files and saves to IndexedDB.
  - **MiniSearch** for search.
  - Before adding any other package, check its licence, add it to `docs/SOURCES.md`, and run
    `npm run licenses` to refresh `THIRD_PARTY_LICENSES.md`.

- **Do not redesign the architecture.** Stack: offline-first web app run on the laptop (not a PWA),
  Next.js (JavaScript) + Tailwind + ShadCN, SQLite in the browser (sql.js +
  IndexedDB), JS rules engine, 2D SVG body map. No backend and no runtime internet dependency.
  A static GitHub Pages copy exists only for judge access; the local build remains the operational
  offline version (`docs/DECISIONS.md` › Hosting and Demo).
- Priorities: hackathon speed, then NASA relevance, then demo quality, then simplicity. Prefer MVP solutions.
- **Every health rule must cite its source in `docs/SOURCES.md` (and its `sourceIds` in
  `src/data`).** The app itself shows no source links or other external links: astronauts
  can't open web pages in flight (`docs/DECISIONS.md` › No External Links). NASA pages
  are qualitative, so numeric thresholds come from general clinical reference
  ranges (`docs/DECISIONS.md` › Thresholds). Emergency steps use NASA where a NASA page
  gives them, otherwise AHA or CDC guidance in our own words (`docs/DECISIONS.md` › Emergency
  Step Sources). These are the only two exceptions to "official sources only". Label them "general clinical reference range",
  never as NASA flight standards.
- **Health content: accurate, informative and in plain English.** Astronauts aren't doctors,
  so give them more understanding, but simply. Simplify the words, not the facts.
  Quick reference only: status, meaning and what to do, with no "Learn more" layers
  (`docs/DECISIONS.md` › Quick Reference Only). Explain medical terms in brackets (`docs/DECISIONS.md` › Content Style).
- Track the 6 indicators the official challenge names (heart rate, blood pressure,
  blood glucose, body temperature, sleep hours, mood) before adding extras.
- The challenge video (Brazilian Space Agency) adds two requirements:
  **emergency guidance** (including for a crewmate) and a **measurement guide for
  every indicator** covering how to take it, why it matters and what to do if it's abnormal.
  Every indicator you add needs its guide.
- **Inclusive design is required** (`docs/DECISIONS.md` › Inclusive Design). Build every screen
  for different knowledge levels and abilities: plain English, colour plus icon plus label,
  large tap targets, high contrast, keyboard and screen-reader support, and reduced motion.
- **Adaptive search** is required (`docs/DECISIONS.md` › Search). Every indicator, guide and
  emergency entry you add must include search keywords: synonyms, plain-English terms
  and symptoms, so search can find it.
- **Measurement reminders** are also required (team decision). Lunar Surface Base is out of scope.
- **No medicines, doses or diagnoses** anywhere in the app (`docs/DECISIONS.md` › No Medicines or Diagnoses).
  Give signs, first-response actions and when to contact the flight surgeon.
- Mark assumptions explicitly. Never present an assumption as an official NASA value.
- The repo is **public**. No secrets, API keys, personal data, or anyone's
  photo, voice or likeness. Some participants may be under 18.
- Ask the team before any hard-to-reverse decision.
- AI may speed up building but **must not generate the core idea**. AI-generated
  media must never use or modify NASA logos, flags or mission identifiers, and
  must carry a visible "AI-generated" watermark (Space Apps SI rules).
- Cite every external library, tool, text and image used (Space Apps submission rules).
- **Licensing: only use what is open source, openly licensed or public domain**,
  so we can name its licence. See `docs/DECISIONS.md` › Licensing. In short:
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

1. Update `README.md` if the change affects features, data or how to run the app.
2. If you made or changed a decision, add it to `docs/DECISIONS.md` with a reason.
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

1. Read the PR diff (`gh pr diff <number>`) against this file and `docs/DECISIONS.md`.
2. Check that:
   - it builds, `npm test` and `npm run check:content` pass, and it works offline (no external fonts,
     scripts or data: check the browser's network log shows only the app's own address);
   - it doesn't change the locked stack;
   - every health rule cites a source in `docs/SOURCES.md`, and the app shows no external links;
   - health text is accurate, sourced and in plain English, quick reference only (no "Learn more" layers);
   - the inclusive design checklist passes (colour isn't the only signal, tap targets are large,
     it works by keyboard, images have labels, contrast is OK);
   - new libraries, fonts and icons are open-licensed and listed in `docs/SOURCES.md`;
   - it adds no secrets, NASA logos or likenesses;
   - AI use is logged in `docs/AI_USAGE.md`.
3. Leave comments on anything that fails. If it all passes, approve it and merge
   (`gh pr merge <number> --squash --delete-branch`).

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
