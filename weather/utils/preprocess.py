# weather/utils/preprocess.py
import pandas as pd
from config import DATE_FMT

def prepare_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Minimal preprocessing: converts date to cyclical features and
    keeps remaining numeric columns untouched.
    """
    if "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"], format=DATE_FMT, errors="coerce")
        df["dayofyear"] = df["date"].dt.dayofyear
        df = df.drop(columns=["date"])
    # Add other cleaning / encoding steps here
    # Ensure expected numeric columns exist even if missing in request
    expected = [
        "precipitation",
        "temp_max",
        "temp_min",
        "wind",
        "dayofyear",
    ]
    for col in expected:
        if col not in df.columns:
            df[col] = 0.0
    return df[expected]