import asyncio
import os
from supabase import create_client, Client
from dotenv import load_dotenv

async def debug_supabase():
    load_dotenv()
    url = os.environ.get('SUPABASE_URL')
    key = os.environ.get('SUPABASE_KEY')
    
    print(f"URL: {url}")
    # print(f"Key: {key[:10]}...")
    
    supabase: Client = create_client(url, key)
    
    tables_to_check = [
        'High Risk Sites', 
        'Patient Data', 
        'Sites Data',
        'high_risk_sites',
        'patient_level_unified',
        'site_level_summary'
    ]
    
    for table in tables_to_check:
        try:
            print(f"\nChecking table: '{table}'")
            response = supabase.table(table).select("*").limit(3).execute()
            if len(response.data) > 0:
                print(f"Sample data: {response.data[0]}")
                for key, value in response.data[0].items():
                    print(f"  Field: {key}, Type: {type(value)}, Value: {repr(value)}")
            else:
                print("Table exists but is EMPTY.")
        except Exception as e:
            print(f"Failed to query '{table}': {str(e)}")

if __name__ == "__main__":
    asyncio.run(debug_supabase())
