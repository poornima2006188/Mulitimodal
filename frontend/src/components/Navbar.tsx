import React from 'react';
import {
  Heart,
  Activity,
  Box,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  Users,
  Sun,
  Moon,
  Menu,
  X,
  LayoutGrid,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { SamplePatient } from '../types';
import { ModuleKey } from './ModuleSelectionView';

export type ViewState = 'welcome' | 'modules' | ModuleKey;

interface NavbarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  samples: SamplePatient[];
  onSelectSample: (sample: SamplePatient) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  apiConnected: boolean;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  samples,
  onSelectSample,
  darkMode,
  onToggleDarkMode,
  apiConnected,
  mobileMenuOpen,
  onToggleMobileMenu
}) => {
  const isInsideModule = currentView !== 'welcome' && currentView !== 'modules';

  const moduleNavItems = [
    { id: 'patient-assessment' as ModuleKey, label: 'Assessment', icon: ClipboardList },
    { id: 'heart-viewer' as ModuleKey, label: '3D Heart', icon: Box },
    { id: 'explainability' as ModuleKey, label: 'SHAP Explainability', icon: BarChart3 },
    { id: 'what-if' as ModuleKey, label: 'What-If', icon: TrendingUp },
    { id: 'validation' as ModuleKey, label: 'Validation', icon: ShieldCheck },
    { id: 'ai-explainer' as ModuleKey, label: 'AI Explainer', icon: Sparkles }
  ];

  const getModuleTitle = (key: ViewState) => {
    switch (key) {
      case 'patient-assessment': return 'Patient Assessment';
      case 'heart-viewer': return '3D Heart';
      case 'explainability': return 'Explainability';
      case 'what-if': return 'What-If Analysis';
      case 'validation': return 'Model Validation';
      case 'ai-explainer': return 'AI Clinical Explainer';
      case 'modules': return 'Modules Hub';
      default: return 'Home';
    }
  };

  const scrollToSection = (sectionId: string) => {
    if (currentView !== 'welcome') {
      onNavigate('welcome');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-[#0B1B2B] text-white border-b border-[#1A2E44] px-4 md:px-6 py-2.5 sticky top-0 z-50 shadow-sm transition-colors">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">

        {/* Left: ArteryLens Brand Logo, Wordmark & Interactive Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('welcome')}
            className="flex items-center gap-2.5 text-left group focus-visible:ring-1 focus-visible:ring-teal-400 rounded-lg p-0.5"
            aria-label="ArteryLens Home"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-600/20 border border-teal-500/40 flex items-center justify-center p-0.5 shadow-xs group-hover:border-teal-400 transition">
              <Heart className="w-4 h-4 text-teal-400 fill-teal-400/30" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-bold tracking-tight text-white leading-tight flex items-center gap-1.5">
                ArteryLens
              </span>
              <p className="text-[10px] text-slate-400 tracking-normal leading-none font-normal">
                Visual Intelligence for Coronary Risk
              </p>
            </div>
          </button>

          {/* Breadcrumb path on functional pages */}
          {currentView !== 'welcome' && (
            <nav aria-label="Breadcrumb" className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 pl-3 border-l border-[#1A2E44]">
              <button
                type="button"
                onClick={() => onNavigate('welcome')}
                className="hover:text-white transition focus-visible:ring-1 focus-visible:ring-teal-400 rounded px-1"
              >
                Home
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              <button
                type="button"
                onClick={() => onNavigate('modules')}
                className={`hover:text-white transition focus-visible:ring-1 focus-visible:ring-teal-400 rounded px-1 ${
                  currentView === 'modules' ? 'text-teal-400 font-semibold' : ''
                }`}
              >
                Modules
              </button>
              {isInsideModule && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-teal-300 font-medium px-1">
                    {getModuleTitle(currentView)}
                  </span>
                </>
              )}
            </nav>
          )}
        </div>

        {/* Center: Module Switcher (Inside modules) OR Clean Landing Links (On welcome page) */}
        {currentView === 'welcome' ? (
          <nav aria-label="Welcome Navigation" className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
            <button
              type="button"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-white hover:text-teal-300 transition py-1 focus-visible:ring-1 focus-visible:ring-teal-400 rounded"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('features-section')}
              className="hover:text-teal-300 transition py-1 focus-visible:ring-1 focus-visible:ring-teal-400 rounded"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('how-it-works-section')}
              className="hover:text-teal-300 transition py-1 focus-visible:ring-1 focus-visible:ring-teal-400 rounded"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => onNavigate('modules')}
              className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer focus-visible:ring-1 focus-visible:ring-teal-400"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Choose a Module</span>
            </button>
          </nav>
        ) : isInsideModule ? (
          <nav aria-label="Module Switcher" className="hidden xl:flex items-center gap-1 bg-[#07121E]/80 p-1 rounded-xl border border-[#1A2E44]">
            <button
              type="button"
              onClick={() => onNavigate('modules')}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-[#13283E] transition flex items-center gap-1.5 cursor-pointer focus-visible:ring-1 focus-visible:ring-teal-400"
              title="Return to Module Selection Hub"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-slate-400" />
              <span>All Modules</span>
            </button>

            <div className="h-4 w-px bg-[#1A2E44] mx-1" />

            {moduleNavItems.map(item => {
              const IconComp = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer focus-visible:ring-1 focus-visible:ring-teal-400 ${
                    isActive
                      ? 'bg-teal-600/25 text-teal-300 font-semibold border border-teal-500/40 shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-[#13283E]/70'
                  }`}
                >
                  <IconComp className={`w-3.5 h-3.5 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        ) : (
          <nav aria-label="Page Navigation" className="hidden md:flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('welcome')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-[#13283E] transition"
            >
              Welcome Home
            </button>
            <div className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-600/20 text-teal-300 border border-teal-500/30 flex items-center gap-1.5">
              <LayoutGrid className="w-3.5 h-3.5 text-teal-400" />
              <span>Module Selection</span>
            </div>
          </nav>
        )}

        {/* Right: API Health Status, Example Patients, Theme, Mobile Hamburger */}
        <div className="flex items-center gap-2">
          {/* API Health Status Dot */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#07121E]/60 border border-[#1A2E44] text-[11px] text-slate-300"
            title={apiConnected ? 'FastAPI & ML Predictors Active' : 'ML Backend Disconnected'}
          >
            <span className={`w-2 h-2 rounded-full ${apiConnected ? 'bg-emerald-400' : 'bg-rose-500'}`} />
            <span className="font-medium">{apiConnected ? 'API Connected' : 'Offline'}</span>
          </div>

          {/* Example Patients Dropdown */}
          {samples.length > 0 && (
            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#13283E] hover:bg-[#1A3757] text-slate-200 border border-[#244265] transition shadow-xs cursor-pointer focus-visible:ring-1 focus-visible:ring-teal-400"
              >
                <Users className="w-3.5 h-3.5 text-teal-400" />
                <span className="hidden sm:inline">Benchmark Patients</span>
              </button>

              <div className="absolute right-0 mt-1 w-64 bg-[#0B1B2B] border border-[#1A2E44] rounded-xl shadow-xl py-1 hidden group-hover:block z-50">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#1A2E44]">
                  Select Clinical Benchmark
                </div>
                {samples.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onSelectSample(s)}
                    className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-[#13283E] hover:text-teal-300 transition"
                  >
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{s.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#13283E] transition cursor-pointer focus-visible:ring-1 focus-visible:ring-teal-400"
            title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="xl:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#13283E] transition focus-visible:ring-1 focus-visible:ring-teal-400"
            aria-label="Open navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden pt-3 pb-2 border-t border-[#1A2E44] mt-2 space-y-1 animate-fade-in">
          <button
            type="button"
            onClick={() => { onNavigate('welcome'); onToggleMobileMenu(); }}
            className={`w-full text-left px-3 py-2 text-xs rounded-lg ${
              currentView === 'welcome' ? 'bg-teal-600/30 text-teal-300 font-semibold' : 'text-slate-300 hover:bg-[#13283E]'
            }`}
          >
            Welcome / Home
          </button>
          <button
            type="button"
            onClick={() => { onNavigate('modules'); onToggleMobileMenu(); }}
            className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center gap-2 ${
              currentView === 'modules' ? 'bg-teal-600/30 text-teal-300 font-semibold' : 'text-slate-300 hover:bg-[#13283E]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Choose a Module</span>
          </button>

          <div className="pt-2 pb-1 text-[10px] font-bold text-slate-500 uppercase px-3">
            Functional Modules
          </div>

          {moduleNavItems.map(item => {
            const IconComp = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => { onNavigate(item.id); onToggleMobileMenu(); }}
                className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center gap-2 ${
                  isActive ? 'bg-teal-600/30 text-teal-300 font-semibold' : 'text-slate-300 hover:bg-[#13283E]'
                }`}
              >
                <IconComp className="w-3.5 h-3.5 text-teal-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
