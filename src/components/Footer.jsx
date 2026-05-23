import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Heart } from 'lucide-react';
import logo from '../assets/logo.jpg';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white py-8 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-950 print:hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg overflow-hidden border border-slate-200/50 dark:border-slate-850 shadow-sm">
              <img src={logo} alt="Krish Tech Channel Logo" className="h-full w-full object-cover" />
            </div>
            <span className="font-sans text-md font-bold tracking-tight bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-blue-400">
              Krish Tech Channel
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
            <Link to="/" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Home</Link>
            <Link to="/tneb-calculator" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">TNEB Calculator</Link>
            <a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Terms of Service</a>
          </div>

          <div className="flex items-center gap-1 text-sm text-slate-400 dark:text-slate-500">
            <span>© {new Date().getFullYear()} Krish Tech Channel. Crafted with</span>
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500 animate-pulse" />
            <span>in India.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
