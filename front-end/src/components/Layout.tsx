import React from 'react';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({
  children
}: LayoutProps) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-50 via-yellow-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex transition-colors">
      <Sidebar />
      <main className="flex-1 ml-64">
        <div className="container mx-auto px-8 py-8 max-w-7xl">{children}</div>
      </main>
    </div>
  );
}