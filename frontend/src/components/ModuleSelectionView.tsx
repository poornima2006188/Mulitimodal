import React from 'react';
import {
  ClipboardList,
  Box,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Users,
  AlertTriangle,
  ArrowLeft,
  Heart,
  ChevronDown,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { SamplePatient, PatientData, PredictionResult } from '../types';
import { getRiskBand } from '../config/riskBands';

export type ModuleKey =
  | 'patient-assessment'
  | 'heart-viewer'
  | 'explainability'
  | 'what-if'
  | 'validation'
  | 'ai-explainer';

interface ModuleSelectionViewProps {
  onSelectModule: (module: ModuleKey) => void;
  onBackToWelcome: () => void;
  samples: SamplePatient[];
  onSelectSample: (sample: SamplePatient) => void;
  currentPatient: PatientData;
  prediction: PredictionResult | null;
}

export const ModuleSelectionView: React.FC<ModuleSelectionViewProps> = ({
  onSelectModule,
  onBackToWelcome,
  samples,
  onSelectSample,
  currentPatient,
  prediction
}) => {
  const modules = [
    {
      id: 'patient-assessment' as ModuleKey,
      title: 'Patient Assessment',
      category: 'Clinical Intake & Prediction',
      description: 'Enter clinical demographics, vitals, labs, and ECG findings to predict CAD and vessel stenosis risk across 57 features.',
      action: 'Start Assessment',
      icon: ClipboardList,
      highlights: ['Demographics & Labs', 'Multi-target inference', 'Instant risk stratification']
    },
    {
      id: 'heart-viewer' as ModuleKey,
      title: '3D Heart Visualization',
      category: 'Anatomical Mapping',
      description: 'Explore interactive 3D coronary anatomy with mapped stenosis likelihood across LAD, LCX, and RCA branches.',
      action: 'Explore 3D Model',
      icon: Heart,
      highlights: ['LAD / LCX / RCA branch isolation', 'Vessel stenosis color codes', 'Full 3D rotation & zoom']
    },
    {
      id: 'explainability' as ModuleKey,
      title: 'Explainability',
      category: 'SHAP Attribution',
      description: 'View SHAP feature contributions and local model explanations to understand what drives each prediction.',
      action: 'View SHAP Insights',
      icon: BarChart3,
      highlights: ['Feature importance waterfall', 'Positive & negative risk drivers', 'Target-specific attributions']
    },
    {
      id: 'what-if' as ModuleKey,
      title: 'What-If Analysis',
      category: 'Counterfactual Simulator',
      description: 'Simulate adjustments to blood pressure, LDL cholesterol, and lifestyle factors to quantify risk reductions.',
      action: 'Simulate Scenarios',
      icon: TrendingUp,
      highlights: ['LDL, BP, EF-TTE sliders', 'Multi-vessel risk delta', 'Lifestyle modification targets']
    },
    {
      id: 'validation' as ModuleKey,
      title: 'Model Validation',
      category: 'Scientific Benchmarks',
      description: 'Review cross-validation metrics, ROC curves, calibration plots, and data leakage audits on the Z-Alizadeh Sani cohort.',
      action: 'Inspect Validation',
      icon: ShieldCheck,
      highlights: ['5-fold repeated CV metrics', 'AUC 0.72 - 0.93', 'Zero data leakage audit']
    },
    {
      id: 'ai-explainer' as ModuleKey,
      title: 'AI Clinical Explainer',
      category: 'Conversational Agent',
      description: 'Query an AI clinical assistant to receive transparent reasoning and plain-language summaries for this patient.',
      action: 'Chat with AI Agent',
      icon: Sparkles,
      highlights: ['Clinical reasoning assistant', 'Plain-language summaries', 'Pre-configured query chips']
    }
  ];

  // Active patient summary calculations
  const hasValidPatient = Boolean(currentPatient && Object.keys(currentPatient).length > 0);
  const cadProb = prediction?.probabilities.CAD ?? 0.5;
  const cadBand = getRiskBand(cadProb);
  const patientAge = currentPatient['Age'] ?? 65;
  const patientGender = (currentPatient['Sex'] ?? 1) === 1 ? 'Male' : 'Female';

  return (
    <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in">
      {/* Top Action Bar & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToWelcome}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition shadow-xs flex items-center gap-1.5 text-xs font-semibold cursor-pointer focus-visible:ring-1 focus-visible:ring-teal-500"
            title="Return to Welcome Landing"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Back to Welcome</span>
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0B1B2B] dark:text-white">
              Choose a Module
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Select a specialized module to explore ArteryLens features
            </p>
          </div>
        </div>

        {/* Right: Active Patient Profile & Benchmark Loader */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Active Patient Indicator Pill (Shown only when valid patient exists) */}
          {hasValidPatient && (
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-2 shadow-xs">
              <span className="text-slate-500 dark:text-slate-400">Active Profile:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {patientAge}yo {patientGender}
              </span>
              {prediction && (
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${cadBand.bgColor} ${cadBand.textColor}`}>
                  CAD {(cadProb * 100).toFixed(1)}% {cadBand.label}
                </span>
              )}
            </div>
          )}

          {/* Benchmark Patients Quick Dropdown */}
          {samples.length > 0 && (
            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-teal-500 shadow-xs transition cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Load Benchmark Patient</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <div className="absolute right-0 mt-1 w-64 bg-white dark:bg-[#0B1B2B] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 hidden group-hover:block z-50">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  Select Benchmark Patient
                </div>
                {samples.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onSelectSample(s)}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-slate-800 hover:text-teal-700 dark:hover:text-teal-300 transition"
                  >
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{s.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 6 Clean Consistent Module Cards (Desktop: 3 cols, Tablet: 2 cols, Mobile: 1 col) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {modules.map(mod => {
          const IconComponent = mod.icon;
          return (
            <div
              key={mod.id}
              onClick={() => onSelectModule(mod.id)}
              className="group bg-white dark:bg-[#0E1D2D] border border-slate-200 dark:border-[#1E3147] rounded-xl p-5 shadow-xs transition-all duration-200 cursor-pointer flex flex-col justify-between hover:border-teal-500 dark:hover:border-teal-400 hover:shadow-md focus-visible:ring-2 focus-visible:ring-teal-500"
              tabIndex={0}
              role="button"
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectModule(mod.id);
                }
              }}
              aria-label={`Open ${mod.title} module`}
            >
              <div>
                {/* Top Card Bar: Icon and Category Badge */}
                <div className="flex items-center justify-between mb-3.5">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-900/40 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-xs transition group-hover:scale-105 duration-200">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold tracking-wide px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700">
                    {mod.category}
                  </span>
                </div>

                {/* Title & Description */}
                <h2 className="text-base font-bold text-[#0B1B2B] dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
                  {mod.title}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed min-h-[48px]">
                  {mod.description}
                </p>

                {/* Key Bullet Highlights */}
                <ul className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                  {mod.highlights.map((h, i) => (
                    <li key={i} className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1.5 group-hover:translate-x-0.5 transition">
                  <span>{mod.action}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Click to open</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Safety Medical Disclaimer */}
      <div className="pt-2">
        <div className="bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-900/50 rounded-xl px-4 py-2.5 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-center gap-2 shadow-xs text-center">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="font-medium">
            <strong>Important</strong>: This is a research prototype for educational and decision-support purposes only. Predictions are not a substitute for professional medical diagnosis, clinical evaluation, or imaging.
          </span>
        </div>
      </div>
    </div>
  );
};
export default ModuleSelectionView;
