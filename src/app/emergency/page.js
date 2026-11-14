"use client";

// Emergency screen (CHECKLIST §3 › Alerts and guidance; DECISIONS › Inclusive Design: "Emergency mode:
// very few, very large controls, one step on screen at a time").
// - /emergency            the guides, most urgent first
// - /emergency?id=<guide> one guide: who needs help (works for a crewmate), signs, ONE step at a time
//   with its "why" and source, read aloud, note the time, record vitals, and when to contact the
//   flight surgeon with the Earth-link delay for the current mission mode.
// All step text and sources come from src/data/emergencies.js (NASA first, otherwise AHA/CDC/ADA in
// our own words). Not medical advice; no medicines, doses or diagnoses.

import { Suspense, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, OctagonAlert, Radio, RotateCcw, TriangleAlert, Volume2 } from "lucide-react";
import { EMERGENCIES, INDICATORS, SYMPTOMS } from "@/data";
import { adviceForMode } from "@/lib/engine";
import { CREW } from "@/lib/crew";
import { useCrew } from "@/components/CrewProvider";
import { useMissionMode } from "@/components/MissionModeProvider";
import { useTodayEvaluation } from "@/components/useTodayEvaluation";
import EmergencyVitals from "@/components/EmergencyVitals";
import { focusRing } from "@/lib/ui";

const guideById = Object.fromEntries(EMERGENCIES.map((e) => [e.id, e]));
const indicatorName = Object.fromEntries(INDICATORS.map((i) => [i.id, i.name]));
const symptomById = Object.fromEntries(SYMPTOMS.map((s) => [s.id, s]));
const GUIDES_BY_PRIORITY = [...EMERGENCIES].sort((a, b) => a.priority - b.priority);
const card = "rounded-2xl border border-border bg-card p-6";
const bigButton = `inline-flex min-h-16 items-center justify-center gap-2 rounded-xl px-6 text-xl font-semibold ${focusRing}`;

function speak(text) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}

const NotAdvice = () => (
  <p className="text-muted-foreground">
    First-response guidance from cited sources, written in plain English. Not medical advice: the flight surgeon makes every
    medical decision. No medicines or doses are given here.
  </p>
);

