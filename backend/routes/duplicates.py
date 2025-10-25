# routes/duplicates.py
import os, json, requests, time, uuid
from flask import Blueprint, request, jsonify
from dotenv import load_dotenv
from utils.appwrite_client import get_database_client, get_storage_client
from utils.embedding_utils import detect_textual_duplicates
from utils.file_utils import detect_file_duplicates
from utils.garden_stats import update_garden_stats
from cryptography.fernet import Fernet
from appwrite.query import Query
from threading import Lock

load_dotenv()
duplicates_bp = Blueprint("duplicates", __name__)

# Fernet Encryption: For User Project API Keys
fernet_key = os.getenv("FERNET_KEY")
if not fernet_key:
    raise ValueError("FERNET_KEY environment variable is required")
f = Fernet(fernet_key.encode())

DUPLICATES_COLLECTION = os.getenv("APPWRITE_DUPLICATES_COLLECTION", "duplicates")
USER_PROJECTS_COLLECTION = os.getenv("APPWRITE_USER_PROJECTS_COLLECTION", "user_projects")

# Global Lock: For scan operations per project
scan_locks = {}
scan_locks_mutex = Lock()

# Helpers
def get_scan_lock(project_id, service):
    """Get or create a lock for this project+service combination"""
    key = f"{project_id}:{service}"
    with scan_locks_mutex:
        if key not in scan_locks:
            scan_locks[key] = {"lock": Lock(), "last_scan": 0}
        return scan_locks[key]

def generate_unique_id():
    """Generate a truly unique ID using UUID + timestamp"""
    unique_str = f"{uuid.uuid4().hex}{int(time.time() * 1000000)}"
    return unique_str[:20]

def get_project_clients(project_doc):
    """Return initialized db, storage, auth clients using project credentials."""
    endpoint = project_doc.get("endpoint")
    project_api_id = project_doc.get("projectId")
    encrypted_key = project_doc.get("apiKey")
    if not encrypted_key:
        raise ValueError("Missing API key in project document")
    api_key = f.decrypt(encrypted_key.encode()).decode()
    db = get_database_client(endpoint=endpoint, project_id=project_api_id, api_key=api_key)
    storage = get_storage_client(endpoint=endpoint, project_id=project_api_id, api_key=api_key)
    return db, storage


