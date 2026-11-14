"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, CircleDashed, Eye, LoaderCircle, OctagonAlert, RotateCcw, ScanLine, TriangleAlert, Volume2 } from "lucide-react";
import { INDICATORS, SYMPTOMS, EMERGENCIES } from "@/data";
import { RECORD_FIELDS, SYMPTOMS_FIELD, checkReading } from "@/lib/engine";
import { useCrew } from "@/components/CrewProvider";
import { useMissionData } from "@/components/MissionDataProvider";
import { checkInStreak } from "@/lib/checkIn";
import { SCAN_SENSORS, readSensor, scanToRecordFields } from "@/lib/sim/sensorScan";
import { formatValue } from "@/lib/readings";
import { plainFieldError } from "@/lib/readings";
import { focusRing } from "@/lib/ui";

// Daily check (layout and design by Izabela, PR #8; simulated sensor scan, docs/DECISIONS.md ›
// Simulated Sensor Scan). Vitals are collected by a SIMULATED sensor scan (src/lib/sim/sensorScan.js),
// validated and saved automatically; the crew only adds mood and symptoms, which no sensor can
// report. A sensor that fails can be retried; numeric vital entry is fully replaced by the scan.
// All health text, units, steps, limits and symptoms come from src/data (AGENTS.md rule),
// so the screen always matches the verified research.

const byId = Object.fromEntries(INDICATORS.map((i) => [i.id, i]));
const mood = byId.mood;
const emergencyName = Object.fromEntries(EMERGENCIES.map((e) => [e.id, e.name]));

const card = "rounded-xl border border-border bg-card p-3";

// How each engine band level is shown: always icon + text label + colour token.
const LEVEL_STYLE = {
  urgent: { label: "Urgent", Icon: OctagonAlert, colour: "var(--status-red)" },
  act: { label: "Act", Icon: TriangleAlert, colour: "var(--status-amber)" },
  watch: { label: "Watch", Icon: Eye, colour: "var(--status-amber)" },
};

const plainError = plainFieldError;

// A fresh form for each astronaut: switching crew in the header never carries one person's
// readings over to another.
function DailyCheckForCrew() {
  const { crewId } = useCrew();
  return <DailyCheck key={crewId} />;
}

// How each scan step is shown: always icon + text label + colour token (Inclusive Design).
const STEP_STYLE = {
  waiting: { label: "Waiting", Icon: CircleDashed, colour: "var(--status-nodata)" },
  reading: { label: "Reading…", Icon: LoaderCircle, colour: "var(--primary)" },
  checked: { label: "Checked", Icon: Check, colour: "var(--primary)" },
  saved: { label: "Checked and saved", Icon: Check, colour: "var(--status-steady)" },
  invalid: { label: "Check failed", Icon: TriangleAlert, colour: "var(--status-amber)" },
  save_error: { label: "Not saved", Icon: TriangleAlert, colour: "var(--status-red)" },
};

/** Pause between sensors while scanning (none when the person asks for reduced motion). */
const STEP_MS = 650;
const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** "120 / 80 mmHg", "7.25 h": one scanned reading for display. */
function readingText(r) {
  const unit = byId[r.indicatorId].unit;
  const vals = Object.values(r.parts).map((v) => formatValue(r.indicatorId, v));
  return `${vals.join(" / ")} ${unit}`;
}

