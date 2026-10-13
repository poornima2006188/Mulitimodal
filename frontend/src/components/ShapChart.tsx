import React from 'react';
import { ExplanationResult } from '../types';
import { BarChart3, Info, AlertCircle, Loader2 } from 'lucide-react';

interface ShapChartProps {
  explanation: ExplanationResult | null;
  selectedTarget: string;
  onSelectTarget: (target: string) => void;
  loading: boolean;
}

export const ShapChart: React.FC<ShapChartProps> = ({
  explanation,
  selectedTarget,
  onSelectTarget,
  loading
}) => {
  const targets = [
    { id: 'CAD', label: 'Overall CAD' },
    { id: 'LAD', label: 'LAD' },
    { id: 'LCX', label: 'LCX' },
    { id: 'RCA', label: 'RCA' }
  ];

  if (loading) {
    return (
      <div id="explainability" className="bg-white dark:bg-[#0E1D2D] border border-slate-200 dark:border-[#1E3147] rounded-xl p-5 shadow-xs flex flex-col items-center justify-center min-h-[380px] space-y-3">
        <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Calculating TreeSHAP feature attributions for {selectedTarget}...
        </span>
      </div>
    );
  }

  if (!explanation) {
    return (
      <div id="explainability" className="bg-white dark:bg-[#0E1D2D] border border-slate-200 dark:border-[#1E3147] rounded-xl p-5 shadow-xs flex flex-col items-center justify-center min-h-[380px] text-center space-y-2">
        <AlertCircle className="w-6 h-6 text-amber-500" />
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          No explanation data available
        </span>
        <span className="text-[11px] text-slate-400">
          Run patient assessment or select an anatomical target.
        </span>
      </div>
    );
  }

  // Combine top positive and negative features into ordered list
  const pos = explanation.positive_features.slice(0, 5);
  const neg = explanation.negative_features.slice(0, 5);

  const combined = [
    ...pos.map(f => ({ ...f, isPositive: true })),
    ...neg.map(f => ({ ...f, isPositive: false }))
  ].sort((a, b) => b.shap - a.shap);

  const maxAbs = Math.max(...combined.map(f => Math.abs(f.shap)), 0.05);

  return (
    <div id="explainability" className="bg-white dark:bg-[#0E1D2D] border border-slate-200 dark:border-[#1E3147] rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100 dark:border-[#1A2E44]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0B1B2B] dark:text-slate-100">
                SHAP Feature Attribution Waterfall
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Local feature contributions for {selectedTarget} model output
              </p>
            </div>
          </div>
        </div>

        {/* Target Switcher Pills (CAD, LAD, LCX, RCA) */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200/80 dark:border-slate-700 mb-4">
          {targets.map(t => {
            const active = selectedTarget === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelectTarget(t.id)}
                className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-md transition cursor-pointer ${
                  active
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Feature Contribution Horizontal Bars */}
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {combined.map((item, idx) => {
            const widthPct = Math.min(100, Math.max(5, (Math.abs(item.shap) / maxAbs) * 100));
            const isPos = item.shap >= 0;

            return (
              <div key={idx} className="text-xs">
                {/* Row Header: Name and SHAP score value */}
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">
                    {item.feature}
                  </span>
                  <div className="flex items-center gap-2 tabular-nums text-[11px] shrink-0">
                    <span className="text-slate-400 text-[10px]">val: {item.value}</span>
                    <span
                      className={`font-bold ${
                        isPos ? 'text-rose-600 dark:text-rose-400' : 'text-teal-600 dark:text-teal-400'
                      }`}
                    >
                      {isPos ? `+${item.shap.toFixed(3)}` : item.shap.toFixed(3)}
                    </span>
                  </div>
                </div>

                {/* Centered zero-axis bar graphic */}
                <div className="relative w-full h-3 bg-slate-50 dark:bg-slate-800/80 rounded border border-slate-100 dark:border-slate-700/60 flex items-center">
                  {/* Center vertical dashed axis line */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-300 dark:bg-slate-600 z-10" />

                  {isPos ? (
                    /* Positive bar extends rightwards from center (Red/Rose) */
                    <div
                      className="absolute left-1/2 top-0.5 bottom-0.5 bg-rose-500 rounded-r transition-all duration-300"
                      style={{ width: `${widthPct / 2}%` }}
                    />
                  ) : (
                    /* Negative bar extends leftwards from center (Teal) */
                    <div
                      className="absolute right-1/2 top-0.5 bottom-0.5 bg-teal-600 rounded-l transition-all duration-300"
                      style={{ width: `${widthPct / 2}%` }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* SHAP Value Impact Axis scale indicator */}
        <div className="flex justify-between text-[10px] text-slate-400 mt-2 px-1 tabular-nums border-t border-slate-100 dark:border-[#1A2E44] pt-2">
          <span>-{maxAbs.toFixed(2)}</span>
          <span className="text-slate-500 font-semibold">0 (Baseline Impact)</span>
          <span>+{maxAbs.toFixed(2)}</span>
        </div>
      </div>

      {/* Legend Footer */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-[#1A2E44] flex items-center justify-center gap-5 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span className="text-slate-600 dark:text-slate-400 text-[11px] font-medium">Increases Risk (+)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
          <span className="text-slate-600 dark:text-slate-400 text-[11px] font-medium">Protective / Decreases Risk (-)</span>
        </div>
      </div>
    </div>
  );
};
export default ShapChart;
