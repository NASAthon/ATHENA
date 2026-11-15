import Link from "next/link";
import { ArrowRight, FlaskConical, RotateCcw } from "lucide-react";
import MissionDataPanel from "@/components/MissionDataPanel";
import { focusRing } from "@/lib/ui";

export default function DemoPage() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-3">
      <h1 className="text-xl font-bold">Demo tools</h1>
      <p className="mt-2 text-muted-foreground">
        Prepare ATHENA for a demonstration, restore a backup, or test how the health engine responds to a simulated event.
      </p>

      <section className="mt-2 grid gap-2 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]" aria-label="Demo options">
        <MissionDataPanel />

        <article className="flex flex-col rounded-xl border border-border bg-card p-3">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <FlaskConical className="size-5" aria-hidden="true" /> Scenario Lab
          </h2>
          <p className="mt-1 flex-1 text-muted-foreground">
            Inject a simulated health event into a copy of the mission and compare ATHENA&apos;s alerts before and after. Crew records are not changed.
          </p>
          <Link
            href="/scenario-lab"
            className={`mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-input px-4 font-semibold hover:bg-accent ${focusRing}`}
          >
            Open Scenario Lab <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </article>
      </section>

      <aside className="mt-2 flex items-start gap-2 rounded-xl border border-border p-3 text-sm text-muted-foreground">
        <RotateCcw className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        Loading the demo mission replaces locally stored checks, exam results and simulated communication history after confirmation. It does not affect GitHub or the hosted site.
      </aside>
    </main>
  );
}
