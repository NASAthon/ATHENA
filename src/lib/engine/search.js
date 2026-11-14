// Offline search (docs/CHECKLIST.md › 2. Logic, item 13).
// Pure logic: no React or DOM. Uses MiniSearch (MIT), already installed
// (docs/DECISIONS.md › Search). Runs fully in the browser with no network.
//
// The searchable content is everything in src/data: indicators (with their measurement
// guides), emergency guides, symptoms, body regions, risks, hazards, exams and mission
// modes, each
// with its `keywords` list. `buildContentSearchIndex()` indexes all of it.

import MiniSearch from "minisearch";
import { EMERGENCIES, EXAMS, HAZARDS, INDICATORS, MISSION_MODES, REGIONS, RISKS, SYMPTOMS } from "../../data/index.js";

/**
 * One searchable item.
 *
 * @typedef {Object} SearchDocument
 * @property {string} id      Unique across all content, e.g. "indicator:heartRate".
 * @property {"indicator" | "emergency" | "symptom" | "bodyPart" | "risk" | "hazard" | "exam" | "mission"} type
 * @property {string} title   e.g. "Heart rate".
 * @property {ReadonlyArray<string>} keywords Synonyms, plain-English terms, symptoms and common
 *   misspellings, e.g. ["pulse", "heartbeat", "hart rate"] (DECISIONS › Search).
 * @property {string} [text]  Optional short description to search as well.
 * @property {string} [emergencyId] For symptoms: the emergency guide it opens.
 */

/**
 * @typedef {Object} SearchHit
 * @property {string} id
 * @property {string} type
 * @property {string} title
 * @property {number} score
 */

/**
 * @typedef {Object} SearchResponse
 * @property {string} query               The normalised query actually searched.
 * @property {ReadonlyArray<SearchHit>} results Best first; emergency guides first for symptom-like queries.
 * @property {boolean} symptomLike        True if the query matched an emergency guide or a symptom.
 * @property {ReadonlyArray<string>} didYouMean Suggestions, only when there are no results.
 * @property {true} emergencyShortcut     Always true: the UI always offers the emergency
 *                                        guide, so search is never a dead end.
 */

/** Search options (DECISIONS › Search: typos, prefixes, field boosting). */
const SEARCH_OPTIONS = Object.freeze({
  prefix: true,
  fuzzy: 0.2,
  boost: Object.freeze({ title: 3, keywords: 2, text: 1 }),
  combineWith: "OR",
});

/** Maximum results returned. */
export const MAX_RESULTS = 10;

/**
 * Turns everything in src/data into search documents. Ids are prefixed by type
 * ("indicator:glucose", "emergency:chest-pain", …) so they are unique across types.
 *
 * @returns {ReadonlyArray<SearchDocument>}
 */
export function contentDocuments() {
  const doc = (type, item, text, extra = {}) => ({
    id: `${type}:${item.id}`,
    type,
    title: item.name,
    keywords: item.keywords ?? [],
    text: text ?? "",
    ...extra,
  });
  return Object.freeze([
    ...EMERGENCIES.map((e) => doc("emergency", e, e.glance)),
    ...SYMPTOMS.map((s) => doc("symptom", s, "", s.emergencyId ? { emergencyId: s.emergencyId } : {})),
    ...INDICATORS.map((i) => doc("indicator", i, i.glance)),
    ...REGIONS.map((r) => doc("bodyPart", r, r.glance)),
    ...RISKS.map((r) => doc("risk", r, r.summary)),
    ...HAZARDS.map((h) => doc("hazard", h, h.summary)),
    ...EXAMS.map((x) => doc("exam", x, x.why)),
    ...MISSION_MODES.map((m) => doc("mission", m, m.environment)),
  ]);
}

/**
 * Builds the search index over all content in src/data. Build once at startup.
 *
 * @returns {MiniSearch}
 */
export function buildContentSearchIndex() {
  return buildSearchIndex(contentDocuments());
}

/**
 * Builds the search index once, from all content. Call again only if content changes.
 *
 * @param {ReadonlyArray<SearchDocument>} documents
 * @returns {MiniSearch} The index (pass it to `search`).
 * @throws {TypeError} If `documents` isn't an array or an id is missing or repeated.
 */
