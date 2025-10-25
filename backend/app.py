# app.py
import os
import threading
from flask import Flask, jsonify, request
from flask_cors import CORS
from utils.reminders_manager import reminder_scheduler, send_message_via_appwrite
from routes.projects import projects_bp
from routes.duplicates import duplicates_bp
from routes.delete_account import delete_account_bp
from routes.garden import garden_bp
from routes.activities import activities_bp
from routes.reminders import reminders_bp


def create_app():
    """Flask application factory."""
    app = Flask(__name__)
    CORS(app)

    app.register_blueprint(projects_bp, url_prefix="/api/projects")
    app.register_blueprint(duplicates_bp, url_prefix="/api/duplicates")
    app.register_blueprint(delete_account_bp, url_prefix="/api")
    app.register_blueprint(garden_bp, url_prefix="/api/garden")
    app.register_blueprint(activities_bp, url_prefix="/api/activities")
    app.register_blueprint(reminders_bp, url_prefix="/api/reminders")

    if os.environ.get("RUN_MAIN") == "true" or os.environ.get("SPACE_ID"):
        threading.Thread(target=reminder_scheduler, daemon=True).start()

    @app.route("/", methods=["GET"])
    def home():
        return jsonify({"message": "AADD Backend running successfully with Appwrite Auth!"}), 200

    @app.route("/send_mail", methods=["POST"])
    def send_mail_endpoint():
        data = request.get_json(force=True)
        try:
            send_message_via_appwrite(
                to_email=data.get("to"),
                subject=data.get("subject"),
                message=data.get("message")
            )
            return jsonify({"status": "success", "message": "Email sent successfully!"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    return app


if __name__ == "__main__":
    app = create_app()
    port = int(os.environ.get("PORT", 7860))  
    app.run(host="0.0.0.0", port=port)