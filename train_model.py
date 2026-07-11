# train_model.py
import pandas as pd, pickle
from sklearn.ensemble import RandomForestClassifier
from weather.utils.preprocess import prepare_features
from config import MODEL_PATH, DATA_PATH

def main():
    df = pd.read_csv(DATA_PATH)
    # Label column is 'weather'
    y = df.pop("weather")
    X = prepare_features(df)

    model = RandomForestClassifier(n_estimators=200, random_state=42)
    model.fit(X, y)

    MODEL_PATH.parent.mkdir(exist_ok=True)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
    print(f"Model saved to {MODEL_PATH}")

if __name__ == "__main__":
    main()