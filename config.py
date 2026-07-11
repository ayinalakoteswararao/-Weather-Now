# config.py
from pathlib import Path

# Base directory of the project
BASE_DIR = Path(__file__).resolve().parent

# File-system paths
MODEL_PATH = BASE_DIR / "model" / "weather_model.pkl"
DATA_PATH = BASE_DIR / "data" / "weather_prediction.csv"

# Date format used across the app
DATE_FMT = "%Y-%m-%d"