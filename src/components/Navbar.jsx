import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Cpu, Calculator, Settings, History } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import logo from '../assets/logo.jpg';

export default function Navbar({ theme, toggleTheme }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Home', path: '/', icon: Cpu },
    { name: 'TNEB Calculator', path: '/tneb-calculator', icon: Calculator },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md transition-all duration-300 dark:border-slate-800/80 dark:bg-slate-950/80 print:hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden border border-slate-200/50 dark:border-slate-850 shadow-md group-hover:scale-105 transition-transform duration-200">
                <img src={logo} alt="Krish Tech Channel Logo" className="h-full w-full object-cover" />
              </div>
              <span className="font-sans text-xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-blue-400">
                Krish Tech Channel
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive(link.path)
                        ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900/50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.name}
                  </Link>
                );
              })}
            </div>
            
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
            
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          </div>

          {/* Mobile menu controls */}
          <div className="flex items-center gap-3 md:hidden">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/80 focus:outline-none"
              aria-label="Main menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-200/50 bg-white/95 backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-950/95 animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-1.5 px-4 pb-4 pt-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-150 ${
                    isActive(link.path)
                      ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900/50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
