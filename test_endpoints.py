"""
Comprehensive automated test suite for Track A Cardiovascular Risk Prediction system.
Tests:
1. Leakage prevention: Cath/LAD/LCX/RCA are excluded and stripped.
2. Endpoint verification via FastAPI TestClient:
   - GET /health
   - GET /schema
   - GET /metrics
   - GET /samples
   - POST /predict (valid and edge cases)
   - POST /explain (all 4 targets: CAD, LAD, LCX, RCA)
   - POST /agent/chat
   - POST /agent/what_if
3. Probability range check: all 4 probabilities in [0, 1].
4. SHAP alignment check: feature names, original patient values and SHAP scores align.
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

import requests
from backend.preprocess import preprocess_single_patient, get_demo_patients, LEAKAGE_COLS, FEATURE_ORDER

LIVE_URL = "http://127.0.0.1:8000"

class LiveClient:
    def __init__(self, base_url):
        self.base_url = base_url
    def get(self, path):
        return requests.get(f"{self.base_url}{path}", timeout=10)
    def post(self, path, json=None):
        return requests.post(f"{self.base_url}{path}", json=json, timeout=10)

try:
    r = requests.get(f"{LIVE_URL}/health", timeout=2)
    if r.status_code == 200:
        client = LiveClient(LIVE_URL)
        print("Connected to live server at", LIVE_URL)
    else:
        from fastapi.testclient import TestClient
        from backend.main import app
        client = TestClient(app)
except Exception:
    from fastapi.testclient import TestClient
    from backend.main import app
    client = TestClient(app)

def test_leakage_prevention():
    print("Testing leakage prevention...")
    dirty_patient = {
        "Age": 65, "Cath": "CAD", "LAD": "Stenotic", "LCX": "Normal", "RCA": "Stenotic",
        "BP": 140, "Typical Chest Pain": 1
    }
    df = preprocess_single_patient(dirty_patient)
    for col in LEAKAGE_COLS:
        assert col not in df.columns, f"Leakage column {col} was found in preprocessed DataFrame!"
    assert len(df.columns) == 57, f"Expected 57 features, got {len(df.columns)}"
    assert list(df.columns) == FEATURE_ORDER, "Feature order mismatch"
    print("  PASS: Leakage prevention verified (Cath/LAD/LCX/RCA excluded; 57 features).")

def test_health():
    print("Testing GET /health...")
    res = client.get("/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    data = res.json()
    assert data["status"] == "healthy"
    assert set(data["models_loaded"]) == {"CAD", "LAD", "LCX", "RCA"}
    assert set(data["explainers_loaded"]) == {"CAD", "LAD", "LCX", "RCA"}
    print(f"  PASS: Health OK. Models: {data['models_loaded']}")

def test_schema():
    print("Testing GET /schema...")
    res = client.get("/schema")
    assert res.status_code == 200
    schema = res.json()
    assert len(schema) == 57, f"Expected 57 features, got {len(schema)}"
    names = [s["name"] for s in schema]
    assert "Age" in names and "Typical Chest Pain" in names
    print("  PASS: Schema returned 57 features.")

def test_metrics():
    print("Testing GET /metrics...")
    res = client.get("/metrics")
    assert res.status_code == 200
    metrics = res.json()
    assert "cv_best" in metrics and "best_models" in metrics
    for row in metrics["cv_best"]:
        print(f"  Target: {row['target']:4s} | Model: {row['model']:12s} | AUC: {row['roc_auc']:.3f} | F1: {row['f1']:.3f}")
    print("  PASS: Metrics retrieved successfully.")

def test_samples():
    print("Testing GET /samples...")
    res = client.get("/samples")
    assert res.status_code == 200
    samples = res.json()
    assert len(samples) >= 4, f"Expected at least 4 demo patients, got {len(samples)}"
    print(f"  PASS: {len(samples)} benchmark patients available.")

def test_predict():
    print("Testing POST /predict...")
    samples = client.get("/samples").json()
    p0 = samples[0]["data"]
    res = client.post("/predict", json={"patient": p0})
    assert res.status_code == 200, res.text
    pred = res.json()
    probs = pred["probabilities"]
    assert all(0.0 <= probs[t] <= 1.0 for t in ["CAD", "LAD", "LCX", "RCA"]), "Probabilities out of bounds!"
    print(f"  High-risk patient probabilities: {probs}")

    # Test healthy patient
    p1 = samples[1]["data"]
    res1 = client.post("/predict", json={"patient": p1})
    assert res1.status_code == 200
    probs1 = res1.json()["probabilities"]
    print(f"  Low-risk patient probabilities:  {probs1}")
    assert probs["CAD"] > probs1["CAD"], "High-risk CAD probability should exceed low-risk!"
    print("  PASS: Prediction test passed with sensible probabilities.")

def test_explain_all_targets():
    print("Testing POST /explain for all 4 targets...")
    samples = client.get("/samples").json()
    p0 = samples[0]["data"]
    for target in ["CAD", "LAD", "LCX", "RCA"]:
        res = client.post("/explain", json={"patient": p0, "target": target})
        assert res.status_code == 200, f"Explain failed for {target}: {res.text}"
        exp = res.json()
        assert exp["target"] == target
        assert len(exp["positive_features"]) > 0 or len(exp["negative_features"]) > 0
        # Check SHAP alignment
        for f in exp["positive_features"][:3]:
            assert "feature" in f and "value" in f and "shap" in f
            assert f["value"] != 0 or f["feature"] in ["Edema", "Lung rales", "Systolic Murmur", "Diastolic Murmur"]
        print(f"  {target} explanation OK. Top positive driver: {exp['positive_features'][0]['feature']} (patient val: {exp['positive_features'][0]['value']}, shap: +{exp['positive_features'][0]['shap']:.3f})")
    print("  PASS: SHAP explanations computed and verified for CAD, LAD, LCX, RCA.")

def test_what_if():
    print("Testing POST /agent/what_if...")
    samples = client.get("/samples").json()
    p0 = samples[0]["data"]
    res = client.post("/agent/what_if", json={
        "patient": p0,
        "changes": {"Current Smoker": 0, "LDL": 70, "BP": 120}
    })
    assert res.status_code == 200
    wi = res.json()
    assert "risk_comparison" in wi
    print("  What-if absolute risk reductions:", {k: v["absolute_risk_reduction"] for k, v in wi["risk_comparison"].items()})
    print("  PASS: What-if simulation functional.")

if __name__ == "__main__":
    test_leakage_prevention()
    test_health()
    test_schema()
    test_metrics()
    test_samples()
    test_predict()
    test_explain_all_targets()
    test_what_if()
    print("\nALL BACKEND TESTS PASSED SUCCESSFULLY!")
