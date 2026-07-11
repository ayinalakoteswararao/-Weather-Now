# Weather Prediction System

An end-to-end Flask application that uses a machine-learning model to predict daily weather conditions (e.g. *sunny*, *rainy*, *foggy* …) from basic meteorological readings.

---

## Features

• **Interactive UI** –  Bootstrap-styled form (`templates/index.html`) where users enter date, precipitation, min/max temperature and wind speed, then view the prediction on a beautiful results page.

• **REST API** –  `POST /api/predict` accepts JSON and returns the predicted class, enabling programmatic access.

• **Reusable preprocessing pipeline** – converts the `date` to cyclical features and fills in missing columns (`weather/utils/preprocess.py`).

• **Model caching** – the pickled model is loaded once and memoized to keep prediction latency low (`weather/model.py`).

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Back-end | Python 3 · Flask |
| ML / Data | pandas · scikit-learn (random-forest by default) |
| Front-end | HTML · Bootstrap 5 |

---

## Directory Layout

```
Whether Prediction System/
├── app.py                # Flask application factory & routes for pages
├── config.py             # Paths & global constants
├── requirements.txt      # Python dependencies (create if missing)
├── templates/            # Jinja2 HTML templates
├── static/               # CSS/JS assets
├── weather/
│   ├── __init__.py
│   ├── routes.py         # API blueprint
│   ├── model.py          # Load & use trained model
│   └── utils/
│       └── preprocess.py  # Feature engineering
├── model/
│   └── weather_model.pkl  # Trained pickled model (git-ignored)
└── data/
    └── weather_prediction.csv # Sample training data (optional)
```

---

## Quick-start

1. **Clone & enter project**

   ```bash
   git clone <repo-url>
   cd "Whether Prediction System"
   ```

2. **Create virtual environment & install deps**

   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Train the model (once)**  
   A helper script (`train_model.py`) should output `model/weather_model.pkl`.

   ```bash
   python train_model.py --input data/weather_prediction.csv
   ```

   *Skip this step if the pickle already exists.*

4. **Run the development server**

   ```bash
   python app.py
   ```

   Visit `http://127.0.0.1:5000/` in your browser.

5. **cURL example (API)**

   ```bash
   curl -X POST http://127.0.0.1:5000/api/predict \
        -H "Content-Type: application/json" \
        -d '{
              "date": "2025-07-11",
              "precipitation": 0.0,
              "temp_max": 33,
              "temp_min": 25,
              "wind": 2
            }'
   ```

   Response:

   ```json
   { "prediction": "sunny" }
   ```

---

## Configuration

All configurable constants live in `config.py`.

| Name | Purpose | Default |
|------|---------|---------|
| `MODEL_PATH` | Location of pickled model | `model/weather_model.pkl` |
| `DATA_PATH`  | CSV used for training     | `data/weather_prediction.csv` |
| `DATE_FMT`   | Expected input date format| `%Y-%m-%d` |

---

## Contributing

Pull requests are welcome! Feel free to open issues for bugs or feature suggestions.

---

## License

This project is released under the MIT License – see `LICENSE` for details.
