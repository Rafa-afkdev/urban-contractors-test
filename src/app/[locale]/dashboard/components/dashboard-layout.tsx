import React from 'react';
import Sidebar from './sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      {/* Main content */}
      <div className="md:ml-64">
        <main className="p-6 pt-20 md:pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}
