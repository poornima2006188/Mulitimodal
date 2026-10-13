import React from 'react';
import { PredictionResult } from '../types';
import { BarChart3, RotateCw, Heart, Activity, AlertCircle } from 'lucide-react';
import { getRiskBand } from '../config/riskBands';

interface PredictionCardsProps {
  prediction: PredictionResult | null;
  selectedTarget: string;
  onSelectTarget: (target: string) => void;
  loading: boolean;
  onRefresh?: () => void;
  lastUpdated?: string;
  isDataModified?: boolean;
}

export const PredictionCards: React.FC<PredictionCardsProps> = ({
  prediction,
  selectedTarget,
  onSelectTarget,
  loading,
  onRefresh,
  lastUpdated,
  isDataModified = false
}) => {
  const targets = [
    {
      id: 'CAD',
      name: 'Overall CAD',
      subtitle: 'Main Coronary Disease',
      model: 'Logistic Regression',
      auc: '0.933',
      prob: prediction?.probabilities.CAD ?? 0.5,
      isMain: true
    },
    {
      id: 'LAD',
      name: 'LAD Branch',
      subtitle: 'Left Anterior Descending',
      model: 'Random Forest',
      auc: '0.862',
      prob: prediction?.probabilities.LAD ?? 0.5,
      isMain: false
    },
    {
      id: 'LCX',
      name: 'LCX Branch',
      subtitle: 'Left Circumflex',
      model: 'XGBoost',
      auc: '0.733',
      prob: prediction?.probabilities.LCX ?? 0.5,
      isMain: false
    },
    {
      id: 'RCA',
      name: 'RCA Branch',
      subtitle: 'Right Coronary Artery',
      model: 'Logistic Regression',
      auc: '0.719',
      prob: prediction?.probabilities.RCA ?? 0.5,
      isMain: false
    }
  ];

  return (
    <div id="prediction-results" className="bg-white dark:bg-[#0E1D2D] border border-slate-200 dark:border-[#1E3147] rounded-xl p-4 sm:p-5 shadow-xs">
      {/* Header with Title and Last Updated */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100 dark:border-[#1A2E44]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#0B1B2B] dark:text-slate-100">
              Model-Estimated Stenosis Probabilities
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Calibrated multi-target classification outputs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          {lastUpdated && <span className="hidden sm:inline">Calculated: {lastUpdated}</span>}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Recalculate Assessment"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-600' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Outdated Notification Banner if patient data modified */}
      {isDataModified && (
        <div className="mb-3 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-200 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Inputs changed. Probabilities below reflect previous calculation until assessment is re-run.</span>
        </div>
      )}

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {targets.map(t => {
          const isSelected = selectedTarget === t.id;
          const pct = (t.prob * 100).toFixed(1);
          const band = getRiskBand(t.prob);

          return (
            <div
              key={t.id}
              onClick={() => onSelectTarget(t.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-teal-500 bg-teal-50/30 dark:bg-teal-950/20 ring-1 ring-teal-500 shadow-xs'
                  : 'border-slate-200 dark:border-[#1E3147] bg-white dark:bg-[#07121E]/60 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
              tabIndex={0}
              role="button"
              aria-label={`Select ${t.name}`}
            >
              {/* Card Top: Title & Icon */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-xs font-bold text-[#0B1B2B] dark:text-slate-100 block">
                    {t.name}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-tight">
                    {t.subtitle}
                  </span>
                </div>

                {t.isMain ? (
                  <div className="w-6 h-6 rounded-md bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-md bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              {/* Card Center: Probability Value */}
              <div className="my-1.5">
                <div className="text-xl sm:text-2xl font-extrabold text-[#0B1B2B] dark:text-white tabular-nums tracking-tight">
                  {pct}%
                </div>
                <div className="text-[10px] text-slate-400">
                  AUC {t.auc} • {t.model}
                </div>
              </div>

              {/* Card Bottom: Risk Badge and Bottom Accent Line */}
              <div className="mt-2">
                <div className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mb-2 ${band.bgColor} ${band.textColor}`}>
                  {band.label}
                </div>

                {/* Card Bottom Progress Bar */}
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.max(5, Math.min(100, t.prob * 100))}%`,
                      backgroundColor: band.colorHex
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default PredictionCards;
