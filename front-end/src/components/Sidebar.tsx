import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, BookOpenIcon, ClockIcon, SettingsIcon, AppleIcon, BarChart3Icon } from 'lucide-react';
export function Sidebar() {
  const location = useLocation();
  const navItems = [{
    path: '/',
    icon: HomeIcon,
    label: 'Home / Predict'
  }, {
    path: '/dashboard',
    icon: BarChart3Icon,
    label: 'Dashboard'
  }, {
    path: '/fruit-info',
    icon: BookOpenIcon,
    label: 'Fruit Info'
  }, {
    path: '/history',
    icon: ClockIcon,
    label: 'Prediction History'
  }, {
    path: '/settings',
    icon: SettingsIcon,
    label: 'Settings'
  }];
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-800 shadow-2xl z-50 transition-colors">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-xl">
            <AppleIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-gray-800 dark:text-gray-200">Fruit AI</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Classification System</p>
          </div>
        </div>
      </div>
      <nav className="p-4">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          <p>Version 1.0.0</p>
          <p className="mt-1">© 2024 Fruit AI</p>
        </div>
      </div>
    </aside>
  );
}