/** The list of guides (no ?id). */
function GuideList() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      <h1 className="flex items-center gap-3 text-4xl font-bold">
        <OctagonAlert className="size-9" aria-hidden="true" style={{ color: "var(--status-red)" }} />
        Emergency guides
      </h1>
      <div className="mt-2 text-lg">
        <NotAdvice />
      </div>
      <p className="mt-4 text-lg">Pick what you see. Not sure? Type the symptom in the search bar (e.g. &ldquo;can&apos;t breathe&rdquo;).</p>
      <ul className="mt-6 grid gap-3 md:grid-cols-2">
        {GUIDES_BY_PRIORITY.map((g) => (
          <li key={g.id}>
            <Link
              href={`/emergency?id=${g.id}`}
              className={`flex min-h-20 flex-col justify-center rounded-xl border-2 border-border bg-card px-5 py-3 hover:bg-accent ${focusRing}`}
            >
              <span className="flex items-center gap-2 text-xl font-semibold">
                <OctagonAlert className="size-5 shrink-0" aria-hidden="true" style={{ color: "var(--status-red)" }} />
                {g.name}
              </span>
              <span className="mt-1 text-muted-foreground">{g.glance}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

/** One guide, one step at a time. Keyed by guide id, so switching guides starts at step 1. */
function Guide({ guide }) {
  const router = useRouter();
  const { crewId, setCrewId, member } = useCrew();
  const { modeId, mode } = useMissionMode();
  const { evaluation, record } = useTodayEvaluation();
  const [step, setStep] = useState(0);
  const [times, setTimes] = useState([]);
  const stepHeading = useRef(null);
  // Move keyboard focus to the heading after the step view changes, so focus is never lost.
  const goTo = (next) => {
    setStep(next);
    requestAnimationFrame(() => stepHeading.current?.focus());
  };

  const total = guide.steps.length;
  const finished = step >= total;
  const current = guide.steps[Math.min(step, total - 1)];
  const advice = adviceForMode(modeId);
  const link = advice.earthLink;
  const redLimits = evaluation?.limitBreaches.filter((b) => b.redLimit) ?? [];
  // Other guides suggested by symptoms ticked today (e.g. chest pain while on the blood-pressure guide).
  const related = [...new Set((record?.symptoms ?? []).map((id) => symptomById[id]).filter((s) => s?.emergencyId && s.emergencyId !== guide.id && guideById[s.emergencyId]))];

  const noteTime = () => setTimes((t) => [...t, new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })]);

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
      <Link href="/emergency" className={`inline-flex min-h-11 items-center gap-1 rounded text-primary hover:underline ${focusRing}`}>
        <ArrowLeft className="size-4" aria-hidden="true" /> All emergency guides
      </Link>
      <h1 className="mt-2 flex items-start gap-3 text-4xl font-bold">
        <OctagonAlert className="mt-1 size-9 shrink-0" aria-hidden="true" style={{ color: "var(--status-red)" }} />
        {guide.name}
      </h1>
      <p className="mt-2 text-xl">{guide.glance}</p>

      {/* Who needs help: works for yourself or a crewmate. Also switches the whole app to them. */}
      <fieldset className="mt-6">
        <legend className="text-lg font-semibold">Who needs help?</legend>
        <div className="mt-2 flex flex-wrap gap-3">
          {CREW.map((m) => {
            const selected = m.id === crewId;
            return (
              <button
                key={m.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setCrewId(m.id)}
                className={`min-h-14 rounded-xl border-2 px-5 text-lg font-semibold ${focusRing} ${selected ? "border-primary bg-accent" : "border-border bg-card hover:bg-accent/60"}`}
              >
                {m.name}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-muted-foreground">Helping a crewmate? Pick them, then follow the steps for them and record their vitals below.</p>
      </fieldset>

      {redLimits.length > 0 && (
        <p className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border-2 px-4 py-3 text-lg font-semibold" style={{ borderColor: "var(--status-red)" }}>
          <OctagonAlert className="size-5" aria-hidden="true" style={{ color: "var(--status-red)" }} />
          {member.name} today: {redLimits.map((r) => `${indicatorName[r.indicatorId]}: ${r.label}`).join("; ")}
        </p>
      )}

      {related.length > 0 && (
        <div className="mt-4 rounded-lg border-2 border-border px-4 py-3">
          <p className="text-lg font-semibold">Also reported today by {member.name}:</p>
          <ul className="mt-2 flex flex-wrap gap-3">
            {related.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/emergency?id=${s.emergencyId}`}
                  className={`inline-flex min-h-12 items-center gap-2 rounded-lg bg-destructive px-4 font-semibold text-background hover:bg-destructive/90 ${focusRing}`}
                >
                  <TriangleAlert className="size-5" aria-hidden="true" />
                  {s.name}: open {guideById[s.emergencyId].name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="space-y-6">
          {/* The step */}
          <section aria-labelledby="step-heading" className="rounded-2xl border-2 p-6" style={{ borderColor: "var(--status-red)" }}>
            {finished ? (
              <div aria-live="polite">
                <h2 id="step-heading" ref={stepHeading} tabIndex={-1} className="rounded text-3xl font-bold outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  All {total} steps done
                </h2>
                <p className="mt-3 text-xl">
                  Stay with {member.name}, keep recording their vitals, and follow the flight surgeon&apos;s advice.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/summary" className={`${bigButton} bg-primary text-primary-foreground hover:bg-primary/90`}>
                    Summary for the flight surgeon
                  </Link>
                  <button type="button" onClick={() => goTo(0)} className={`${bigButton} border border-input hover:bg-accent`}>
                    <RotateCcw className="size-5" aria-hidden="true" /> Start again
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-lg font-semibold text-muted-foreground">
                    Step {step + 1} of {total}
                  </p>
                  <ol className="flex gap-1.5" aria-hidden="true">
                    {guide.steps.map((_, i) => (
                      <li key={i} className={`h-2.5 w-6 rounded-full ${i <= step ? "bg-primary" : "bg-border"}`} />
                    ))}
                  </ol>
                </div>
                <div aria-live="polite">
                  <h2 id="step-heading" ref={stepHeading} tabIndex={-1} className="mt-3 rounded text-3xl font-bold leading-snug outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {current.text}
                  </h2>
                  <p className="mt-4 text-xl">
                    <span className="font-semibold">Why: </span>
                    {current.why}
                  </p>
                </div>
                {current.adaptation && (
                  <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span className="rounded border border-dashed border-border px-1.5 py-0.5">ATHENA&apos;s adaptation for spaceflight</span>
                  </p>
                )}
                {current.nextEmergencyId && guideById[current.nextEmergencyId] && (
                  <button
                    type="button"
                    onClick={() => router.push(`/emergency?id=${current.nextEmergencyId}`)}
                    className={`${bigButton} mt-5 w-full bg-destructive text-background hover:bg-destructive/90`}
                  >
                    <TriangleAlert className="size-5" aria-hidden="true" /> Switch to: {guideById[current.nextEmergencyId].name}
                  </button>
                )}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => (step === 1 ? goTo(0) : setStep(Math.max(0, step - 1)))}
                    disabled={step === 0}
                    className={`${bigButton} border border-input hover:bg-accent disabled:opacity-40`}
                  >
                    <ArrowLeft className="size-6" aria-hidden="true" /> Back
                  </button>
                  <button type="button" onClick={() => (step + 1 === total ? goTo(total) : setStep(step + 1))} className={`${bigButton} bg-primary text-primary-foreground hover:bg-primary/90`}>
                    {step + 1 === total ? "Done" : "Next step"} <ArrowRight className="size-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => speak(`Step ${step + 1}. ${current.text} Why: ${current.why}`)}
                    className={`inline-flex min-h-12 items-center gap-2 rounded-lg border border-input px-4 hover:bg-accent ${focusRing}`}
                  >
                    <Volume2 className="size-5" aria-hidden="true" /> Read this step aloud
                  </button>
                  <button
                    type="button"
                    onClick={noteTime}
                    className={`inline-flex min-h-12 items-center gap-2 rounded-lg border border-input px-4 hover:bg-accent ${focusRing}`}
                  >
                    <Clock className="size-5" aria-hidden="true" /> Note the time
                  </button>
                </div>
              </>
            )}
            {times.length > 0 && (
              <p role="status" className="mt-4 text-lg">
                Times noted: {times.join(", ")}
              </p>
            )}
          </section>

          <section aria-labelledby="vitals-heading" className={card}>
            <h2 id="vitals-heading" className="text-2xl font-bold">
              Record vitals
            </h2>
            <div className="mt-2">
              <EmergencyVitals key={crewId} astronautId={crewId} astronautName={member.name} currentGuideId={guide.id} />
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section aria-labelledby="ground-heading" className="rounded-2xl border-2 p-6" style={{ borderColor: "var(--status-amber)" }}>
            <h2 id="ground-heading" className="flex items-center gap-2 text-2xl font-bold">
              <Radio className="size-6" aria-hidden="true" /> Contact the flight surgeon
            </h2>
            <p className="mt-3 text-lg">
              {mode.name}: reply expected <span className="font-semibold">{link ? link.replyText : "after an unknown delay"}</span>.
            </p>
            <p className="mt-2">{advice.glance}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {advice.basisLabel}
            </p>
            <Link href="/summary" className={`mt-4 inline-flex min-h-12 items-center rounded-lg border border-input px-4 font-semibold hover:bg-accent ${focusRing}`}>
              Open the summary to send
            </Link>
          </section>

          <section aria-labelledby="signs-heading" className={card}>
            <h2 id="signs-heading" className="text-2xl font-bold">
              Signs to look for
            </h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-lg">
              {guide.signs.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>

          <details className={card}>
            <summary className={`flex min-h-11 cursor-pointer items-center rounded text-lg font-semibold ${focusRing}`}>All steps at once</summary>
            <ol className="mt-3 list-decimal space-y-3 pl-5">
              {guide.steps.map((s, i) => (
                <li key={i}>
                  <button type="button" onClick={() => goTo(i)} className={`min-h-11 rounded text-left underline-offset-2 hover:underline ${focusRing}`}>
                    {s.text}
                  </button>
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={() => speak(guide.steps.map((s, i) => `Step ${i + 1}. ${s.text}`).join(" "))}
              className={`mt-4 inline-flex min-h-12 items-center gap-2 rounded-lg border border-input px-4 hover:bg-accent ${focusRing}`}
            >
              <Volume2 className="size-5" aria-hidden="true" /> Read all steps aloud
            </button>
          </details>

          <div className="text-sm">
            <NotAdvice />
          </div>
        </aside>
      </div>
    </main>
  );
}

function EmergencyPage() {
  const id = useSearchParams().get("id");
  const guide = id ? guideById[id] : null;
  if (!guide) return <GuideList />;
  return <Guide key={guide.id} guide={guide} />;
}

export default function Page() {
  return (
    <Suspense fallback={<main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8"><h1 className="text-4xl font-bold">Emergency guides</h1></main>}>
      <EmergencyPage />
    </Suspense>
  );
}
