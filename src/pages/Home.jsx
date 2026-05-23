import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Percent, Ruler, Landmark, History, Trash2, ArrowRight, Sparkles, Search, Compass, ShieldCheck } from 'lucide-react';
import ToolCard from '../components/ToolCard';
import { getCalculations, clearHistory, deleteCalculation } from '../utils/storage';

export default function Home() {
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    setHistory(getCalculations());
  }, []);

  const handleDeleteHistory = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = deleteCalculation(id);
    setHistory(updated);
  };

  const handleClearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear all calculation history?')) {
      const updated = clearHistory();
      setHistory(updated);
    }
  };

  const tools = [
    {
      title: 'Tamil Nadu Electricity Bill Calculator',
      description: 'Compare TNEB domestic bills before and after the May 2026 tariff revision (100 free units vs 200 free units).',
      icon: Zap,
      path: '/tneb-calculator',
      badge: 'Featured',
      category: 'Utility',
      colorTheme: 'purple',
      isComingSoon: false,
    },
  ];

  const categories = ['All', 'Utility'];

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeTab === 'All' || tool.category === activeTab;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="relative min-h-screen overflow-hidden pb-16">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-purple-500/10 to-indigo-500/10 blur-3xl animate-pulse" />
      <div className="absolute top-1/3 right-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 blur-3xl animate-pulse" />

      {/* Hero Section */}
      <div className="mx-auto max-w-5xl px-4 pt-16 pb-12 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3.5 py-1.5 text-xs font-semibold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 mb-6 border border-purple-200/40 dark:border-purple-800/40">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Professional Smart Utility Suite</span>
        </div>
        
        <h1 className="font-sans text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl lg:text-7xl">
          <span className="block mb-2">Simplify Everyday</span>
          <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-blue-400">
            Calculations
          </span>
        </h1>
        
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
          Useful tools and smart calculators designed to simplify everyday technical and utility calculations. Easy-to-use, mobile-first, and completely free.
        </p>

        {/* Quick Search & Filter Area */}
        <div className="mx-auto mt-10 max-w-md">
          <div className="relative rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-2xl border-0 py-3.5 pl-11 pr-4 text-slate-950 placeholder:text-slate-400 focus:ring-2 focus:ring-purple-600 dark:text-white dark:bg-slate-900 focus:outline-none text-sm"
              placeholder="Search utility calculators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Category Filters */}
        <div className="flex items-center justify-center gap-2 mb-10 overflow-x-auto py-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                activeTab === cat
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 dark:hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {filteredTools.length > 0 ? (
            filteredTools.map((tool, idx) => (
              <ToolCard
                key={idx}
                title={tool.title}
                description={tool.description}
                icon={tool.icon}
                path={tool.path}
                badge={tool.badge}
                isComingSoon={tool.isComingSoon}
                colorTheme={tool.colorTheme}
              />
            ))
          ) : (
            <div className="col-span-2 text-center py-12 text-slate-500 dark:text-slate-400">
              No calculators found matching your query.
            </div>
          )}
        </div>

        {/* Recent Calculations Section */}
        {history.length > 0 && (
          <div className="mt-20 border-t border-slate-200 dark:border-slate-800 pt-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <h2 className="text-xl font-bold tracking-tight text-slate-950 dark:text-white">
                  Recent Calculations
                </h2>
              </div>
              <button
                onClick={handleClearAllHistory}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear All
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {history.map((item) => {
                const isSavings = item.difference < 0;
                const formattedDiff = Math.abs(item.difference).toFixed(2);
                
                return (
                  <div
                    key={item.id}
                    onClick={() => navigate('/tneb-calculator', { state: { loadCalculation: item } })}
                    className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900 hover:border-purple-500/20"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                      <div>
                        <span className="text-xs text-slate-400 dark:text-slate-500 block">
                          {new Date(item.timestamp).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                          {item.units} Units Consumed
                        </span>
                      </div>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block">Pre-May 2026</span>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          ₹{item.oldTariff.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block">
                          May 2026 Bill
                        </span>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block">
                          ₹{item.newTariff.toFixed(2)}
                        </span>
                        <span className="text-[9px] text-purple-600 dark:text-purple-400 block mt-0.5">
                          {item.units <= 500 ? '200 Free units' : '100 Free units'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-medium text-slate-400">Outcome</span>
                      <span className={`inline-flex items-center rounded-lg px-2 py-1 text-xs font-bold ${
                        isSavings
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                      }`}>
                        {isSavings ? `Saves ₹${formattedDiff}` : `Extra ₹${formattedDiff}`}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleDeleteHistory(item.id, e)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-50 dark:hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Delete calculation"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
