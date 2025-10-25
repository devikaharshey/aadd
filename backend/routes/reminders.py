# routes/reminders.py
import os
from flask import Blueprint, request, jsonify
from utils.appwrite_client import get_database_client
from appwrite.query import Query
from datetime import datetime, timezone

reminders_bp = Blueprint("reminders", __name__)

APPWRITE_DATABASE_ID = os.getenv("APPWRITE_DATABASE_ID", "default")
REMINDER_COLLECTION = os.getenv("APPWRITE_REMINDER_COLLECTION", "reminders")


# Add Route: To add a new reminder
@reminders_bp.route("/add", methods=["POST"])
def add_reminder():
    """Add a new reminder for a project"""
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Empty request"}), 400

    user_id = data.get("userId")
    user_email = data.get("userEmail")
    project_id = data.get("projectId")
    frequency = data.get("frequency")
    service = data.get("service", "database")
    database_id = data.get("databaseId")  
    collection_id = data.get("collectionId")  

    if not all([user_id, user_email, project_id, frequency]):
        return jsonify({"error": "Missing required fields"}), 400

    if service == "database" and not database_id:
        return jsonify({"error": "databaseId is required for database service"}), 400

    db = get_database_client()

    try:
        existing_reminders = db.list_documents(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=REMINDER_COLLECTION,
            queries=[Query.equal("userId", user_id)]
        ).get("documents", [])

        if len(existing_reminders) >= 5:
            return jsonify({"error": "You can only create up to 5 reminders"}), 400

        reminder_data = {
            "userId": user_id,
            "userEmail": user_email,
            "projectId": project_id,
            "frequency": frequency,
            "service": service,
            "enabled": True,
            "lastRun": datetime.now(timezone.utc).isoformat()
        }
        
        if service == "database":
            reminder_data["databaseId"] = database_id
            if collection_id:
                reminder_data["collectionId"] = collection_id

        doc = db.create_document(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=REMINDER_COLLECTION,
            document_id="unique()",
            data=reminder_data
        )
        return jsonify({"status": "success", "reminder": doc}), 200

    except Exception as e:
        print("Error creating reminder:", e)
        return jsonify({"error": str(e)}), 500


# List Route: To list reminders for a user
@reminders_bp.route("/list", methods=["GET"])
def list_reminders():
    """Fetch reminders for a user"""
    user_id = request.args.get("userId")
    if not user_id:
        return jsonify({"error": "Missing userId"}), 400

    db = get_database_client()
    try:
        docs = db.list_documents(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=REMINDER_COLLECTION,
            queries=[Query.equal("userId", user_id)]
        )
        return jsonify({"status": "success", "reminders": docs.get("documents", [])}), 200

    except Exception as e:
        print("Error listing reminders:", e)
        return jsonify({"error": str(e)}), 500


# Toggle Route: To enable or disable a reminder
@reminders_bp.route("/toggle", methods=["PATCH"])
def toggle_reminder():
    """Enable or disable a reminder"""
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Empty request"}), 400

    reminder_id = data.get("reminderId")
    enabled = data.get("enabled")

    if reminder_id is None or enabled is None:
        return jsonify({"error": "Missing fields"}), 400

    db = get_database_client()
    try:
        doc = db.update_document(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=REMINDER_COLLECTION,
            document_id=reminder_id,
            data={"enabled": enabled}
        )
        return jsonify({"status": "success", "reminder": doc}), 200

    except Exception as e:
        print("Error toggling reminder:", e)
        return jsonify({"error": str(e)}), 500


# Delete Route: To delete a reminder
@reminders_bp.route("/delete", methods=["DELETE"])
def delete_reminder():
    """Delete a reminder"""
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Empty request"}), 400

    reminder_id = data.get("reminderId")
    if not reminder_id:
        return jsonify({"error": "Missing reminderId"}), 400

    db = get_database_client()
    try:
        db.delete_document(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=REMINDER_COLLECTION,
            document_id=reminder_id
        )
        return jsonify({"status": "success", "message": "Reminder deleted"}), 200

    except Exception as e:
        print("Error deleting reminder:", e)
        return jsonify({"error": str(e)}), 500