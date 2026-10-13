import React, { useState } from 'react';
import { PredictionResult } from '../../types';
import { HeartViewer } from '../HeartViewer';
import { VesselCards } from '../VesselCards';
import { ModuleKey } from '../ModuleSelectionView';
import {
  ArrowLeft,
  Box,
  BarChart3,
  HelpCircle,
  ChevronDown,
  Activity,
  Sparkles,
  Info,
  ArrowRight
} from 'lucide-react';
import { getRiskBand } from '../../config/riskBands';

interface HeartVisualizationModuleProps {
  prediction: PredictionResult | null;
  selectedVessel: string;
  onSelectVessel: (vessel: string) => void;
  loading: boolean;
  onNavigateModule: (mod: ModuleKey) => void;
  onBackToModules: () => void;
}

export const HeartVisualizationModule: React.FC<HeartVisualizationModuleProps> = ({
  prediction,
  selectedVessel,
  onSelectVessel,
  loading,
  onNavigateModule,
  onBackToModules
}) => {
  const [showAnatomyGuide, setShowAnatomyGuide] = useState(false);

  const probabilities = prediction?.probabilities || {
    LAD: 0.5,
    LCX: 0.5,
    RCA: 0.5
  };

  const selectedProb = probabilities[selectedVessel as 'LAD' | 'LCX' | 'RCA'] ?? 0.5;
  const band = getRiskBand(selectedProb);

  const vesselDetails: Record<string, { title: string; territory: string; ecgLeads: string; clinical: string }> = {
    LAD: {
      title: 'Left Anterior Descending (LAD) Artery',
      territory: 'Supplies anterior ventricular myocardium, cardiac apex, and the anterior 2/3 of the interventricular septum.',
      ecgLeads: 'Precordial leads V1–V4 (ST-segment elevation or anterior Q-waves).',
      clinical: 'Crucial vessel frequently designated as the clinical "widowmaker" due to the large left ventricular mass at risk.'
    },
    LCX: {
      title: 'Left Circumflex (LCX) Artery',
      territory: 'Supplies lateral and posterolateral walls of the left ventricle and anterolateral papillary muscle.',
      ecgLeads: 'High lateral leads I and aVL, plus lateral precordial leads V5–V6.',
      clinical: 'Stenosis can cause lateral wall ischemia which may be clinically subtle or silent on standard 12-lead surface ECG.'
    },
    RCA: {
      title: 'Right Coronary Artery (RCA)',
      territory: 'Supplies the right ventricle, inferior wall of the left ventricle, posterior 1/3 of the septum, and AV node (in right-dominant anatomy ~85%).',
      ecgLeads: 'Inferior leads II, III, and aVF (frequently associated with bradycardia or high-grade AV block).',
      clinical: 'Inferior wall infarctions often carry conduction system disturbances due to acute AV nodal artery compromise.'
    }
  };

  const currentDetail = vesselDetails[selectedVessel] || vesselDetails.LAD;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* 1. Header Banner */}
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
                  Module 2
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <h1 className="text-base font-bold text-[#0B1B2B] dark:text-white">
                  3D Heart Visualization & Coronary Vessel Mapping
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Interactive anatomical 3D heart with vessel-specific stenosis probabilities.
              </p>
            </div>
          </div>

          {/* Accessible HTML Vessel Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Select Vessel:</span>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              {['LAD', 'LCX', 'RCA'].map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => onSelectVessel(v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer focus-visible:ring-1 focus-visible:ring-teal-500 ${
                    selectedVessel === v
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-teal-600'
                  }`}
                  aria-pressed={selectedVessel === v}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left / Center: Interactive 3D Viewer (7.5 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <HeartViewer
            probabilities={probabilities}
            selectedVessel={selectedVessel}
            onSelectVessel={onSelectVessel}
          />
        </div>

        {/* Right Side: Vessel Breakdown & Clinical Context (4.5 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Vessel Cards Component */}
          <VesselCards
            prediction={prediction}
            selectedVessel={selectedVessel}
            onSelectVessel={onSelectVessel}
            loading={loading}
          />

          {/* Active Vessel Clinical Summary Box */}
          <div className="bg-white dark:bg-[#0E1D2D] border border-slate-200 dark:border-[#1E3147] rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-[#1A2E44]">
              <span className="text-xs font-bold text-[#0B1B2B] dark:text-slate-100">
                {currentDetail.title}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${band.bgColor} ${band.textColor}`}>
                {(selectedProb * 100).toFixed(1)}% {band.label}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Myocardial Territory:</span>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{currentDetail.territory}</p>
              </div>

              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">ECG Lead Correlation:</span>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{currentDetail.ecgLeads}</p>
              </div>
            </div>

            {/* Direct CTA to Inspect SHAP for this vessel */}
            <div className="pt-2 border-t border-slate-100 dark:border-[#1A2E44]">
              <button
                type="button"
                onClick={() => onNavigateModule('explainability')}
                className="w-full py-2.5 px-3 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 hover:bg-teal-100/70 text-teal-700 dark:text-teal-300 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <BarChart3 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Inspect SHAP Feature Drivers for {selectedVessel}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>
          </div>

          {/* Progressive Disclosure: Anatomy & Pathology Guide */}
          <div className="bg-white dark:bg-[#0E1D2D] border border-slate-200 dark:border-[#1E3147] rounded-xl shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAnatomyGuide(!showAnatomyGuide)}
              className="w-full px-4 py-3 text-left flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Coronary Anatomy & Territory Details</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showAnatomyGuide ? 'rotate-180' : ''}`} />
            </button>

            {showAnatomyGuide && (
              <div className="p-4 border-t border-slate-100 dark:border-[#1A2E44] bg-slate-50/50 dark:bg-slate-950/30 text-xs text-slate-600 dark:text-slate-400 space-y-2.5 leading-relaxed">
                <p>
                  <strong>Model-Estimated Stenosis:</strong> The model evaluates likelihood of clinically significant (&ge;50%) luminal stenosis on invasive catheterization.
                </p>
                <p>
                  <strong>Clinical Significance:</strong> {currentDetail.clinical}
                </p>
                <p className="text-[11px] text-slate-500 italic">
                  Note: The 3D model presents canonical anatomical paths; predicted probabilities represent statistical model likelihoods and do not depict focal plaque geometry.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default HeartVisualizationModule;
