'use client';

import React from 'react';
import Navbar from '@/components/common/Navbar';
import Sidebar from '@/components/common/Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="dashboard-layout min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Sidebar - visible on desktop, collapsible on mobile */}
      <aside
        className={`fixed left-0 top-0 h-screen z-40 transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-0'
        } md:w-64 md:translate-x-0 ${!isSidebarOpen && '-translate-x-full md:translate-x-0'}`}
      >
        <Sidebar />
      </aside>

      {/* Main content area */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-64'}`}>
        {/* Navbar */}
        <header className="sticky top-0 z-30 border-b border-white/5">
          <Navbar onSidebarToggle={handleSidebarToggle} isSidebarOpen={isSidebarOpen} />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto relative z-10">
          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
