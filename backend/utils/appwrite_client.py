# utils/appwrite_client.py
import os
from dotenv import load_dotenv
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.services.storage import Storage

load_dotenv()

def get_env_str(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise ValueError(f"{name} environment variable is required")
    return value

def get_appwrite_client(endpoint: str | None = None, project_id: str | None = None, api_key: str | None = None) -> Client:
    client = Client()
    client.set_endpoint(endpoint or get_env_str("APPWRITE_ENDPOINT"))
    client.set_project(project_id or get_env_str("APPWRITE_PROJECT"))
    client.set_key(api_key or get_env_str("APPWRITE_API_KEY"))
    return client

def get_database_client(endpoint: str | None = None, project_id: str | None = None, api_key: str | None = None) -> Databases:
    return Databases(get_appwrite_client(endpoint, project_id, api_key))

def get_storage_client(endpoint: str | None = None, project_id: str | None = None, api_key: str | None = None) -> Storage:
    return Storage(get_appwrite_client(endpoint, project_id, api_key))