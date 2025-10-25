# routes/projects.py
import os
from flask import Blueprint, request, jsonify
from utils.appwrite_client import get_database_client
from appwrite.query import Query
from cryptography.fernet import Fernet
from dotenv import load_dotenv

load_dotenv()  

projects_bp = Blueprint("projects_bp", __name__)

# Fernet Encryption: For User Project API Keys
fernet_key = os.getenv("FERNET_KEY")
if fernet_key is None:
    raise ValueError("FERNET_KEY not found in environment variables")
f = Fernet(fernet_key.encode())


DATABASE_ID = str(os.getenv("APPWRITE_DATABASE_ID"))
if DATABASE_ID is None:
    raise ValueError("APPWRITE_DATABASE_ID not found in environment variables")
COLLECTION_ID = "user_projects"
APPWRITE_ENDPOINT = os.getenv("APPWRITE_ENDPOINT")
APPWRITE_PROJECT = os.getenv("APPWRITE_PROJECT")
APPWRITE_API_KEY = os.getenv("APPWRITE_API_KEY")  


# Connect Route: To add a new project
@projects_bp.post("/connect")
def connect_project():
    data = request.json or {}
    user_id = data.get("userId")
    project_id = data.get("projectId")
    endpoint = data.get("endpoint")
    api_key = data.get("apiKey")

    if not all([user_id, project_id, endpoint, api_key]):
        return jsonify({"error": "Missing project details"}), 400

    # API Key Encryption
    if api_key is None:
        return jsonify({"error": "API key is required"}), 400
    encrypted_key = f.encrypt(api_key.encode()).decode()

    try:
        db = get_database_client(
            endpoint=APPWRITE_ENDPOINT,
            project_id=APPWRITE_PROJECT,
            api_key=APPWRITE_API_KEY
        )

        db.create_document(
            database_id=DATABASE_ID,
            collection_id=COLLECTION_ID,
            document_id="unique()",
            data={
                "userId": user_id,
                "projectId": project_id,
                "endpoint": endpoint,
                "apiKey": encrypted_key
            },
        )
    except Exception as e:
        return jsonify({"error": f"Failed to store project: {str(e)}"}), 500

    return jsonify({"message": "Project connected successfully!"})


# List Route: To list all projects for a user
@projects_bp.get("/list")
def list_projects():
    user_id = request.args.get("userId")
    if not user_id:
        return jsonify({"error": "Missing userId"}), 400

    try:
        db = get_database_client(
            endpoint=APPWRITE_ENDPOINT,
            project_id=APPWRITE_PROJECT,
            api_key=APPWRITE_API_KEY
        )

        result = db.list_documents(
            database_id=DATABASE_ID,
            collection_id=COLLECTION_ID,
            queries=[Query.equal("userId", user_id)]
        )
        return jsonify({"projects": result["documents"]})
    except Exception as e:
        return jsonify({"error": f"Failed to fetch projects: {str(e)}"}), 500


# Delete Route: To delete a project
@projects_bp.delete("/delete")
def delete_project():
    data = request.json or {}
    user_id = data.get("userId")
    project_id = data.get("projectId") 

    if not user_id or not project_id:
        return jsonify({"error": "Missing userId or projectId"}), 400

    try:
        db = get_database_client(
            endpoint=APPWRITE_ENDPOINT,
            project_id=APPWRITE_PROJECT,
            api_key=APPWRITE_API_KEY
        )

        doc = db.get_document(
            database_id=DATABASE_ID,
            collection_id=COLLECTION_ID,
            document_id=project_id
        )

        if doc.get("userId") != user_id:
            return jsonify({"error": "Unauthorized"}), 403

        db.delete_document(
            database_id=DATABASE_ID,
            collection_id=COLLECTION_ID,
            document_id=project_id
        )

        return jsonify({"message": "Project deleted successfully!"})

    except Exception as e:
        return jsonify({"error": f"Failed to delete project: {str(e)}"}), 500