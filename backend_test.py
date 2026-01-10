import requests
import sys
import json
from datetime import datetime

class ClinicalDataAPITester:
    def __init__(self, base_url="https://69c0dd75-8bab-4343-9b8d-1cc00fa59a3d.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "name": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=test_headers, timeout=30)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            
            try:
                response_data = response.json()
                if not success:
                    details = f"Expected {expected_status}, got {response.status_code}. Response: {response_data}"
                else:
                    details = "Success"
                self.log_test(name, success, details)
                return success, response_data
            except:
                details = f"Expected {expected_status}, got {response.status_code}. Non-JSON response: {response.text[:200]}"
                self.log_test(name, success, details)
                return success, {}

        except Exception as e:
            details = f"Request failed: {str(e)}"
            self.log_test(name, False, details)
            return False, {}

    def test_health_check(self):
        """Test health check endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "health",
            200
        )
        if success:
            print(f"   Health Status: {response}")
        return success

    def test_register_user(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        user_data = {
            "email": f"test{timestamp}@example.com",
            "password": "Test123!",
            "full_name": "Test User",
            "role": "CRA"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=user_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            print(f"   Registered user: {response['user']['email']}")
            return True
        return False

    def test_login_user(self):
        """Test user login with existing credentials"""
        login_data = {
            "email": "test@example.com",
            "password": "Test123!"
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            print(f"   Logged in user: {response['user']['email']}")
            return True
        return False

    def test_get_current_user(self):
        """Test getting current user info"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_supabase_endpoints(self):
        """Test Supabase endpoints - should return 503"""
        endpoints = [
            ("Dashboard Stats", "data/dashboard-stats"),
            ("High Risk Sites", "data/high-risk-sites"),
            ("Patient Level Data", "data/patient-level"),
            ("Site Level Data", "data/site-level")
        ]
        
        for name, endpoint in endpoints:
            success, response = self.run_test(
                f"Supabase {name} (Expected 503)",
                "GET",
                endpoint,
                503
            )

    def test_create_alert(self):
        """Test creating an alert"""
        alert_data = {
            "title": "Test Alert",
            "description": "Testing alert creation",
            "priority": "High",
            "alert_type": "data_quality"
        }
        
        success, response = self.run_test(
            "Create Alert",
            "POST",
            "alerts",
            200,
            data=alert_data
        )
        
        if success and 'id' in response:
            self.alert_id = response['id']
            print(f"   Created alert ID: {self.alert_id}")
            return True
        return False

    def test_get_alerts(self):
        """Test getting alerts"""
        success, response = self.run_test(
            "Get Alerts",
            "GET",
            "alerts",
            200
        )
        
        if success:
            print(f"   Found {len(response)} alerts")
        return success

    def test_update_alert_status(self):
        """Test updating alert status"""
        if not hasattr(self, 'alert_id'):
            print("   Skipping - no alert ID available")
            return False
            
        success, response = self.run_test(
            "Update Alert Status",
            "PATCH",
            f"alerts/{self.alert_id}/status?status=resolved",
            200
        )
        return success

    def test_create_comment(self):
        """Test creating a comment"""
        comment_data = {
            "entity_type": "alert",
            "entity_id": getattr(self, 'alert_id', 'test-id'),
            "comment_text": "This is a test comment"
        }
        
        success, response = self.run_test(
            "Create Comment",
            "POST",
            "comments",
            200,
            data=comment_data
        )
        return success

    def test_get_comments(self):
        """Test getting comments"""
        entity_id = getattr(self, 'alert_id', 'test-id')
        success, response = self.run_test(
            "Get Comments",
            "GET",
            f"comments/alert/{entity_id}",
            200
        )
        return success

    def test_create_tag(self):
        """Test creating a tag"""
        tag_data = {
            "entity_type": "alert",
            "entity_id": getattr(self, 'alert_id', 'test-id'),
            "tag_name": "urgent"
        }
        
        success, response = self.run_test(
            "Create Tag",
            "POST",
            "tags",
            200,
            data=tag_data
        )
        return success

    def test_get_tags(self):
        """Test getting tags"""
        entity_id = getattr(self, 'alert_id', 'test-id')
        success, response = self.run_test(
            "Get Tags",
            "GET",
            f"tags/alert/{entity_id}",
            200
        )
        return success

    def test_ai_natural_query(self):
        """Test AI natural language query"""
        query_data = {
            "query": "What are the key metrics for clinical trial monitoring?"
        }
        
        success, response = self.run_test(
            "AI Natural Language Query",
            "POST",
            "ai/query",
            200,
            data=query_data
        )
        
        if success and 'response' in response:
            print(f"   AI Response: {response['response'][:100]}...")
        return success

    def test_ai_generate_report(self):
        """Test AI report generation"""
        report_data = {
            "report_type": "site_performance",
            "context": {"test": "data"}
        }
        
        success, response = self.run_test(
            "AI Generate Report",
            "POST",
            "ai/generate-report",
            200,
            data=report_data
        )
        
        if success and 'report' in response:
            print(f"   AI Report: {response['report'][:100]}...")
        return success

    def test_ai_recommendations(self):
        """Test AI recommendations"""
        success, response = self.run_test(
            "AI Recommendations",
            "POST",
            "ai/recommend-actions",
            200
        )
        
        if success and 'recommendations' in response:
            print(f"   AI Recommendations: {response['recommendations'][:100]}...")
        return success

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Clinical Data Monitoring System API Tests")
        print("=" * 60)
        
        # Basic connectivity
        if not self.test_health_check():
            print("❌ Health check failed - stopping tests")
            return False
        
        # Authentication tests
        print("\n📝 Testing Authentication...")
        if not self.test_register_user():
            print("❌ Registration failed - trying login")
            if not self.test_login_user():
                print("❌ Login also failed - stopping tests")
                return False
        
        self.test_get_current_user()
        
        # Supabase tests (expected to fail with 503)
        print("\n🔌 Testing Supabase Endpoints (Expected 503 errors)...")
        self.test_supabase_endpoints()
        
        # MongoDB features tests
        print("\n📊 Testing MongoDB Features...")
        self.test_create_alert()
        self.test_get_alerts()
        self.test_update_alert_status()
        self.test_create_comment()
        self.test_get_comments()
        self.test_create_tag()
        self.test_get_tags()
        
        # AI features tests
        print("\n🤖 Testing AI Features...")
        self.test_ai_natural_query()
        self.test_ai_generate_report()
        self.test_ai_recommendations()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        # Print failed tests
        failed_tests = [t for t in self.test_results if not t['success']]
        if failed_tests:
            print("\n❌ Failed Tests:")
            for test in failed_tests:
                print(f"   - {test['name']}: {test['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = ClinicalDataAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())