"""Generate SHAP explanations for the trained credit model."""

import pandas as pd
import shap
import xgboost as xgb

# Load model and sample data
model = xgb.XGBClassifier()
model.load_model("credit_model.json")

# Use the same data preprocessing as in training
X = pd.read_csv("user_data.csv")
X = pd.get_dummies(X.drop("default", axis=1))

explainer = shap.Explainer(model)
shap_values = explainer(X)

# Plot the explanation for the first prediction
shap.plots.waterfall(shap_values[0])
