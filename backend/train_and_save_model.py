# train_and_save_model.py
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.ensemble import RandomForestClassifier, StackingClassifier
from lightgbm import LGBMClassifier, LGBMRegressor
import joblib # Import joblib

print("Starting model training...")

# STEP 1: Load dataset
df = pd.read_csv("final_feature_engineered_dataset_final.csv")

# STEP 2: Prepare features
X = df.drop(columns=["Burnout_Level", "Burnout_Score"])
y_class = df["Burnout_Level"].astype(int)
y_score = df["Burnout_Score"]

# STEP 3: Train-test split (using the full dataset for the final model)
X_train, _, y_class_train, _ = train_test_split(X, y_class, test_size=0.1, stratify=y_class, random_state=42)
X_score_train, _, y_score_train, _ = train_test_split(X, y_score, test_size=0.1, random_state=42)


# STEP 4: Base learners & Meta model
base_learners = [
    ("knn", KNeighborsClassifier(n_neighbors=5)),
    ("nb", GaussianNB()),
    ("rf", RandomForestClassifier(n_estimators=100, random_state=42))
]
meta_model = LGBMClassifier(random_state=42, verbose=-1)

# STEP 5: Train stacking classifier
stacking_model = StackingClassifier(
    estimators=base_learners,
    final_estimator=meta_model,
    cv=5
)
stacking_model.fit(X_train, y_class_train)

# STEP 6: Train regression model
score_model = LGBMRegressor(random_state=42, verbose=-1)
score_model.fit(X_score_train, y_score_train)

# STEP 7: Save the trained models to files
joblib.dump(stacking_model, 'burnout_level_model.joblib')
joblib.dump(score_model, 'burnout_score_model.joblib')

print("Models trained and saved successfully as 'burnout_level_model.joblib' and 'burnout_score_model.joblib'")