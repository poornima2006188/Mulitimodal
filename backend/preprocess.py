"""
Shared preprocessing module for Track A Cardiovascular Risk Prediction.
Ensures identical feature engineering, encoding, winsorization, and column order
between training and backend serving.
"""
from pathlib import Path
import numpy as np
import pandas as pd
import json

TARGETS = {"CAD": "Cath", "LAD": "LAD", "LCX": "LCX", "RCA": "RCA"}
LEAKAGE_COLS = ["Cath", "LAD", "LCX", "RCA"]

# Feature order saved from training pipeline
FEATURE_ORDER = [
    'Age', 'Weight', 'Length', 'Sex', 'BMI', 'DM', 'HTN', 'Current Smoker',
    'EX-Smoker', 'FH', 'CRF', 'CVA', 'Airway disease', 'Thyroid Disease',
    'CHF', 'DLP', 'BP', 'PR', 'Edema', 'Weak Peripheral Pulse', 'Lung rales',
    'Systolic Murmur', 'Diastolic Murmur', 'Typical Chest Pain', 'Dyspnea',
    'Function Class', 'Atypical', 'Nonanginal', 'Exertional CP', 'LowTH Ang',
    'Q Wave', 'St Elevation', 'St Depression', 'Tinversion', 'LVH',
    'Poor R Progression', 'BBB', 'FBS', 'CR', 'TG', 'LDL', 'HDL', 'BUN',
    'ESR', 'HB', 'K', 'Na', 'WBC', 'Lymph', 'Neut', 'PLT', 'EF-TTE',
    'Region RWMA', 'VHD', 'TG_HDL', 'LDL_HDL', 'NLR'
]

# Winsorizing bounds (1st and 99th percentiles) computed during training
WINSOR_BOUNDS = {
    "WBC": (4100.0, 15976.24),
    "TG": (46.16, 449.88),
    "ESR": (2.0, 75.72),
    "CR": (0.6, 1.9),
    "TG_HDL": (0.96, 13.08),
    "NLR": (0.65, 8.39),
    "BUN": (8.0, 40.96),
    "FBS": (70.0, 319.21)
}

# Clinical training medians from models/schema.json to prevent 0.0 imputation artifacts
DEFAULT_CLINICAL_VALUES = {
    'Age': 58.0, 'Weight': 74.0, 'Length': 165.0, 'Sex': 1.0, 'BMI': 26.8,
    'DM': 0.0, 'HTN': 1.0, 'Current Smoker': 0.0, 'EX-Smoker': 0.0, 'FH': 0.0,
    'CRF': 0.0, 'CVA': 0.0, 'Airway disease': 0.0, 'Thyroid Disease': 0.0, 'CHF': 0.0, 'DLP': 0.0,
    'BP': 130.0, 'PR': 70.0, 'Edema': 0.0, 'Weak Peripheral Pulse': 0.0, 'Lung rales': 0.0,
    'Systolic Murmur': 0.0, 'Diastolic Murmur': 0.0, 'Typical Chest Pain': 1.0, 'Dyspnea': 0.0,
    'Function Class': 0.0, 'Atypical': 0.0, 'Nonanginal': 0.0, 'Exertional CP': 0.0, 'LowTH Ang': 0.0,
    'Q Wave': 0.0, 'St Elevation': 0.0, 'St Depression': 0.0, 'Tinversion': 0.0, 'LVH': 0.0,
    'Poor R Progression': 0.0, 'BBB': 0.0, 'FBS': 100.0, 'CR': 0.9, 'TG': 142.0,
    'LDL': 100.0, 'HDL': 41.0, 'BUN': 16.0, 'ESR': 15.0, 'HB': 13.5,
    'K': 4.2, 'Na': 140.0, 'WBC': 7200.0, 'Lymph': 30.0, 'Neut': 61.0, 'PLT': 240.0,
    'EF-TTE': 47.0, 'Region RWMA': 0.0, 'VHD': 0.0, 'TG_HDL': 3.46, 'LDL_HDL': 2.44, 'NLR': 2.03
}


def get_default_patient() -> dict:
    """Returns a full baseline patient dictionary matching all 57 schema features."""
    return dict(DEFAULT_CLINICAL_VALUES)


