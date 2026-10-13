import React, { useState } from 'react';
import { PatientData, SamplePatient } from '../types';
import {
  ClipboardList,
  Play,
  RotateCcw,
  User,
  HeartPulse,
  Stethoscope,
  Activity,
  TestTube,
  ChevronRight,
  ChevronLeft,
  Info,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  X
} from 'lucide-react';
import { DEFAULT_PATIENT } from '../config/defaultPatient';

interface PatientFormProps {
  patient: PatientData;
  onChange: (updated: PatientData) => void;
  samples: SamplePatient[];
  onSelectSample: (sample: SamplePatient) => void;
  onSubmit: () => void;
  loading: boolean;
  isDataModified?: boolean;
}

export const PatientForm: React.FC<PatientFormProps> = ({
  patient,
  onChange,
  samples,
  onSelectSample,
  onSubmit,
  loading,
  isDataModified = false
}) => {
  // Stepper / Tab selection: 1 to 6
  const [activeStep, setActiveStep] = useState<number>(1);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  const steps = [
    { id: 1, name: 'Demographics', icon: User, desc: 'Age, Sex, BMI' },
    { id: 2, name: 'Medical History', icon: HeartPulse, desc: 'DM, HTN, Smoking' },
    { id: 3, name: 'Symptoms & Signs', icon: Stethoscope, desc: 'Chest pain, BP, Vitals' },
    { id: 4, name: 'ECG Findings', icon: Activity, desc: 'ST changes, Q-wave, T-inv' },
    { id: 5, name: 'Laboratory Tests', icon: TestTube, desc: 'Lipids, Glucose, CBC' },
    { id: 6, name: 'Echo & Cardiac Function', icon: HeartPulse, desc: 'EF-TTE, RWMA, VHD' }
  ];

  const updateField = (key: string, val: number) => {
    const updated = {
      ...DEFAULT_PATIENT,
      ...patient,
      [key]: val
    };

    // Auto calculate BMI if height (Length in cm) or Weight changes
    if (key === 'Length' || key === 'Weight') {
      const h = (key === 'Length' ? val : (updated['Length'] || 170)) / 100;
      const w = key === 'Weight' ? val : (updated['Weight'] || 70);
      if (h > 0) {
        updated['BMI'] = parseFloat((w / (h * h)).toFixed(1));
      }
    }

    onChange(updated);
  };

  const getVal = (key: string): number => {
    return patient[key] !== undefined ? patient[key] : (DEFAULT_PATIENT[key] ?? 0);
  };

  const handleConfirmReset = () => {
    if (samples.length > 1) {
      onSelectSample(samples[1]); // Reset to normal benchmark patient
    } else {
      onChange({ ...DEFAULT_PATIENT });
    }
    setShowResetConfirm(false);
  };

  const bmiVal = getVal('BMI');
  const bmiLabel = bmiVal < 18.5 ? 'Underweight' : bmiVal < 25 ? 'Normal' : bmiVal < 30 ? 'Overweight' : 'Obese';
  const bmiBadgeColor = bmiVal < 25
    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';

  // Field validation checks
  const age = getVal('Age');
  const ageValid = age >= 20 && age <= 100;
  const bp = getVal('BP');
  const bpValid = bp >= 70 && bp <= 250;

  return (
    <div id="patient-assessment" className="bg-white dark:bg-[#0E1D2D] border border-slate-200 dark:border-[#1E3147] rounded-xl p-4 sm:p-5 shadow-xs flex flex-col justify-between h-full relative">

      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100 dark:border-[#1A2E44]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#0B1B2B] dark:text-slate-100">
                Patient Assessment Form
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                57 multimodal clinical features across 6 clinical domains
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Step {activeStep} of 6
            </span>
          </div>
        </div>

        {/* Form Modification Warning Notice if patient data modified */}
        {isDataModified && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Patient data modified since last assessment. Previous predictions may be outdated.</span>
            </div>
            <button
              type="button"
              onClick={onSubmit}
              disabled={loading}
              className="text-[11px] font-bold text-amber-700 dark:text-amber-300 underline hover:no-underline ml-2"
            >
              Recalculate now
            </button>
          </div>
        )}

        {/* Two-Column Form Structure: Left Stepper, Right Fields */}
        <div className="grid grid-cols-12 gap-3.5">
          {/* Step Navigation Sidebar (4 cols on sm+) */}
          <div className="col-span-12 sm:col-span-4 flex flex-col gap-1 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-[#1A2E44] pb-2 sm:pb-0 sm:pr-2.5">
            {steps.map(s => {
              const isActive = activeStep === s.id;
              const StepIcon = s.icon;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveStep(s.id)}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs transition cursor-pointer ${
                    isActive
                      ? 'bg-teal-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isActive ? 'bg-white text-teal-700' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
                      }`}
                    >
                      {s.id}
                    </span>
                    <span className="truncate">{s.name}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-teal-200 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Form Fields Content Area (8 cols) */}
          <div className="col-span-12 sm:col-span-8 flex flex-col justify-between min-h-[260px] pl-0 sm:pl-1">

            {/* Step 1: Demographics */}
            {activeStep === 1 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-[#1A2E44]">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                    1. Patient Demographics
                  </h3>
                  <span className="text-[10px] text-slate-400">* Required clinical parameters</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between mb-0.5">
                      <span>Age (years) <span className="text-rose-500">*</span></span>
                      {!ageValid && <span className="text-[10px] text-rose-500 font-normal">20–100 yrs</span>}
                    </label>
                    <input
                      type="number"
                      min="20"
                      max="100"
                      value={getVal('Age')}
                      onChange={e => updateField('Age', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 tabular-nums focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between mb-0.5">
                      <span>Biological Sex <span className="text-rose-500">*</span></span>
                    </label>
                    <select
                      value={getVal('Sex')}
                      onChange={e => updateField('Sex', parseFloat(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-teal-500 focus:outline-none cursor-pointer"
                    >
                      <option value={1}>Male</option>
                      <option value={0}>Female</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-0.5">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      min="100"
                      max="220"
                      value={getVal('Length')}
                      onChange={e => updateField('Length', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 tabular-nums focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-0.5">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      min="30"
                      max="200"
                      value={getVal('Weight')}
                      onChange={e => updateField('Weight', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 tabular-nums focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* BMI Card */}
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <Info className="w-3.5 h-3.5 text-teal-600" />
                    <span>Calculated Body Mass Index (BMI):</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">
                      {bmiVal.toFixed(1)} kg/m²
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${bmiBadgeColor}`}>
                      {bmiLabel}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Medical History */}
            {activeStep === 2 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-[#1A2E44]">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                    2. Past Medical History & Comorbidities
                  </h3>
                  <span className="text-[10px] text-slate-400">Check all that apply</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 max-h-[210px] overflow-y-auto pr-1">
                  {[
                    { key: 'DM', label: 'Diabetes Mellitus (DM)' },
                    { key: 'HTN', label: 'Hypertension (HTN)' },
                    { key: 'Current Smoker', label: 'Current Cigarette Smoker' },
                    { key: 'EX-Smoker', label: 'Ex-Smoker' },
                    { key: 'FH', label: 'Family History of CAD (FH)' },
                    { key: 'DLP', label: 'Dyslipidemia (DLP)' },
                    { key: 'CRF', label: 'Chronic Renal Failure (CRF)' },
                    { key: 'CHF', label: 'Congestive Heart Failure (CHF)' },
                    { key: 'CVA', label: 'Cerebrovascular Accident (CVA)' },
                    { key: 'Airway disease', label: 'Chronic Airway Disease' },
                    { key: 'Thyroid Disease', label: 'Thyroid Dysfunction' }
                  ].map(item => (
                    <label key={item.key} className="flex items-center gap-2 p-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition">
                      <input
                        type="checkbox"
                        checked={Boolean(getVal(item.key))}
                        onChange={e => updateField(item.key, e.target.checked ? 1 : 0)}
                        className="rounded border-slate-300 dark:border-slate-600 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-[11px] text-slate-700 dark:text-slate-300">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Symptoms & Signs */}
            {activeStep === 3 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-[#1A2E44]">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                    3. Symptoms & Physical Examination
                  </h3>
                  <span className="text-[10px] text-slate-400">Vitals and clinical presentations</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-1.5">
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between mb-0.5">
                      <span>Systolic BP (mmHg)</span>
                      {!bpValid && <span className="text-[10px] text-rose-500">70–250</span>}
                    </label>
                    <input
                      type="number"
                      min="70"
                      max="250"
                      value={getVal('BP')}
                      onChange={e => updateField('BP', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-slate-100 tabular-nums focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-0.5">
                      Pulse Rate (bpm)
                    </label>
                    <input
                      type="number"
                      min="40"
                      max="180"
                      value={getVal('PR')}
                      onChange={e => updateField('PR', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-slate-100 tabular-nums focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1 max-h-[150px] overflow-y-auto pr-1">
                  {[
                    { key: 'Typical Chest Pain', label: 'Typical Anginal Chest Pain' },
                    { key: 'Exertional CP', label: 'Exertional Chest Pain' },
                    { key: 'LowTH Ang', label: 'Low-Threshold Angina' },
                    { key: 'Dyspnea', label: 'Dyspnea on Exertion' },
                    { key: 'Atypical', label: 'Atypical Chest Pain' },
                    { key: 'Weak Peripheral Pulse', label: 'Weak Peripheral Pulses' },
                    { key: 'Edema', label: 'Peripheral Edema' },
                    { key: 'Lung rales', label: 'Pulmonary Rales' },
                    { key: 'Systolic Murmur', label: 'Systolic Heart Murmur' },
                    { key: 'Diastolic Murmur', label: 'Diastolic Heart Murmur' }
                  ].map(item => (
                    <label key={item.key} className="flex items-center gap-1.5 p-1 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(getVal(item.key))}
                        onChange={e => updateField(item.key, e.target.checked ? 1 : 0)}
                        className="rounded border-slate-300 dark:border-slate-600 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-[11px] text-slate-700 dark:text-slate-300">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: ECG Findings */}
            {activeStep === 4 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-[#1A2E44]">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                    4. 12-Lead Electrocardiogram (ECG)
                  </h3>
                  <span className="text-[10px] text-slate-400">Diagnostic ECG changes</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 max-h-[210px] overflow-y-auto pr-1">
                  {[
                    { key: 'St Elevation', label: 'ST-Segment Elevation' },
                    { key: 'St Depression', label: 'ST-Segment Depression' },
                    { key: 'Tinversion', label: 'T-Wave Inversion' },
                    { key: 'Q Wave', label: 'Pathological Q-Wave' },
                    { key: 'LVH', label: 'Left Ventricular Hypertrophy' },
                    { key: 'Poor R Progression', label: 'Poor R-Wave Progression' },
                    { key: 'BBB', label: 'Bundle Branch Block' }
                  ].map(item => (
                    <label key={item.key} className="flex items-center gap-2 p-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition">
                      <input
                        type="checkbox"
                        checked={Boolean(getVal(item.key))}
                        onChange={e => updateField(item.key, e.target.checked ? 1 : 0)}
                        className="rounded border-slate-300 dark:border-slate-600 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-[11px] text-slate-700 dark:text-slate-300">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Laboratory Tests */}
            {activeStep === 5 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-[#1A2E44]">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                    5. Laboratory Tests & Biomarkers
                  </h3>
                  <span className="text-[10px] text-slate-400">Lipids, metabolic, hematology</span>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-[210px] overflow-y-auto pr-1">
                  {[
                    { key: 'LDL', label: 'LDL-C (mg/dL)', step: 1 },
                    { key: 'HDL', label: 'HDL-C (mg/dL)', step: 1 },
                    { key: 'TG', label: 'Triglycerides (mg/dL)', step: 1 },
                    { key: 'FBS', label: 'Fasting Glucose (mg/dL)', step: 1 },
                    { key: 'CR', label: 'Creatinine (mg/dL)', step: 0.1 },
                    { key: 'BUN', label: 'Urea Nitrogen (mg/dL)', step: 1 },
                    { key: 'ESR', label: 'ESR (mm/hr)', step: 1 },
                    { key: 'WBC', label: 'WBC (/uL)', step: 100 },
                    { key: 'HB', label: 'Hemoglobin (g/dL)', step: 0.1 },
                    { key: 'K', label: 'Potassium (mEq/L)', step: 0.1 },
                    { key: 'Na', label: 'Sodium (mEq/L)', step: 1 },
                    { key: 'Neut', label: 'Neutrophils %', step: 1 },
                    { key: 'Lymph', label: 'Lymphocytes %', step: 1 }
                  ].map(lab => (
                    <div key={lab.key}>
                      <label className="text-[10px] font-medium text-slate-600 dark:text-slate-400 block mb-0.5">
                        {lab.label}
                      </label>
                      <input
                        type="number"
                        step={lab.step}
                        value={getVal(lab.key)}
                        onChange={e => updateField(lab.key, parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-slate-100 tabular-nums focus:ring-1 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 6: Echo & Cardiac Function */}
            {activeStep === 6 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-[#1A2E44]">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                    6. Echocardiography & Cardiac Function
                  </h3>
                  <span className="text-[10px] text-slate-400">TTE functional parameters</span>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1 font-medium">
                    <span className="text-slate-700 dark:text-slate-300">Ejection Fraction (EF-TTE)</span>
                    <span className="font-bold text-slate-900 dark:text-white tabular-nums">{getVal('EF-TTE')}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="75"
                    value={getVal('EF-TTE')}
                    onChange={e => updateField('EF-TTE', parseFloat(e.target.value))}
                    className="w-full accent-teal-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>20% (Severe dysfunction)</span>
                    <span>55–70% (Normal)</span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-0.5">
                    Regional Wall Motion Abnormality (RWMA)
                  </label>
                  <select
                    value={getVal('Region RWMA')}
                    onChange={e => updateField('Region RWMA', parseFloat(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-teal-500 focus:outline-none cursor-pointer"
                  >
                    <option value={0}>0 - None (Normal wall motion)</option>
                    <option value={1}>1 - Mild hypokinesia</option>
                    <option value={2}>2 - Moderate regional hypokinesia</option>
                    <option value={3}>3 - Severe akinesia or dyskinesia</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 block mb-0.5">
                    Valvular Heart Disease (VHD)
                  </label>
                  <select
                    value={getVal('VHD')}
                    onChange={e => updateField('VHD', parseFloat(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-teal-500 focus:outline-none cursor-pointer"
                  >
                    <option value={0}>None (Normal valve mechanics)</option>
                    <option value={1}>Mild regurgitation / stenosis</option>
                    <option value={2}>Moderate valvular disease</option>
                    <option value={3}>Severe valvular disease</option>
                  </select>
                </div>
              </div>
            )}

            {/* Stepper Navigation: Previous and Next Controls */}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-[#1A2E44]">
              <button
                type="button"
                onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                disabled={activeStep === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous Section</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveStep(prev => Math.min(6, prev + 1))}
                disabled={activeStep === 6}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <span>Next Section</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Action Buttons at the Bottom */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1A2E44] flex flex-wrap items-center gap-2">
        {/* Load Example Patient Quick Button */}
        {samples.length > 0 && (
          <button
            type="button"
            onClick={() => onSelectSample(samples[0])}
            className="py-2.5 px-3 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            title="Load Example Benchmark Case"
          >
            <User className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden sm:inline">Load Example Patient</span>
            <span className="sm:hidden">Example</span>
          </button>
        )}

        {/* Primary Action Button: Run Risk Assessment */}
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="flex-1 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-semibold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-2 shadow-xs transition disabled:opacity-50 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-500"
        >
          <Play className={`w-3.5 h-3.5 fill-current ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Evaluating Model Inference...' : 'Run Risk Assessment'}</span>
        </button>

        {/* Reset Button with Confirmation Dialog Guard */}
        <button
          type="button"
          onClick={() => setShowResetConfirm(true)}
          className="p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
          title="Reset Patient Data"
          aria-label="Reset Patient Data"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="absolute inset-0 bg-[#0B1B2B]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 rounded-xl">
          <div className="bg-white dark:bg-[#0E1D2D] border border-slate-200 dark:border-[#1E3147] rounded-xl p-5 max-w-sm w-full shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Confirm Reset</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to reset all clinical parameters to baseline? Entered patient values will be lost.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default PatientForm;
