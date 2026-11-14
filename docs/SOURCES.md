# Sources

Every source ATHENA uses. This feeds the submission's "NASA Data" and "Space Agency Partner Data and Other References" fields (`docs/judging.md` 1C.7–8). Add a row whenever you use something new. **Only open source, openly licensed or public-domain material** (see `docs/DECISIONS.md` › Licensing). If a licence is unclear, don't use it.

| Source | URL | What we take from it | Official NASA? | Licence / terms |
|---|---|---|---|---|
| 5 Hazards of Human Spaceflight | https://www.nasa.gov/hrp/hazards/ | The five hazards | Yes | US Gov work; no NASA logos |
| Risks of Human Spaceflight | https://www.nasa.gov/hrp/risks/ | The 17 risks (the pages don't map them to hazards; our mapping is in `docs/BODY_MAP.md`) | Yes | US Gov work; no NASA logos |
| NASA Open Science Data Repository (OSDR) | https://osdr.nasa.gov/ | Real spaceflight biology data for inspiration and testing (named in the challenge video) | Yes | Check each dataset's licence before use |
| Challenge video (Brazilian Space Agency) | https://www.youtube.com/watch?v=RERG3gEmdC8 | Challenge goals, emergency scenario, guidance requirements | Official challenge material | Cite and link only |
| 17 NASA risk pages + 5 hazard pages | URLs listed in `docs/BODY_MAP.md` | Body regions, affected systems, verified facts (e.g. bone loss 1–1.5%/month) | Yes | US Gov work; no NASA logos |
| NASA Space Apps resources (submission and judging guides) | https://www.spaceappschallenge.org/resources/ | Rules, deadlines and judging criteria (`docs/judging.md`) | Official event material | Cite and link only |
| Monitoring Radiation for Astronaut Health (CSA) | https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp | Radiation monitoring context (CANS) | No (partner) | Cite and link only; check CSA notices |

## Clinical reference ranges (thresholds only, see `docs/DECISIONS.md` › Thresholds and › Red-Limit Sources)

Licence notes: **CDC** content is US Government work (public domain). **AHA** and **ADA** pages are
copyrighted, so use only the numeric facts (facts can't be copyrighted), write our own
wording, and cite the page. Never copy their text, images or charts.

| Indicator | Range used | Source | URL |
|---|---|---|---|
| | | | |

## Emergency first-response steps (see `docs/DECISIONS.md` › Emergency Step Sources)

NASA first; otherwise AHA or CDC, rewritten in our own words.

| Scenario | Step(s) | Source | URL |
|---|---|---|---|
| | | | |

## Libraries and tools

| Name | Use | Licence | Link |
|---|---|---|---|
| Next.js | App framework (static export) | MIT | https://github.com/vercel/next.js |
| React / React DOM | UI library | MIT | https://github.com/facebook/react |
| Tailwind CSS (+ @tailwindcss/turbopack) | Styling | MIT | https://github.com/tailwindlabs/tailwindcss |
| shadcn/ui (`shadcn` CLI and CSS, `cn`) | UI components copied into `src/components/ui/`; class merging | MIT | https://github.com/shadcn-ui/ui |
| Radix UI (`radix-ui`) | Accessible UI primitives used by shadcn/ui | MIT | https://github.com/radix-ui/primitives |
| Lucide (`lucide-react`) | Icons (status icons and so on) | ISC | https://github.com/lucide-icons/lucide |
| class-variance-authority | Component style variants | Apache-2.0 | https://github.com/joe-bell/cva |
| tw-animate-css | Tailwind animation utilities | MIT | https://github.com/Wombosvideo/tw-animate-css |
| sql.js | SQLite database in the browser (WASM, bundled locally) | MIT | https://github.com/sql-js/sql.js |
| MiniSearch | Offline fuzzy search (typos, prefixes, synonyms) | MIT | https://github.com/lucaong/minisearch |
| ESLint + eslint-config-next | Linting (dev only) | MIT | https://github.com/eslint/eslint |
| Fonts | System fonts only, nothing bundled or downloaded | n/a | n/a |

### Dependency licence scan (14 Nov 2026, after installing sql.js, MiniSearch and shadcn/ui)

All 575 installed npm packages (direct and transitive) are open source:
MIT (498), Apache-2.0 (27), ISC (19), BSD-2/3-Clause (18), BlueOak-1.0.0 (3), MPL-2.0 (3:
axe-core, lightningcss), CC-BY-4.0 (caniuse-lite browser data), CC0-1.0, 0BSD,
Python-2.0 (argparse), MIT OR CC0-1.0 (type-fest), and LGPL-3.0 (sharp/libvips,
Next's optional image optimiser; unused with static export and not modified).
No proprietary or unknown licences. Re-run the scan after adding packages, e.g.
`npx license-checker --summary`.
