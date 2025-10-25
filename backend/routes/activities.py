# routes/activities.py
import os
import traceback
from dotenv import load_dotenv
from flask import Blueprint, request, jsonify
from datetime import datetime
from utils.appwrite_client import get_database_client
from appwrite.query import Query

activities_bp = Blueprint("activities", __name__)
load_dotenv()

DATABASE_ID = os.getenv("APPWRITE_DATABASE_ID", "aadd_db")
ACTIVITIES_COLLECTION_ID = os.getenv("APPWRITE_ACTIVITIES_COLLECTION", "activities")

db = get_database_client()

# List Route: Get all activities for a user
@activities_bp.route("/list", methods=["GET"])
def list_activities():
    user_id = request.args.get("userId")
    if not user_id:
        return jsonify({"error": "Missing userId"}), 400
    
    try:
        res = db.list_documents(
            database_id=DATABASE_ID,
            collection_id=ACTIVITIES_COLLECTION_ID,
            queries=[
                Query.equal("userId", [user_id]),
                Query.order_desc("timestamp"),
            ],
        )
        activities = [
            {
                "$id": doc["$id"],  
                "message": doc["message"],
                "timestamp": doc["timestamp"],
                "type": doc["type"],
                "projectId": doc.get("projectId", ""),
            }
            for doc in res["documents"]
        ]
        return jsonify({"activities": activities}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    

# Add Route: Add a new activity
@activities_bp.route("/add", methods=["POST"])
def add_activity():
    data = request.get_json() or {}
    required_fields = ["userId", "message", "type"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        db.create_document(
            database_id=DATABASE_ID,
            collection_id=ACTIVITIES_COLLECTION_ID,
            document_id="unique()",
            data={
                "userId": data["userId"],
                "projectId": data.get("projectId", ""),
                "message": data["message"],
                "type": data["type"],
                "timestamp": datetime.utcnow().isoformat(),
            },
        )
        return jsonify({"success": True}), 201
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    

# Delete Single Route: Delete a single activity
@activities_bp.route("/delete-single", methods=["DELETE"])
def delete_single_activity():
    data = request.get_json() or {}
    user_id = data.get("userId")
    activity_id = data.get("activityId")
    
    if not user_id or not activity_id:
        return jsonify({"error": "Missing userId or activityId"}), 400
    
    try:
        try:
            activity = db.get_document(
                database_id=DATABASE_ID,
                collection_id=ACTIVITIES_COLLECTION_ID,
                document_id=activity_id,
            )
        except Exception as get_error:
            print(f"Error fetching activity: {get_error}")
            return jsonify({"error": "Activity not found"}), 404
        
        if activity.get("userId") != user_id:
            return jsonify({"error": "Unauthorized: Activity does not belong to user"}), 403
        
        db.delete_document(
            database_id=DATABASE_ID,
            collection_id=ACTIVITIES_COLLECTION_ID,
            document_id=activity_id,
        )
        
        return jsonify({
            "success": True,
            "message": "Activity deleted successfully"
        }), 200
    except Exception as e:
        print(f"Error in delete_single_activity: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    

# Delete Route: Delete all activities for a user
@activities_bp.route("/delete", methods=["DELETE"])
def delete_activities():
    user_id = request.args.get("userId")
    if not user_id:
        return jsonify({"error": "Missing userId"}), 400
    
    try:
        res = db.list_documents(
            database_id=DATABASE_ID,
            collection_id=ACTIVITIES_COLLECTION_ID,
            queries=[Query.equal("userId", [user_id])],
        )
        
        deleted_count = 0
        for doc in res["documents"]:
            db.delete_document(
                database_id=DATABASE_ID,
                collection_id=ACTIVITIES_COLLECTION_ID,
                document_id=doc["$id"],
            )
            deleted_count += 1
        
        return jsonify({
            "success": True,
            "deletedCount": deleted_count,
            "message": f"Deleted {deleted_count} activities for user {user_id}"
        }), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500