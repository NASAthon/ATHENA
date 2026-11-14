import Link from "next/link";

const navItems = [
  { href: "/", label: "Today" },
  { href: "/trends", label: "Trends" },
  { href: "/body", label: "Body" },
  { href: "/calendar", label: "Calendar" },
  { href: "/summary", label: "Summary" },
];

export default function Header() {
  return (
    <header className="border-b border-white/20 bg-black/40">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <Link href="/" className="text-xl font-bold tracking-wide">
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
            className="min-h-11 w-full rounded-lg border border-white/30 bg-white/5 px-3 text-base"
          />
        </div>

        <div className="flex min-h-11 items-center rounded-lg border border-white/30 px-3 text-sm">
          Day 1 · Cmdr Rivera
        </div>

        <Link
          href="/emergency"
          className="flex min-h-11 items-center gap-2 rounded-lg bg-red-700 px-4 font-semibold text-white hover:bg-red-600"
        >
          <span aria-hidden="true">⚠</span> Emergency
        </Link>
      </div>

      <nav aria-label="Main" className="mx-auto max-w-6xl px-4 pb-3">
        <ul className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex min-h-11 items-center rounded-lg px-4 font-medium hover:bg-white/10"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
