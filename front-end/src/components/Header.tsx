import React from 'react';
import { AppleIcon } from 'lucide-react';
export function Header() {
  return (
    <header className="text-center">
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-2xl shadow-lg">
          <AppleIcon className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent">
          Fruit and Vegetable Recognition System
        </h1>
      </div>
      <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
        Upload a fruit or vegetable image and let Model identify it!
      </p>
    </header>
  );
}