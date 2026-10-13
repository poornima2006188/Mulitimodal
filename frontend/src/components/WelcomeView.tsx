import React from 'react';
import {
  Heart,
  Activity,
  Box,
  BarChart3,
  ArrowRight,
  AlertTriangle,
  ShieldCheck,
  Users,
  ClipboardList,
  Sparkles,
  Stethoscope,
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { HeartHeroVisual } from './HeartHeroVisual';
import { SamplePatient } from '../types';
import { ModuleKey } from './ModuleSelectionView';

interface WelcomeViewProps {
  onGetStarted: () => void;
  onNavigateModule?: (module: ModuleKey) => void;
  samples: SamplePatient[];
  onSelectSampleAndStart: (sample: SamplePatient) => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  onGetStarted,
  onNavigateModule,
  samples,
  onSelectSampleAndStart
}) => {
  const handleFeatureClick = (module: ModuleKey) => {
    if (onNavigateModule) {
      onNavigateModule(module);
    } else {
      onGetStarted();
    }
  };

  const scrollToFeatures = () => {
    const el = document.getElementById('features-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full flex flex-col justify-between min-h-[calc(100vh-120px)] space-y-12 py-4 animate-fade-in">

      {/* 1. HERO SECTION (Balanced two-column layout) */}
      <section className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 pt-4 md:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left Column: Heading, Description & CTAs */}
          <div className="lg:col-span-7 flex flex-col space-y-5">
            {/* Small Label */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 text-teal-700 dark:text-teal-300 text-xs font-semibold w-fit shadow-xs">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span>Multimodal AI Decision Support • Track A</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#0B1B2B] dark:text-white leading-[1.15]">
                See Beyond Numbers. <br />
                <span className="text-teal-600 dark:text-teal-400">
                  Explore Coronary Risk.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                Explore model-estimated coronary risk through interactive 3D visualization,
                explainable AI, and clinical feature analysis.
              </p>
            </div>

            {/* Primary & Secondary Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={onGetStarted}
                className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={scrollToFeatures}
                className="px-5 py-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-sm transition shadow-xs flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                <span>Explore Features</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Quick Benchmark Profiles */}
              {samples.length > 0 && (
                <div className="flex items-center gap-2 pl-1 sm:pl-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">Or load:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onSelectSampleAndStart(samples[0])}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-700 border border-slate-200 dark:border-slate-700 transition"
                      title="Load benchmark High-Risk patient"
                    >
                      High-Risk Case
                    </button>
                    {samples.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onSelectSampleAndStart(samples[1])}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-700 border border-slate-200 dark:border-slate-700 transition"
                        title="Load benchmark Normal patient"
                      >
                        Normal Case
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Credibility Line */}
            <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-4">
              <span>• Calibrated Multi-Target Predictors</span>
              <span>• Z-Alizadeh Sani Cohort (N = 303)</span>
              <span>• 57 Multimodal Features</span>
            </div>
          </div>

          {/* Right Column: 3D Anatomical Heart Live Preview */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="w-full bg-[#0B1B2B] border border-[#1A2E44] rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-1 pb-2 border-b border-[#1A2E44]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  <span className="text-xs font-semibold text-slate-200 tracking-wide uppercase">
                    3D Coronary Anatomy Live Preview
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 bg-[#07121E] px-2 py-0.5 rounded border border-[#1A2E44]">
                  Interactive
                </span>
              </div>

              {/* 3D Heart Canvas Component */}
              <HeartHeroVisual onExploreClick={() => handleFeatureClick('heart-viewer')} />

              <div className="mt-2 pt-2.5 border-t border-[#1A2E44] flex items-center justify-between text-[11px] text-slate-400">
                <span>Drag to rotate • Scroll to zoom</span>
                <button
                  type="button"
                  onClick={() => handleFeatureClick('heart-viewer')}
                  className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 transition"
                >
                  <span>Launch full viewer</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. FEATURE SECTION (Three compact, consistent cards) */}
      <section id="features-section" className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 pt-6">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0B1B2B] dark:text-white">
            Core Clinical Features
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Key capabilities integrated within the ArteryLens decision-support system
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Feature Card 1: Multi-Target Risk Prediction */}
          <div
            onClick={() => handleFeatureClick('patient-assessment')}
            className="bg-white dark:bg-[#0E1D2D] border border-slate-200 dark:border-[#1E3147] rounded-xl p-5 shadow-xs hover:border-teal-500 dark:hover:border-teal-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-4 group-hover:scale-105 transition">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0B1B2B] dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
                Multi-Target Risk Prediction
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Overall CAD and vessel-specific model-estimated probabilities for LAD, LCX, and RCA derived from 57 multimodal non-invasive clinical markers.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1A2E44] flex items-center text-xs font-semibold text-teal-600 dark:text-teal-400">
              <span>Start Risk Assessment</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Feature Card 2: Interactive 3D Coronary Visualization */}
          <div
            onClick={() => handleFeatureClick('heart-viewer')}
            className="bg-white dark:bg-[#0E1D2D] border border-slate-200 dark:border-[#1E3147] rounded-xl p-5 shadow-xs hover:border-teal-500 dark:hover:border-teal-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4 group-hover:scale-105 transition">
                <Box className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0B1B2B] dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
                Interactive 3D Coronary Visualization
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Explore LAD, LCX, and RCA through the 3D anatomical viewer, with vessel branch isolation, rotation, zoom, and probability-based risk mapping.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1A2E44] flex items-center text-xs font-semibold text-teal-600 dark:text-teal-400">
              <span>Explore 3D Anatomy</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Feature Card 3: Explainable AI */}
          <div
            onClick={() => handleFeatureClick('explainability')}
            className="bg-white dark:bg-[#0E1D2D] border border-slate-200 dark:border-[#1E3147] rounded-xl p-5 shadow-xs hover:border-teal-500 dark:hover:border-teal-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-105 transition">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0B1B2B] dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
                Explainable AI
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Understand model feature contributions through SHAP values, identifying positive drivers and protective factors for each anatomical vessel.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1A2E44] flex items-center text-xs font-semibold text-teal-600 dark:text-teal-400">
              <span>View SHAP Attribution</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS (Simple three-step workflow) */}
      <section id="how-it-works-section" className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 pt-4">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0B1B2B] dark:text-white">
            How It Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            A structured three-step clinical assessment workflow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Step 1 */}
          <div className="bg-white dark:bg-[#0E1D2D] border border-slate-200 dark:border-[#1E3147] rounded-xl p-5 shadow-xs relative">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-7 h-7 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                1
              </span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <ClipboardList className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-[#0B1B2B] dark:text-white">
              Enter Patient Details
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              Input patient clinical history, ECG findings, laboratory biomarkers, and echocardiography metrics across the 6 structured categories.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white dark:bg-[#0E1D2D] border border-slate-200 dark:border-[#1E3147] rounded-xl p-5 shadow-xs relative">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-7 h-7 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                2
              </span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <Cpu className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-[#0B1B2B] dark:text-white">
              Run Risk Assessment
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              Calibrated multi-target ML models compute simultaneous probability scores for overall CAD, LAD, LCX, and RCA stenosis.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white dark:bg-[#0E1D2D] border border-slate-200 dark:border-[#1E3147] rounded-xl p-5 shadow-xs relative">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-7 h-7 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                3
              </span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <Box className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-[#0B1B2B] dark:text-white">
              Explore Results
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              Examine the 3D heart coronary map, inspect SHAP feature attributions, simulate what-if lifestyle interventions, and query the AI explainer.
            </p>
          </div>
        </div>
      </section>

      {/* 4. SAFETY DISCLAIMER BANNER */}
      <section className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 pt-2 pb-4">
        <div className="bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-900/50 rounded-xl px-4 py-3 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-center gap-2.5 shadow-xs text-center">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="font-medium leading-relaxed">
            <strong>Medical Disclaimer</strong>: ArteryLens is a research prototype for educational and decision-support purposes only.
            Predictions are not a substitute for professional medical evaluation, diagnosis, or formal diagnostic imaging.
          </span>
        </div>
      </section>

    </div>
  );
};
export default WelcomeView;
