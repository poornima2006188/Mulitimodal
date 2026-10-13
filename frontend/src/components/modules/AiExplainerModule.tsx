import React from 'react';
import { PatientData, PredictionResult } from '../../types';
import { AiAgentChat } from '../AiAgentChat';
import { ModuleKey } from '../ModuleSelectionView';
import {
  ArrowLeft,
  Sparkles,
  User,
  Activity,
  Heart,
  HelpCircle,
  MessageSquare,
  Stethoscope,
  ChevronRight
} from 'lucide-react';
import { getRiskBand } from '../../config/riskBands';

interface AiExplainerModuleProps {
  currentPatient: PatientData;
  selectedTarget: string;
  prediction: PredictionResult | null;
  onNavigateModule: (mod: ModuleKey) => void;
  onBackToModules: () => void;
}

export const AiExplainerModule: React.FC<AiExplainerModuleProps> = ({
  currentPatient,
  selectedTarget,
  prediction,
  onNavigateModule,
  onBackToModules
}) => {
  const cadProb = prediction?.probabilities.CAD ?? 0.5;
  const ladProb = prediction?.probabilities.LAD ?? 0.5;
  const lcxProb = prediction?.probabilities.LCX ?? 0.5;
  const rcaProb = prediction?.probabilities.RCA ?? 0.5;

  const cadBand = getRiskBand(cadProb);
  const ladBand = getRiskBand(ladProb);
  const lcxBand = getRiskBand(lcxProb);
  const rcaBand = getRiskBand(rcaProb);

  const age = currentPatient['Age'] ?? 65;
  const gender = (currentPatient['Sex'] ?? 1) === 1 ? 'Male' : 'Female';
  const bp = currentPatient['BP'] ?? 120;
  const ldl = currentPatient['LDL'] ?? 100;
  const ef = currentPatient['EF-TTE'] ?? 55;
  const smoker = currentPatient['Current Smoker'] === 1 ? 'Yes' : 'No';

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
                  Module 6
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <h1 className="text-base font-bold text-[#0B1B2B] dark:text-white">
                  AI Clinical Explainer & Reasoning Agent
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ask interactive questions and receive clinical explanations synthesized from active predictions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 text-teal-700 dark:text-teal-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Grounded in Active Patient</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Interactive Chat (8 cols) */}
        <div className="lg:col-span-8">
          <AiAgentChat
            patient={currentPatient}
            selectedTarget={selectedTarget}
          />
        </div>

        {/* Right Column: Active Patient Context Summary (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white dark:bg-[#0E1D2D] border border-slate-200 dark:border-[#1E3147] rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-[#1A2E44]">
              <Stethoscope className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <h2 className="text-xs font-bold text-[#0B1B2B] dark:text-white uppercase tracking-wider">
                Active Clinical Context
              </h2>
            </div>

            {/* Demographics & Vitals */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Patient</span>
                <div className="font-bold text-slate-900 dark:text-slate-100">{age}yo {gender}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Blood Pressure</span>
                <div className="font-bold text-slate-900 dark:text-slate-100">{bp} mmHg</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-bold">LDL-C</span>
                <div className="font-bold text-slate-900 dark:text-slate-100">{ldl} mg/dL</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-bold">EF-TTE</span>
                <div className="font-bold text-slate-900 dark:text-slate-100">{ef}%</div>
              </div>
            </div>

            {/* Predicted Stenosis Probabilities */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-[#1A2E44]">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                Active Model Probabilities:
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                  <span className="font-medium text-slate-800 dark:text-slate-200">Overall CAD</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cadBand.bgColor} ${cadBand.textColor}`}>
                    {(cadProb * 100).toFixed(1)}% {cadBand.label}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                  <span className="font-medium text-slate-800 dark:text-slate-200">LAD Artery</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ladBand.bgColor} ${ladBand.textColor}`}>
                    {(ladProb * 100).toFixed(1)}% {ladBand.label}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                  <span className="font-medium text-slate-800 dark:text-slate-200">LCX Artery</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${lcxBand.bgColor} ${lcxBand.textColor}`}>
                    {(lcxProb * 100).toFixed(1)}% {lcxBand.label}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                  <span className="font-medium text-slate-800 dark:text-slate-200">RCA Artery</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${rcaBand.bgColor} ${rcaBand.textColor}`}>
                    {(rcaProb * 100).toFixed(1)}% {rcaBand.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Helper Actions */}
            <div className="pt-2 border-t border-slate-100 dark:border-[#1A2E44]">
              <button
                type="button"
                onClick={() => onNavigateModule('patient-assessment')}
                className="w-full py-2.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Edit Patient Clinical Profile</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AiExplainerModule;
