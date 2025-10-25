# utils/garden_stats.py
import os
from utils.appwrite_client import get_database_client
from appwrite.query import Query

GARDEN_STATS_COLLECTION = os.getenv("APPWRITE_GARDEN_STATS_COLLECTION", "garden_stats")

def get_or_create_garden_stats(user_id):
    """Get or create garden stats for a user"""
    try:
        main_db = get_database_client()
        
        result = main_db.list_documents(
            database_id=os.getenv("APPWRITE_DATABASE_ID", "default"),
            collection_id=GARDEN_STATS_COLLECTION,
            queries=[Query.equal("userId", user_id)]
        )
        
        documents = result.get("documents", [])
        if documents:
            return documents[0]
        
        new_stats = main_db.create_document(
            database_id=os.getenv("APPWRITE_DATABASE_ID", "default"),
            collection_id=GARDEN_STATS_COLLECTION,
            document_id="unique()",
            data={
                "userId": user_id,
                "health": 50,
                "total_scans": 0,
                "total_duplicates": 0,
                "total_cleaned": 0
            }
        )
        return new_stats
        
    except Exception as e:
        print(f"Error getting/creating garden stats: {e}")
        raise e

def calculate_health(stats):
    """Calculate health based on cleanup ratio and activity"""
    total_scans = stats.get("total_scans", 0)
    total_duplicates = stats.get("total_duplicates", 0)
    total_cleaned = stats.get("total_cleaned", 0)
    
    health = 50
    
    if total_duplicates == 0:
        activity_bonus = min(total_scans * 5, 50)
        return min(50 + activity_bonus, 100)
    
    cleanup_rate = (total_cleaned / total_duplicates) * 50
    
    activity_bonus = min(total_scans * 2, 20)
    
    health = cleanup_rate + activity_bonus
    
    return min(round(health), 100)

def update_garden_stats(user_id, increment_scans=0, increment_duplicates=0, increment_cleaned=0):
    """Update garden stats for a user"""
    try:
        main_db = get_database_client()
        stats = get_or_create_garden_stats(user_id)
        
        new_scans = stats.get("total_scans", 0) + increment_scans
        new_duplicates = stats.get("total_duplicates", 0) + increment_duplicates
        new_cleaned = stats.get("total_cleaned", 0) + increment_cleaned
        
        new_stats = {
            "total_scans": new_scans,
            "total_duplicates": new_duplicates,
            "total_cleaned": new_cleaned
        }
        new_health = calculate_health(new_stats)
        new_stats["health"] = new_health
        
        updated = main_db.update_document(
            database_id=os.getenv("APPWRITE_DATABASE_ID", "default"),
            collection_id=GARDEN_STATS_COLLECTION,
            document_id=stats["$id"],
            data=new_stats
        )
        
        print(f"✅ Updated garden stats for user {user_id}: scans={new_scans}, duplicates={new_duplicates}, cleaned={new_cleaned}, health={new_health}")
        return updated
        
    except Exception as e:
        print(f"Error updating garden stats: {e}")
        return None
    
def update_plant_name(user_id: str, plant_name: str) -> bool:
    """Update plant name for a user"""
    try:
        main_db = get_database_client()
        stats = get_or_create_garden_stats(user_id)
        
        main_db.update_document(
            database_id=os.getenv("APPWRITE_DATABASE_ID", "default"),
            collection_id=GARDEN_STATS_COLLECTION,
            document_id=stats["$id"],
            data={"plant_name": plant_name}
        )
        
        return True
    except Exception as e:
        print(f"Error updating plant name: {e}")
        return False