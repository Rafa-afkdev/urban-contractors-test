import React from "react";
import Sidebar from "./components/sidebar";

export default function DashboardSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <main className="p-4 md:p-6 pt-20 md:pt-16 min-h-screen flex items-start justify-center">
          <div className="max-w-7xl w-full mt-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
