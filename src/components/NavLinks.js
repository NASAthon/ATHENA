"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  CalendarDays,
  ChartNoAxesCombined,
  ClipboardCheck,
  FileText,
  FlaskConical,
  ScanLine,
  Timer,
  Users,
} from "lucide-react";
import { focusRing } from "@/lib/ui";
import { appPathname } from "@/lib/basePath";

// Main navigation: the checklist screens plus Izabela's additions (PR #8).
const navItems = [
  { href: "/today", label: "Today", Icon: Activity },
  { href: "/daily-check", label: "Daily check", Icon: ClipboardCheck },
  { href: "/reaction-test", label: "Reaction test", Icon: Timer },
  { href: "/trends", label: "Trends", Icon: ChartNoAxesCombined },
  { href: "/body", label: "Body", Icon: ScanLine },
  { href: "/calendar", label: "Calendar", Icon: CalendarDays },
  { href: "/summary", label: "Summary", Icon: FileText },
  { href: "/crew", label: "Crew", Icon: Users },
  { href: "/demo", label: "Demo", Icon: FlaskConical },
];

export default function NavLinks({ variant = "header", collapsed = false }) {
  const pathname = appPathname(usePathname());
  const sidebar = variant === "sidebar";

  return (
    <ul className={sidebar ? "flex flex-col gap-1" : "flex flex-wrap justify-center gap-2"}>
      {navItems.map((item) => {
        const isHome = item.href === "/today" && pathname === "/";
        const isDemoRoute = item.href === "/demo" && pathname.startsWith("/scenario-lab");
        const isCurrent = isHome || isDemoRoute || pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.Icon;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={isCurrent ? "page" : undefined}
              aria-label={sidebar && collapsed ? item.label : undefined}
              title={sidebar && collapsed ? item.label : undefined}
              className={`flex min-h-11 items-center rounded-lg font-medium text-foreground underline-offset-8 hover:bg-accent hover:text-accent-foreground aria-[current=page]:bg-accent aria-[current=page]:font-semibold aria-[current=page]:text-foreground ${
                sidebar
                  ? `w-full border-l-2 border-transparent aria-[current=page]:border-primary ${collapsed ? "justify-center px-2" : "gap-3 px-3"}`
                  : "px-4 aria-[current=page]:underline"
              } ${focusRing}`}
            >
              {sidebar && <Icon className="size-5 shrink-0" aria-hidden="true" />}
              <span className={sidebar && collapsed ? "sr-only" : undefined}>{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
