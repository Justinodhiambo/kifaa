import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score


def train(csv_path: str = "user_data.csv"):
    """Train a simple credit scoring model and return it along with test data."""
    df = pd.read_csv(csv_path)
    X = pd.get_dummies(df.drop("default", axis=1))
    y = df["default"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = xgb.XGBClassifier(use_label_encoder=False, eval_metric="logloss")
    model.fit(X_train, y_train)
    score = roc_auc_score(y_test, model.predict_proba(X_test)[:, 1])
    print("AUC:", score)
    model.save_model("credit_model.json")
    return model, X_test


if __name__ == "__main__":
    train()
