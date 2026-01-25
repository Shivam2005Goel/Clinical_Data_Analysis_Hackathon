import requests
import json

try:
    response = requests.post(
        'http://localhost:8000/api/ai/query',
        json={"query": "Hello AI, what can you do?"}
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
