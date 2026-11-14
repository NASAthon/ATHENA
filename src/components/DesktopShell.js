"use client";

import { useState } from "react";
import AlertBanner from "@/components/AlertBanner";
import DesktopSidebar from "@/components/DesktopSidebar";

export default function DesktopShell({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  function toggleSidebar() {
    setCollapsed((current) => !current);
  }

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