# List Route: List databases and storages for a project
@duplicates_bp.route("/list", methods=["POST"])
def list_project_resources():
    """Return databases and storages for a project."""
    if not request.is_json:
        return jsonify({"error": "Invalid or missing JSON body"}), 400
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Empty request body"}), 400
    user_id = data.get("userId")
    project_id = data.get("projectId")
    if not all([user_id, project_id]):
        return jsonify({"error": "Missing required parameters"}), 400
    try:
        main_db = get_database_client()
        projects = main_db.list_documents(
            database_id=os.getenv("APPWRITE_DATABASE_ID", "default"),
            collection_id=USER_PROJECTS_COLLECTION,
            queries=[Query.equal("projectId", project_id)]
        ).get("documents", [])
        if not projects:
            return jsonify({"error": "Project not found"}), 404
        project_doc = projects[0]
        if project_doc.get("userId") != user_id:
            return jsonify({"error": "Unauthorized"}), 403
        db, storage = get_project_clients(project_doc)

        collections = []
        try:
            collections = db.list_collections(database_id=os.getenv("APPWRITE_DATABASE_ID", "default")).get("collections", [])
        except Exception as e:
            print(f"Error listing collections: {e}")
        buckets = []
        try:
            buckets = storage.list_buckets().get("buckets", [])
        except Exception as e:
            print(f"Error listing buckets: {e}")
        return jsonify({
            "status": "success",
            "databases": [{"$id": c["$id"], "name": c.get("name", "Unnamed Collection")} for c in collections],
            "storages": [{"$id": b["$id"], "name": b.get("name", "Unnamed Bucket")} for b in buckets]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Collections Route: List collections for a given database
@duplicates_bp.route("/collections", methods=["POST"])
def list_collections_for_database():
    """Return collections for a given databaseId."""
    if not request.is_json:
        return jsonify({"error": "Invalid or missing JSON body"}), 400
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Empty request body"}), 400
    user_id = data.get("userId")
    project_id = data.get("projectId")
    database_id = data.get("databaseId")
    if not all([user_id, project_id, database_id]):
        return jsonify({"error": "Missing required parameters"}), 400
    try:
        main_db = get_database_client()
        projects = main_db.list_documents(
            database_id=os.getenv("APPWRITE_DATABASE_ID", "default"),
            collection_id=USER_PROJECTS_COLLECTION,
            queries=[Query.equal("projectId", project_id)]
        ).get("documents", [])
        if not projects:
            return jsonify({"error": "Project not found"}), 404
        project_doc = projects[0]
        if project_doc.get("userId") != user_id:
            return jsonify({"error": "Unauthorized"}), 403
        db, _ = get_project_clients(project_doc)
        collections = db.list_collections(database_id=database_id).get("collections", [])
        return jsonify({
            "status": "success",
            "collections": [{"$id": c["$id"], "name": c.get("name", "Unnamed Collection")} for c in collections]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Scan Route: Scan for duplicates in a project
@duplicates_bp.route("/scan", methods=["POST"])
def scan_duplicates():
    if not request.is_json:
        return jsonify({"error": "Invalid or missing JSON body"}), 400
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Empty request body"}), 400
    user_id = data.get("userId")
    project_id = data.get("projectId")
    service = data.get("service")
    database_id = data.get("databaseId")
    collection_id = data.get("collectionId")
    if not all([user_id, project_id, service]):
        return jsonify({"error": "Missing required parameters"}), 400
    
    # Race Conditions Handling
    scan_lock_info = get_scan_lock(project_id, service)
    
    current_time = time.time()
    if current_time - scan_lock_info["last_scan"] < 2:
        print(f"⚠️  Scan already in progress or recently completed for {project_id}:{service}")
        return jsonify({
            "status": "success",
            "message": "Scan already in progress or recently completed",
            "duplicates_found": 0,
            "data": []
        }), 200
    
    if not scan_lock_info["lock"].acquire(blocking=False):
        print(f"⚠️  Another scan is in progress for {project_id}:{service}")
        return jsonify({
            "status": "success", 
            "message": "Another scan is in progress",
            "duplicates_found": 0,
            "data": []
        }), 200
    
    try:
        main_db = get_database_client()
        projects = main_db.list_documents(
            database_id=os.getenv("APPWRITE_DATABASE_ID", "default"),
            collection_id=USER_PROJECTS_COLLECTION,
            queries=[Query.equal("projectId", project_id)]
        ).get("documents", [])
        if not projects:
            return jsonify({"error": "Project not found"}), 404
        project_doc = projects[0]
        if project_doc.get("userId") != user_id:
            return jsonify({"error": "Unauthorized"}), 403
        db, storage = get_project_clients(project_doc)
        
        print(f"Cleaning up old duplicates for project {project_id}, service {service}")
        try:
            queries = [
                Query.equal("projectId", project_id),
                Query.equal("service", service)
            ]
            
            if service == "database" and database_id:
                queries.append(Query.equal("databaseId", database_id))
                if collection_id:
                    queries.append(Query.equal("collectionId", collection_id))
            
            old_docs = main_db.list_documents(
                database_id=os.getenv("APPWRITE_DATABASE_ID", "default"),
                collection_id=DUPLICATES_COLLECTION,
                queries=queries
            ).get("documents", [])
            
            print(f"Found {len(old_docs)} old duplicates to delete")
            
            for doc in old_docs:
                try:
                    main_db.delete_document(
                        database_id=os.getenv("APPWRITE_DATABASE_ID", "default"),
                        collection_id=DUPLICATES_COLLECTION,
                        document_id=doc["$id"]
                    )
                    print(f"Deleted old duplicate: {doc['$id']}")
                except Exception as e:
                    print(f"Failed to delete old duplicate {doc['$id']}: {e}")
        except Exception as e:
            print(f"Error during cleanup: {e}")

        duplicates = []
        
        # Scan database
        if service == "database":
            if not database_id:
                return jsonify({"error": "Missing databaseId for database scan"}), 400
            collections_to_scan = [collection_id] if collection_id else [
                c["$id"] for c in db.list_collections(database_id=database_id).get("collections", [])
            ]
            for col_id in collections_to_scan:
                try:
                    docs = db.list_documents(database_id, col_id).get("documents", [])
                    if not docs:
                        continue
                    records = [{"id": d["$id"], "text": json.dumps(d)} for d in docs]
                    clusters = detect_textual_duplicates(records)
                    for cluster_items in clusters:
                        duplicates.append({
                            "userId": user_id,
                            "projectId": project_id,
                            "service": service,
                            "type": "text",
                            "databaseId": database_id,
                            "collectionId": col_id,
                            "clusters": json.dumps(cluster_items)
                        })
                except Exception as e:
                    print(f"Error scanning collection {col_id}: {e}")
                    
        # Scan storage
        elif service == "storage":
            buckets = storage.list_buckets().get("buckets", [])
            for b in buckets:
                try:
                    files = storage.list_files(b["$id"]).get("files", [])
                    file_records = []
                    for fi in files:
                        file_id = fi["$id"]
                        filename = fi.get("name", "")
                        try:
                            endpoint = project_doc.get("endpoint") or os.getenv("APPWRITE_ENDPOINT")
                            project_api_id = project_doc.get("projectId")
                            url = f"{endpoint}/storage/buckets/{b['$id']}/files/{file_id}/view?project={project_api_id}"
                            if not str(url).startswith("https"):
                                print(f"Skipping invalid URL for file {file_id}")
                                continue
                            try:
                                resp = requests.get(url, timeout=30)
                                resp.raise_for_status()
                                file_bytes = resp.content
                                file_records.append({
                                    "id": file_id,
                                    "url": url,
                                    "filename": filename,
                                    "file_bytes": file_bytes
                                })
                            except Exception as e:
                                print(f"Failed to fetch file {file_id}: {e}")
                                continue
                        except Exception as e:
                            print(f"Error constructing URL for file {file_id}: {e}")
                            continue
                    if file_records:
                        clusters = detect_file_duplicates(file_records)
                        for cluster_items in clusters:
                            clean_cluster = []
                            for item in cluster_items:
                                clean_item = {
                                    "id": item.get("id"),
                                    "url": item.get("url"),
                                    "filename": item.get("filename"),
                                    "similarity_score": item.get("similarity_score", 1.0)
                                }
                                clean_cluster.append(clean_item)
                            duplicates.append({
                                "userId": user_id,
                                "projectId": project_id,
                                "service": service,
                                "type": "file",
                                "bucketId": b["$id"],
                                "clusters": json.dumps(clean_cluster)
                            })
                except Exception as e:
                    print(f"Error scanning bucket {b['$id']}: {e}")
        
        stored_duplicates = []
        duplicate_count = 0
        
        for cluster_doc in duplicates:
            cluster_items = json.loads(cluster_doc.get("clusters", "[]"))
            if len(cluster_items) < 2:
                continue
                
            original = cluster_items[0]
            
            for idx, dup in enumerate(cluster_items[1:]):
                duplicate_count += 1
                item_data = {
                    "userId": cluster_doc["userId"],
                    "projectId": cluster_doc["projectId"],
                    "service": cluster_doc["service"],
                    "type": cluster_doc["type"],
                    "originalId": original.get("id"),
                    "duplicateId": dup.get("id"),
                    "duplicateData": json.dumps({
                        "name": dup.get("filename", dup.get("id")),
                        "url": dup.get("url"),
                        "filename": dup.get("filename"),
                        "similarity_score": dup.get("similarity_score", 1.0)
                    }),
                    "status": "active"
                }
                
                if cluster_doc.get("databaseId"):
                    item_data["databaseId"] = cluster_doc["databaseId"]
                if cluster_doc.get("collectionId"):
                    item_data["collectionId"] = cluster_doc["collectionId"]
                if cluster_doc.get("bucketId"):
                    item_data["bucketId"] = cluster_doc["bucketId"]
                
                max_retries = 5
                retry_count = 0
                saved = False
                last_error = None
                
                while retry_count < max_retries and not saved:
                    try:
                        doc_id = generate_unique_id()
                        
                        print(f"Storing duplicate {duplicate_count} (attempt {retry_count + 1}): ID={doc_id}, originalId={original.get('id')}, duplicateId={dup.get('id')}")
                        
                        saved_doc = main_db.create_document(
                            database_id=os.getenv("APPWRITE_DATABASE_ID", "default"),
                            collection_id=DUPLICATES_COLLECTION,
                            document_id=doc_id,
                            data=item_data
                        )
                        stored_duplicates.append(saved_doc)
                        print(f"✅ Successfully stored duplicate with ID: {saved_doc['$id']}")
                        saved = True
                        
                    except Exception as e:
                        error_msg = str(e)
                        last_error = error_msg
                        retry_count += 1
                        
                        if "document with the requested ID already exists" in error_msg.lower():
                            if retry_count < max_retries:
                                print(f"⚠️  Duplicate ID conflict on attempt {retry_count}, retrying...")
                                time.sleep(0.05 * retry_count)  
                            else:
                                print(f"❌ Failed after {max_retries} retries: {error_msg}")
                        else:
                            print(f"❌ Failed to save duplicate #{duplicate_count}: {error_msg}")
                            print(f"   Data: {json.dumps(item_data, indent=2)}")
                            break
                
                if not saved and last_error:
                    print(f"⚠️  Could not store duplicate #{duplicate_count} after {max_retries} attempts")
        
        print(f"\n✅ Successfully stored {len(stored_duplicates)} out of {duplicate_count} duplicates")

        try:
            update_garden_stats(
                user_id=user_id,
                increment_scans=1,
                increment_duplicates=len(stored_duplicates)
            )
        except Exception as e:
            print(f"⚠️  Failed to update garden stats: {e}")
        
        scan_lock_info["last_scan"] = time.time()
        
        return jsonify({
            "status": "success",
            "duplicates_found": len(stored_duplicates),
            "total_attempted": duplicate_count,
            "data": stored_duplicates
        }), 200
        
    except Exception as e:
        print(f"❌ Error in scan_duplicates: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    finally:
        scan_lock_info["lock"].release()


# List Flat Route: List duplicates in flat structure
@duplicates_bp.route("/list_flat", methods=["POST"])
def list_flat_duplicates():
    if not request.is_json:
        return jsonify({"error": "Invalid or missing JSON body"}), 400
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Empty request body"}), 400
    user_id = data.get("userId")
    project_id = data.get("projectId")
    if not all([user_id, project_id]):
        return jsonify({"error": "Missing required parameters"}), 400
    try:
        main_db = get_database_client()
        docs = main_db.list_documents(
            database_id=os.getenv("APPWRITE_DATABASE_ID", "default"),
            collection_id=DUPLICATES_COLLECTION,
            queries=[
                Query.equal("userId", user_id),
                Query.equal("projectId", project_id),
                Query.equal("status", "active")
            ]
        ).get("documents", [])
        return jsonify({
            "status": "success",
            "total_duplicates": len(docs),
            "duplicates": docs
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Delete Single Duplicate Route: Delete a single duplicate
@duplicates_bp.route("/delete_single", methods=["POST"])
def delete_single_duplicate():
    if not request.is_json:
        return jsonify({"error": "Invalid or missing JSON body"}), 400
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Empty request body"}), 400
    user_id = data.get("userId")
    project_id = data.get("projectId")
    duplicate_id = data.get("duplicateId")
    delete_data = data.get("deleteData", False)
    if not all([user_id, project_id, duplicate_id]):
        return jsonify({"error": "Missing required parameters"}), 400
    try:
        main_db = get_database_client()
        projects = main_db.list_documents(
            database_id=os.getenv("APPWRITE_DATABASE_ID", "default"),
            collection_id=USER_PROJECTS_COLLECTION,
            queries=[Query.equal("projectId", project_id)]
        ).get("documents", [])
        if not projects:
            return jsonify({"error": "Project not found"}), 404
        project_doc = projects[0]
        if project_doc.get("userId") != user_id:
            return jsonify({"error": "Unauthorized"}), 403
        db, storage = get_project_clients(project_doc)
        dup_doc = main_db.get_document(
            database_id=os.getenv("APPWRITE_DATABASE_ID", "default"),
            collection_id=DUPLICATES_COLLECTION,
            document_id=duplicate_id
        )
        if not dup_doc:
            return jsonify({"error": "Duplicate not found"}), 404
        
        if delete_data:
            service = dup_doc.get("service")
            bucket_id = dup_doc.get("bucketId")
            collection_id = dup_doc.get("collectionId")
            database_id = dup_doc.get("databaseId")
            target_id = dup_doc.get("duplicateId")
            if target_id is None:
                return jsonify({"error": "No target ID found in duplicate record"}), 400
            try:
                if service == "storage" and bucket_id:
                    storage.delete_file(bucket_id, target_id)
                elif service == "database" and database_id and collection_id:
                    db.delete_document(database_id, collection_id, target_id)
            except Exception as e:
                print(f"Failed to delete data source: {e}")
        
        main_db.update_document(
            database_id=os.getenv("APPWRITE_DATABASE_ID", "default"),
            collection_id=DUPLICATES_COLLECTION,
            document_id=duplicate_id,
            data={"status": "deleted"}
        )

        try:
            update_garden_stats(
                user_id=user_id,
                increment_cleaned=1
            )
        except Exception as e:
            print(f"⚠️  Failed to update garden stats: {e}")

        return jsonify({"status": "success", "message": "Duplicate deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Delete Bulk Duplicates Route: Delete multiple duplicates at once
@duplicates_bp.route("/delete_bulk", methods=["POST"])
def delete_bulk_duplicates():
    """Delete multiple duplicates at once"""
    if not request.is_json:
        return jsonify({"error": "Invalid or missing JSON body"}), 400
    
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Empty request body"}), 400
    
    user_id = data.get("userId")
    project_id = data.get("projectId")
    duplicate_ids = data.get("duplicateIds", [])
    delete_data = data.get("deleteData", False)
    
    if not all([user_id, project_id]):
        return jsonify({"error": "Missing required parameters"}), 400
    
    if not duplicate_ids or not isinstance(duplicate_ids, list):
        return jsonify({"error": "duplicateIds must be a non-empty list"}), 400
    
    try:
        main_db = get_database_client()
        
        projects = main_db.list_documents(
            database_id=os.getenv("APPWRITE_DATABASE_ID", "default"),
            collection_id=USER_PROJECTS_COLLECTION,
            queries=[Query.equal("projectId", project_id)]
        ).get("documents", [])
        
        if not projects:
            return jsonify({"error": "Project not found"}), 404
        
        project_doc = projects[0]
        if project_doc.get("userId") != user_id:
            return jsonify({"error": "Unauthorized"}), 403
        
        db, storage = get_project_clients(project_doc)
        
        success_count = 0
        fail_count = 0
        errors = []
        
        for duplicate_id in duplicate_ids:
            try:
                dup_doc = main_db.get_document(
                    database_id=os.getenv("APPWRITE_DATABASE_ID", "default"),
                    collection_id=DUPLICATES_COLLECTION,
                    document_id=duplicate_id
                )
                
                if not dup_doc:
                    fail_count += 1
                    errors.append(f"Duplicate {duplicate_id} not found")
                    continue
                
                if delete_data:
                    service = dup_doc.get("service")
                    bucket_id = dup_doc.get("bucketId")
                    collection_id = dup_doc.get("collectionId")
                    database_id = dup_doc.get("databaseId")
                    target_id = dup_doc.get("duplicateId")
                    
                    if target_id:
                        try:
                            if service == "storage" and bucket_id:
                                storage.delete_file(bucket_id, target_id)
                                print(f"✅ Deleted file {target_id} from bucket {bucket_id}")
                            elif service == "database" and database_id and collection_id:
                                db.delete_document(database_id, collection_id, target_id)
                                print(f"✅ Deleted document {target_id} from collection {collection_id}")
                        except Exception as e:
                            print(f"⚠️  Failed to delete data source for {duplicate_id}: {e}")
                
                main_db.update_document(
                    database_id=os.getenv("APPWRITE_DATABASE_ID", "default"),
                    collection_id=DUPLICATES_COLLECTION,
                    document_id=duplicate_id,
                    data={"status": "deleted"}
                )
                
                success_count += 1
                print(f"✅ Successfully processed duplicate {duplicate_id}")
                
            except Exception as e:
                fail_count += 1
                error_msg = f"Failed to delete {duplicate_id}: {str(e)}"
                errors.append(error_msg)
                print(f"❌ {error_msg}")

        try:
            update_garden_stats(
                user_id=user_id,
                increment_cleaned=success_count
            )
        except Exception as e:
            print(f"⚠️  Failed to update garden stats: {e}")
        
        response_data = {
            "status": "success",
            "successCount": success_count,
            "failCount": fail_count,
            "message": f"Deleted {success_count} duplicate(s)"
        }
        
        if errors and len(errors) <= 5:
            response_data["errors"] = errors
        
        return jsonify(response_data), 200
        
    except Exception as e:
        print(f"❌ Error in delete_bulk_duplicates: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500