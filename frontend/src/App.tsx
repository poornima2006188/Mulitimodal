import React, { useEffect, useState } from 'react';
import {
  PatientData,
  SamplePatient,
  PredictionResult,
  ExplanationResult
} from './types';
import { DEFAULT_PATIENT } from './config/defaultPatient';
import {
  fetchSamples,
  predictRisk,
  explainRisk
} from './api';
import { Navbar, ViewState } from './components/Navbar';
import { WelcomeView } from './components/WelcomeView';
import { ModuleSelectionView, ModuleKey } from './components/ModuleSelectionView';
import { PatientAssessmentModule } from './components/modules/PatientAssessmentModule';
import { HeartVisualizationModule } from './components/modules/HeartVisualizationModule';
import { ExplainabilityModule } from './components/modules/ExplainabilityModule';
import { WhatIfModule } from './components/modules/WhatIfModule';
import { ModelValidationModule } from './components/modules/ModelValidationModule';
import { AiExplainerModule } from './components/modules/AiExplainerModule';

export const App: React.FC = () => {
  // Navigation & View State (Defaults to 'welcome' landing page)
  const [currentView, setCurrentView] = useState<ViewState>('welcome');

  // Persistent Clinical Data & ML State across all views
  const [samples, setSamples] = useState<SamplePatient[]>([]);
  const [currentPatient, setCurrentPatient] = useState<PatientData>(DEFAULT_PATIENT);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [explanation, setExplanation] = useState<ExplanationResult | null>(null);
  const [selectedVessel, setSelectedVessel] = useState<string>('LAD');
  const [selectedTarget, setSelectedTarget] = useState<string>('CAD');
  const [loading, setLoading] = useState<boolean>(false);
  const [apiConnected, setApiConnected] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Sync dark mode class with root html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load benchmark samples on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = () => {
    fetchSamples()
      .then(sampleList => {
        setSamples(sampleList);
        if (sampleList.length > 0) {
          const first = sampleList[0];
          setCurrentPatient(first.data);
          runFullEvaluation(first.data, 'CAD');
        } else {
          runFullEvaluation(DEFAULT_PATIENT, 'CAD');
        }
        setApiConnected(true);
      })
      .catch(err => {
        console.error('API connection failed:', err);
        setApiConnected(false);
      });
  };

  const runFullEvaluation = async (patientData: PatientData, target: string = 'CAD') => {
    setLoading(true);
    try {
      const [predRes, expRes] = await Promise.all([
        predictRisk(patientData),
        explainRisk(patientData, target)
      ]);
      setPrediction(predRes);
      setExplanation(expRes);
      setApiConnected(true);

      const now = new Date();
      setLastUpdated(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Error running assessment:', err);
      setApiConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sample: SamplePatient) => {
    setCurrentPatient(sample.data);
    runFullEvaluation(sample.data, selectedTarget);
  };

  const handleSelectSampleAndStart = (sample: SamplePatient) => {
    setCurrentPatient(sample.data);
    runFullEvaluation(sample.data, selectedTarget);
    setCurrentView('modules');
  };

  const handleSelectVessel = (vessel: string) => {
    setSelectedVessel(vessel);
    setSelectedTarget(vessel);
    explainRisk(currentPatient, vessel)
      .then(res => setExplanation(res))
      .catch(err => console.error(err));
  };

  const handleSelectTarget = (target: string) => {
    setSelectedTarget(target);
    setSelectedVessel(target === 'CAD' ? 'LAD' : target);
    explainRisk(currentPatient, target)
      .then(res => setExplanation(res))
      .catch(err => console.error(err));
  };

  return (
    <div className="min-h-screen bg-[#F5F8FB] dark:bg-[#07121E] text-[#0B1B2B] dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* 1. Compact Header with Active Navigation and Breadcrumbs */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        samples={samples}
        onSelectSample={handleSelectSample}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        apiConnected={apiConnected}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      {/* 2. Main View Container (Switches based on currentView) */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-3 sm:p-4 md:p-6">
        {/* VIEW 1: Welcome Landing Page */}
        {currentView === 'welcome' && (
          <WelcomeView
            onGetStarted={() => {
              setCurrentView('modules');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateModule={(mod) => {
              setCurrentView(mod);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            samples={samples}
            onSelectSampleAndStart={handleSelectSampleAndStart}
          />
        )}

        {/* VIEW 2: Module Selection Hub (Choose a Module) */}
        {currentView === 'modules' && (
          <ModuleSelectionView
            onSelectModule={(mod) => {
              setCurrentView(mod);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBackToWelcome={() => {
              setCurrentView('welcome');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            samples={samples}
            onSelectSample={handleSelectSample}
            currentPatient={currentPatient}
            prediction={prediction}
          />
        )}

        {/* VIEW 3: Module 1 - Patient Assessment */}
        {currentView === 'patient-assessment' && (
          <PatientAssessmentModule
            currentPatient={currentPatient}
            onPatientChange={setCurrentPatient}
            samples={samples}
            onSelectSample={handleSelectSample}
            onSubmitAssessment={() => runFullEvaluation(currentPatient, selectedTarget)}
            prediction={prediction}
            selectedTarget={selectedTarget}
            onSelectTarget={handleSelectTarget}
            loading={loading}
            lastUpdated={lastUpdated}
            onNavigateModule={(mod) => {
              setCurrentView(mod);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBackToModules={() => {
              setCurrentView('modules');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* VIEW 4: Module 2 - 3D Heart Visualization */}
        {currentView === 'heart-viewer' && (
          <HeartVisualizationModule
            prediction={prediction}
            selectedVessel={selectedVessel}
            onSelectVessel={handleSelectVessel}
            loading={loading}
            onNavigateModule={(mod) => {
              setCurrentView(mod);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBackToModules={() => {
              setCurrentView('modules');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* VIEW 5: Module 3 - SHAP Explainability */}
        {currentView === 'explainability' && (
          <ExplainabilityModule
            explanation={explanation}
            selectedTarget={selectedTarget}
            onSelectTarget={handleSelectTarget}
            loading={loading}
            patient={currentPatient}
            onNavigateModule={(mod) => {
              setCurrentView(mod);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBackToModules={() => {
              setCurrentView('modules');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* VIEW 6: Module 4 - What-If Analysis */}
        {currentView === 'what-if' && (
          <WhatIfModule
            currentPatient={currentPatient}
            onPatientChange={setCurrentPatient}
            onNavigateModule={(mod) => {
              setCurrentView(mod);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBackToModules={() => {
              setCurrentView('modules');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* VIEW 7: Module 5 - Model Validation */}
        {currentView === 'validation' && (
          <ModelValidationModule
            onNavigateModule={(mod) => {
              setCurrentView(mod);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBackToModules={() => {
              setCurrentView('modules');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* VIEW 8: Module 6 - AI Clinical Explainer */}
        {currentView === 'ai-explainer' && (
          <AiExplainerModule
            currentPatient={currentPatient}
            selectedTarget={selectedTarget}
            prediction={prediction}
            onNavigateModule={(mod) => {
              setCurrentView(mod);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBackToModules={() => {
              setCurrentView('modules');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Slim Clinical Footer */}
      <footer className="border-t border-slate-200 dark:border-[#1E3147] bg-white dark:bg-[#0B1B2B] px-6 py-3 mt-auto text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">ArteryLens</span>
            <span>• Visual Intelligence for Coronary Risk (Track A)</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Research prototype for educational & decision-support purposes only • UCI Z-Alizadeh Sani Cohort (N = 303)
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
