import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { useSSE } from '../hooks/useSSE';

export function DashboardLayout() {
  useSSE(); // Global SSE connection for real-time updates
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        <Outlet />
      </main>
    </div>);

}