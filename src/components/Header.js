import Link from "next/link";
import HeaderLogo from "@/components/HeaderLogo";
import { TriangleAlert } from "lucide-react";
import CrewSwitcher from "@/components/CrewSwitcher";
import MissionStatus from "@/components/MissionStatus";
import NavLinks from "@/components/NavLinks";
import SearchBox from "@/components/SearchBox";
import LiveChip from "@/components/LiveChip";
import { focusRing } from "@/lib/ui";

export default function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl space-y-3 px-4 py-4 xl:max-w-none xl:space-y-2 xl:px-3 xl:py-2">
        {/* Left: the controls row and the nav row. Right: one tall Emergency button spanning both rows. */}
        <div className="flex flex-col gap-3 md:flex-row md:items-stretch">
          <div className="min-w-0 flex-1 space-y-3 xl:space-y-0">
            <div className="flex flex-wrap items-center gap-3 xl:flex-nowrap xl:gap-2">
              <HeaderLogo />

              <SearchBox />

              <MissionStatus />

              <CrewSwitcher />

              <LiveChip />
            </div>

            <nav aria-label="Main" className="xl:hidden">
              <NavLinks />
            </nav>
          </div>

          <Link
            href="/emergency"
            className={`flex min-h-12 flex-none items-center justify-center gap-2 rounded-xl bg-destructive px-6 text-lg font-bold text-background hover:bg-destructive/90 md:flex-col md:gap-1 xl:hidden ${focusRing}`}
          >
            <TriangleAlert aria-hidden="true" className="size-6 md:size-8" /> Emergency
          </Link>
        </div>
      </div>
    </header>
  );
}
