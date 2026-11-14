import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import CrewSwitcher from "@/components/CrewSwitcher";
import NavLinks from "@/components/NavLinks";

// Shared keyboard focus style (inclusive design: always show where focus is).
const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export default function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <Link href="/" className={`rounded-md text-xl font-bold tracking-wide ${focusRing}`}>
          ATHENA
        </Link>

        <div className="min-w-[12rem] flex-1">
          <label htmlFor="search" className="sr-only">
            Search
          </label>
          <input
            id="search"
            type="search"
            placeholder="Search, e.g. chest pain or heart rate"
            className={`min-h-11 w-full rounded-lg border border-input bg-input/30 px-3 text-base placeholder:text-muted-foreground ${focusRing}`}
          />
        </div>

        <CrewSwitcher />

        <Link
          href="/emergency"
          className={`flex min-h-11 items-center gap-2 rounded-lg bg-destructive px-4 font-semibold text-background hover:bg-destructive/90 ${focusRing}`}
        >
          <TriangleAlert aria-hidden="true" className="size-5" /> Emergency
        </Link>
      </div>

      <nav aria-label="Main" className="mx-auto max-w-6xl px-4 pb-3">
        <NavLinks />
      </nav>
    </header>
  );
}
