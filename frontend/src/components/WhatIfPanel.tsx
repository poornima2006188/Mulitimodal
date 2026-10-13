import React, { useState, useEffect } from 'react';
import { PatientData, WhatIfResult } from '../types';
import { simulateWhatIf } from '../api';
import { TrendingUp, RotateCcw, ArrowDownRight, ArrowUpRight, Sparkles, Loader2, Play, AlertCircle, Info } from 'lucide-react';
import { DEFAULT_PATIENT } from '../config/defaultPatient';

interface WhatIfPanelProps {
  patient: PatientData;
  onPatientChange?: (updated: PatientData) => void;
}

interface ParameterOption {
  key: string;
  name: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  defaultModified: number;
}

const PARAMETERS: ParameterOption[] = [
  { key: 'LDL', name: 'LDL-C Cholesterol', min: 40, max: 280, step: 5, unit: 'mg/dL', defaultModified: 70 },
  { key: 'BP', name: 'Systolic Blood Pressure', min: 80, max: 220, step: 5, unit: 'mmHg', defaultModified: 120 },
  { key: 'EF-TTE', name: 'Ejection Fraction (EF-TTE)', min: 25, max: 70, step: 1, unit: '%', defaultModified: 55 },
  { key: 'FBS', name: 'Fasting Blood Sugar', min: 65, max: 250, step: 5, unit: 'mg/dL', defaultModified: 95 },
  { key: 'Current Smoker', name: 'Smoking Cessation (0 = Non-smoker, 1 = Active)', min: 0, max: 1, step: 1, unit: '', defaultModified: 0 }
];

