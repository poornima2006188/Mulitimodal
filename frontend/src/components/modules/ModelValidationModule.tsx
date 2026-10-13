import React, { useState } from 'react';
import { ValidationPanel } from '../ValidationPanel';
import { ModuleKey } from '../ModuleSelectionView';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  Database,
  Lock,
  Layers,
  FileText
} from 'lucide-react';

interface ModelValidationModuleProps {
  onNavigateModule: (mod: ModuleKey) => void;
  onBackToModules: () => void;
}

export const ModelValidationModule: React.FC<ModelValidationModuleProps> = ({
  onNavigateModule,
  onBackToModules
}) => {
  const [showLeakageAudit, setShowLeakageAudit] = useState(false);
  const [showCohortDetails, setShowCohortDetails] = useState(false);

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
                  Module 5
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <h1 className="text-base font-bold text-[#0B1B2B] dark:text-white">
                  Model Validation & Scientific Benchmarking
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Rigorous multi-target evaluation metrics, cross-validation ROC curves, and data leakage audits.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 text-teal-700 dark:text-teal-300 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Repeated Stratified 5-Fold CV</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Full Validation Panel with Tables and Diagnostic Plots (8 cols) */}
        <div className="lg:col-span-8">
          <ValidationPanel />
        </div>

        {/* Right Column: Progressive Disclosure Audits & Cohort Information (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Scientific Rigor Highlights */}
          <div className="bg-white dark:bg-[#0E1D2D] border border-slate-200 dark:border-[#1E3147] rounded-xl p-4 sm:p-5 shadow-xs space-y-3.5 text-xs">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-[#1A2E44] text-teal-700 dark:text-teal-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Validation Integrity Guarantee</span>
            </div>

            <div className="space-y-2.5 text-slate-600 dark:text-slate-400 leading-relaxed">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Probability Calibration:</strong> Sigmoid Platt calibration applied to Logistic Regression and XGBoost classifiers ensures reliable estimated probabilities.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Independent Estimators:</strong> Best-performing algorithms independently selected per target (LogReg for CAD/RCA, Random Forest for LAD, XGBoost for LCX).
                </span>
              </div>
            </div>
          </div>

          {/* Progressive Disclosure: Data Leakage Prevention Audit */}
          <div className="bg-white dark:bg-[#0E1D2D] border border-slate-200 dark:border-[#1E3147] rounded-xl shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setShowLeakageAudit(!showLeakageAudit)}
              className="w-full px-4 py-3 text-left flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Zero Data Leakage Audit</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showLeakageAudit ? 'rotate-180' : ''}`} />
            </button>

            {showLeakageAudit && (
              <div className="p-4 border-t border-slate-100 dark:border-[#1A2E44] bg-slate-50/50 dark:bg-slate-950/30 text-xs text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
                <p>
                  <strong>Catheterization Leakage Strip:</strong> Post-catheterization outcomes (Cath, LAD, LCX, RCA) are scrubbed prior to feature matrix preprocessing.
                </p>
                <p>
                  <strong>Exact Schema:</strong> Exactly 57 non-invasive clinical, ECG, laboratory, and echocardiographic variables form the standardized input feature order.
                </p>
              </div>
            )}
          </div>

          {/* Progressive Disclosure: Cohort Demographics */}
          <div className="bg-white dark:bg-[#0E1D2D] border border-slate-200 dark:border-[#1E3147] rounded-xl shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setShowCohortDetails(!showCohortDetails)}
              className="w-full px-4 py-3 text-left flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Z-Alizadeh Sani Cohort Details</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showCohortDetails ? 'rotate-180' : ''}`} />
            </button>

            {showCohortDetails && (
              <div className="p-4 border-t border-slate-100 dark:border-[#1A2E44] bg-slate-50/50 dark:bg-slate-950/30 text-xs text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
                <p>
                  <strong>Cohort Size:</strong> N = 303 patients undergoing diagnostic coronary catheter angiography at Shaheed Rajaei Cardiovascular Medical and Research Center.
                </p>
                <p>
                  <strong>Distribution:</strong> 216 patients with verified coronary artery disease (&ge;50% stenosis), 87 patients with normal coronary anatomy.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ModelValidationModule;
