import Link from "next/link";
import { PanelLeftClose, PanelLeftOpen, TriangleAlert } from "lucide-react";
import NavLinks from "@/components/NavLinks";
import { focusRing } from "@/lib/ui";

export default function DesktopSidebar({ collapsed, onToggle }) {
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <aside
      className={`hidden shrink-0 border-r border-border bg-card/60 transition-[width] xl:block ${collapsed ? "w-16" : "w-56"}`}
      aria-label="Desktop navigation"
    >
      <div className={`sticky top-0 flex flex-col gap-3 ${collapsed ? "p-2" : "p-3"}`}>
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`flex min-h-11 items-center rounded-lg border border-input hover:bg-accent ${collapsed ? "justify-center px-2" : "justify-between gap-2 px-3"} ${focusRing}`}
        >
          {!collapsed && <span className="font-medium">Navigation</span>}
          <ToggleIcon className="size-5 shrink-0" aria-hidden="true" />
        </button>
        <nav aria-label="Main">
          <NavLinks variant="sidebar" collapsed={collapsed} />
        </nav>
        <Link
          href="/emergency"
          aria-label={collapsed ? "Emergency" : undefined}
          title={collapsed ? "Emergency" : undefined}
          className={`flex min-h-12 items-center justify-center rounded-xl bg-destructive text-base font-bold text-background hover:bg-destructive/90 ${collapsed ? "px-2" : "gap-2 px-4"} ${focusRing}`}
        >
          <TriangleAlert aria-hidden="true" className="size-6 shrink-0" />
          <span className={collapsed ? "sr-only" : undefined}>Emergency</span>
        </Link>
      </div>
    </aside>
  );
}
