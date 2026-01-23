import requests
import json
import time

BASE_URL = "http://localhost:8000/api"

def test_flow():
    # 1. Register a new test user
    timestamp = int(time.time())
    email = f"test_{timestamp}@example.com"
    reg_data = {
        "email": email,
        "password": "Password123!",
        "full_name": "Test User",
        "role": "CRA"
    }
    
    print(f"Registering: {email}...")
    try:
        r = requests.post(f"{BASE_URL}/auth/register", json=reg_data)
        print(f"Register status: {r.status_code}")
        if r.status_code != 200:
            print(f"Register failed: {r.text}")
            return
            
        data = r.json()
        token = data['access_token']
        print("Register successful!")
        
        # 2. Test /auth/me
        headers = {"Authorization": f"Bearer {token}"}
        r = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        print(f"Auth Me status: {r.status_code}")
        print(f"Auth Me response: {r.text}")
        
        # 3. Test data endpoint
        r = requests.get(f"{BASE_URL}/data/dashboard-stats", headers=headers)
        print(f"Dashboard Stats status: {r.status_code}")
        print(f"Dashboard Stats response: {r.text}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_flow()
