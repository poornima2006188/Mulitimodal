import React, { useState } from 'react';
import { ExplanationResult, PatientData } from '../../types';
import { ShapChart } from '../ShapChart';
import { ModuleKey } from '../ModuleSelectionView';
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  HelpCircle,
  ChevronDown,
  Sparkles,
  Info,
  ArrowRight
} from 'lucide-react';

interface ExplainabilityModuleProps {
  explanation: ExplanationResult | null;
  selectedTarget: string;
  onSelectTarget: (target: string) => void;
  loading: boolean;
  patient: PatientData;
  onNavigateModule: (mod: ModuleKey) => void;
  onBackToModules: () => void;
}

export const ExplainabilityModule: React.FC<ExplainabilityModuleProps> = ({
  explanation,
  selectedTarget,
  onSelectTarget,
  loading,
  patient,
  onNavigateModule,
  onBackToModules
}) => {
  const [showMethodology, setShowMethodology] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  const targets = [
    { id: 'CAD', label: 'Overall CAD' },
    { id: 'LAD', label: 'LAD' },
    { id: 'LCX', label: 'LCX' },
    { id: 'RCA', label: 'RCA' }
  ];

  // Clinical explanations for known biomarkers in the 57-feature schema
  const featureExplanations: Record<string, string> = {
    'St Elevation': 'ST-segment elevation indicates acute transmural myocardial ischemia/injury on standard 12-lead electrocardiography.',
    'Region RWMA': 'Regional wall motion abnormalities (hypokinesia, akinesia, dyskinesia) reflect localized myocardial contractile dysfunction.',
    'Typical Chest Pain': 'Substernal chest pressure or squeezing precipitated by physical exertion or stress and relieved by rest or nitrates.',
    'Age': 'Cardiovascular risk progressively increases with advancing chronological age due to endothelial stiffening and vascular plaque accumulation.',
    'Poor R Progression': 'Loss or delayed increase of R-wave amplitude across precordial leads V1–V4, highly suggestive of anterior wall infarction.',
    'EF-TTE': 'Ejection fraction measured by transthoracic echocardiography; normal left ventricular function is 55–70%.',
    'BP': 'Systolic blood pressure; persistent hypertension accelerates vascular shear injury and plaque vulnerability.',
    'LDL': 'Low-density lipoprotein cholesterol; primary atherogenic lipoprotein directly participating in intimal plaque formation.',
    'FBS': 'Fasting blood sugar; elevated levels denote insulin resistance, endothelial oxidative stress, and accelerated coronary disease.',
    'Tinversion': 'T-wave inversion represents myocardial ischemia or repolarization delay in the subtended vascular territory.',
    'HTN': 'Hypertension history; chronic hemodynamic stress promoting vascular remodeling.',
    'DM': 'Diabetes mellitus; substantially accelerates multivessel coronary atherosclerosis.'
  };

  const topPosFeature = explanation?.positive_features[0]?.feature || 'St Elevation';
  const activeFeatureName = selectedFeature || topPosFeature;
  const activeFeatureInfo = featureExplanations[activeFeatureName] ||
    'Multimodal clinical biomarker identified by TreeSHAP as a key driver of this target model output.';

  const activePatientVal = patient[activeFeatureName] !== undefined ? patient[activeFeatureName] : 'Present';

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
                  Module 3
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <h1 className="text-base font-bold text-[#0B1B2B] dark:text-white">
                  SHAP Explainability & Feature Attribution
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Transparent feature contributions and local model explanations for each coronary vessel.
              </p>
            </div>
          </div>

          {/* Target Selector Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            {targets.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => onSelectTarget(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer focus-visible:ring-1 focus-visible:ring-teal-500 ${
                  selectedTarget === t.id
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-teal-600'
                }`}
              >
                {t.id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Focused Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Full SHAP Visualization Waterfall (7.5 cols) */}
        <div className="lg:col-span-8">
          <ShapChart
            explanation={explanation}
            selectedTarget={selectedTarget}
            onSelectTarget={onSelectTarget}
            loading={loading}
          />
        </div>

        {/* Right Column: Feature Inspector & Clinical Interpretation (4.5 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Feature Inspector Card */}
          <div className="bg-white dark:bg-[#0E1D2D] border border-slate-200 dark:border-[#1E3147] rounded-xl p-4 sm:p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-[#1A2E44]">
              <h2 className="text-xs font-bold text-[#0B1B2B] dark:text-slate-100 flex items-center gap-1.5 uppercase tracking-wide">
                <Info className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Feature Deep-Dive Inspector</span>
              </h2>
              <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                Target: {selectedTarget}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Inspected Biomarker
                </span>
                <div className="text-sm font-extrabold text-[#0B1B2B] dark:text-white mt-0.5">
                  {activeFeatureName}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">Patient Observed Value:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                    {String(activePatientVal)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">Attribution Impact:</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">Positive Risk Driver (+)</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Cardiovascular Clinical Relevance:
                </span>
                <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {activeFeatureInfo}
                </p>
              </div>
            </div>

            {/* Quick Feature Selector Pills from top positive features */}
            {explanation && explanation.positive_features.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-[#1A2E44]">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Quick Select Top Drivers:
                </span>
                <div className="flex flex-wrap gap-1">
                  {explanation.positive_features.slice(0, 4).map((f) => (
                    <button
                      key={f.feature}
                      type="button"
                      onClick={() => setSelectedFeature(f.feature)}
                      className={`px-2 py-1 rounded-md text-[10px] font-semibold transition cursor-pointer ${
                        activeFeatureName === f.feature
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950/40'
                      }`}
                    >
                      {f.feature}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Next Action: Run What-If Counterfactual */}
            <div className="pt-2 border-t border-slate-100 dark:border-[#1A2E44]">
              <button
                type="button"
                onClick={() => onNavigateModule('what-if')}
                className="w-full py-2.5 px-3 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 hover:bg-teal-100 text-teal-800 dark:text-teal-300 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
                <span>Test Modifying This in What-If Analysis</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>
          </div>

          {/* Progressive Disclosure: SHAP Methodology Accordion */}
          <div className="bg-white dark:bg-[#0E1D2D] border border-slate-200 dark:border-[#1E3147] rounded-xl shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setShowMethodology(!showMethodology)}
              className="w-full px-4 py-3 text-left flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>SHAP Methodology & Medical Disclaimer</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showMethodology ? 'rotate-180' : ''}`} />
            </button>

            {showMethodology && (
              <div className="p-4 border-t border-slate-100 dark:border-[#1A2E44] bg-slate-50/50 dark:bg-slate-950/30 text-xs text-slate-600 dark:text-slate-400 space-y-2.5 leading-relaxed">
                <p>
                  <strong>TreeSHAP Interpretation:</strong> Shapley additive explanations mathematically distribute the model log-odds / output among features based on cooperative game theory.
                </p>
                <p>
                  <strong>Clinical Scope:</strong> SHAP describes how features mathematically contributed to the trained algorithm's score.
                  <em> SHAP values describe statistical feature attribution and do not establish direct medical causation.</em>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ExplainabilityModule;
