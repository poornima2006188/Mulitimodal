# Track A Submission Manifest: CardioRisk 3D (ArteryLens)
**Project Title**: CardioRisk 3D — Visual Intelligence for Coronary Risk
**Competition**: Multimodal AI Hackathon 2026 — Track A
**Submission Package**: `CardioRisk_3D_Track_A_Submission.zip`
**Author**: Kirthana (Final-Year CSE)
**Dataset**: UCI Extension of Z-Alizadeh Sani ($N=303$, 57 Engineered Features)

---

## 1. Included Files and Directory Manifest

The submission ZIP contains the complete source code, trained models, explainers, reports, dataset, and documentation:

```
CardioRisk_3D_Track_A_Submission/
├── backend/
│   ├── main.py                  # FastAPI REST server & API endpoints
│   ├── preprocess.py            # Feature engineering, winsorization, leakage prevention, benchmark cases
│   ├── agent.py                 # Tool-grounded clinical narrative synthesis & counterfactual simulator
│   └── requirements.txt         # Backend Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── HeartViewer.tsx        # Interactive 3D Three.js WebGL heart & procedural coronary arteries
│   │   │   ├── PatientForm.tsx        # 57-feature categorized clinical intake form
│   │   │   ├── RiskCard.tsx           # Calibrated overall CAD risk gauge
│   │   │   ├── VesselCards.tsx        # LAD, LCX, RCA vessel risk cards
│   │   │   ├── ShapChart.tsx          # Local SHAP positive risk drivers vs protective factors
│   │   │   ├── MeasurementsTable.tsx  # Biomarker comparison against standard cardiology normal ranges
│   │   │   ├── AiAgentChat.tsx        # Clinical reasoning assistant & What-If simulator UI
│   │   │   └── MetricsModal.tsx       # Cross-validation performance modal & ROC/Calibration curves
│   │   ├── api.ts                     # TypeScript API client
│   │   ├── types.ts                   # TypeScript interfaces & types
│   │   ├── App.tsx                    # Root dashboard application layout
│   │   └── index.css                  # Custom cyber-clinical design system & pulse animations
│   ├── index.html                     # HTML5 entry with metadata
│   ├── package.json                   # Frontend dependencies and npm scripts
│   ├── package-lock.json              # Deterministic npm lockfile
│   ├── postcss.config.js              # PostCSS configuration
│   ├── tailwind.config.js             # Tailwind CSS configuration
│   ├── tsconfig.json                  # TypeScript compiler settings
│   └── vite.config.ts                 # Vite bundler configuration
├── models/
│   ├── model_cad.joblib               # Calibrated Logistic Regression model (ROC-AUC 0.934)
│   ├── model_lad.joblib               # Calibrated Random Forest model (ROC-AUC 0.862)
│   ├── model_lcx.joblib               # Calibrated XGBoost model (ROC-AUC 0.733)
│   ├── model_rca.joblib               # Calibrated Logistic Regression model (ROC-AUC 0.719)
│   ├── explainer_cad.joblib           # SHAP LinearExplainer for CAD
│   ├── explainer_lad.joblib           # SHAP TreeExplainer for LAD
│   ├── explainer_lcx.joblib           # SHAP TreeExplainer for LCX
│   ├── explainer_rca.joblib           # SHAP LinearExplainer for RCA
│   └── schema.json                    # Feature metadata schema (57 features)
├── reports/
│   ├── cv_metrics_all_models.csv      # Full repeated 5-fold CV comparisons
│   ├── cv_metrics_best.csv            # Best model performance summary table
│   ├── metrics.json                   # Structured JSON metrics for UI
│   ├── roc_calibration.png            # ROC curves & Platt calibration curves
│   ├── confusion_matrices.png         # Out-of-fold confusion matrices
│   ├── shap_summary_CAD.png           # Global beeswarm SHAP plot for CAD
│   ├── shap_summary_LAD.png           # Global beeswarm SHAP plot for LAD
│   ├── shap_summary_LCX.png           # Global beeswarm SHAP plot for LCX
│   ├── shap_summary_RCA.png           # Global beeswarm SHAP plot for RCA
│   ├── shap_bar_CAD.png               # Mean absolute SHAP importance for CAD
│   ├── shap_bar_LAD.png               # Mean absolute SHAP importance for LAD
│   ├── shap_bar_LCX.png               # Mean absolute SHAP importance for LCX
│   ├── shap_bar_RCA.png               # Mean absolute SHAP importance for RCA
│   └── training.log                   # Training execution log
├── extention of Z-Alizadeh sani dataset.xlsx  # Dataset (UCI Machine Learning Repository)
├── train.py                           # Full ML training & cross-validation pipeline script
├── test_endpoints.py                  # Comprehensive backend test suite (leakage, endpoints, SHAP)
├── requirements.txt                   # Root Python dependencies
├── README.md                          # Comprehensive setup, run, and reproducibility guide
├── DOCUMENTATION.md                   # Complete technical documentation report
├── DEMO_VIDEO_SCRIPT.md               # 6-minute presentation script & shot list
└── SUBMISSION_MANIFEST.md             # This submission manifest
```

---

## 2. Packaging Exclusions

The packaging process strictly excludes:
- `node_modules/` (Frontend package dependencies; reinstalled via `npm install`)
- `frontend/dist/` (Transpiled build cache)
- `.git/` & `.gitignore` (Source control metadata)
- `__pycache__/` and `*.pyc` (Python bytecode caches)
- Virtual environments (`venv/`, `.venv/`, `env/`)
- Temporary, log, and editor files (`.DS_Store`, `Thumbs.db`, `.vscode/`, `.idea/`)
- Existing submission archive files (`*.zip`)

---

## 3. Data & Asset Attribution Summary

1. **Clinical Dataset**:
   - UCI Machine Learning Repository: *Extension of Z-Alizadeh Sani Dataset* (DOI: `10.24432/C59P43`).
   - License: CC BY 4.0.
2. **3D Heart Anatomy & Vasculature**:
   - Procedural WebGL TubeGeometry/SphereGeometry constructed with Three.js.
   - Author: Original project implementation ([HeartViewer.tsx](file:///c:/Users/Poornima/OneDrive/Desktop/NAV/ArteryLens-Visual-Intelligence-for-Coronary-Risk/frontend/src/components/HeartViewer.tsx)).
   - License: MIT License. No third-party mesh files required.

---

## 4. Verification & Reproducibility Summary

1. **Automated Backend Test Suite**:
   - Command: `python test_endpoints.py`
   - Verified: Zero data leakage, /health, /schema, /metrics, /samples, /predict, /explain (all 4 targets), /agent/what_if.
2. **Frontend Build Verification**:
   - Command: `npm run build`
   - Verified: TypeScript validation and Vite production bundling (`frontend/dist`).
3. **Demo Video Status**:
   - Script and shot list ready (`DEMO_VIDEO_SCRIPT.md`).
   - Actual video recording pending final recording file.
