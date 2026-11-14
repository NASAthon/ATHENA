import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import CrewSwitcher from "@/components/CrewSwitcher";
import MissionStatus from "@/components/MissionStatus";
import NavLinks from "@/components/NavLinks";
import AlertBanner from "@/components/AlertBanner";
import SearchBox from "@/components/SearchBox";
import { focusRing } from "@/lib/ui";

export default function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl space-y-3 px-4 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/" className={`inline-flex min-h-11 items-center rounded-md text-2xl font-bold tracking-[0.3em] ${focusRing}`}>
            ATHENA
          </Link>

          <SearchBox />

          <MissionStatus />

          <CrewSwitcher />

          <Link
            href="/emergency"
            className={`flex min-h-12 items-center gap-2 rounded-lg bg-destructive px-4 font-semibold text-background hover:bg-destructive/90 ${focusRing}`}
          >
            <TriangleAlert aria-hidden="true" className="size-5" /> Emergency
          </Link>
        </div>

        <nav aria-label="Main">
          <NavLinks />
        </nav>

        <AlertBanner />
      </div>
    </header>
  );
}
