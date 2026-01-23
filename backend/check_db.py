import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

async def check_db():
    load_dotenv()
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME')
    
    print(f"Connecting to: {mongo_url.split('@')[-1]}")
    print(f"DB Name: {db_name}")
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        collections = await db.list_collection_names()
        print(f"Collections: {collections}")
        
        if 'users' in collections:
            count = await db.users.count_documents({})
            print(f"User count: {count}")
            if count > 0:
                user = await db.users.find_one({}, {"password": 0})
                print(f"Sample user: {user.get('email')}")
        else:
            print("Collection 'users' NOT found!")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(check_db())
