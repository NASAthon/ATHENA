"use client";

import AlertBanner from "@/components/AlertBanner";
import DesktopSidebar from "@/components/DesktopSidebar";
import { useSidebar } from "@/components/SidebarProvider";

export default function DesktopShell({ children }) {
  // Shared with the header logo, so it stays as wide as the navigation column.
  const { collapsed, toggle: toggleSidebar } = useSidebar();

  return (
    <div className="flex min-h-0 flex-1 items-stretch">
      <DesktopSidebar collapsed={collapsed} onToggle={toggleSidebar} />
      <div className="min-w-0 flex-1">
        <AlertBanner />
        {children}
      </div>
    </div>
  );
}
