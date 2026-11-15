"use client";

import { createContext, useContext, useState } from "react";

// Whether the desktop sidebar is collapsed, shared by the sidebar and the header logo, so the
// ATHENA logo always lines up with the navigation column underneath it.
const SidebarContext = createContext({ collapsed: false, toggle: () => {} });

export function SidebarProvider({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  return <SidebarContext.Provider value={{ collapsed, toggle: () => setCollapsed((c) => !c) }}>{children}</SidebarContext.Provider>;
}

export const useSidebar = () => useContext(SidebarContext);
