"use client";

// Header search (docs/DECISIONS.md › Search; CHECKLIST §3 › Search). Results appear as you type and
// come from the engine's offline MiniSearch index over everything in src/data, so typos ("hart rate"),
// everyday words ("pulse") and symptoms ("chest pain") all work. Symptom-like queries list emergency
// guides first. With no match it offers "Did you mean…?", the closest results and the emergency
// guides, so search is never a dead end.
//
// Accessibility: ARIA combobox + listbox. Arrow keys move, Enter opens, Escape closes; the number
// of results is announced; emergency results carry an icon and a text label, not only colour.

import { useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, OctagonAlert, Search as SearchIcon, Sparkles } from "lucide-react";
import { buildContentSearchIndex, search } from "@/lib/engine";
import { describeHit } from "@/lib/searchLinks";
import { useMissionMode } from "@/components/MissionModeProvider";
import { focusRing } from "@/lib/ui";

let index = null;
const getIndex = () => (index ??= buildContentSearchIndex());

const CLOSEST_RESULTS = 3;

/** Turns the engine's response into one flat list of options (results, suggestions, emergency shortcut). */
function buildOptions(query) {
  if (query.trim().length === 0) return { response: null, options: [] };
  const response = search(getIndex(), query);
  const options = response.results.map((hit) => ({ key: hit.id, kind: "hit", hit, ...describeHit(hit) }));

  if (options.length === 0) {
    // MiniSearch suggests whole phrases ("headache head"); offer each distinct word once instead.
    const words = [...new Set(response.didYouMean.flatMap((s) => s.split(" ")))].slice(0, 3);
    for (const w of words) options.push({ key: `suggest:${w}`, kind: "suggest", suggestion: w });
    const closest = words[0] ? search(getIndex(), words[0]).results.slice(0, CLOSEST_RESULTS) : [];
    for (const hit of closest) options.push({ key: `closest:${hit.id}`, kind: "hit", closest: true, hit, ...describeHit(hit) });
  }
  if (!options.some((o) => o.href === "/emergency")) {
    options.push({ key: "emergency-shortcut", kind: "shortcut", href: "/emergency", emergency: true });
  }
  return { response, options };
}

export default function SearchBox() {
  const router = useRouter();
  const { setModeId } = useMissionMode();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef(null);
  const listId = useId();
  const optionId = (i) => `${listId}-opt-${i}`;

  const { response, options } = useMemo(() => buildOptions(query), [query]);
  const showList = open && query.trim().length > 0;
  const realResults = options.filter((o) => o.kind === "hit" && !o.closest).length;

  const close = () => {
    setOpen(false);
    setActive(-1);
  };

  const choose = (option) => {
    if (!option) return;
    if (option.kind === "suggest") {
      setQuery(option.suggestion);
      setActive(-1);
      inputRef.current?.focus();
      return;
    }
    if (option.missionModeId) {
      setModeId(option.missionModeId);
    } else if (option.href) {
      router.push(option.href);
    }
    setQuery("");
    close();
    inputRef.current?.blur();
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (options.length === 0 ? -1 : (i + 1) % options.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (options.length === 0 ? -1 : i <= 0 ? options.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      if (!showList) return;
      e.preventDefault();
      choose(options[active >= 0 ? active : 0]);
    } else if (e.key === "Escape") {
      if (showList) close();
      else setQuery("");
    }
  };

  const status = !showList
    ? ""
    : realResults > 0
      ? `${realResults} result${realResults === 1 ? "" : "s"}${response?.symptomLike ? ", emergency guides first" : ""}. Use the arrow keys to choose.`
      : "No exact match. Suggestions and the emergency guides are listed.";

  return (
    <div className="relative min-w-[14rem] flex-1">
      <label htmlFor="search" className="sr-only">
        Search readings, symptoms and guides
      </label>
      <SearchIcon aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={inputRef}
        id="search"
        type="search"
        role="combobox"
        autoComplete="off"
        spellCheck={false}
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={showList && active >= 0 ? optionId(active) : undefined}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={close}
        onKeyDown={onKeyDown}
        placeholder="Search readings, symptoms, guides (e.g. dizzy, BP, can't sleep)"
        className={`min-h-12 w-full rounded-lg border border-input bg-input/30 pr-4 pl-10 text-base placeholder:text-muted-foreground ${focusRing}`}
      />
      <p role="status" aria-live="polite" className="sr-only">
        {status}
      </p>

      {showList && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-xl border border-border bg-popover p-2 shadow-xl">
          {response?.symptomLike && realResults > 0 && (
            <p className="flex items-center gap-2 px-3 py-2 text-sm font-semibold" style={{ color: "var(--status-red)" }}>
              <OctagonAlert aria-hidden="true" className="size-4" />
              Looks like a symptom: emergency guides first
            </p>
          )}
          {realResults === 0 && (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              No exact match for &ldquo;{query.trim()}&rdquo;.
              {response?.didYouMean.length > 0 ? "" : " Try other words, or open the emergency guides."}
            </p>
          )}
          <ul id={listId} role="listbox" aria-label="Search results" className="flex flex-col gap-1">
            {options.map((o, i) => {
              const selected = i === active;
              const firstClosest = o.closest && !options[i - 1]?.closest;
              return [
                firstClosest && (
                  <li key={`${o.key}-heading`} role="presentation" aria-hidden="true" className="px-3 pt-2 text-sm text-muted-foreground">
                    Closest results
                  </li>
                ),
                <li
                  key={o.key}
                  id={optionId(i)}
                  role="option"
                  aria-selected={selected}
                  className={`flex min-h-14 cursor-pointer items-start gap-3 rounded-lg px-3 py-2 ${selected ? "bg-accent ring-2 ring-ring" : "hover:bg-accent/60"}`}
                  // mousedown, not click: the input's blur would close the list first.
                  onMouseDown={(e) => {
                    e.preventDefault();
                    choose(o);
                  }}
                  onMouseEnter={() => setActive(i)}
                >
                  <OptionContent option={o} />
                </li>,
              ];
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

const emergencyIcon = <OctagonAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" style={{ color: "var(--status-red)" }} />;

function OptionContent({ option: o }) {
  if (o.kind === "suggest") {
    return (
      <>
        <Sparkles aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
        <span className="font-semibold">Did you mean &ldquo;{o.suggestion}&rdquo;?</span>
      </>
    );
  }
  if (o.kind === "shortcut") {
    return (
      <>
        {emergencyIcon}
        <span className="flex flex-col">
          <span className="font-semibold">All emergency guides</span>
          <span className="text-sm text-muted-foreground">Chest pain, collapse, low oxygen and more</span>
        </span>
      </>
    );
  }
  return (
    <>
      {o.emergency ? emergencyIcon : <BookOpen aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-muted-foreground" />}
      <span className="flex min-w-0 flex-col">
        <span className="font-semibold">{o.hit.title}</span>
        <span className="text-sm font-medium" style={{ color: o.emergency ? "var(--status-red)" : "var(--muted-foreground)" }}>
          {o.typeLabel}
        </span>
        {o.glance && <span className="line-clamp-2 text-sm text-muted-foreground">{o.glance}</span>}
      </span>
    </>
  );
}
