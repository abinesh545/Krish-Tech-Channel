import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Zap, RotateCcw, Copy, 
  TrendingUp, TrendingDown, Info, Check, 
  ChevronDown, ChevronUp, Printer, Gift, Download
} from 'lucide-react';

import { calculateBeforeMay2026Tariff, calculateAfterMay2026Tariff } from '../utils/tnebRates';
import { saveCalculation } from '../utils/storage';
import MobileBottomActionBar from '../components/MobileBottomActionBar';

export default function TnebCalculator() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Inputs
  const [units, setUnits] = useState('');
  const [isCalculated, setIsCalculated] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Errors & Sharing
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Calculations State
  const [results, setResults] = useState(null);
  
  // Accordion details toggles
  const [showOldBreakdown, setShowOldBreakdown] = useState(true);
  const [showNewBreakdown, setShowNewBreakdown] = useState(true);

  const resultsRef = useRef(null);

  // Load from location state if user clicked a recent calculation on Home
  useEffect(() => {
    if (location.state && location.state.loadCalculation) {
      const { 
        units: loadedUnits
      } = location.state.loadCalculation;
      
      setUnits(loadedUnits.toString());
      performCalculation(loadedUnits, false);
      
      // Clear location state immediately after loading to prevent infinite loops
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, navigate]);

  const validateInput = (val) => {
    if (val === '') {
      setError('Please enter the units consumed.');
      return false;
    }
    const num = parseFloat(val);
    if (isNaN(num) || num < 0) {
      setError('Please enter a valid positive number.');
      return false;
    }
    if (num > 100000) {
      setError('Units are too high. Please enter units less than 1,0,000.');
      return false;
    }
    setError('');
    return true;
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setUnits(val);
      if (error) setError('');
    }
  };

  const triggerCalculate = (e) => {
    if (e) e.preventDefault();
    if (!validateInput(units)) return;
    
    setIsCalculating(true);
    // Simulate loading for premium experience
    setTimeout(() => {
      performCalculation(parseFloat(units), true);
      setIsCalculating(false);
    }, 450);
  };

  const performCalculation = (unitVal, shouldSave = true) => {
    const oldRes = calculateBeforeMay2026Tariff(unitVal);
    const newRes = calculateAfterMay2026Tariff(unitVal);
    
    const difference = newRes.total - oldRes.total;
    const isSavings = difference < 0;
    
    const calculationResult = {
      units: unitVal,
      oldTariff: oldRes.total,
      newTariff: newRes.total,
      oldBreakdown: oldRes.breakdown,
      newBreakdown: newRes.breakdown,
      oldFixed: oldRes.fixedCharges,
      newFixed: newRes.fixedCharges,
      oldEnergyCharges: oldRes.energyCharges,
      newEnergyCharges: newRes.energyCharges,
      difference,
      isSavings
    };
    
    setResults(calculationResult);
    setIsCalculated(true);
    
    if (shouldSave) {
      saveCalculation({
        units: unitVal,
        oldTariff: oldRes.total,
        newTariff: newRes.total,
        difference
      });
    }

    // Scroll to results on desktop after calculation
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleReset = () => {
    setUnits('');
    setIsCalculated(false);
    setResults(null);
    setError('');
    // Clear location state so resetting doesn't reload
    window.history.replaceState({}, document.title);
  };

  const copyToClipboard = () => {
    if (!results) return;
    
    const summary = `
Krish Tech Channel - TNEB Bill Calculation Summary
-------------------------------------------
Units Consumed: ${results.units} Units
Billing Cycle: Bi-monthly (LT-IA Domestic)
Tariff Compared: Before May 2026 vs May 2026 onwards

1. Before May 2026 Bill: Rs. ${results.oldTariff.toFixed(2)}
   - Energy Charges: Rs. ${results.oldEnergyCharges.toFixed(2)}
   
2. May 2026 onwards Bill: Rs. ${results.newTariff.toFixed(2)}
   - Energy Charges: Rs. ${results.newEnergyCharges.toFixed(2)}

Outcome:
${results.difference === 0 
  ? 'Both bills are identical.' 
  : results.isSavings 
    ? `Savings under May 2026 Tariff: Rs. ${Math.abs(results.difference).toFixed(2)}`
    : `Increase under May 2026 Tariff: Rs. ${Math.abs(results.difference).toFixed(2)}`
}
-------------------------------------------
Calculated using Krish Tech Channel Bill Calculator.
`;
    
    const textToCopy = summary.trim();

    const fallbackCopy = (text) => {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } else {
          console.error('Fallback copy failed');
        }
      } catch (err) {
        console.error('Fallback copy error:', err);
      }
      document.body.removeChild(textArea);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch((err) => {
          console.error('navigator.clipboard error, trying fallback:', err);
          fallbackCopy(textToCopy);
        });
    } else {
      fallbackCopy(textToCopy);
    }
  };

  const triggerPrintPDF = async () => {
    if (!results) return;
    
    let html2canvas, jsPDF;
    try {
      const html2canvasModule = await import('html2canvas-pro');
      const jspdfModule = await import('jspdf');
      
      html2canvas = html2canvasModule.default || html2canvasModule;
      jsPDF = jspdfModule.jsPDF || jspdfModule.default || jspdfModule;
    } catch (e) {
      console.error('Failed to load PDF generation modules dynamically:', e);
      alert('PDF generation component failed to load. Please try copying the summary instead.');
      return;
    }
    
    const element = document.createElement('div');
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.top = '0';
    element.style.width = '790px'; // Standard A4 width in pixels
    element.style.padding = '32px';
    element.style.backgroundColor = '#ffffff';
    element.style.color = '#0f172a';
    element.style.fontFamily = 'sans-serif';
    
    element.innerHTML = `
      <div style="border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; font-family: sans-serif;">
        <div>
          <h1 style="font-size: 24px; font-weight: bold; color: #0f172a; margin: 0;">KRISH TECH CHANNEL</h1>
          <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">Smart Bill Calculation Report</p>
        </div>
        <div style="text-align: right; font-family: sans-serif;">
          <h2 style="font-size: 18px; font-weight: bold; color: #1e293b; margin: 0;">TNEB Tariff Comparison</h2>
          <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">Date: ${new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div style="margin-bottom: 24px; font-family: sans-serif;">
        <h3 style="font-size: 14px; font-weight: bold; color: #0f172a; margin-bottom: 16px;">Tariff Comparison Summary</h3>
        <p style="font-size: 12px; color: #475569; margin-bottom: 8px;">
          May 2026 Revision: <strong>${results.units <= 500 ? '200 Free Units Applied (≤ 500 units)' : '100 Free Units Applied (> 500 units)'}</strong>
        </p>
        <table style="width: 100%; text-align: left; border-collapse: collapse; font-size: 12px; font-family: sans-serif;">
          <thead>
            <tr style="border-bottom: 1px solid #cbd5e1;">
              <th style="padding: 8px 0; font-weight: bold; color: #0f172a;">Calculation Parameter</th>
              <th style="padding: 8px 0; font-weight: bold; text-align: right; color: #0f172a;">Before May 2026</th>
              <th style="padding: 8px 0; font-weight: bold; text-align: right; color: #0f172a;">May 2026 onwards</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 8px 0; color: #334155;">Units Consumed</td>
              <td style="padding: 8px 0; text-align: right; color: #334155;">${results.units} Units</td>
              <td style="padding: 8px 0; text-align: right; color: #334155;">${results.units} Units</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 8px 0; color: #334155;">Energy Charges</td>
              <td style="padding: 8px 0; text-align: right; color: #334155;">₹${results.oldEnergyCharges.toFixed(2)}</td>
              <td style="padding: 8px 0; text-align: right; color: #334155;">₹${results.newEnergyCharges.toFixed(2)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 8px 0; color: #334155;">Fixed Charges</td>
              <td style="padding: 8px 0; text-align: right; color: #334155;">₹0.00</td>
              <td style="padding: 8px 0; text-align: right; color: #334155;">₹0.00</td>
            </tr>
            <tr style="border-top: 1px solid #cbd5e1; font-weight: bold; background-color: #f8fafc;">
              <td style="padding: 8px; color: #0f172a;">Total Bill</td>
              <td style="padding: 8px; text-align: right; color: #0f172a;">₹${results.oldTariff.toFixed(2)}</td>
              <td style="padding: 8px; text-align: right; color: #0f172a;">₹${results.newTariff.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="margin-top: 24px; padding: 16px; border-radius: 8px; background-color: #f1f5f9; border: 1px solid #e2e8f0; font-size: 12px; line-height: 1.5; color: #334155; font-family: sans-serif;">
        <span style="font-weight: bold; display: block; color: #0f172a; margin-bottom: 4px;">Outcome Report:</span>
        <p style="margin: 0;">
          ${results.difference === 0 
            ? 'Both bill calculations result in the exact same payable amount.'
            : results.isSavings
              ? `The consumer saves a total of ₹${Math.abs(results.difference).toFixed(2)} bimonthly under the revised telescopic tariff scheme.`
              : `The consumer pays an additional ₹${Math.abs(results.difference).toFixed(2)} bimonthly under the revised telescopic tariff scheme.`
          }
        </p>
      </div>

      <div style="margin-top: 48px; text-align: center; font-size: 10px; color: #94a3b8; line-height: 1.5; font-family: sans-serif;">
        <p style="margin: 0;">Generated automatically using Krish Tech Smart Calculator Platform.</p>
        <p style="margin: 4px 0 0 0;">This report is for information purposes and is not a formal legal receipt of TANGEDCO.</p>
      </div>
    `;

    document.body.appendChild(element);

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 190; // Page width (210mm) - 20mm margin
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 10, 10, imgWidth, imgHeight);
      pdf.save(`tneb-bill-${results.units}-units.pdf`);
      
      if (document.body.contains(element)) {
        document.body.removeChild(element);
      }
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('An error occurred during PDF generation. Please try copying the summary instead.');
      
      // Robust DOM cleanup to prevent pointer-event locks and freeze states
      if (document.body.contains(element)) {
        document.body.removeChild(element);
      }
      const strayIframes = document.querySelectorAll('iframe');
      strayIframes.forEach(iframe => {
        if ((iframe.id && iframe.id.startsWith('html2canvas-')) || !iframe.id) {
          iframe.remove();
        }
      });
      const bodyCanvases = document.querySelectorAll('body > canvas');
      bodyCanvases.forEach(canvas => canvas.remove());
    }
  };

  const presets = [100, 150, 300, 500, 600, 1000];

  const handlePresetClick = (val) => {
    setUnits(val.toString());
    setError('');
    setIsCalculating(true);
    setTimeout(() => {
      performCalculation(val, true);
      setIsCalculating(false);
    }, 300);
  };

  return (
    <div className="relative min-h-screen pb-24 md:pb-16">
      
      {/* Background blobs */}
      <div className="absolute top-0 right-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-purple-500/10 to-indigo-500/10 blur-3xl" />
      <div className="absolute top-1/2 left-1/4 -z-10 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-indigo-500/10 to-blue-500/10 blur-3xl" />

      {/* Main Content Area */}
      <div className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 lg:px-8">
        
        {/* Navigation / Header */}
        <div className="flex items-center justify-between mb-8 print:hidden">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-purple-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Zap className="h-4.5 w-4.5 text-amber-500 fill-amber-500" />
            <span>Bi-monthly Consumer LT-1A</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center md:text-left mb-10 print:hidden">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            TNEB Electricity Bill Calculator
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Compare bills before and after the May 2026 tariff revision (100 free units vs 200 free units).
          </p>
        </div>

        {/* Print Layout Header */}
        <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-8">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">KRISH TECH</h1>
              <p className="text-xs text-slate-500">Smart Bill Calculation Report</p>
            </div>
            <div className="text-right">
              <h2 className="text-lg font-bold text-slate-800">TNEB Tariff Comparison</h2>
              <p className="text-xs text-slate-500">Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Input / Config Card */}
        <div className="grid gap-6 md:grid-cols-3 print:hidden">
          
          {/* Controls Column */}
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <form onSubmit={triggerCalculate} className="space-y-5">
                <div>
                  <label htmlFor="units-input" className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                    Units Consumed (Bi-monthly)
                  </label>
                  <p className="text-xs text-slate-400 mt-0.5">Enter total units from your meter reading</p>
                  
                  <div className="relative mt-2.5 rounded-xl shadow-sm">
                    <input
                      type="text"
                      name="units"
                      id="units-input"
                      className={`block w-full rounded-xl border border-slate-200 py-3.5 pl-4 pr-16 text-lg font-semibold text-slate-950 focus:ring-2 focus:ring-purple-600 focus:outline-none dark:bg-slate-950 dark:border-slate-800 dark:text-white ${
                        error ? 'border-rose-500 focus:ring-rose-500' : ''
                      }`}
                      placeholder="e.g. 350"
                      value={units}
                      onChange={handleInputChange}
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                      <span className="text-sm font-bold text-slate-400 dark:text-slate-500">Units</span>
                    </div>
                  </div>
                  {error && <p className="mt-1.5 text-xs font-semibold text-rose-500">{error}</p>}
                </div>

                {/* Quick Presets */}
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2.5">
                    Quick Presets
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {presets.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handlePresetClick(p)}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                          parseFloat(units) === p
                            ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700'
                        }`}
                      >
                        {p} Units
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-950/60 font-semibold text-sm transition-all"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isCalculating}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-500 dark:to-indigo-500 text-white font-bold py-3 px-6 rounded-xl hover:opacity-95 active:scale-[0.99] disabled:opacity-50 transition-all shadow-md shadow-purple-500/10"
                  >
                    {isCalculating ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <Zap className="h-4.5 w-4.5" />
                        <span>Compare Bill Tariffs</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Configuration Column */}
          <div className="md:col-span-1 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 h-full flex flex-col justify-between gap-6">
              <div className="space-y-5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 border-b pb-2 dark:border-slate-800">
                  <Info className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  Tariff Comparison Details
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <span className="block font-bold text-xs text-slate-500 uppercase tracking-wide">
                      Before May 2026 Tariff
                    </span>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Standard Scheme: 100 free units bimonthly for all consumers. Consumption up to 500 units includes ₹2.35/unit for the 101–200 range.
                    </p>
                  </div>
                  
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-850">
                    <span className="block font-bold text-xs text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                      May 2026 Tariff (New)
                    </span>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Effective from 10 May 2026: The first <strong>200 units are free</strong> if total consumption is ≤ 500 units.
                    </p>
                  </div>
                  
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-850">
                    <span className="block font-bold text-xs text-amber-600 dark:text-amber-500 uppercase tracking-wide">
                      Consumption &gt; 500 Units
                    </span>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Under both schemes, if total units exceed 500, the free quota reverts to 100 units, and units 101–400 are billed at ₹4.70.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Presentation (Visible after calculation) */}
        {isCalculated && results && (
          <div ref={resultsRef} className="mt-8 space-y-6 animate-in fade-in-50 slide-in-from-bottom-8 duration-300">
            
            {/* Quick Result Summary Panel */}
            <div className="grid gap-4 sm:grid-cols-3">
              
              {/* Before May 2026 Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wide">
                  Before May 2026 Tariff
                </span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-extrabold text-slate-800 dark:text-white">
                    ₹{results.oldTariff.toFixed(2)}
                  </span>
                </div>
                <div className="mt-3 text-xs text-slate-400">
                  <span>Energy Charges: ₹{results.oldEnergyCharges.toFixed(2)}</span>
                </div>
              </div>

              {/* May 2026 Tariff Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 relative overflow-hidden">
                <div className="absolute right-0 top-0 bg-purple-600 text-white text-[9px] font-extrabold px-2.5 py-1 rounded-bl-lg uppercase tracking-wider">
                  Active
                </div>
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wide">
                  May 2026 Tariff (New)
                </span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-extrabold text-slate-800 dark:text-white">
                    ₹{results.newTariff.toFixed(2)}
                  </span>
                </div>
                <div className="mt-3 text-xs text-slate-400">
                  <span>Energy Charges: ₹{results.newEnergyCharges.toFixed(2)}</span>
                </div>
              </div>

              {/* Difference / Savings Card */}
              <div className={`rounded-2xl border p-5 shadow-sm ${
                results.isSavings
                  ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-950/20'
                  : results.difference === 0
                    ? 'border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50'
                    : 'border-rose-200 bg-rose-50/50 dark:border-rose-900/30 dark:bg-rose-950/20'
              }`}>
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wide">
                  Bill Impact
                </span>
                <div className="flex items-center gap-2 mt-2">
                  {results.difference === 0 ? (
                    <span className="text-3xl font-extrabold text-slate-600 dark:text-slate-400">
                      ₹0.00
                    </span>
                  ) : (
                    <>
                      <span className={`text-3xl font-extrabold ${
                        results.isSavings ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        ₹{Math.abs(results.difference).toFixed(2)}
                      </span>
                      {results.isSavings ? (
                        <TrendingDown className="h-6 w-6 text-emerald-500" />
                      ) : (
                        <TrendingUp className="h-6 w-6 text-rose-500" />
                      )}
                    </>
                  )}
                </div>
                <span className={`text-xs font-semibold mt-3 block ${
                  results.isSavings 
                    ? 'text-emerald-700 dark:text-emerald-400' 
                    : results.difference === 0
                      ? 'text-slate-500 dark:text-slate-400'
                      : 'text-rose-700 dark:text-rose-400'
                }`}>
                  {results.difference === 0 
                    ? 'No impact on your bill.' 
                    : results.isSavings 
                      ? 'New tariff is cheaper for you!' 
                      : 'You pay more under the new tariff.'}
                </span>
              </div>

            </div>

            {/* Quick Export Panel */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 print:hidden">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
                <span>Bill calculated for {results.units} units</span>
                <span className="h-1 w-1 bg-slate-400 rounded-full" />
                <span className="text-purple-600 dark:text-purple-400">
                  {results.units <= 500 ? 'May 2026 Scheme (200 Free Units)' : 'May 2026 Scheme (100 Free Units)'}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 dark:bg-slate-950 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Summary</span>
                    </>
                  )}
                </button>
                <button
                  onClick={triggerPrintPDF}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 text-xs font-bold transition-all shadow-sm shadow-purple-500/10"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Bill PDF</span>
                </button>
              </div>
            </div>

            {/* Detail Section: Slab-wise Breakdown */}
            <div className="grid gap-6 md:grid-cols-2">
              
              {/* Before May 2026 Breakdown */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
                <button
                  onClick={() => setShowOldBreakdown(!showOldBreakdown)}
                  className="w-full flex items-center justify-between p-5 font-bold text-left text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-slate-400" />
                    Before May 2026 Slab Structure
                  </span>
                  {showOldBreakdown ? <ChevronUp className="h-4.5 w-4.5" /> : <ChevronDown className="h-4.5 w-4.5" />}
                </button>

                {showOldBreakdown && (
                  <div className="p-5 space-y-4">
                    <div className="space-y-2">
                      {results.oldBreakdown.map((row, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm py-2 border-b border-slate-50 dark:border-slate-800/40 last:border-0">
                          <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{row.slab}</span>
                            <span className="text-xs text-slate-400 block">{row.units} units × ₹{row.rate.toFixed(2)}</span>
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white">
                            ₹{row.amount.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-sm space-y-2.5">
                      <div className="flex justify-between text-slate-500 dark:text-slate-400">
                        <span>Energy Charges Subtotal</span>
                        <span>₹{results.oldEnergyCharges.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 dark:text-slate-400">
                        <span>Fixed Service Charges</span>
                        <span className="text-slate-400 dark:text-slate-500">₹0.00</span>
                      </div>
                      <div className="flex justify-between font-bold text-base text-slate-900 dark:text-white pt-2.5 border-t border-dashed border-slate-100 dark:border-slate-800">
                        <span>Total Payable Amount</span>
                        <span>₹{results.oldTariff.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* May 2026 Breakdown */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
                <button
                  onClick={() => setShowNewBreakdown(!showNewBreakdown)}
                  className="w-full flex items-center justify-between p-5 font-bold text-left text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-purple-500" />
                    May 2026 Slab Structure
                  </span>
                  {showNewBreakdown ? <ChevronUp className="h-4.5 w-4.5" /> : <ChevronDown className="h-4.5 w-4.5" />}
                </button>

                {showNewBreakdown && (
                  <div className="p-5 space-y-4">
                    <div className="space-y-2">
                      {results.newBreakdown.map((row, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm py-2 border-b border-slate-50 dark:border-slate-800/40 last:border-0">
                          <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{row.slab}</span>
                            <span className="text-xs text-slate-400 block">{row.units} units × ₹{row.rate.toFixed(2)}</span>
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white">
                            ₹{row.amount.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-sm space-y-2.5">
                      <div className="flex justify-between text-slate-500 dark:text-slate-400">
                        <span>Energy Charges Subtotal</span>
                        <span>₹{results.newEnergyCharges.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 dark:text-slate-400">
                        <span>Fixed Service Charges</span>
                        <span className="text-slate-400 dark:text-slate-500">₹0.00</span>
                      </div>
                      <div className="flex justify-between font-bold text-base text-slate-900 dark:text-white pt-2.5 border-t border-dashed border-slate-100 dark:border-slate-800">
                        <span>Total Payable Amount</span>
                        <span>₹{results.newTariff.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Print Only Summary - Hidden on Screen */}
            <div className="hidden print:block border-t border-slate-300 pt-8 mt-12">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Tariff Comparison Summary</h3>
              <p className="text-xs text-slate-500 mb-2">
                May 2026 Revision: <strong>{results.units <= 500 ? '200 Free Units Applied (≤ 500 units)' : '100 Free Units Applied (> 500 units)'}</strong>
              </p>
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-300">
                    <th className="py-2 font-bold">Calculation Parameter</th>
                    <th className="py-2 font-bold text-right">Before May 2026</th>
                    <th className="py-2 font-bold text-right">May 2026 onwards</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="py-2">Units Consumed</td>
                    <td className="py-2 text-right">{results.units} Units</td>
                    <td className="py-2 text-right">{results.units} Units</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-2">Energy Charges</td>
                    <td className="py-2 text-right">₹{results.oldEnergyCharges.toFixed(2)}</td>
                    <td className="py-2 text-right">₹{results.newEnergyCharges.toFixed(2)}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-2">Fixed Charges</td>
                    <td className="py-2 text-right">₹0.00</td>
                    <td className="py-2 text-right">₹0.00</td>
                  </tr>
                  <tr className="border-b border-slate-300 font-bold bg-slate-50">
                    <td className="py-2 font-bold">Total Bill</td>
                    <td className="py-2 text-right font-bold">₹{results.oldTariff.toFixed(2)}</td>
                    <td className="py-2 text-right font-bold">₹{results.newTariff.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-6 p-4 rounded bg-slate-100 border border-slate-300 text-xs">
                <span className="font-bold block">Outcome Report:</span>
                <p className="mt-1">
                  {results.difference === 0 
                    ? 'Both bill calculations result in the exact same payable amount.'
                    : results.isSavings
                      ? `The consumer saves a total of ₹${Math.abs(results.difference).toFixed(2)} bimonthly under the revised telescopic tariff scheme.`
                      : `The consumer pays an additional ₹${Math.abs(results.difference).toFixed(2)} bimonthly under the revised telescopic tariff scheme.`
                  }
                </p>
              </div>

              <div className="mt-12 text-center text-[10px] text-slate-400">
                <p>Generated automatically using Krish Tech Smart Calculator Platform.</p>
                <p>This report is for information purposes and is not a formal legal receipt of TANGEDCO.</p>
              </div>
            </div>

          </div>
        )}

        {/* Detailed FAQ/Help section */}
        <div className="mt-16 border-t border-slate-200 dark:border-slate-800 pt-10 print:hidden">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2 mb-6">
            Understanding the Tariff Differences
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 text-sm">
            <div className="space-y-2.5">
              <h3 className="font-bold text-slate-800 dark:text-slate-200">
                1. What changed in the May 2026 revision?
              </h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-xs">
                Starting May 10, 2026, Tamil Nadu has revised the domestic electricity tariff scheme to double the free electricity slab. The first **200 units** are completely free of charge, provided that the total consumption for the bimonthly period is **500 units or less**.
              </p>
            </div>
            
            <div className="space-y-2.5">
              <h3 className="font-bold text-slate-800 dark:text-slate-200">
                2. What happens if I consume more than 500 units?
              </h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-xs">
                If your bimonthly consumption is **above 500 units**, the benefit of the 200 free units is withdrawn. The scheme falls back to the standard **100 free units**, and all subsequent slabs are billed normally. Thus, your bill will be identical to the pre-May 2026 telescopic tariff.
              </p>
            </div>

            <div className="space-y-2.5">
              <h3 className="font-bold text-slate-800 dark:text-slate-200">
                3. How was the bill calculated before May 2026?
              </h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-xs">
                Before the revision, the first **100 units** were free. For consumption ≤ 500 units, the next 100 units (101–200) were charged at ₹2.35 per unit, units 201–400 at ₹4.70, and units 401–500 at ₹6.30.
              </p>
            </div>

            <div className="space-y-2.5">
              <h3 className="font-bold text-slate-800 dark:text-slate-200">
                4. Are there fixed monthly/bimonthly service charges?
              </h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-xs">
                No. In accordance with TANGEDCO rules, fixed bimonthly service charges for domestic consumers (LT-IA) remain fully withdrawn (₹0) under both the pre-May 2026 and post-May 2026 telescopic billing schemes.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Mobile Sticky Action Bar */}
      <MobileBottomActionBar
        onCalculate={triggerCalculate}
        onReset={handleReset}
        isCalculated={isCalculated}
        isCalculating={isCalculating}
      />
    </div>
  );
}
