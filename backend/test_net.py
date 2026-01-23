import requests
try:
    print("Testing connection to google.com...")
    r = requests.get("https://www.google.com", timeout=5)
    print(f"Status: {r.status_code}")
except Exception as e:
    print(f"Failed: {e}")

try:
    print("\nTesting connection to Supabase host...")
    import socket
    host = "qlavibrdivegeecqzxzn.supabase.co"
    ip = socket.gethostbyname(host)
    print(f"IP for {host}: {ip}")
except Exception as e:
    print(f"Failed to resolve {host}: {e}")
