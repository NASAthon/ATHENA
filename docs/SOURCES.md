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
| CDC pages (blood pressure, heart attack, cardiac arrest, stroke, fever, hypothermia, sleep, glucose monitoring) | see tables below | Thresholds, measurement steps, emergency steps | No (clinical) | US Gov work, public domain; rewritten in our words |
| American Diabetes Association pages | see tables below | Glucose ranges, 15-15 rule | No (clinical) | Copyrighted: numbers only, our own wording |
| Monitoring Radiation for Astronaut Health (CSA) | https://www.asc-csa.gc.ca/eng/news/articles/2026/2026-02-26-monitoring-radiation-astronaut-health.asp | Radiation monitoring context (CANS) | No (partner) | Cite and link only; check CSA notices |

## Clinical reference ranges (thresholds only, see `docs/DECISIONS.md` › Thresholds and › Red-Limit Sources)

Licence notes: **CDC** content is US Government work (public domain). **AHA** and **ADA** pages are
copyrighted, so use only the numeric facts (facts can't be copyrighted), write our own
wording, and cite the page. Never copy their text, images or charts.

All values verified on 14 Nov 2026. The data lives in `src/data/indicators.js`.

| Indicator | Range used | Source | URL |
|---|---|---|---|
| Blood pressure | Normal <120/<80; Elevated 120–129/<80; Stage 1 130–139 or 80–89; Stage 2 ≥140 or ≥90; Severe >180 and/or >120 (emergency if symptoms) | CDC (table based on ACC/AHA guidelines) | https://www.cdc.gov/high-blood-pressure/about/index.html |
| Blood glucose (fasting) | Normal <100; 100–125 raised; ≥126 high (mg/dL); fasting = 8 h | ADA | https://diabetes.org/about-diabetes/diagnosis |
| Blood glucose (low) | Below 70 mg/dL | ADA | https://diabetes.org/living-with-diabetes/treatment-care/hypoglycemia-low-blood-glucose |
| Blood glucose (very high) | Above 240 mg/dL: check ketones, don't exercise if present | ADA | https://diabetes.org/living-with-diabetes/treatment-care/hyperglycemia |
| Body temperature (fever) | 38.0°C (100.4°F) or above | CDC | https://www.cdc.gov/quarantine/maritime/definitions-signs-symptoms-conditions-ill-travelers.html |
| Body temperature (hypothermia) | Below 35°C (95°F): get medical help immediately | CDC | https://www.cdc.gov/winter-weather/prevention/index.html |
| Sleep | Adults 18–60: 7 or more hours | CDC | https://www.cdc.gov/sleep/about/index.html |
| Exercise | About 1.5 h a day, 6–7 days a week | NASA | https://www.nasa.gov/reference/risk-of-reduced-cardiorespiratory-and-musculoskeletal-fitness/ |
| Heart rate | **No fixed range, by design:** compared with each astronaut's own baseline (`docs/DECISIONS.md` › Heart Rate and SpO₂) | — | — |
| SpO₂, radiation dose | **No fixed thresholds:** own baseline (SpO₂) and running total (dose); symptoms open the emergency guides | — | — |

Measurement steps: blood pressure from https://www.cdc.gov/high-blood-pressure/measure/index.html; glucose from https://www.cdc.gov/diabetes/diabetes-testing/monitoring-blood-sugar.html.
ATHENA design choices (not clinical): the mood scale and its bands, the 500 ms reaction lapse, "3+ nights or days in a row" rules, and mapping clinical categories onto our four levels. These are labelled `basis: "design"` in the data.

## Emergency first-response steps (see `docs/DECISIONS.md` › Emergency Step Sources)

NASA first; otherwise AHA or CDC, rewritten in our own words.

All in `src/data/emergencies.js`. Where a source says "call 911", ATHENA says "contact the flight surgeon" (marked `adaptation: true`).

| Scenario | Status | Source | URL |
|---|---|---|---|
| Chest pain (heart attack signs) | Ready | CDC | https://www.cdc.gov/heart-disease/about/heart-attack.html |
| Collapse (cardiac arrest) | Partial: CPR technique pending (only AHA states it, and heart.org blocks automated access) | CDC | https://www.cdc.gov/heart-disease/about/cardiac-arrest.html, https://www.cdc.gov/heart-disease/php/cardiac-arrest-response-plans/index.html |
| Stroke (BE FAST) | Ready | CDC | https://www.cdc.gov/stroke/signs-symptoms/index.html |
| Low blood sugar (15-15 rule) | Ready | ADA | https://diabetes.org/living-with-diabetes/hypoglycemia-low-blood-glucose/symptoms-treatment |
| Very high blood pressure | Ready | CDC | https://www.cdc.gov/high-blood-pressure/about/index.html |
| Hypothermia | Ready | CDC | https://www.cdc.gov/winter-weather/prevention/index.html |
| Decompression sickness | Ready | NASA | https://www.nasa.gov/reference/risk-of-decompression-sickness/ |
| Hypoxia | Ready (altitude-illness guidance applied to spaceflight, marked as adaptation) | NASA, CDC Yellow Book | https://www.nasa.gov/reference/risk-of-hypoxia/, https://www.cdc.gov/yellow-book/hcp/environmental-hazards-risks/high-altitude-travel-and-altitude-illness.html |
| Radiation alert | Ready ("get inside, stay inside, stay tuned" applied to spaceflight) | CDC | https://www.cdc.gov/radiation-emergencies/response/get-inside.html (+ stay-inside, stay-tuned) |
| Injury or blow to the head | Partial: concussion steps ready; bleeding and broken-bone first aid pending | CDC HEADS UP | https://www.cdc.gov/heads-up/response/index.html, https://www.cdc.gov/heads-up/signs-symptoms/index.html |
| Mental health crisis | Ready | CDC | https://www.cdc.gov/suicide/prevention/index.html, https://www.cdc.gov/mental-health/living-with/index.html |

No medication doses are included anywhere (the CDC altitude chapter lists drugs; ATHENA leaves medicines to the flight surgeon).

## Libraries and tools

The full licence text of every package is in [`THIRD_PARTY_LICENSES.md`](../THIRD_PARTY_LICENSES.md) (regenerate with `npm run licenses`).

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
