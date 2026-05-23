import React from 'react';
import { Calculator, RotateCcw } from 'lucide-react';

export default function MobileBottomActionBar({ onCalculate, onReset, isCalculated, isCalculating }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/80 bg-white/95 p-4 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur-md transition-all duration-300 dark:border-slate-800/80 dark:bg-slate-950/95 md:hidden">
      <div className="flex items-center gap-3">
        {onReset && (
          <button
            onClick={onReset}
            className="flex items-center justify-center p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all"
            aria-label="Reset fields"
            type="button"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        )}
        <button
          onClick={onCalculate}
          disabled={isCalculating}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-500 dark:to-indigo-500 text-white font-semibold py-3.5 px-6 rounded-xl hover:opacity-95 active:scale-[0.98] disabled:opacity-50 transition-all shadow-md shadow-purple-500/25"
          type="button"
        >
          {isCalculating ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <Calculator className="h-5 w-5" />
              <span>{isCalculated ? 'Recalculate' : 'Calculate Bill'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
