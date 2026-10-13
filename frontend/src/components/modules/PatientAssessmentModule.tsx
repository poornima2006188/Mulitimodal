import React, { useState } from 'react';
import { PatientData, SamplePatient, PredictionResult } from '../../types';
import { PatientForm } from '../PatientForm';
import { PredictionCards } from '../PredictionCards';
import { MeasurementsTable } from '../MeasurementsTable';
import { ModuleKey } from '../ModuleSelectionView';
import {
  ArrowLeft,
  ChevronRight,
  Box,
  BarChart3,
  TrendingUp,
  Sparkles,
  Table2,
  ChevronDown,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface PatientAssessmentModuleProps {
  currentPatient: PatientData;
  onPatientChange: (patient: PatientData) => void;
  samples: SamplePatient[];
  onSelectSample: (sample: SamplePatient) => void;
  onSubmitAssessment: () => void;
  prediction: PredictionResult | null;
  selectedTarget: string;
  onSelectTarget: (target: string) => void;
  loading: boolean;
  lastUpdated: string;
  onNavigateModule: (mod: ModuleKey) => void;
  onBackToModules: () => void;
}

export const PatientAssessmentModule: React.FC<PatientAssessmentModuleProps> = ({
  currentPatient,
  onPatientChange,
  samples,
  onSelectSample,
  onSubmitAssessment,
  prediction,
  selectedTarget,
  onSelectTarget,
  loading,
  lastUpdated,
  onNavigateModule,
  onBackToModules
}) => {
  const [showMeasurementsTable, setShowMeasurementsTable] = useState(false);
  const [isDataModified, setIsDataModified] = useState(false);

  const handlePatientDataChange = (updated: PatientData) => {
    setIsDataModified(true);
    onPatientChange(updated);
  };

  const handleRunAssessment = () => {
    setIsDataModified(false);
    onSubmitAssessment();
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* 1. Module Header Banner */}
      <div className="bg-white dark:bg-[#0E1D2D] border border-slate-200 dark:border-[#1E3147] rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                  Module 1
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <h1 className="text-base font-bold text-[#0B1B2B] dark:text-white">
                  Patient Assessment & Clinical Risk Stratification
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter multimodal clinical data, calculate calibrated risk, and inspect stenosis probabilities.
              </p>
            </div>
          </div>

          {/* 3-Step Sequence Flow Indicator */}
          <div className="flex items-center gap-1 sm:gap-2 bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs font-medium self-start md:self-auto">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-300 font-semibold border border-teal-500/20">
              <span className="w-4 h-4 rounded-full bg-teal-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
              <span>Intake Data</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${
              loading
                ? 'bg-amber-500/10 text-amber-600 font-semibold border border-amber-500/20'
                : 'text-slate-600 dark:text-slate-300'
            }`}>
              <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] flex items-center justify-center font-bold">2</span>
              <span>Model Eval</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${
              prediction
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/20'
                : 'text-slate-400'
            }`}>
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">3</span>
              <span>Risk Results</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Focused Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Focused Patient Input Form */}
        <div className="lg:col-span-7 xl:col-span-7">
          <PatientForm
            patient={currentPatient}
            onChange={handlePatientDataChange}
            samples={samples}
            onSelectSample={onSelectSample}
            onSubmit={handleRunAssessment}
            loading={loading}
            isDataModified={isDataModified}
          />
        </div>

        {/* Right Column: Prediction Results + Recommended Actions */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col gap-4">
          {/* Prediction Cards */}
          <PredictionCards
            prediction={prediction}
            selectedTarget={selectedTarget}
            onSelectTarget={onSelectTarget}
            loading={loading}
            onRefresh={handleRunAssessment}
            lastUpdated={lastUpdated}
            isDataModified={isDataModified}
          />

          {/* Action Center: Seamless next steps to other modules */}
          <div className="bg-white dark:bg-[#0E1D2D] border border-slate-200 dark:border-[#1E3147] rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1A2E44] pb-2.5">
              <h3 className="text-xs font-bold text-[#0B1B2B] dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Recommended Next Actions</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-medium">Explore patient insights</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => onNavigateModule('heart-viewer')}
                className="p-3 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-950/20 hover:bg-rose-100/50 dark:hover:bg-rose-900/30 text-left transition flex items-start gap-2.5 group cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <Box className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    <span>3D Heart Model</span>
                    <ArrowRight className="w-3 h-3 text-rose-500 group-hover:translate-x-0.5 transition" />
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Rotate coronary vessels & inspect anatomy
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onNavigateModule('explainability')}
                className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/20 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 text-left transition flex items-start gap-2.5 group cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    <span>SHAP Explainability</span>
                    <ArrowRight className="w-3 h-3 text-emerald-500 group-hover:translate-x-0.5 transition" />
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    View top positive & negative risk drivers
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onNavigateModule('what-if')}
                className="p-3 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/20 hover:bg-amber-100/50 dark:hover:bg-amber-900/30 text-left transition flex items-start gap-2.5 group cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    <span>What-If Analysis</span>
                    <ArrowRight className="w-3 h-3 text-amber-500 group-hover:translate-x-0.5 transition" />
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Adjust BP, LDL, and simulate risk drop
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onNavigateModule('ai-explainer')}
                className="p-3 rounded-xl border border-teal-200 dark:border-teal-900/40 bg-teal-50/30 dark:bg-teal-950/20 hover:bg-teal-100/50 dark:hover:bg-teal-900/30 text-left transition flex items-start gap-2.5 group cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    <span>AI Explainer</span>
                    <ArrowRight className="w-3 h-3 text-teal-500 group-hover:translate-x-0.5 transition" />
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Ask questions grounded in this patient
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Progressive Disclosure: Expandable Clinical Measurements Table */}
          <div className="bg-white dark:bg-[#0E1D2D] border border-slate-200 dark:border-[#1E3147] rounded-xl shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setShowMeasurementsTable(!showMeasurementsTable)}
              className="w-full px-4 py-3 text-left flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Table2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Reference Clinical Measurements & Lab Ranges</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                <span>{showMeasurementsTable ? 'Hide Details' : 'View Details'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMeasurementsTable ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {showMeasurementsTable && (
              <div className="p-4 border-t border-slate-100 dark:border-[#1A2E44] bg-slate-50/50 dark:bg-slate-950/30">
                <MeasurementsTable patient={currentPatient} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default PatientAssessmentModule;