def _canonical_key_map():
    """Build case-insensitive, punctuation-insensitive lookup mapping to canonical feature names."""
    m = {}
    for col in FEATURE_ORDER:
        norm = col.lower().replace("_", " ").replace("-", " ").strip()
        m[norm] = col
        m[col.lower()] = col
        m[col] = col
    for leak in LEAKAGE_COLS:
        norm = leak.lower().replace("_", " ").replace("-", " ").strip()
        m[norm] = leak
        m[leak.lower()] = leak
        m[leak] = leak
    return m

CANONICAL_MAP = _canonical_key_map()


def preprocess_single_patient(raw_dict: dict) -> pd.DataFrame:
    """
    Transforms a single patient input dictionary into a 1-row DataFrame
    strictly matching the 57 features and exact column order expected by models.
    Normalizes keys (case-insensitive, handles underscores/dashes) to guarantee
    patient input values are never lost or erroneously set to 0.0.
    """
    raw_data = dict(raw_dict)

    # 1. Normalize keys to canonical feature names
    data = {}
    for k, v in raw_data.items():
        k_str = str(k).strip()
        k_norm = k_str.lower().replace("_", " ").replace("-", " ").strip()
        canonical_name = CANONICAL_MAP.get(k_norm, CANONICAL_MAP.get(k_str.lower(), k_str))
        data[canonical_name] = v

    # 2. Strict target leakage stripping (regardless of original key casing)
    for col in LEAKAGE_COLS:
        data.pop(col, None)
        data.pop(col.lower(), None)
        data.pop(col.upper(), None)

    # 3. Handle Sex
    if "Sex" in data:
        val = str(data["Sex"]).strip().lower()
        if val in ["male", "1", "1.0", "m", "true"]:
            data["Sex"] = 1.0
        elif val in ["female", "0", "0.0", "f", "false", "fmale"]:
            data["Sex"] = 0.0

    # 4. Handle VHD (Valvular Heart Disease)
    if "VHD" in data:
        val = str(data["VHD"]).strip()
        vhd_map = {"n": 0.0, "none": 0.0, "mild": 1.0, "moderate": 2.0, "severe": 3.0,
                   "0": 0.0, "1": 1.0, "2": 2.0, "3": 3.0}
        data["VHD"] = vhd_map.get(val.lower(), 0.0)

    # 5. Convert Yes/No strings or bools to 1.0 / 0.0
    for k, v in list(data.items()):
        if isinstance(v, str):
            v_str = v.strip().upper()
            if v_str in ["Y", "YES", "TRUE", "PRESENT", "POSITIVE"]:
                data[k] = 1.0
            elif v_str in ["N", "NO", "FALSE", "ABSENT", "NEGATIVE"]:
                data[k] = 0.0
        elif isinstance(v, bool):
            data[k] = 1.0 if v else 0.0

    # 6. Ensure numeric types with fallback to clinical training medians
    cleaned = {}
    for k, v in data.items():
        try:
            cleaned[k] = float(v)
        except (ValueError, TypeError):
            cleaned[k] = DEFAULT_CLINICAL_VALUES.get(k, 0.0)

    # 7. Compute engineered clinical ratios
    hdl = cleaned.get("HDL", DEFAULT_CLINICAL_VALUES["HDL"])
    hdl = hdl if hdl > 0 else 40.0

    tg = cleaned.get("TG", DEFAULT_CLINICAL_VALUES["TG"])
    cleaned["TG_HDL"] = tg / hdl

    ldl = cleaned.get("LDL", DEFAULT_CLINICAL_VALUES["LDL"])
    cleaned["LDL_HDL"] = ldl / hdl

    lymph = cleaned.get("Lymph", DEFAULT_CLINICAL_VALUES["Lymph"])
    lymph = lymph if lymph > 0 else 30.0
    neut = cleaned.get("Neut", DEFAULT_CLINICAL_VALUES["Neut"])
    cleaned["NLR"] = neut / lymph

    # Obesity dropped to avoid BMI collinearity
    cleaned.pop("Obesity", None)

    # 8. Winsorize skewed laboratory biomarkers
    for feat, (lo, hi) in WINSOR_BOUNDS.items():
        if feat in cleaned:
            cleaned[feat] = float(np.clip(cleaned[feat], lo, hi))

    # 9. Assemble into DataFrame according to FEATURE_ORDER, using clinical medians for unprovided columns
    row = {}
    for col in FEATURE_ORDER:
        if col in cleaned and cleaned[col] is not None:
            row[col] = cleaned[col]
        else:
            row[col] = DEFAULT_CLINICAL_VALUES.get(col, 0.0)

    df = pd.DataFrame([row], columns=FEATURE_ORDER).astype(float)

    # Strict target leakage assertion
    assert not any(c in df.columns for c in LEAKAGE_COLS), f"Target leakage detected: {set(df.columns) & set(LEAKAGE_COLS)}"
    return df


