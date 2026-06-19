"""
Currency Converter — Flask backend
Proxies live exchange rates from exchangerate.host (free, no key required)
and exposes a small clean API for the React frontend.
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import time

app = Flask(__name__)
CORS(app)

# --- Simple in-memory cache (avoid hammering the upstream API) ---
CACHE = {"rates": None, "base": None, "fetched_at": 0}
CACHE_TTL_SECONDS = 60 * 10  # 10 minutes

# Frankfurter is a free, keyless, reliable ECB-backed exchange rate API.
UPSTREAM_LATEST = "https://api.frankfurter.app/latest"
UPSTREAM_HISTORY = "https://api.frankfurter.app/{start}..{end}"
UPSTREAM_CURRENCIES = "https://api.frankfurter.app/currencies"


def fetch_rates(base="USD"):
    now = time.time()
    if (
        CACHE["rates"]
        and CACHE["base"] == base
        and now - CACHE["fetched_at"] < CACHE_TTL_SECONDS
    ):
        return CACHE["rates"]

    resp = requests.get(UPSTREAM_LATEST, params={"from": base}, timeout=10)
    resp.raise_for_status()
    data = resp.json()
    rates = data.get("rates", {})
    rates[base] = 1.0  # base-to-itself

    CACHE["rates"] = rates
    CACHE["base"] = base
    CACHE["fetched_at"] = now
    return rates


@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.get("/api/currencies")
def currencies():
    try:
        resp = requests.get(UPSTREAM_CURRENCIES, timeout=10)
        resp.raise_for_status()
        return jsonify(resp.json())
    except requests.RequestException as exc:
        return jsonify({"error": str(exc)}), 502


@app.get("/api/rates")
def rates():
    base = request.args.get("base", "USD").upper()
    try:
        data = fetch_rates(base)
        return jsonify({"base": base, "rates": data, "cached_at": CACHE["fetched_at"]})
    except requests.RequestException as exc:
        return jsonify({"error": str(exc)}), 502


@app.get("/api/convert")
def convert():
    base = request.args.get("from", "USD").upper()
    target = request.args.get("to", "EUR").upper()
    try:
        amount = float(request.args.get("amount", "1"))
    except ValueError:
        return jsonify({"error": "amount must be a number"}), 400

    try:
        data = fetch_rates(base)
    except requests.RequestException as exc:
        return jsonify({"error": str(exc)}), 502

    if target not in data:
        return jsonify({"error": f"unknown currency '{target}'"}), 400

    rate = data[target]
    result = amount * rate
    return jsonify(
        {
            "from": base,
            "to": target,
            "amount": amount,
            "rate": rate,
            "result": result,
        }
    )


@app.get("/api/history")
def history():
    """7-day rate history for a currency pair, used for the sparkline."""
    base = request.args.get("from", "USD").upper()
    target = request.args.get("to", "EUR").upper()
    days = int(request.args.get("days", "7"))

    end = time.strftime("%Y-%m-%d")
    start = time.strftime("%Y-%m-%d", time.localtime(time.time() - days * 86400))

    try:
        resp = requests.get(
            UPSTREAM_HISTORY.format(start=start, end=end),
            params={"from": base, "to": target},
            timeout=10,
        )
        resp.raise_for_status()
        payload = resp.json()
        series = [
            {"date": date, "rate": rates.get(target)}
            for date, rates in sorted(payload.get("rates", {}).items())
        ]
        return jsonify({"from": base, "to": target, "series": series})
    except requests.RequestException as exc:
        return jsonify({"error": str(exc)}), 502


if __name__ == "__main__":
    app.run(debug=True, port=5000)