export function buildSearchIndex(documents) {
  if (!Array.isArray(documents)) throw new TypeError("buildSearchIndex: documents must be an array.");
  const seen = new Set();
  const prepared = documents.map((doc) => {
    if (!doc || typeof doc.id !== "string" || doc.id.length === 0) {
      throw new TypeError("buildSearchIndex: every document needs a string id.");
    }
    if (seen.has(doc.id)) throw new TypeError(`buildSearchIndex: duplicate id "${doc.id}".`);
    seen.add(doc.id);
    return {
      id: doc.id,
      type: doc.type,
      title: String(doc.title ?? ""),
      keywords: Array.isArray(doc.keywords) ? doc.keywords.join(" ") : "",
      text: String(doc.text ?? ""),
      emergencyId: doc.emergencyId ?? null,
    };
  });

  const index = new MiniSearch({
    fields: ["title", "keywords", "text"],
    storeFields: ["type", "title", "emergencyId"],
    processTerm: (term) => normaliseQuery(term) || null,
  });
  index.addAll(prepared);
  return index;
}

/**
 * Lower-cases, turns punctuation into spaces and collapses spaces, so case,
 * punctuation and extra spaces never change the result (DECISIONS › Search).
 * Word order already doesn't matter to the index.
 *
 * @param {unknown} query
 * @returns {string}
 */
export function normaliseQuery(query) {
  return String(query ?? "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

/**
 * CHECKLIST §2: "Search index: offline fuzzy search over all content (typos, prefixes,
 * synonyms, symptoms)".
 *
 * - Typos ("hart rate") and partial words ("oxy") match through fuzzy and prefix search.
 * - Synonyms and symptoms match through each document's `keywords`.
 * - If every word of the query matches an emergency guide or a symptom, and the query
 *   isn't the name of a measurement, it is symptom-like: emergency guides come first, including the guide a matched symptom
 *   opens (e.g. "can't breathe" → Low oxygen).
 * - With no results, `didYouMean` holds the closest known terms. `emergencyShortcut`
 *   is always true.
 *
 * Deterministic: equal scores are ordered by id.
 *
 * @param {MiniSearch} index From buildSearchIndex().
 * @param {string} query What the astronaut typed.
 * @returns {Readonly<SearchResponse>}
 */
export function search(index, query) {
  const q = normaliseQuery(query);
  if (q.length === 0) {
    return Object.freeze({ query: q, results: Object.freeze([]), symptomLike: false, didYouMean: Object.freeze([]), emergencyShortcut: true });
  }

  const raw = index.search(q, SEARCH_OPTIONS);
  const hits = raw
    .map((r) => ({ id: r.id, type: r.type, title: r.title, score: r.score }))
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));

  // Symptom-like: every word matches an emergency guide or a symptom.
  const symptomMatches = index.search(q, {
    fields: ["title", "keywords"],
    prefix: true,
    fuzzy: 0.2,
    combineWith: "AND",
    filter: (r) => r.type === "emergency" || r.type === "symptom",
  });
  // …but not when the query names a measurement, by its name or one of its own keywords
  // ("temprature" is the indicator, not hypothermia; "pulse" is heart rate, not cardiac arrest).
  const namesIndicator =
    index.search(q, {
      fields: ["title", "keywords"],
      prefix: true,
      fuzzy: 0.2,
      combineWith: "AND",
      filter: (r) => r.type === "indicator",
    }).length > 0;
  const symptomLike = symptomMatches.length > 0 && !namesIndicator;

  let ordered = hits;
  if (symptomLike) {
    // Emergency guides first: those matched directly, then those the matched symptoms open.
    const emergencyIds = [];
    for (const r of [...symptomMatches].sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))) {
      const id = r.type === "emergency" ? r.id : r.emergencyId ? `emergency:${r.emergencyId}` : null;
      if (id && !emergencyIds.includes(id)) emergencyIds.push(id);
    }
    const first = emergencyIds.map((id) => {
      const hit = hits.find((h) => h.id === id);
      if (hit) return hit;
      const stored = index.getStoredFields(id);
      return { id, type: "emergency", title: stored?.title ?? id, score: 0 };
    });
    ordered = [...first, ...hits.filter((h) => !emergencyIds.includes(h.id))];
  }

  const didYouMean =
    ordered.length === 0
      ? index
          .autoSuggest(q, { fuzzy: 0.4, prefix: true })
          .sort((a, b) => b.score - a.score || a.suggestion.localeCompare(b.suggestion))
          .slice(0, 3)
          .map((s) => s.suggestion)
      : [];

  return Object.freeze({
    query: q,
    results: Object.freeze(ordered.slice(0, MAX_RESULTS).map((h) => Object.freeze(h))),
    symptomLike,
    didYouMean: Object.freeze(didYouMean),
    emergencyShortcut: true,
  });
}
