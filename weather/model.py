# weather/model.py
import pickle, functools, os
import pandas as pd
from config import MODEL_PATH
from .utils.preprocess import prepare_features

@functools.lru_cache(maxsize=1)
def _load_model():
    """Load the pickled model once and cache it.
    Raises an informative error if the file is missing or empty."""
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"Model file not found at {MODEL_PATH}. Run `python train_model.py` first."
        )
    if os.path.getsize(MODEL_PATH) == 0:
        raise ValueError(
            f"Model file at {MODEL_PATH} is empty. Re-train the model via `python train_model.py`."
        )
    with open(MODEL_PATH, "rb") as f:
        return pickle.load(f)

def predict(raw_json: dict) -> str:
    """
    Expects JSON of the form:
    {
      "date": "2025-06-23",
      "temp": 32,
      "humidity": 60,
      ...
    }
    Returns the predicted weather class (e.g., "rain").
    """
    df = pd.DataFrame([raw_json])
    X = prepare_features(df)
    model = _load_model()
    return str(model.predict(X)[0])