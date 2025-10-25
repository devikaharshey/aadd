# backend/routes/delete_account.py
import os
from flask import Blueprint, request, jsonify
from appwrite.exception import AppwriteException
from appwrite.services.users import Users
from appwrite.query import Query
from utils.appwrite_client import get_env_str
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.services.storage import Storage

delete_account_bp = Blueprint("delete_account", __name__)

DATABASE_ID = os.getenv("APPWRITE_DATABASE_ID", "aadd_db")
DUPLICATES_COLLECTION = "duplicates"
USER_PROJECTS_COLLECTION = "user_projects"
GARDEN_STATS_COLLECTION = "garden_stats"
USER_ACTIVITIES_COLLECTION = "activities"
USER_REMINDERS_COLLECTION = "reminders"
PROFILE_BUCKET = os.getenv("APPWRITE_BUCKET_ID", "profile_pictures")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Helpers: Initialize Appwrite clients
def get_appwrite_client_server() -> Client:
    client = Client()
    client.set_endpoint(get_env_str("APPWRITE_ENDPOINT"))
    client.set_project(get_env_str("APPWRITE_PROJECT"))
    client.set_key(get_env_str("APPWRITE_API_KEY"))  
    return client


def get_database_client_server() -> Databases:
    return Databases(get_appwrite_client_server())


def get_storage_client_server() -> Storage:
    return Storage(get_appwrite_client_server())


# Delete Account Route: Delete a user account and associated data
@delete_account_bp.route("/delete-account", methods=["POST", "OPTIONS"])
def delete_account():
    if request.method == "OPTIONS":
        return (
            jsonify({"ok": True}),
            200,
            {
                "Access-Control-Allow-Origin": FRONTEND_URL,
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
        )

    data = request.get_json()
    user_id = data.get("userId")
    if not user_id:
        return jsonify({"error": "userId is required"}), 400

    users_client = Users(get_appwrite_client_server())
    db_client = get_database_client_server()
    storage_client = get_storage_client_server()

    try:
        # Delete profile picture
        try:
            avatar_file_id = f"pfp_{user_id}"
            storage_client.get_file(PROFILE_BUCKET, avatar_file_id)
            storage_client.delete_file(PROFILE_BUCKET, avatar_file_id)
            print(f"[INFO] Deleted profile picture: {avatar_file_id}")
        except AppwriteException as e:
            print(f"[WARN] Profile picture not found or failed to delete: {str(e)}")

        # Delete duplicates
        try:
            duplicates = db_client.list_documents(
                database_id=DATABASE_ID,
                collection_id=DUPLICATES_COLLECTION,
                queries=[Query.equal("userId", user_id)]
            ).get("documents", [])

            for doc in duplicates:
                db_client.delete_document(DATABASE_ID, DUPLICATES_COLLECTION, doc["$id"])
        except AppwriteException as e:
            print(f"[WARN] Failed to delete duplicates: {str(e)}")

        # Delete user projects
        try:
            projects = db_client.list_documents(
                database_id=DATABASE_ID,
                collection_id=USER_PROJECTS_COLLECTION,
                queries=[Query.equal("userId", user_id)]
            ).get("documents", [])

            for proj in projects:
                db_client.delete_document(DATABASE_ID, USER_PROJECTS_COLLECTION, proj["$id"])
        except AppwriteException as e:
            print(f"[WARN] Failed to delete user projects: {str(e)}")

        # Delete user garden stats
        try:
            garden_stats = db_client.list_documents(
                database_id=DATABASE_ID,
                collection_id=GARDEN_STATS_COLLECTION,
                queries=[Query.equal("userId", user_id)]
            ).get("documents", [])

            for stat in garden_stats:
                db_client.delete_document(DATABASE_ID, GARDEN_STATS_COLLECTION, stat["$id"])
        except AppwriteException as e:
            print(f"[WARN] Failed to delete user garden stats: {str(e)}")

        # Delete user activities
        try:
            activities = db_client.list_documents(
                database_id=DATABASE_ID,
                collection_id=USER_ACTIVITIES_COLLECTION,
                queries=[Query.equal("userId", user_id)]
            ).get("documents", [])

            for act in activities:
                db_client.delete_document(DATABASE_ID, USER_ACTIVITIES_COLLECTION, act["$id"])
        except AppwriteException as e:
            print(f"[WARN] Failed to delete user activities: {str(e)}")

        # Delete user reminders
        try:
            reminders = db_client.list_documents(
                database_id=DATABASE_ID,
                collection_id=USER_REMINDERS_COLLECTION,
                queries=[Query.equal("userId", user_id)]
            ).get("documents", [])

            for rem in reminders:
                db_client.delete_document(DATABASE_ID, USER_REMINDERS_COLLECTION, rem["$id"])
        except AppwriteException as e:
            print(f"[WARN] Failed to delete user reminders: {str(e)}")

        # Delete user sessions
        try:
            users_client.delete_sessions(user_id)
        except AppwriteException as e:
            print(f"[WARN] Failed to delete user sessions: {str(e)}")

        # Delete user account
        try:
            users_client.delete(user_id)
        except AppwriteException as e:
            print(f"[ERROR] Failed to delete user account: {str(e)}")
            return jsonify({"error": "Failed to delete user account"}), 400

        return (
            jsonify({
                "success": True,
                "message": "User, profile picture, duplicates, and projects deleted successfully"
            }),
            200,
            {"Access-Control-Allow-Origin": FRONTEND_URL},
        )

    except Exception as e:
        return (
            jsonify({"error": str(e)}),
            500,
            {"Access-Control-Allow-Origin": FRONTEND_URL},
        )
