"use client";

import Link from "next/link";
import { useSidebar } from "@/components/SidebarProvider";
import { focusRing } from "@/lib/ui";

// The ATHENA logo. On desktop (xl) it is exactly as wide as the navigation column below it, with
// the letters spread across that width, so it reads as the top of the nav; when the sidebar is
// collapsed it shows just "A" to match the narrow column. Its right margin makes the search bar
// start where the page content starts (sidebar edge + the main area's 16 px padding).
// Smaller screens keep the plain word.
export default function HeaderLogo() {
  const { collapsed } = useSidebar();
  return (
    <Link
      href="/"
      aria-label="ATHENA home"
      className={`inline-flex min-h-11 flex-none items-center rounded-md text-2xl font-bold tracking-[0.3em] xl:justify-between xl:px-3 xl:text-xl xl:tracking-normal ${
        collapsed ? "xl:mr-4 xl:-ml-1 xl:w-12 xl:justify-center xl:px-0" : "xl:mr-5 xl:w-50"
      } ${focusRing}`}
    >
      <span className="xl:hidden">ATHENA</span>
      {collapsed ? (
        <span className="hidden xl:inline" aria-hidden="true">
          A
        </span>
      ) : (
        "ATHENA".split("").map((letter, i) => (
          <span key={i} className="hidden xl:inline" aria-hidden="true">
            {letter}
          </span>
        ))
      )}
    </Link>
  );
}
