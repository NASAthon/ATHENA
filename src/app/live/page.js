"use client";

// Live Monitor (docs/DECISIONS.md › Always-On Live Monitoring; layout from the Live Monitor mockup).
// Always on: ATHENA evaluates every new reading of each astronaut's SIMULATED sensor feed as the
// mission clock moves (useLive). No crew input needed. Also the home of the measurement guides
// (`?guide=<indicator id>`, from search and from each tile).

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Info, OctagonAlert, Radio, Volume2, X } from "lucide-react";
import { INDICATORS } from "@/data";
import { adviceForMode } from "@/lib/engine";
import { useLive } from "@/components/LiveProvider";
import { useMissionMode } from "@/components/MissionModeProvider";
import { LIVE_STYLE, LiveStateBadge } from "@/components/LiveUI";
import LiveWaveform from "@/components/LiveWaveform";
import { CREW } from "@/lib/crew";
import { LIVE_MEASURES, RULES, timeText } from "@/lib/live/stream";
import { focusRing } from "@/lib/ui";

const byId = Object.fromEntries(INDICATORS.map((i) => [i.id, i]));
const crewById = Object.fromEntries(CREW.map((m) => [m.id, m]));
const ORDER = { critical: 0, deteriorating: 1, fluctuating: 2, no_data: 3, stable: 4 };
const card = "rounded-xl border border-border bg-card p-3";

const TILE_NOTE = {
  stable: "Within own normal",
  fluctuating: "Short change, not sustained",
  deteriorating: `Outside own normal for ${RULES.deteriorateAfter}+ min`,
  critical: "Red limit",
  no_data: "No data: unknown, not fine",
};

// The tile's live chart, bedside-monitor style (illustrative, drawn from the live rate; see
// src/components/LiveWaveform.js): which waveform each measurement shows, and at what rate.
const hr = (snap) => snap.measures.heartRate.reading?.heartRate ?? null;
const WAVEFORM = {
  heartRate: { kind: "ecg", rate: hr },
  bloodPressure: { kind: "arterial", rate: (snap) => (snap.measures.bloodPressure.reading ? hr(snap) : null) },
  spo2: { kind: "pleth", rate: (snap) => (snap.measures.spo2.reading ? hr(snap) : null) },
  breathing: { kind: "resp", rate: (snap) => snap.measures.breathing.reading?.breathing ?? null },
  skinTemp: { kind: "level", rate: (snap) => (snap.measures.skinTemp.reading ? 6 : null) },
};

function Tile({ measure, snap, onGuide }) {
  const m = snap.measures[measure.id];
  const style = LIVE_STYLE[m.state];
  const highlight = m.state !== "stable";
  const note = snap.exercise && m.state === "fluctuating" ? "Exercise (equipment log): not a concern" : TILE_NOTE[m.state];
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-xl border bg-background p-3" style={{ borderColor: highlight ? style.colour : "var(--border)" }}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm text-muted-foreground">{measure.name}</span>
        {highlight && <LiveStateBadge state={m.state} />}
      </div>
      <p className="text-xl font-bold">
        {m.reading ? m.text.replace(` ${measure.unit}`, "") : "—"}{" "}
        <span className="text-sm font-normal text-muted-foreground">{measure.unit}</span>
      </p>
      <LiveWaveform
        kind={WAVEFORM[measure.id]?.kind ?? "level"}
        rate={WAVEFORM[measure.id]?.rate(snap) ?? null}
        colour={highlight ? style.colour : "var(--status-steady)"}
      />
      <p className="text-xs" style={{ color: highlight ? style.colour : "var(--muted-foreground)" }}>
        {note}
      </p>
      {byId[measure.id] && (
        <button type="button" onClick={() => onGuide(measure.id)} className={`mt-auto self-start rounded text-sm text-primary underline ${focusRing}`}>
          How it&apos;s measured
        </button>
      )}
    </div>
  );
}

