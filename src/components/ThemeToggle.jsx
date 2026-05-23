import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ theme, toggleTheme }) {
  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 border border-slate-200/50 dark:border-slate-700/50"
      aria-label="Toggle theme"
      id="theme-toggle-btn"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-amber-500 animate-spin-slow" />
      ) : (
        <Moon className="h-5 w-5 text-indigo-600 hover:text-indigo-700" />
      )}
    </button>
  );
}