def get_demo_patients():
    """
    Returns curated demo patient profiles representing different risk tiers:
    1. High-Risk Triple Vessel CAD
    2. Low-Risk Healthy Patient
    3. LAD-Predominant Anterior Ischemia
    4. Borderline / Moderate Risk Patient
    """
    return [
        {
            "id": "patient-high-risk-cad",
            "name": "Patient 1: High-Risk Triple Vessel CAD",
            "description": "68-year-old male with diabetes, hypertension, typical angina, ST-elevation, T-wave inversion, and low EF (35%).",
            "ground_truth": {"CAD": "CAD", "LAD": "Stenotic", "LCX": "Stenotic", "RCA": "Stenotic"},
            "data": {
                "Age": 68.0, "Weight": 85.0, "Length": 172.0, "Sex": 1.0, "BMI": 28.7,
                "DM": 1.0, "HTN": 1.0, "Current Smoker": 1.0, "EX-Smoker": 0.0, "FH": 1.0,
                "CRF": 0.0, "CVA": 0.0, "Airway disease": 0.0, "Thyroid Disease": 0.0, "CHF": 0.0, "DLP": 1.0,
                "BP": 150.0, "PR": 88.0, "Edema": 0.0, "Weak Peripheral Pulse": 1.0, "Lung rales": 0.0,
                "Systolic Murmur": 0.0, "Diastolic Murmur": 0.0, "Typical Chest Pain": 1.0, "Dyspnea": 1.0,
                "Function Class": 3.0, "Atypical": 0.0, "Nonanginal": 0.0, "Exertional CP": 1.0, "LowTH Ang": 0.0,
                "Q Wave": 1.0, "St Elevation": 1.0, "St Depression": 1.0, "Tinversion": 1.0, "LVH": 1.0,
                "Poor R Progression": 1.0, "BBB": 0.0, "FBS": 180.0, "CR": 1.3, "TG": 240.0,
                "LDL": 165.0, "HDL": 32.0, "BUN": 26.0, "ESR": 34.0, "HB": 13.8,
                "K": 4.4, "Na": 140.0, "WBC": 9200.0, "Lymph": 22.0, "Neut": 72.0, "PLT": 260.0,
                "EF-TTE": 35.0, "Region RWMA": 3.0, "VHD": 1.0
            }
        },
        {
            "id": "patient-low-risk-normal",
            "name": "Patient 2: Low-Risk Normal Patient",
            "description": "46-year-old female with atypical complaints, normal ECG, EF 55%, normal lipids, and non-smoker.",
            "ground_truth": {"CAD": "Normal", "LAD": "Normal", "LCX": "Normal", "RCA": "Normal"},
            "data": {
                "Age": 46.0, "Weight": 60.0, "Length": 162.0, "Sex": 0.0, "BMI": 22.8,
                "DM": 0.0, "HTN": 0.0, "Current Smoker": 0.0, "EX-Smoker": 0.0, "FH": 0.0,
                "CRF": 0.0, "CVA": 0.0, "Airway disease": 0.0, "Thyroid Disease": 0.0, "CHF": 0.0, "DLP": 0.0,
                "BP": 115.0, "PR": 72.0, "Edema": 0.0, "Weak Peripheral Pulse": 0.0, "Lung rales": 0.0,
                "Systolic Murmur": 0.0, "Diastolic Murmur": 0.0, "Typical Chest Pain": 0.0, "Dyspnea": 0.0,
                "Function Class": 1.0, "Atypical": 1.0, "Nonanginal": 0.0, "Exertional CP": 0.0, "LowTH Ang": 0.0,
                "Q Wave": 0.0, "St Elevation": 0.0, "St Depression": 0.0, "Tinversion": 0.0, "LVH": 0.0,
                "Poor R Progression": 0.0, "BBB": 0.0, "FBS": 90.0, "CR": 0.8, "TG": 98.0,
                "LDL": 85.0, "HDL": 56.0, "BUN": 14.0, "ESR": 8.0, "HB": 13.2,
                "K": 4.1, "Na": 141.0, "WBC": 6100.0, "Lymph": 36.0, "Neut": 54.0, "PLT": 230.0,
                "EF-TTE": 55.0, "Region RWMA": 0.0, "VHD": 0.0
            }
        },
        {
            "id": "patient-lad-stenosis",
            "name": "Patient 3: LAD-Dominant Anterior Ischemia",
            "description": "59-year-old male with anterior leads T-inversion, elevated LDL, regional wall motion abnormality in LAD territory.",
            "ground_truth": {"CAD": "CAD", "LAD": "Stenotic", "LCX": "Normal", "RCA": "Normal"},
            "data": {
                "Age": 59.0, "Weight": 78.0, "Length": 170.0, "Sex": 1.0, "BMI": 27.0,
                "DM": 0.0, "HTN": 1.0, "Current Smoker": 1.0, "EX-Smoker": 0.0, "FH": 1.0,
                "CRF": 0.0, "CVA": 0.0, "Airway disease": 0.0, "Thyroid Disease": 0.0, "CHF": 0.0, "DLP": 1.0,
                "BP": 135.0, "PR": 78.0, "Edema": 0.0, "Weak Peripheral Pulse": 0.0, "Lung rales": 0.0,
                "Systolic Murmur": 0.0, "Diastolic Murmur": 0.0, "Typical Chest Pain": 1.0, "Dyspnea": 0.0,
                "Function Class": 2.0, "Atypical": 0.0, "Nonanginal": 0.0, "Exertional CP": 1.0, "LowTH Ang": 0.0,
                "Q Wave": 0.0, "St Elevation": 0.0, "St Depression": 1.0, "Tinversion": 1.0, "LVH": 0.0,
                "Poor R Progression": 1.0, "BBB": 0.0, "FBS": 105.0, "CR": 1.0, "TG": 180.0,
                "LDL": 155.0, "HDL": 38.0, "BUN": 18.0, "ESR": 18.0, "HB": 14.5,
                "K": 4.3, "Na": 139.0, "WBC": 7800.0, "Lymph": 28.0, "Neut": 64.0, "PLT": 245.0,
                "EF-TTE": 45.0, "Region RWMA": 2.0, "VHD": 0.0
            }
        },
        {
            "id": "patient-moderate-rca",
            "name": "Patient 4: RCA/Inferior Wall Ischemia Risk",
            "description": "63-year-old male with dyslipidemia, hypertension, exertional angina, moderate regional wall motion abnormalities.",
            "ground_truth": {"CAD": "CAD", "LAD": "Normal", "LCX": "Normal", "RCA": "Stenotic"},
            "data": {
                "Age": 63.0, "Weight": 82.0, "Length": 168.0, "Sex": 1.0, "BMI": 29.0,
                "DM": 1.0, "HTN": 1.0, "Current Smoker": 0.0, "EX-Smoker": 1.0, "FH": 0.0,
                "CRF": 0.0, "CVA": 0.0, "Airway disease": 0.0, "Thyroid Disease": 0.0, "CHF": 0.0, "DLP": 1.0,
                "BP": 142.0, "PR": 82.0, "Edema": 0.0, "Weak Peripheral Pulse": 0.0, "Lung rales": 0.0,
                "Systolic Murmur": 0.0, "Diastolic Murmur": 0.0, "Typical Chest Pain": 1.0, "Dyspnea": 1.0,
                "Function Class": 2.0, "Atypical": 0.0, "Nonanginal": 0.0, "Exertional CP": 1.0, "LowTH Ang": 0.0,
                "Q Wave": 1.0, "St Elevation": 0.0, "St Depression": 1.0, "Tinversion": 0.0, "LVH": 1.0,
                "Poor R Progression": 0.0, "BBB": 0.0, "FBS": 135.0, "CR": 1.1, "TG": 210.0,
                "LDL": 142.0, "HDL": 36.0, "BUN": 22.0, "ESR": 24.0, "HB": 14.0,
                "K": 4.2, "Na": 140.0, "WBC": 8100.0, "Lymph": 25.0, "Neut": 68.0, "PLT": 255.0,
                "EF-TTE": 45.0, "Region RWMA": 1.0, "VHD": 0.0
            }
        }
    ]
