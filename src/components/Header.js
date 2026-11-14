import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import CrewSwitcher from "@/components/CrewSwitcher";
import MissionStatus from "@/components/MissionStatus";
import NavLinks from "@/components/NavLinks";
import AlertBanner from "@/components/AlertBanner";
import { focusRing } from "@/lib/ui";

export default function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl space-y-3 px-4 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/" className={`rounded-md text-2xl font-bold tracking-[0.3em] ${focusRing}`}>
            ATHENA
          </Link>

          <div className="min-w-[14rem] flex-1">
            <label htmlFor="search" className="sr-only">
              Search
            </label>
            <input
              id="search"
              type="search"
              placeholder="Search readings, symptoms, guides (e.g. dizzy, BP, can't sleep)"
              className={`min-h-12 w-full rounded-lg border border-input bg-input/30 px-4 text-base placeholder:text-muted-foreground ${focusRing}`}
            />
          </div>

          <CrewSwitcher />

          <Link
            href="/emergency"
            className={`flex min-h-12 items-center gap-2 rounded-lg bg-destructive px-4 font-semibold text-background hover:bg-destructive/90 ${focusRing}`}
          >
            <TriangleAlert aria-hidden="true" className="size-5" /> Emergency
          </Link>
        </div>

        <MissionStatus />

        <nav aria-label="Main">
          <NavLinks />
        </nav>

        <AlertBanner />
      </div>
    </header>
  );
}
