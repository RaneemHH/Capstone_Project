import type { ReactNode } from "react";

interface DashboardLayoutProps {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
}

export function DashboardLayout({
  sidebar,
  header,
  children,
}: DashboardLayoutProps) {
  return (
    <div
      className="min-h-screen bg-background font-cairo"
      dir="rtl"
    >
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        {sidebar}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-card overflow-hidden">
          {/* Header */}
          {header}

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-background scrollbar-hide">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}