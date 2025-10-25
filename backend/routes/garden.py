# routes/garden.py
import os, requests, random
from dotenv import load_dotenv
from flask import Blueprint, Response, make_response, request, jsonify
from utils.garden_stats import get_or_create_garden_stats, update_plant_name

garden_bp = Blueprint("garden", __name__)

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


# Status Route: For getting garnden status of the user
@garden_bp.route("/status", methods=["GET"])
def get_garden_status():
    """Get garden stats for a user"""
    user_id = request.args.get("userId")
    
    if not user_id:
        return jsonify({"error": "Missing userId parameter"}), 400
    
    try:
        stats = get_or_create_garden_stats(user_id)
        
        return jsonify({
            "health": stats.get("health", 50),
            "total_scans": stats.get("total_scans", 0),
            "total_duplicates": stats.get("total_duplicates", 0),
            "total_cleaned": stats.get("total_cleaned", 0),
            "plant_name": stats.get("plant_name", "My Garden"),
        }), 200
        
    except Exception as e:
        print(f"Error fetching garden status: {e}")
        return jsonify({"error": str(e)}), 500


# Daily Message Route: For displaying messages based on garden health
@garden_bp.route("/daily-message", methods=["GET"])
def get_daily_message():
    """Get a motivational message based on garden health"""
    user_id = request.args.get("userId")
    health = int(request.args.get("health", 50))
    
    if not user_id:
        return jsonify({"error": "Missing userId parameter"}), 400
    
    messages = {
        "flourishing": [
            "🌟 Your garden is thriving! Keep up the excellent work cleaning duplicates!",
            "✨ Amazing! Your data garden has never looked better!",
            "🎉 Outstanding maintenance! Your garden is in perfect condition!"
        ],
        "blooming": [
            "🌸 Your garden is blooming nicely! A few more cleanups and it'll be perfect.",
            "🌺 Great progress! Your garden is looking healthier every day.",
            "🌼 Wonderful work! Your garden is flourishing beautifully."
        ],
        "recovering": [
            "🌱 Your garden is recovering. Keep scanning and cleaning to improve health.",
            "🌿 Good start! Regular maintenance will help your garden thrive.",
            "🍃 Your garden needs some attention, but you're on the right track!"
        ],
        "wilting": [
            "💧 Your garden needs care! Start scanning for duplicates to revive it.",
            "🥀 Time to water your garden! Clean up some duplicates to restore health.",
            "🌾 Your garden is wilting. Regular cleanups will bring it back to life!"
        ]
    }
    
    if health >= 85:
        state = "flourishing"
    elif health >= 60:
        state = "blooming"
    elif health >= 30:
        state = "recovering"
    else:
        state = "wilting"
    
    message = random.choice(messages[state])
    
    return jsonify({"message": message}), 200


# Chat Route: For chatting with plant (AI Gardener) using Gemini API
@garden_bp.route("/chat", methods=["POST"])
def garden_chat():
    """Chat with AI Gardener using Gemini REST API"""
    data = request.get_json()
    user_message = data.get("message", "")
    garden_state = data.get("gardenState", {})

    if not user_message or not garden_state:
        return jsonify({"error": "Missing message or gardenState"}), 400

    prompt = f"""
You are an AI gardener cum user's plant spirit in a digital garden representing data health.
The garden's state:
- Health: {garden_state.get('health', 50)}
- Total scans: {garden_state.get('total_scans', 0)}
- Duplicates found: {garden_state.get('total_duplicates', 0)}
- Duplicates cleaned: {garden_state.get('total_cleaned', 0)}

User says: "{user_message}"
Respond in a friendly way, as if you are user's plant spirit. Keep it poetic, gentle, under 2 sentences.
If user asks about taking care of his/her plant, suggest scanning for duplicates and cleaning them to improve garden health.
"""

    try:
        payload = {"contents": [{"parts": [{"text": prompt}]}]}

        resp = requests.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}",
            headers={"Content-Type": "application/json"},
            json=payload,
            timeout=15
        )

        if resp.status_code != 200:
            print("Gemini returned non-200:", resp.status_code, resp.text)
            return jsonify({"error": f"Gemini API error: {resp.status_code}"}), 503

        resp_json = resp.json()
        reply = resp_json["candidates"][0]["content"]["parts"][0]["text"].strip()

        return jsonify({"reply": reply}), 200

    except requests.exceptions.RequestException as e:
        print("Gemini request error:", e)
        return jsonify({"reply": "The soil seems quiet right now... try again later."}), 503

    except Exception as e:
        print("Garden chat error:", e)
        return jsonify({"reply": "The gardener is napping... please try again."}), 500


# Plant Name Route: For getting and setting plant name   
@garden_bp.route("/plant-name", methods=["GET", "POST"])
def plant_name() -> Response:
    """Get or set plant name for a user"""
    try:
        user_id = (
            request.args.get("userId")
            if request.method == "GET"
            else request.get_json().get("userId")
        )

        if not user_id:
            return make_response(jsonify({"error": "Missing userId parameter"}), 400)

        stats = get_or_create_garden_stats(user_id)

        if request.method == "GET":
            return make_response(jsonify({"plantName": stats.get("plant_name", "My Garden")}), 200)

        elif request.method == "POST":
            data = request.get_json()
            plant_name = data.get("plantName", "").strip()

            if not plant_name:
                return make_response(jsonify({"error": "Plant name cannot be empty"}), 400)

            update_plant_name(user_id, plant_name)

            return make_response(jsonify({"success": True, "plantName": plant_name}), 200)

        return make_response(jsonify({"error": "Invalid request method"}), 405)

    except Exception as e:
        print(f"Error handling plant name: {e}")
        return make_response(jsonify({"error": str(e)}), 500)