function DailyCheck() {
  const [steps, setSteps] = useState({}); // sensorId → { state, result, attempt }
  const [scanning, setScanning] = useState(false);
  const [moodValue, setMoodValue] = useState(null);
  const [symptoms, setSymptoms] = useState([]);
  // `?guide=<indicator id>` (from search) opens that indicator's "How it's measured" guide.
  const guide = useSearchParams().get("guide");
  const guideId = guide && byId[guide] ? guide : null;
  const [focusId, setFocusId] = useState(guideId ?? "heartRate");
  const [lastGuide, setLastGuide] = useState(guideId);
  if (guideId !== lastGuide) {
    setLastGuide(guideId);
    if (guideId) setFocusId(guideId);
  }
  const [result, setResult] = useState(null);
  const [saveInfo, setSaveInfo] = useState(null); // { day, streak, what } after a successful save
  const [errors, setErrors] = useState([]);
  const { crewId, member } = useCrew();
  const { db, status, today, saveCheckIn } = useMissionData();
  const canSave = status === "ready" && today !== null;
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const focused = byId[focusId];
  const redFlags = SYMPTOMS.filter((s) => s.redFlag && symptoms.includes(s.id));
  const scanned = SCAN_SENSORS.filter((s) => steps[s.id]?.state && steps[s.id].state !== "waiting" && steps[s.id].state !== "reading");
  const scanDone = scanned.length === SCAN_SENSORS.length;
  const failed = SCAN_SENSORS.filter((s) => steps[s.id]?.state === "invalid");
  const unsaved = SCAN_SENSORS.filter((s) => steps[s.id]?.state === "save_error");

  // Saves record fields (validated first, src/lib/dailyRecord.js), then checks the whole of
  // today's record with the engine's red-limit check, using the previous days for streak bands.
  const persist = async (fields, what) => {
    setErrors([]);
    try {
      const saved = await saveCheckIn(crewId, fields);
      if (!alive.current) return false;
      if (!saved.ok) {
        setErrors(saved.errors);
        return false;
      }
      setResult(checkReading(saved.record, saved.history));
      setSaveInfo({ day: today, streak: checkInStreak(db.loadDailyRecords(crewId), today), what });
      return true;
    } catch (e) {
      if (alive.current) setErrors([`Couldn't save: ${e instanceof Error ? e.message : String(e)}`]);
      return false;
    }
  };

  // The scan: reads each simulated sensor in turn, validates it, then saves every valid reading.
  const startScan = async () => {
    if (!canSave || scanning) return;
    setScanning(true);
    setResult(null);
    setSaveInfo(null);
    setSteps(Object.fromEntries(SCAN_SENSORS.map((s) => [s.id, { state: "waiting", result: null, attempt: 0 }])));
    const delay = prefersReducedMotion() ? 0 : STEP_MS;
    const results = [];
    for (const sensor of SCAN_SENSORS) {
      if (!alive.current) return;
      setSteps((st) => ({ ...st, [sensor.id]: { ...st[sensor.id], state: "reading" } }));
      await wait(delay);
      if (!alive.current) return;
      const r = readSensor(crewId, today, sensor.id, { attempt: 0 });
      results.push(r);
      setSteps((st) => ({ ...st, [sensor.id]: { state: r.ok ? "checked" : "invalid", result: r, attempt: 0 } }));
    }
    const fields = scanToRecordFields(results);
    const saved = Object.keys(fields).length > 0 && await persist(fields, "Simulated sensor readings");
    if (!alive.current) return;
    setSteps((st) => Object.fromEntries(Object.entries(st).map(([id, step]) => [
      id,
      step.state === "checked" ? { ...step, state: saved ? "saved" : "save_error" } : step,
    ])));
    if (alive.current) setScanning(false);
  };

  // Retry one failed sensor (a retry always reads cleanly in the simulation) and save it.
  const retry = async (sensorId) => {
    const attempt = (steps[sensorId]?.attempt ?? 0) + 1;
    setSteps((st) => ({ ...st, [sensorId]: { ...st[sensorId], state: "reading" } }));
    await wait(prefersReducedMotion() ? 0 : STEP_MS);
    if (!alive.current) return;
    const r = readSensor(crewId, today, sensorId, { attempt });
    setSteps((st) => ({ ...st, [sensorId]: { state: r.ok ? "checked" : "invalid", result: r, attempt } }));
    if (!r.ok) return;
    const saved = await persist(scanToRecordFields([r]), "Simulated sensor reading");
    if (!alive.current) return;
    setSteps((st) => ({ ...st, [sensorId]: { ...st[sensorId], state: saved ? "saved" : "save_error" } }));
  };

  const toggleSymptom = (id) => {
    setSaveInfo(null);
    setSymptoms((list) => (list.includes(id) ? list.filter((s) => s !== id) : [...list, id]));
  };
  const clearOutcome = () => setSaveInfo(null);

  const saveCrewInput = () => {
    const fields = { [SYMPTOMS_FIELD]: symptoms };
    if (moodValue != null) fields[RECORD_FIELDS.mood.value] = moodValue;
    return persist(fields, "Mood and symptoms");
  };

  const readAloud = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const stepsText = focused.howToMeasure.map((s) => s.step).join(" ");
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(`${focused.name}. ${stepsText}`));
  };

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-3">
      <h1 className="flex flex-wrap items-baseline gap-x-2 text-xl font-bold">
        Daily check{" "}
        <span className="text-base font-normal text-muted-foreground">
          | {member.name}
          {today !== null && ` | Day ${today}`}
        </span>
        <span className="rounded-full border border-dashed px-2.5 py-0.5 text-sm font-semibold" style={{ borderColor: "var(--status-nodata)", color: "var(--status-nodata)" }}>
          Simulated sensors
        </span>
      </h1>
      <p className="mt-1 text-base text-muted-foreground">
        ATHENA reads your vitals from your sensors, checks them and saves them for you. You only add your mood and any symptoms.
      </p>

      <div className="mt-2 grid gap-2 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-2">
          <section className={card} aria-labelledby="scan-heading">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="scan-heading" className="text-base font-bold">
                Sensor scan
              </h2>
              <span className="text-sm text-muted-foreground">All readings are simulated for this demo.</span>
              <button
                type="button"
                onClick={startScan}
                disabled={!canSave || scanning}
                className={`ml-auto inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 text-base font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 ${focusRing}`}
              >
                <ScanLine aria-hidden="true" className="size-5" />
                {scanning ? "Scanning…" : scanned.length > 0 ? "Scan again" : "Start sensor scan"}
              </button>
            </div>

            <ol className="mt-2 grid auto-rows-fr gap-2 md:grid-cols-2" aria-label="Sensors">
              {SCAN_SENSORS.map((sensor) => {
                const step = steps[sensor.id] ?? { state: "waiting" };
                const { label, Icon, colour } = STEP_STYLE[step.state];
                const shown = step.result?.readings.filter((r) => r.status !== "not_measured") ?? [];
                const reason = step.result?.readings.find((r) => r.status === "invalid")?.reason;
                return (
                  <li key={sensor.id} className="flex flex-col gap-1 rounded-lg border bg-input/10 p-3" style={{ borderColor: step.state === "invalid" ? colour : "var(--border)" }}>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{sensor.name}</span>
                      <span className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-sm" style={{ borderColor: colour, color: colour }}>
                        <Icon aria-hidden="true" className={`size-4 ${step.state === "reading" ? "animate-spin motion-reduce:animate-none" : ""}`} />
                        {label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Reads {sensor.detail}</p>
                    {(["checked", "saved", "save_error"].includes(step.state)) && shown.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {shown.map((r) => (
                          <li key={r.indicatorId} className="text-base">
                            {byId[r.indicatorId].name}: <strong>{readingText(r)}</strong>{" "}
                            <span className="text-sm text-muted-foreground">(simulated)</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {(step.state === "invalid" || step.state === "save_error") && (
                      <>
                        <p className="text-sm">
                          {step.state === "invalid" ? `${reason} Nothing from this sensor was saved.` : "The readings passed their checks, but the database did not confirm the save."}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          <button type="button" onClick={() => retry(sensor.id)} disabled={scanning || step.state === "reading"} className={`inline-flex min-h-11 items-center gap-2 rounded-lg border border-input px-3 text-sm font-semibold hover:bg-accent disabled:opacity-50 ${focusRing}`}>
                            <RotateCcw aria-hidden="true" className="size-4" /> Retry sensor
                          </button>
                        </div>
                      </>
                    )}
                    <button type="button" onClick={() => setFocusId(sensor.indicators[0])} className={`mt-auto self-start rounded text-sm text-primary underline ${focusRing}`}>
                      How it&apos;s measured
                    </button>
                  </li>
                );
              })}
            </ol>

            <p role="status" aria-live="polite" className="mt-2 text-sm text-muted-foreground">
              {scanning
                ? `Scanning: ${scanned.length} of ${SCAN_SENSORS.length} sensors read.`
                : scanDone
                  ? failed.length > 0
                    ? `Scan finished. ${failed.length} ${failed.length === 1 ? "sensor needs" : "sensors need"} attention: retry the sensor.`
                    : unsaved.length > 0
                      ? `Scan finished, but ${unsaved.length} ${unsaved.length === 1 ? "sensor was" : "sensors were"} not saved. Retry to save again.`
                      : "Scan finished. Every reading passed its checks and was saved."
                  : "Press Start sensor scan. It takes a few seconds and needs nothing from you."}
            </p>
          </section>

          <section className={card} aria-labelledby="mood-heading">
            <h2 id="mood-heading" className="text-base font-bold">
              How is your mood today?
            </h2>
            <p className="mt-1 text-muted-foreground">{mood.glance}</p>
            <div className="mt-2 grid auto-rows-fr grid-cols-5 gap-2">
              {mood.scale.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={moodValue === value}
                  onFocus={() => setFocusId("mood")}
                  onClick={() => {
                    setMoodValue(value);
                    clearOutcome();
                  }}
                  className={`min-h-12 rounded-lg border px-2 py-2 text-center ${focusRing} ${
                    moodValue === value
                      ? "border-primary bg-primary/15"
                      : "border-input bg-input/30 hover:bg-accent"
                  }`}
                >
                  <span className="block text-base font-bold">{value}</span>
                  <span className="block text-sm text-muted-foreground">{label}</span>
                </button>
              ))}
            </div>
          </section>
          <section className={card} aria-labelledby="symptoms-heading">
            <h2 id="symptoms-heading" className="text-base font-bold">
              Any of these today?
            </h2>
            <div className="mt-2 grid auto-rows-fr gap-2 md:grid-cols-2 xl:grid-cols-3">
              {SYMPTOMS.map((s) => (
                <label
                  key={s.id}
                  className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-input bg-input/30 px-4 hover:bg-accent has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
                >
                  <input
                    type="checkbox"
                    checked={symptoms.includes(s.id)}
                    onChange={() => toggleSymptom(s.id)}
                    className="size-5 shrink-0 accent-primary outline-none"
                  />
                  <span>{s.name}</span>
                  {s.redFlag && (
                    <span className="ml-auto flex items-center gap-1 text-sm font-semibold text-destructive">
                      <TriangleAlert aria-hidden="true" className="size-4" />
                      Urgent
                    </span>
                  )}
                </label>
              ))}
            </div>

            {redFlags.length > 0 && (
              <div role="alert" className="mt-2 rounded-lg border-2 border-destructive p-3">
                <p className="flex items-center gap-2 text-base font-bold">
                  <TriangleAlert aria-hidden="true" className="size-5 text-destructive" />
                  Urgent: open the emergency guide now
                </p>
                <ul className="mt-2 space-y-2">
                  {redFlags.map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`/emergency?id=${s.emergencyId}`}
                        className={`inline-flex min-h-11 items-center rounded-lg bg-destructive px-4 font-semibold text-background hover:bg-destructive/90 ${focusRing}`}
                      >
                        {emergencyName[s.emergencyId]}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={saveCrewInput}
              disabled={!canSave}
              className={`min-h-11 rounded-lg bg-primary px-6 text-base font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 ${focusRing}`}
            >
              Save mood and symptoms
            </button>
            <p role="status" className="flex items-center gap-2 font-semibold">
              {saveInfo && (
                <>
                  <Check aria-hidden="true" className="size-5" style={{ color: "var(--status-steady)" }} />
                  {saveInfo.what} saved to {member.name}&apos;s record for day {saveInfo.day}. Check-in streak: {saveInfo.streak}{" "}
                  {saveInfo.streak === 1 ? "day" : "days"}.
                </>
              )}
            </p>
          </div>
          {status === "ready" && today === null && (
            <p className="text-muted-foreground">
              No mission data stored, so there&apos;s nothing to save to. Load the demo mission on the{" "}
              <Link href="/crew" className={`rounded text-primary underline ${focusRing}`}>
                Crew page
              </Link>
              .
            </p>
          )}
          {errors.length > 0 && (
            <div role="alert" className="rounded-lg border-2 border-destructive p-3">
              <p className="flex items-center gap-2 font-semibold">
                <TriangleAlert aria-hidden="true" className="size-5 text-destructive" />
                Not saved. Please check:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-6">
                {errors.map((e) => (
                  <li key={e}>{plainError(e)}</li>
                ))}
              </ul>
            </div>
          )}
          {result && (
            <section className={card} aria-labelledby="result-heading">
              <h2 id="result-heading" className="text-base font-bold">
                Today&apos;s result
              </h2>
              {result.length === 0 ? (
                <p className="mt-2 flex items-center gap-2 text-base">
                  <Check aria-hidden="true" className="size-5" style={{ color: "var(--status-steady)" }} />
                  No flags on today&apos;s readings. Trends are checked against your own baseline over the coming days.
                </p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {result.map((r) => {
                    const { label, Icon, colour } = LEVEL_STYLE[r.level];
                    return (
                      <li key={r.indicatorId} className="rounded-lg border border-border p-3" style={{ borderColor: colour }}>
                        <p className="flex flex-wrap items-center gap-2 text-base font-semibold">
                          <span className="flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-sm" style={{ borderColor: colour, color: colour }}>
                            <Icon aria-hidden="true" className="size-4" />
                            {label}
                          </span>
                          {byId[r.indicatorId].name}: {r.label}
                        </p>
                        <p className="mt-1 text-muted-foreground">{r.rule}</p>
                        <p className="mt-2">{r.action}</p>
                        {r.emergencyId && (
                          <Link
                            href={`/emergency?id=${r.emergencyId}`}
                            className={`mt-2 inline-flex min-h-11 items-center rounded-lg bg-destructive px-4 font-semibold text-background hover:bg-destructive/90 ${focusRing}`}
                          >
                            Open: {emergencyName[r.emergencyId]}
                          </Link>
                        )}
                        <p className="mt-2 text-sm text-muted-foreground">
                          {r.basisLabel}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
              <p className="mt-2 text-sm text-muted-foreground">Not medical advice. The flight surgeon makes every medical decision.</p>
            </section>
          )}
        </div>

        <aside className={`${card} h-fit lg:sticky lg:top-4`} aria-live="polite">
          <p className="text-sm uppercase tracking-wider text-muted-foreground">How it&apos;s measured</p>
          <h2 className="mt-2 text-base font-bold">{focused.name}</h2>
          <p className="mt-1 text-muted-foreground">{focused.glance}</p>

          {focused.howToMeasure.length > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">Reference steps for checking this measurement:</p>
          )}
          {focused.howToMeasure.length > 0 && (
            <ol className="mt-2 list-decimal space-y-2 pl-5 text-base">
              {focused.howToMeasure.map((s) => (
                <li key={s.step}>{s.step}</li>
              ))}
            </ol>
          )}
          {focused.spaceNote && <p className="mt-2 text-muted-foreground">{focused.spaceNote}</p>}

          <p className="mt-2 text-sm text-muted-foreground">
            Ranges are general clinical reference ranges, not NASA flight standards. Not medical advice.
          </p>

          {focused.howToMeasure.length > 0 && (
            <button
              type="button"
              onClick={readAloud}
              className={`mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-input hover:bg-accent ${focusRing}`}
            >
              <Volume2 aria-hidden="true" className="size-5" />
              Read these steps aloud
            </button>
          )}
        </aside>
      </div>
    </main>
  );
}

export default function DailyCheckPage() {
  return (
    <Suspense fallback={<main className="mx-auto w-full max-w-7xl flex-1 px-4 py-3"><h1 className="text-xl font-bold">Daily check</h1></main>}>
      <DailyCheckForCrew />
    </Suspense>
  );
}
