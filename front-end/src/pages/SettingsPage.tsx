import { PaletteIcon, SunIcon, MoonIcon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Customize your Fruit Classification System</p>
      </div>
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-xl">
              <PaletteIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Appearance</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-4 font-medium">Theme</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setTheme('light')}
                  className={`px-6 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    theme === 'light'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:border-green-500'
                  }`}
                >
                  <SunIcon className="w-5 h-5" />
                  Light
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`px-6 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-gray-700 to-gray-800 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <MoonIcon className="w-5 h-5" />
                  Dark
                </button>
              </div>
            </div>
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Theme preference is saved automatically and will be applied across all pages.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}