function CrewRow({ member, snap, replyText, onGuide }) {
  const style = LIVE_STYLE[snap.overall];
  const strong = snap.overall === "critical" || snap.overall === "deteriorating";
  const confColour = { High: "var(--status-steady)", Medium: "var(--status-amber)", Low: "var(--status-red)" }[snap.confidence.level];
  const critical = [...snap.events].reverse().find((e) => e.state === "critical" && e.emergencyId);
  return (
    <section aria-label={member.name} className="flex flex-col gap-2 rounded-2xl bg-card p-3" style={{ border: `${strong ? 2 : 1}px solid ${strong ? style.colour : "var(--border)"}` }}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h2 className="text-base font-bold">
          {member.name} <span className="font-normal text-muted-foreground">| {member.role}</span>
        </h2>
        <LiveStateBadge state={snap.overall} size="lg" />
        <span className="text-sm text-muted-foreground">
          Confidence: <strong style={{ color: confColour }}>{snap.confidence.level}</strong>
        </span>
        <span className="text-sm text-muted-foreground sm:ml-auto">{snap.sensor}</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {LIVE_MEASURES.map((measure) => (
          <Tile key={measure.id} measure={measure} snap={snap} onGuide={onGuide} />
        ))}
      </div>
      {snap.overall === "critical" && critical && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-accent px-3 py-2">
          <Radio aria-hidden="true" className="size-4 shrink-0 text-primary" />
          <span className="min-w-0 flex-1 basis-64">
            Summary queued for the flight surgeon at {timeText(critical.minute)}. <strong>{replyText}</strong> Act now; don&apos;t wait for Earth.
          </span>
          <Link
            href={`/emergency?id=${critical.emergencyId}`}
            className={`inline-flex min-h-11 items-center gap-2 rounded-lg bg-destructive px-4 font-bold text-background hover:bg-destructive/90 ${focusRing}`}
          >
            <OctagonAlert aria-hidden="true" className="size-4" /> Open emergency guide
          </Link>
        </div>
      )}
      {snap.overall !== "critical" && snap.request && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-accent px-3 py-2">
          <Info aria-hidden="true" className="size-4 shrink-0" style={{ color: "var(--status-amber)" }} />
          <span className="min-w-0 flex-1 basis-64">
            ATHENA requested an extra check at {timeText(snap.request.minute)}: <strong>cuff blood pressure now</strong>.
          </span>
          <Link href="/today#extra-check" className={`inline-flex min-h-11 items-center rounded-lg border border-input px-4 font-semibold hover:bg-background/40 ${focusRing}`}>
            Record cuff reading
          </Link>
        </div>
      )}
    </section>
  );
}

