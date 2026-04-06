import React from 'react';
import { Outlet } from 'react-router-dom';
export function PublicLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 w-full max-w-[480px] mx-auto bg-surface shadow-xl max-h-[80vh] overflow-y-auto relative pb-24 rounded-xl my-auto">
        <Outlet />
      </main>
    </div>);

}