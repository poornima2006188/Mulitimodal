import React, { useEffect, useState } from 'react';
import { MetricsData } from '../types';
import { fetchMetrics, getReportImageUrl } from '../api';
import { ShieldCheck, Info, CheckCircle2, AlertTriangle, Layers, BarChart2 } from 'lucide-react';

export const ValidationPanel: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [activeTab, setActiveTab] = useState<'table' | 'roc' | 'cm' | 'shap'>('table');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchMetrics()
      .then(data => setMetrics(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const metricHighlights = [
    { target: 'CAD', model: 'Logistic Regression', auc: '0.933', f1: '0.903', desc: 'High discrimination for overall CAD' },
    { target: 'LAD', model: 'Random Forest', auc: '0.862', f1: '0.833', desc: 'Robust anterior branch sensitivity' },
    { target: 'LCX', model: 'XGBoost', auc: '0.733', f1: '0.580', desc: 'Moderate lateral branch discrimination' },
    { target: 'RCA', model: 'Logistic Regression', auc: '0.719', f1: '0.604', desc: 'Moderate inferior branch discrimination' }
  ];

  return (
    <div id="validation" className="bg-white dark:bg-[#0E1D2D] border border-slate-200 dark:border-[#1E3147] rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full space-y-4">
      {/* Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-[#1A2E44]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0B1B2B] dark:text-slate-100">
                Model Evaluation & Scientific Benchmarks
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Repeated Stratified 5-Fold Cross-Validation on Z-Alizadeh Sani Cohort (N = 303)
              </p>
            </div>
          </div>

          {/* Sub-tabs pills */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200/80 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition cursor-pointer ${
                activeTab === 'table'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Metrics Table
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('roc')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition cursor-pointer ${
                activeTab === 'roc'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              ROC Curves
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cm')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition cursor-pointer ${
                activeTab === 'cm'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Confusion Matrices
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('shap')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition cursor-pointer ${
                activeTab === 'shap'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              SHAP Summary
            </button>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {metricHighlights.map(item => (
            <div
              key={item.target}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.target}</span>
                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                  AUC {item.auc}
                </span>
              </div>
              <div className="my-1">
                <span className="text-base font-extrabold text-[#0B1B2B] dark:text-white tabular-nums">
                  F1 {item.f1}
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  {item.model}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                {item.desc}
              </span>
            </div>
          ))}
        </div>

        {/* Tab 1: Metrics Table */}
        {activeTab === 'table' && (
          <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-[#1A2E44]">
            <table className="w-full text-left text-xs tabular-nums">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                  <th className="py-2 px-3">Target</th>
                  <th className="py-2 px-3">Best Model</th>
                  <th className="py-2 px-3">ROC-AUC</th>
                  <th className="py-2 px-3">F1 Score</th>
                  <th className="py-2 px-3">Recall</th>
                  <th className="py-2 px-3">Precision</th>
                  <th className="py-2 px-3">Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {metrics?.cv_best.map(row => (
                  <tr key={row.target} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100 font-sans">
                      {row.target}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                      {row.model}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-teal-700 dark:text-teal-400">
                      {row.roc_auc.toFixed(3)}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-200">
                      {row.f1.toFixed(3)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                      {(row.recall * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                      {(row.precision * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                      {(row.accuracy * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: ROC Curves */}
        {activeTab === 'roc' && (
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <img
              src={getReportImageUrl('roc_calibration.png')}
              alt="ROC Curves and Platt Calibration"
              className="max-h-[220px] w-auto rounded-lg border border-slate-200 dark:border-slate-700 object-contain shadow-xs"
            />
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">
              Cross-validated Receiver Operating Characteristic (ROC) & Sigmoid Calibration Curves
            </span>
          </div>
        )}

        {/* Tab 3: Confusion Matrix */}
        {activeTab === 'cm' && (
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <img
              src={getReportImageUrl('confusion_matrices.png')}
              alt="Multi-Target Confusion Matrices"
              className="max-h-[220px] w-auto rounded-lg border border-slate-200 dark:border-slate-700 object-contain shadow-xs"
            />
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">
              Test-fold Confusion Matrices across CAD, LAD, LCX, and RCA Targets
            </span>
          </div>
        )}

        {/* Tab 4: SHAP Plots */}
        {activeTab === 'shap' && (
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <img
              src={getReportImageUrl('shap_summary_CAD.png')}
              alt="CAD Global SHAP Summary Plot"
              className="max-h-[220px] w-auto rounded-lg border border-slate-200 dark:border-slate-700 object-contain shadow-xs"
            />
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">
              Global TreeSHAP Summary Beeswarm for Overall CAD Predictor
            </span>
          </div>
        )}
      </div>

      {/* Honest Limitation Callout Notice */}
      <div className="p-3 rounded-xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200/90 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-bold">
            Scientific Cohort Context & Discrimination Limitations:
          </p>
          <p className="text-amber-800 dark:text-amber-300 mt-0.5">
            Validation conducted on N = 303 angiographically verified records from the UCI Z-Alizadeh Sani cohort.
            While overall CAD (AUC 0.933) and LAD (AUC 0.862) demonstrate strong discrimination, LCX (AUC 0.733) and RCA (AUC 0.719) have moderate discrimination due to overlapping non-invasive presentations and limited single-center sample size. This prototype has not been clinically validated for standalone diagnostic use.
          </p>
        </div>
      </div>
    </div>
  );
};
export default ValidationPanel;
