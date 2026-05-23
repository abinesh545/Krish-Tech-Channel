import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function ToolCard({ title, description, icon: Icon, path, badge, isComingSoon = false, colorTheme = 'purple' }) {
  const themes = {
    purple: {
      bg: 'from-purple-500/10 to-indigo-500/10',
      icon: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-100 dark:bg-purple-950/50',
      border: 'hover:border-purple-500/30',
      shadow: 'hover:shadow-purple-500/5',
      badgeBg: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
    },
    blue: {
      bg: 'from-blue-500/10 to-cyan-500/10',
      icon: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-950/50',
      border: 'hover:border-blue-500/30',
      shadow: 'hover:shadow-blue-500/5',
      badgeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
    },
    emerald: {
      bg: 'from-emerald-500/10 to-teal-500/10',
      icon: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/50',
      border: 'hover:border-emerald-500/30',
      shadow: 'hover:shadow-emerald-500/5',
      badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
    },
    rose: {
      bg: 'from-rose-500/10 to-pink-500/10',
      icon: 'text-rose-600 dark:text-rose-400',
      iconBg: 'bg-rose-100 dark:bg-rose-950/50',
      border: 'hover:border-rose-500/30',
      shadow: 'hover:shadow-rose-500/5',
      badgeBg: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
    },
    amber: {
      bg: 'from-amber-500/10 to-yellow-500/10',
      icon: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-100 dark:bg-amber-950/50',
      border: 'hover:border-amber-500/30',
      shadow: 'hover:shadow-amber-500/5',
      badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
    }
  };

  const t = themes[colorTheme] || themes.purple;

  const CardWrapper = ({ children }) => {
    if (isComingSoon) {
      return (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 opacity-75">
          {children}
        </div>
      );
    }
    return (
      <Link
        to={path}
        className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 ${t.border} ${t.shadow}`}
      >
        {children}
      </Link>
    );
  };

  return (
    <CardWrapper>
      {/* Decorative gradient blob */}
      <div className={`absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${t.bg} blur-2xl group-hover:scale-125 transition-transform duration-300`} />

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          {/* Header row */}
          <div className="flex items-center justify-between mb-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${t.iconBg} ${t.icon} shadow-sm`}>
              <Icon className="h-6 w-6" />
            </div>
            {badge && (
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase ${t.badgeBg}`}>
                {badge}
              </span>
            )}
          </div>

          {/* Title & Description */}
          <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {title}
          </h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
            {description}
          </p>
        </div>

        {/* Footer/Action area */}
        <div className="mt-6 flex items-center text-sm font-semibold text-purple-600 dark:text-purple-400">
          {isComingSoon ? (
            <span className="text-slate-400 dark:text-slate-500">Coming Soon</span>
          ) : (
            <span className="flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
              Try it now
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </div>
      </div>
    </CardWrapper>
  );
}
