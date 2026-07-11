# app.py
from flask import Flask, render_template, request
from weather.routes import bp as weather_bp
from weather.model import predict as predict_weather

def create_app():
    # Tell Flask where to find templates and static assets
    app = Flask(__name__, template_folder="templates", static_folder="static")
    app.register_blueprint(weather_bp, url_prefix="/api")

    # Dedicated Landing Page
    @app.route("/")
    def index():
        return render_template("landing.html")

    # Dashboard / Prediction Form
    @app.route("/predict_ui")
    def predict_ui():
        return render_template("dashboard.html", prediction=None)

    @app.route("/result", methods=["POST"])
    def result():
        # Collect form data and cast numeric fields
        data = {k: v for k, v in request.form.items()}
        for field in ["precipitation", "temp_max", "temp_min", "wind"]:
            try:
                data[field] = float(data.get(field, 0))
            except ValueError:
                data[field] = 0.0

        prediction = predict_weather(data)
        return render_template("result.html", prediction=prediction, data=data)

app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5001)          # switch to False in prod