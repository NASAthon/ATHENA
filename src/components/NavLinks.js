"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { focusRing } from "@/lib/ui";

// Main navigation: the checklist screens plus Izabela's additions (PR #8).
const navItems = [
  { href: "/today", label: "Today" },
  { href: "/daily-check", label: "Daily check" },
  { href: "/reaction-test", label: "Reaction test" },
  { href: "/trends", label: "Trends" },
  { href: "/body", label: "Body" },
  { href: "/calendar", label: "Calendar" },
  { href: "/summary", label: "Summary" },
  { href: "/scenario-lab", label: "Scenario Lab" },
  { href: "/crew", label: "Crew" },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <ul className="flex flex-wrap gap-2">
      {navItems.map((item) => {
        const isCurrent = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={isCurrent ? "page" : undefined}
              className={`flex min-h-11 items-center rounded-lg px-4 font-medium text-muted-foreground underline-offset-8 hover:bg-accent hover:text-accent-foreground aria-[current=page]:bg-accent aria-[current=page]:font-semibold aria-[current=page]:text-foreground aria-[current=page]:underline ${focusRing}`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
