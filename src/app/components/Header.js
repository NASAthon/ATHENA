"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/crew", label: "Crew" },
  { href: "/today", label: "Today" },
  { href: "/daily-check", label: "Daily check" },
  { href: "/reaction-test", label: "Reaction test" },
  { href: "/trends", label: "Trends" },
  { href: "/body", label: "Body" },
];

const pill =
  "flex min-h-11 items-center rounded-full border border-white/15 px-4 text-sm";

export default function Header() {
  const pathname = usePathname();
  const tab = (active) =>
    `flex min-h-11 items-center rounded-xl px-4 font-medium hover:bg-white/10 ${
      active ? "bg-slate-700/50 font-semibold text-white" : "text-slate-300"
    }`;

  return (
    <header className="border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/" className="text-2xl font-bold tracking-[0.3em]">
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
              className="min-h-12 w-full rounded-xl border border-white/15 bg-white/5 px-4"
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label htmlFor="mode" className="text-slate-300">
            Mission mode
          </label>
          <select
            id="mode"
            className="min-h-12 rounded-xl border border-white/15 bg-[#0b1120] px-3"
            defaultValue="Mars Transit"
          >
            <option>ISS</option>
            <option>Lunar Gateway</option>
            <option>Mars Transit</option>
          </select>
          <span className={pill}>Day 129 · Earth link 14 min one way</span>
          <span className={pill}>Offline · saved on this device</span>
        </div>

        <nav aria-label="Main" className="mt-3">
          <ul className="flex flex-wrap gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={pathname.startsWith(item.href) ? "page" : undefined}
                  className={tab(pathname.startsWith(item.href))}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/emergency"
                className={`${tab(pathname.startsWith("/emergency"))} !text-red-400`}
              >
                <span aria-hidden="true">⚠&nbsp;</span>Emergency
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}