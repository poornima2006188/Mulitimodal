import React, { useState } from 'react';
import { PatientData } from '../../types';
import { WhatIfPanel } from '../WhatIfPanel';
import { ModuleKey } from '../ModuleSelectionView';
import {
  ArrowLeft,
  TrendingUp,
  HelpCircle,
  ChevronDown,
  Box,
  Sparkles,
  HeartHandshake,
  ArrowRight,
  Info
} from 'lucide-react';

interface WhatIfModuleProps {
  currentPatient: PatientData;
  onPatientChange: (patient: PatientData) => void;
  onNavigateModule: (mod: ModuleKey) => void;
  onBackToModules: () => void;
}

export const WhatIfModule: React.FC<WhatIfModuleProps> = ({
  currentPatient,
  onPatientChange,
  onNavigateModule,
  onBackToModules
}) => {
  const [showGuidelines, setShowGuidelines] = useState(false);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* 1. Module Header */}
      <div className="bg-white dark:bg-[#0E1D2D] border border-slate-200 dark:border-[#1E3147] rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToModules}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer focus-visible:ring-1 focus-visible:ring-teal-500"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Modules</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                  Module 4
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <h1 className="text-base font-bold text-[#0B1B2B] dark:text-white">
                  What-If Counterfactual Scenario Analysis
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Simulate modifiable clinical risk factor adjustments and quantify predicted stenosis risk reductions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateModule('heart-viewer')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-700 transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Box className="w-3.5 h-3.5 text-teal-600" />
              <span>View in 3D Heart</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Focused Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Full Interactive What-If Simulator (8 cols) */}
        <div className="lg:col-span-8">
          <WhatIfPanel
            patient={currentPatient}
            onPatientChange={onPatientChange}
          />
        </div>

        {/* Right Column: Clinical Guidance & Counterfactual Reasoning (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Quick Counterfactual Summary Card */}
          <div className="bg-white dark:bg-[#0E1D2D] border border-slate-200 dark:border-[#1E3147] rounded-xl p-4 sm:p-5 shadow-xs space-y-3.5 text-xs">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-[#1A2E44] text-teal-700 dark:text-teal-400 font-bold">
              <HeartHandshake className="w-4 h-4" />
              <span>Clinical Counterfactual Principles</span>
            </div>

            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              What-if simulations model the statistical sensitivity of the multi-target classifiers to changes in patient parameters.
              By simulating therapeutic targets (e.g. reducing LDL-C to guideline targets or stabilizing systolic pressure),
              clinicians can visually explore relative shifts in CAD, LAD, LCX, and RCA estimated likelihoods.
            </p>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Model Limitation & Context:
              </span>
              Simulations evaluate mathematical feature shifts through trained decision models and do not guarantee anatomic disease regression without formal clinical verification.
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-[#1A2E44] space-y-2">
              <button
                type="button"
                onClick={() => onNavigateModule('ai-explainer')}
                className="w-full py-2.5 px-3 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 hover:bg-teal-100 text-teal-700 dark:text-teal-300 font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Ask AI to Recommend Clinical Targets</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>
          </div>

          {/* Progressive Disclosure: Cardiovascular Prevention Targets */}
          <div className="bg-white dark:bg-[#0E1D2D] border border-slate-200 dark:border-[#1E3147] rounded-xl shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setShowGuidelines(!showGuidelines)}
              className="w-full px-4 py-3 text-left flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Cardiovascular Guidelines (ACC/AHA)</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showGuidelines ? 'rotate-180' : ''}`} />
            </button>

            {showGuidelines && (
              <div className="p-4 border-t border-slate-100 dark:border-[#1A2E44] bg-slate-50/50 dark:bg-slate-950/30 text-xs text-slate-600 dark:text-slate-400 space-y-2.5 leading-relaxed">
                <div>
                  <strong>LDL-C Target:</strong> &lt; 70 mg/dL (or &lt; 55 mg/dL for very high risk individuals with recurrent ischemic events).
                </div>
                <div>
                  <strong>Blood Pressure:</strong> SBP &lt; 120–130 mmHg via lifestyle and guideline-directed pharmacotherapy.
                </div>
                <div>
                  <strong>Glycemic Control:</strong> Fasting blood glucose &lt; 100 mg/dL with HbA1c &lt; 7.0%.
                </div>
                <div>
                  <strong>Smoking Cessation:</strong> Absolute cessation of all combustible tobacco products.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default WhatIfModule;