export const WhatIfPanel: React.FC<WhatIfPanelProps> = ({ patient }) => {
  const [selectedParamKey, setSelectedParamKey] = useState<string>('LDL');
  const [modifiedValue, setModifiedValue] = useState<number>(70);
  const [result, setResult] = useState<WhatIfResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const selectedParam = PARAMETERS.find(p => p.key === selectedParamKey) || PARAMETERS[0];
  const currentValue = patient[selectedParam.key] ?? (DEFAULT_PATIENT[selectedParam.key] ?? selectedParam.min);

  // Sync default modified value when parameter changes
  useEffect(() => {
    if (selectedParam.key === 'LDL') setModifiedValue(70);
    else if (selectedParam.key === 'BP') setModifiedValue(120);
    else if (selectedParam.key === 'EF-TTE') setModifiedValue(Math.min(60, Math.max(50, currentValue + 10)));
    else if (selectedParam.key === 'FBS') setModifiedValue(95);
    else if (selectedParam.key === 'Current Smoker') setModifiedValue(0);
    else setModifiedValue(selectedParam.defaultModified);
  }, [selectedParamKey, currentValue]);

  // Run simulation whenever patient, selected param or target value changes
  useEffect(() => {
    runSimulation();
  }, [patient, selectedParamKey, modifiedValue]);

  const runSimulation = async () => {
    setLoading(true);
    setError(null);
    try {
      const changes: Record<string, number> = {
        [selectedParam.key]: modifiedValue
      };
      const res = await simulateWhatIf(patient, changes);
      setResult(res);
    } catch (err: any) {
      console.error('What-if simulation error:', err);
      setError('What-If simulation request failed. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetToBaseline = () => {
    setModifiedValue(currentValue);
  };

  const vesselKeys = ['CAD', 'LAD', 'LCX', 'RCA'] as const;

  // Compute total or prominent reduction note
  let reductionHighlight = 'Adjusting modifiable parameters allows clinical scenario exploration.';
  if (result) {
    const lcxArr = Math.round((result.risk_comparison.LCX?.absolute_risk_reduction || 0) * 100);
    const cadArr = Math.round((result.risk_comparison.CAD?.absolute_risk_reduction || 0) * 100);
    const ladArr = Math.round((result.risk_comparison.LAD?.absolute_risk_reduction || 0) * 100);
    const rcaArr = Math.round((result.risk_comparison.RCA?.absolute_risk_reduction || 0) * 100);

    const maxVessel = [
      { name: 'CAD', val: cadArr },
      { name: 'LAD', val: ladArr },
      { name: 'LCX', val: lcxArr },
      { name: 'RCA', val: rcaArr }
    ].sort((a, b) => b.val - a.val)[0];

    if (maxVessel && maxVessel.val > 0) {
      reductionHighlight = `Target scenario yields a model-estimated ${maxVessel.val}% percentage-point risk reduction in ${maxVessel.name}.`;
    } else {
      reductionHighlight = 'Risk scores remain steady under the specified hypothetical adjustments.';
    }
  }

  return (
    <div id="whatif" className="bg-white dark:bg-[#0E1D2D] border border-slate-200 dark:border-[#1E3147] rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full">
      {/* Panel Header */}
      <div>
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100 dark:border-[#1A2E44]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0B1B2B] dark:text-slate-100">
                What-If Counterfactual Simulator
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Simulate modifiable clinical factor adjustments and evaluate model risk shifts
              </p>
            </div>
          </div>

          {/* Comparison Legend */}
          <div className="hidden sm:flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-600 dark:text-slate-400 font-medium">Baseline Patient</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
              <span className="text-slate-600 dark:text-slate-400 font-medium">What-If Scenario</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-3 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Two-Column Grid: Parameter Controls on Left, Side-by-Side Comparisons on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Controls Column (left 5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3.5">
            {/* Parameter Selector Dropdown */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Modifiable Biomarker / Risk Factor
              </label>
              <select
                value={selectedParamKey}
                onChange={e => setSelectedParamKey(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg px-2.5 py-2 focus:ring-1 focus:ring-teal-500 focus:outline-none cursor-pointer"
              >
                {PARAMETERS.map(p => (
                  <option key={p.key} value={p.key}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Current Value Display */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">
                  Current Observed Value
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs tabular-nums bg-white dark:bg-slate-700 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">
                  {currentValue} {selectedParam.unit}
                </span>
              </div>
              <input
                type="range"
                min={selectedParam.min}
                max={selectedParam.max}
                step={selectedParam.step}
                value={currentValue}
                disabled
                className="w-full accent-slate-400 cursor-not-allowed opacity-75"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>{selectedParam.min} {selectedParam.unit}</span>
                <span>{selectedParam.max} {selectedParam.unit}</span>
              </div>
            </div>

            {/* Proposed Target Value Control */}
            <div className="bg-teal-50/40 dark:bg-teal-950/20 p-3 rounded-xl border border-teal-200/80 dark:border-teal-900/40">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-teal-900 dark:text-teal-300 font-bold text-[11px]">
                  Proposed Counterfactual Value
                </span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={selectedParam.min}
                    max={selectedParam.max}
                    step={selectedParam.step}
                    value={modifiedValue}
                    onChange={e => setModifiedValue(Number(e.target.value))}
                    className="w-20 bg-white dark:bg-slate-800 border border-teal-300 dark:border-teal-700 text-teal-800 dark:text-teal-200 text-xs font-bold rounded px-1.5 py-0.5 text-right tabular-nums focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  <span className="text-[10px] text-teal-700 dark:text-teal-400 font-medium">{selectedParam.unit}</span>
                </div>
              </div>
              <input
                type="range"
                min={selectedParam.min}
                max={selectedParam.max}
                step={selectedParam.step}
                value={modifiedValue}
                onChange={e => setModifiedValue(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-teal-700/70 dark:text-teal-400/70 mt-0.5">
                <span>{selectedParam.min} {selectedParam.unit}</span>
                <span>{selectedParam.max} {selectedParam.unit}</span>
              </div>
            </div>

            {/* Action Buttons: Run Simulation & Reset */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={runSimulation}
                disabled={loading}
                className="flex-1 py-2 px-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Play className={`w-3.5 h-3.5 fill-current ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Simulating...' : 'Run Analysis'}</span>
              </button>

              <button
                type="button"
                onClick={handleResetToBaseline}
                className="py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium transition flex items-center justify-center gap-1 cursor-pointer"
                title="Reset counterfactual value to patient baseline"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Side-by-Side Comparison Columns (right 7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#0B1B2B] dark:text-slate-100 uppercase tracking-wide">
                  Model Estimated Stenosis Comparison
                </span>
                {loading && (
                  <span className="flex items-center gap-1 text-[11px] text-teal-600 font-medium">
                    <Loader2 className="w-3 h-3 animate-spin" /> Calculating...
                  </span>
                )}
              </div>

              {/* 4 Vessel Comparison Cards (CAD, LAD, LCX, RCA) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {vesselKeys.map(vKey => {
                  const data = result?.risk_comparison[vKey];
                  const baseP = data ? data.baseline_prob : 0.5;
                  const modP = data ? data.modified_prob : 0.5;
                  const basePct = (baseP * 100).toFixed(1);
                  const modPct = (modP * 100).toFixed(1);
                  const arr = data ? data.absolute_risk_reduction : 0;
                  const arrPct = (arr * 100).toFixed(1);
                  const isReduced = arr > 0.001;
                  const isIncreased = arr < -0.001;

                  return (
                    <div
                      key={vKey}
                      className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-2.5 border border-slate-200/80 dark:border-slate-700 flex flex-col items-center justify-between text-center min-h-[155px]"
                    >
                      {/* Vessel Header */}
                      <div className="w-full border-b border-slate-200/60 dark:border-slate-700 pb-1 mb-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{vKey}</span>
                      </div>

                      {/* Side-by-Side Bar Graphic */}
                      <div className="w-full flex items-end justify-center gap-2 h-18 mb-2 px-1">
                        {/* Red/Rose Current Bar */}
                        <div className="flex flex-col items-center flex-1 h-full justify-end">
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 tabular-nums leading-none mb-1">
                            {basePct}%
                          </span>
                          <div
                            className="w-full bg-rose-500 rounded-t transition-all duration-300"
                            style={{ height: `${Math.max(6, Math.min(100, Number(basePct)))}%` }}
                            title={`Baseline: ${basePct}%`}
                          />
                        </div>

                        {/* Teal Modified Bar */}
                        <div className="flex flex-col items-center flex-1 h-full justify-end">
                          <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 tabular-nums leading-none mb-1">
                            {modPct}%
                          </span>
                          <div
                            className="w-full bg-teal-600 rounded-t transition-all duration-300"
                            style={{ height: `${Math.max(6, Math.min(100, Number(modPct)))}%` }}
                            title={`Scenario: ${modPct}%`}
                          />
                        </div>
                      </div>

                      {/* Percentage Point Delta Indicator (ARR) */}
                      <div className="w-full pt-1.5 border-t border-slate-200/60 dark:border-slate-700">
                        {isReduced ? (
                          <div className="flex items-center justify-center gap-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                            <ArrowDownRight className="w-3.5 h-3.5" />
                            <span>-{Math.abs(Number(arrPct))}% ARR</span>
                          </div>
                        ) : isIncreased ? (
                          <div className="flex items-center justify-center gap-0.5 text-[11px] font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            <span>+{Math.abs(Number(arrPct))}% ARR</span>
                          </div>
                        ) : (
                          <span className="text-[11px] font-medium text-slate-400 tabular-nums">0.0% delta</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Potential Risk Reduction Callout Box */}
            <div className="mt-3.5 p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-md bg-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3 h-3" />
              </div>
              <div>
                <span className="text-xs font-bold text-teal-900 dark:text-teal-200 block">
                  Clinical Simulation Insight
                </span>
                <p className="text-[11px] text-teal-800 dark:text-teal-300 leading-relaxed mt-0.5">
                  {reductionHighlight}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default WhatIfPanel;
