import requests
import json
import uuid

base_url = 'http://localhost:8000/api'
email = f"test_user_{uuid.uuid4()}@example.com"
password = "testpassword123"

try:
    # 1. Register
    print(f"Registering user: {email}")
    auth_response = requests.post(
        f'{base_url}/auth/register',
        json={
            "email": email,
            "password": password,
            "full_name": "Test User",
            "role": "CRA"
        }
    )
    
    if auth_response.status_code != 200:
        print(f"Registration failed: {auth_response.text}")
        # Try login if already exists (though uuid makes that unlikely)
        auth_response = requests.post(
            f'{base_url}/auth/login',
            json={"email": email, "password": password}
        )

    token = auth_response.json()['access_token']
    print("Got access token")

    # 2. Query AI
    print("Querying AI...")
    ai_response = requests.post(
        f'{base_url}/ai/query',
        json={"query": "Hello AI, what can you do?"},
        headers={"Authorization": f"Bearer {token}"}
    )
    
    print(f"AI Status Code: {ai_response.status_code}")
    print(f"AI Response: {ai_response.json()}")

except Exception as e:
    print(f"Error: {e}")