function Feed({ live }) {
  const shown = live.events.slice(0, 30);
  return (
    <section aria-labelledby="feed-heading" className={card}>
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="feed-heading" className="text-base font-bold">
          Alert feed
        </h2>
        <span className="text-sm text-muted-foreground">newest first</span>
      </div>
      {shown.length === 0 ? (
        <p className="mt-2 text-muted-foreground">Nothing yet today: every reading so far is within its own normal.</p>
      ) : (
        <ol className="mt-1" aria-live="polite">
          {shown.map((e, i) => {
            const style = LIVE_STYLE[e.state] ?? LIVE_STYLE.stable;
            return (
              <li key={`${e.minute}-${e.astronautId}-${e.measureId}-${i}`} className="flex gap-2 border-t border-border py-2">
                <style.Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" style={{ color: style.colour }} />
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">{timeText(e.minute)}</strong> | {e.astronautId ? crewById[e.astronautId].name : "Whole crew"} |{" "}
                    <span className="font-semibold" style={{ color: style.colour }}>
                      {e.request ? "Extra check" : style.label}
                    </span>
                  </p>
                  <p className="text-sm">{e.text}</p>
                  <p className="text-xs text-muted-foreground">
                    <strong>Why:</strong> {e.why}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

function Guide({ id, onClose }) {
  const g = byId[id];
  if (!g) return null;
  const readAloud = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(`${g.name}. ${g.howToMeasure.map((s) => s.step).join(" ")}`));
  };
  return (
    <section aria-labelledby="guide-heading" className={card}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm uppercase tracking-wider text-muted-foreground">How it&apos;s measured</p>
          <h2 id="guide-heading" className="text-base font-bold">
            {g.name}
          </h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Close the measurement guide" className={`inline-flex size-11 items-center justify-center rounded-lg hover:bg-accent ${focusRing}`}>
          <X aria-hidden="true" className="size-5" />
        </button>
      </div>
      <p className="mt-1 text-muted-foreground">{g.glance}</p>
      {g.howToMeasure.length > 0 && (
        <>
          <p className="mt-2 text-sm text-muted-foreground">Sensors usually do this for you. To measure by hand:</p>
          <ol className="mt-1 list-decimal space-y-1 pl-5">
            {g.howToMeasure.map((s) => (
              <li key={s.step}>{s.step}</li>
            ))}
          </ol>
          <button type="button" onClick={readAloud} className={`mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-input hover:bg-accent ${focusRing}`}>
            <Volume2 aria-hidden="true" className="size-5" /> Read these steps aloud
          </button>
        </>
      )}
      {g.spaceNote && <p className="mt-2 text-sm text-muted-foreground">{g.spaceNote}</p>}
      <p className="mt-2 text-xs text-muted-foreground">Ranges are general clinical reference ranges, not NASA flight standards. Not medical advice.</p>
    </section>
  );
}

function LiveMonitor() {
  const live = useLive();
  const { modeId } = useMissionMode();
  const params = useSearchParams();
  const router = useRouter();
  const guideId = params.get("guide");
  const setGuide = (id) => router.replace(id ? `/live?guide=${id}` : "/live", { scroll: false });

  if (!live.active) {
    return (
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-3">
        <h1 className="text-xl font-bold">Live Monitor</h1>
        <p className="mt-2 text-muted-foreground">
          No mission data stored, so there is no sensor feed to show. Load the demo mission on the{" "}
          <Link href="/crew" className={`rounded text-primary underline ${focusRing}`}>
            Crew page
          </Link>
          .
        </p>
        {guideId && (
          <div className="mt-3 max-w-xl">
            <Guide id={guideId} onClose={() => setGuide(null)} />
          </div>
        )}
      </main>
    );
  }

  const replyText = `${adviceForMode(modeId).earthLink?.replyText ? `Reply expected ${adviceForMode(modeId).earthLink.replyText}.` : ""}`;
  const crew = [...CREW].sort((a, b) => ORDER[live.crew[a.id].overall] - ORDER[live.crew[b.id].overall]);

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-3 2xl:max-w-none">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="text-xl font-bold">
          Live Monitor{" "}
          <span className="text-base font-normal text-muted-foreground">
            | All crew | Day {live.day} | {live.time}
          </span>
        </h1>
        <span className="rounded-full border border-dashed px-2.5 py-0.5 text-sm font-semibold" style={{ borderColor: "var(--status-nodata)", color: "var(--status-nodata)" }}>
          Simulated sensor feed
        </span>
        <span className="text-sm text-muted-foreground">
          Always on: ATHENA checks every new reading the moment it arrives.
          {live.paused && " The feed is paused (Crew page › Demo controls)."}
        </span>
      </div>

      <div className="mt-2 grid items-start gap-2 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-2">
          {crew.map((m) => (
            <CrewRow key={m.id} member={m} snap={live.crew[m.id]} replyText={replyText} onGuide={setGuide} />
          ))}
          <section aria-labelledby="decides-heading" className={card}>
            <h2 id="decides-heading" className="text-base font-bold">
              How ATHENA decides{" "}
              <span className="font-normal text-muted-foreground">| each reading is judged against that astronaut&apos;s own normal</span>
            </h2>
            <dl className="mt-2 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {[
                ["stable", "Inside own normal band; the 15-minute average is near the baseline"],
                ["fluctuating", "Short changes that recover, or a logged exercise session"],
                ["deteriorating", `The 15-minute average stays outside the own band for ${RULES.deteriorateAfter}+ minutes`],
                ["critical", "Any reading in a red limit: fires on the first reading"],
                ["no_data", "Sensor not worn or no signal: never counted as fine"],
              ].map(([state, text]) => (
                <div key={state}>
                  <dt>
                    <LiveStateBadge state={state} />
                  </dt>
                  <dd className="mt-1 text-sm text-muted-foreground">{text}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-2 text-xs text-muted-foreground">
              Band widths and timings are ATHENA design choices for the simulation, not NASA values. Not medical advice.
            </p>
          </section>
        </div>
        <aside className="space-y-2 lg:sticky lg:top-4">
          {guideId && <Guide id={guideId} onClose={() => setGuide(null)} />}
          <Feed live={live} />
        </aside>
      </div>
    </main>
  );
}

export default function LiveMonitorPage() {
  return (
    <Suspense fallback={<main className="mx-auto w-full max-w-7xl flex-1 px-4 py-3"><h1 className="text-xl font-bold">Live Monitor</h1></main>}>
      <LiveMonitor />
    </Suspense>
  );
}
