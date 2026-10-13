import React from 'react';
import { PredictionResult } from '../types';
import { getRiskBand, VESSEL_THRESHOLDS } from '../config/riskBands';
import { Info } from 'lucide-react';

interface VesselCardsProps {
  prediction: PredictionResult | null;
  selectedVessel: string;
  onSelectVessel: (vessel: string) => void;
  loading: boolean;
}

export const VesselCards: React.FC<VesselCardsProps> = ({
  prediction,
  selectedVessel,
  onSelectVessel,
  loading
}) => {
  if (loading || !prediction) {
    return (
      <div className="bg-white dark:bg-[#0E1D2D] border border-slate-200 dark:border-[#1E3147] p-4 rounded-xl space-y-2 animate-pulse">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-3" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800 rounded-md" />
        ))}
      </div>
    );
  }

  const vessels = [
    {
      id: 'LAD',
      fullName: 'Left anterior descending',
      territory: 'Anterior wall & septum',
      model: 'Random Forest',
      auc: '0.862',
      threshold: VESSEL_THRESHOLDS.LAD,
      prob: prediction.probabilities.LAD,
      isStenotic: prediction.probabilities.LAD >= VESSEL_THRESHOLDS.LAD
    },
    {
      id: 'LCX',
      fullName: 'Left circumflex',
      territory: 'Lateral & posterior LV',
      model: 'XGBoost',
      auc: '0.733',
      threshold: VESSEL_THRESHOLDS.LCX,
      prob: prediction.probabilities.LCX,
      isStenotic: prediction.probabilities.LCX >= VESSEL_THRESHOLDS.LCX
    },
    {
      id: 'RCA',
      fullName: 'Right coronary',
      territory: 'Inferior wall & RV',
      model: 'Logistic Regression',
      auc: '0.719',
      threshold: VESSEL_THRESHOLDS.RCA,
      prob: prediction.probabilities.RCA,
      isStenotic: prediction.probabilities.RCA >= VESSEL_THRESHOLDS.RCA
    }
  ];

  return (
    <div className="bg-white dark:bg-[#0E1D2D] border border-slate-200 dark:border-[#1E3147] p-4 sm:p-5 rounded-xl shadow-xs">
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100 dark:border-[#1A2E44]">
        <h3 className="text-xs font-bold text-[#0B1B2B] dark:text-slate-100 uppercase tracking-wide">
          Coronary Vessel Stenosis Risk
        </h3>
        <span className="text-[11px] text-slate-400">
          Click vessel to inspect
        </span>
      </div>

      {/* Vessel Rows */}
      <div className="divide-y divide-slate-100 dark:divide-[#1A2E44]">
        {vessels.map(v => {
          const isSelected = selectedVessel === v.id;
          const pct = (v.prob * 100).toFixed(1);
          const band = getRiskBand(v.prob);

          return (
            <div
              key={v.id}
              onClick={() => onSelectVessel(v.id)}
              className={`py-3 px-2.5 rounded-lg transition cursor-pointer flex flex-col gap-1.5 ${
                isSelected
                  ? 'bg-teal-50/50 dark:bg-teal-950/20 ring-1 ring-teal-500/70 border border-teal-500/30'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
              tabIndex={0}
              role="button"
              aria-label={`Select ${v.id}`}
            >
              {/* Row Top: Vessel Name, Status Dot, Percentage */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${band.dotColor}`} />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {v.id}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-1.5">
                      {v.fullName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    v.isStenotic
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  }`}>
                    {v.isStenotic ? 'Stenotic' : 'Normal'}
                  </span>
                  <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 tabular-nums w-12 text-right">
                    {pct}%
                  </span>
                </div>
              </div>

              {/* Row Middle: Clean probability bar */}
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.max(4, Math.min(100, v.prob * 100))}%`,
                    backgroundColor: band.colorHex
                  }}
                />
              </div>

              {/* Row Bottom: Model architecture + AUC */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 tabular-nums">
                <span>{v.territory}</span>
                <span>{v.model} (AUC {v.auc})</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* LCX/RCA Reliability Caveat */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-[#1A2E44] flex items-start gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
        <p>
          Note: LCX (AUC 0.733) and RCA (AUC 0.719) classifiers have moderate discrimination compared to CAD (0.933), reflecting clinical non-invasive overlap.
        </p>
      </div>
    </div>
  );
};
export default VesselCards;
