"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Today" },
  { href: "/trends", label: "Trends" },
  { href: "/body", label: "Body" },
  { href: "/calendar", label: "Calendar" },
  { href: "/summary", label: "Summary" },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <ul className="flex flex-wrap gap-2">
      {navItems.map((item) => {
        const isCurrent = pathname === item.href;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={isCurrent ? "page" : undefined}
              className="flex min-h-11 items-center rounded-lg px-4 font-medium text-muted-foreground underline-offset-8 outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-[current=page]:bg-accent aria-[current=page]:font-semibold aria-[current=page]:text-foreground aria-[current=page]:underline"
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
