import numpy as np
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sklearn.cluster import KMeans
from sklearn.ensemble import GradientBoostingClassifier

app = FastAPI(title="KPMG Smart Campus Analytics API")

# Fixes Cross-Origin blocks so your React app on 5174 can talk to port 8000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

np.random.seed(42)
n_students = 100

# Generating Data for all 7 Core Scope Categories
cgpa = np.random.uniform(6.0, 10.0, n_students)
backlogs = np.random.randint(0, 4, n_students)
attendance = np.random.uniform(60, 100, n_students)
lms_logins = np.random.randint(15, 250, n_students)
assignments_late = np.random.randint(0, 6, n_students)
placement_mock_score = np.random.uniform(40, 100, n_students)
technical_skill_score = np.random.uniform(45, 100, n_students)
student_satisfaction = np.random.randint(1, 6, n_students)

at_risk_academic = []
at_risk_placement = []

for i in range(n_students):
    p_acad = 0.1
    if attendance[i] < 75: p_acad += 0.4
    if backlogs[i] > 1: p_acad += 0.3
    at_risk_academic.append(1 if np.random.rand() < min(p_acad, 0.95) else 0)
    
    p_place = 0.1
    if placement_mock_score[i] < 60: p_place += 0.4
    if technical_skill_score[i] < 60: p_place += 0.3
    at_risk_placement.append(1 if np.random.rand() < min(p_place, 0.95) else 0)

df = pd.DataFrame({
    "student_id": [f"STU{1000+i}" for i in range(n_students)],
    "name": [f"Student {i+1}" for i in range(n_students)],
    "cgpa": cgpa,
    "backlogs": backlogs,
    "attendance": attendance,
    "lms_logins": lms_logins,
    "assignments_late": assignments_late,
    "placement_mock_score": placement_mock_score,
    "technical_skill_score": technical_skill_score,
    "student_satisfaction": student_satisfaction,
    "at_risk_academic": at_risk_academic,
    "at_risk_placement": at_risk_placement
})

# Calculate your Student Success Score (Required Item)
def calc_success_score(row):
    acad = (row['cgpa'] / 10.0) * 100
    lms = max(0, 100 - (row['assignments_late'] * 15))
    return round((acad * 0.3) + (row['attendance'] * 0.2) + (lms * 0.15) + (row['placement_mock_score'] * 0.2) + (row['technical_skill_score'] * 0.15), 2)

df["student_success_score"] = df.apply(calc_success_score, axis=1)

# Training our simple AI models
features = ["cgpa", "backlogs", "attendance", "lms_logins", "assignments_late", "placement_mock_score", "technical_skill_score"]
X = df[features]
clf_a = GradientBoostingClassifier(random_state=42).fit(X, df["at_risk_academic"])
clf_p = GradientBoostingClassifier(random_state=42).fit(X, df["at_risk_placement"])
kmeans = KMeans(n_clusters=4, n_init=10, random_state=42).fit(X)

df["academic_risk_flag"] = clf_a.predict(X)
df["placement_risk_flag"] = clf_p.predict(X)
df["segmentation_cluster"] = kmeans.labels_

@app.get("/api/students")
def get_all_students():
    return df.to_dict(orient="records")
