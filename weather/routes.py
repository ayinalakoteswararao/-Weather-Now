# weather/routes.py
from flask import Blueprint, request, jsonify
from .model import predict

bp = Blueprint("weather", __name__)

@bp.route("/predict", methods=["POST"])
def do_predict():
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400
    try:
        result = predict(request.get_json())
        return jsonify({"prediction": result})
    except Exception as exc:
        return jsonify({"error": str(exc)}), 422