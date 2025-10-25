# utils/reminders_manager.py
import os, time, requests, threading
from datetime import datetime, timedelta, timezone
from utils.appwrite_client import get_database_client, get_appwrite_client
from appwrite.query import Query
from appwrite.services.users import Users
from appwrite.services.messaging import Messaging

APPWRITE_DATABASE_ID = os.getenv("APPWRITE_DATABASE_ID", "default")
USER_PROJECTS_COLLECTION = os.getenv("APPWRITE_USER_PROJECTS_COLLECTION", "user_projects")
REMINDER_COLLECTION = os.getenv("APPWRITE_REMINDER_COLLECTION", "reminders")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5000")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")  
MESSAGING_TOPIC_ID = os.getenv("MESSAGING_TOPIC_ID")

SCHEDULE_MAP = {
    "30min": 30 * 60,       
    "hourly": 60 * 60,      
    "daily": 24 * 60 * 60,   
    "weekly": 7 * 24 * 60 * 60,    
    "monthly": 30 * 24 * 60 * 60   
}

def get_user_email(user_id: str) -> str | None:
    """Fetch the user’s email from Appwrite using userId"""
    try:
        client = get_appwrite_client()
        users_service = Users(client)
        user = users_service.get(user_id)
        return user.get("email")
    except Exception as e:
        print(f"Error fetching email for user {user_id}: {e}")
        return None

def send_message_via_appwrite(to_email: str, subject: str, message: str):
    """Send reminder via Appwrite Messaging instead of email"""
    try:
        client = get_appwrite_client()
        messaging = Messaging(client)
        messaging.create_message(  # type: ignore
            topic_id=MESSAGING_TOPIC_ID,
            to=[to_email],
            payload={
                "subject": subject,
                "message": message
            }
        )
        print(f"📧 Reminder sent via Appwrite Messaging to {to_email}")
    except Exception as e:
        print(f"❌ Failed to send message via Appwrite: {e}")

def run_scan_reminder(reminder):
    """Perform duplicate scan for a project when reminder triggers."""
    try:
        project_id = reminder["projectId"]
        user_id = reminder["userId"]
        service = reminder.get("service", "database")
        frequency = reminder.get("frequency", "weekly")
        freq = frequency[0].upper() + frequency[1:]

        print(f"🔄 Running scheduled scan for {project_id} ({service})")

        payload = {
            "userId": user_id,
            "projectId": project_id,
            "service": service
        }
        
        if service == "database":
            database_id = reminder.get("databaseId")
            if not database_id:
                print(f"❌ Missing databaseId for database scan reminder {reminder['$id']}")
                return
            payload["databaseId"] = database_id
            
            collection_id = reminder.get("collectionId")
            if collection_id:
                payload["collectionId"] = collection_id

        response = requests.post(
            f"{BACKEND_URL}/api/duplicates/scan",
            json=payload,
            timeout=300
        )
        res_data = response.json()

        email = get_user_email(user_id)
        if email:
            duplicates_url = f"{FRONTEND_URL}/duplicates/{project_id}/{service}"
            if service == "database" and database_id:
                duplicates_url += f"?databaseId={database_id}"

            send_message_via_appwrite(
                to_email=email,
                subject=f"Appwrite AI Duplicates Detector (Reminder) 🔔 | Duplicate Scan Completed for Project - {project_id}",
                message = f"""
                        Your {freq} Duplicate Scan Completed ✅
                        Project ID: {project_id}
                        Service: {service.capitalize()}
                        Total duplicates found: {res_data.get('duplicates_found', 0)}
                        View details: {FRONTEND_URL}/dashboard
                        Re-run scan: {duplicates_url}
                        Thank you, Appwrite AI Duplicates Detector (AADD)
                        """
            )

        db = get_database_client()
        db.update_document(
            database_id=APPWRITE_DATABASE_ID,
            collection_id=REMINDER_COLLECTION,
            document_id=reminder["$id"],
            data={"lastRun": datetime.now(timezone.utc).isoformat()}
        )
        print(f"✅ Reminder executed for {project_id}")

    except Exception as e:
        print(f"❌ Error running reminder: {e}")

def reminder_scheduler():
    """Background scheduler thread that periodically checks reminders and runs them on time."""
    print("🚀 Reminder scheduler started...")
    db = get_database_client()

    while True:
        try:
            reminders = db.list_documents(
                database_id=APPWRITE_DATABASE_ID,
                collection_id=REMINDER_COLLECTION,
                queries=[Query.equal("enabled", True)]
            ).get("documents", [])

            now = datetime.now(timezone.utc)  
            next_run_times = []

            for reminder in reminders:
                freq = reminder.get("frequency")
                interval_sec = SCHEDULE_MAP.get(freq, 0)
                if not interval_sec:
                    continue

                last_run_str = reminder.get("lastRun")
                last_run = (
                    datetime.fromisoformat(last_run_str)
                    if last_run_str else now
                )
                if last_run.tzinfo is None:
                    last_run = last_run.replace(tzinfo=timezone.utc)

                next_run = last_run + timedelta(seconds=interval_sec)

                if now >= next_run:
                    threading.Thread(target=run_scan_reminder, args=(reminder,), daemon=True).start()
                    db.update_document(
                        database_id=APPWRITE_DATABASE_ID,
                        collection_id=REMINDER_COLLECTION,
                        document_id=reminder["$id"],
                        data={"lastRun": datetime.now(timezone.utc).isoformat()}
                    )
                    next_run = now + timedelta(seconds=interval_sec)

                next_run_times.append(next_run)

            if next_run_times:
                nearest = min(next_run_times)
                sleep_seconds = max((nearest - datetime.now(timezone.utc)).total_seconds(), 1)
            else:
                sleep_seconds = 60 

            time.sleep(sleep_seconds)

        except Exception as e:
            print(f"⚠️ Reminder loop error: {e}")
            time.sleep(60)