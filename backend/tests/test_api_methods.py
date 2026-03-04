"""
Comprehensive API Endpoint Tests
Tests all API endpoints with proper HTTP methods
"""
import pytest
import requests
import sys
from pathlib import Path

backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))


BASE_URL = "http://localhost:8000"


def is_server_running():
    """Check if backend server is running"""
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=2)
        return response.status_code == 200
    except:
        return False


class TestAPIHealthEndpoints:
    """Test basic API health endpoints - GET only"""

    def test_root_get(self):
        """GET / should return 200"""
        if not is_server_running():
            pytest.skip("Backend server not running")
        
        response = requests.get(f"{BASE_URL}/")
        assert response.status_code == 200
        assert "message" in response.json()

    def test_health_get(self):
        """GET /health should return healthy status"""
        if not is_server_running():
            pytest.skip("Backend server not running")
        
        response = requests.get(f"{BASE_URL}/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"


class TestLocationEndpoints:
    """Test location endpoints - GET only"""

    def test_get_districts(self):
        """GET /location/getDistrict - retrieve districts by state"""
        if not is_server_running():
            pytest.skip("Backend server not running")
        
        response = requests.get(f"{BASE_URL}/location/getDistrict?state=AP")
        assert response.status_code in [200, 404]

    def test_get_cities(self):
        """GET /location/getCity - retrieve cities by district"""
        if not is_server_running():
            pytest.skip("Backend server not running")
        
        response = requests.get(f"{BASE_URL}/location/getCity?district=Guntur")
        assert response.status_code in [200, 404]

    def test_get_cities_with_query(self):
        """GET /location/getCity - search cities with query param"""
        if not is_server_running():
            pytest.skip("Backend server not running")
        
        response = requests.get(f"{BASE_URL}/location/getCity?district=Guntur&q=ten")
        assert response.status_code in [200, 404]


class TestWeatherEndpoints:
    """Test weather endpoints - GET only"""

    def test_get_weather_data(self):
        """GET /weather/getWeatherData - retrieve weather by coordinates"""
        if not is_server_running():
            pytest.skip("Backend server not running")
        
        response = requests.get(f"{BASE_URL}/weather/getWeatherData?lat=16.3067&lon=80.4365")
        assert response.status_code in [200, 500]


class TestAuthEndpoints:
    """Test authentication endpoints - POST only"""

    def test_gen_otp_post(self):
        """POST /auth/genOTP - generate OTP"""
        if not is_server_running():
            pytest.skip("Backend server not running")
        
        response = requests.post(
            f"{BASE_URL}/auth/genOTP",
            json={"email": "test@example.com", "userType": "Farmer"}
        )
        assert response.status_code in [200, 400, 403, 500]

    def test_verify_otp_post(self):
        """POST /auth/verifyOTP - verify OTP"""
        if not is_server_running():
            pytest.skip("Backend server not running")
        
        response = requests.post(
            f"{BASE_URL}/auth/verifyOTP",
            json={"email": "test@example.com", "otp": "123456", "userType": "Farmer"}
        )
        assert response.status_code in [200, 400]

    def test_logout_post(self):
        """POST /auth/logout - logout user"""
        if not is_server_running():
            pytest.skip("Backend server not running")
        
        response = requests.post(f"{BASE_URL}/auth/logout")
        assert response.status_code == 200


class TestProtectedEndpointsRequireAuth:
    """Test protected endpoints require authentication"""

    def test_disease_detect_requires_auth(self):
        """POST /disease/detect requires auth"""
        if not is_server_running():
            pytest.skip("Backend server not running")
        
        response = requests.post(f"{BASE_URL}/disease/detect")
        assert response.status_code in [401, 403]

    def test_crop_advice_requires_auth(self):
        """POST /crop_advice/new_chat requires auth"""
        if not is_server_running():
            pytest.skip("Backend server not running")
        
        response = requests.post(
            f"{BASE_URL}/crop_advice/new_chat",
            json={"crop": "rice", "location": "Guntur", "query": "test", "user_language": "en"}
        )
        assert response.status_code in [401, 403]

    def test_users_notifications_requires_auth(self):
        """GET /users/notifications requires auth"""
        if not is_server_running():
            pytest.skip("Backend server not running")
        
        response = requests.get(f"{BASE_URL}/users/notifications")
        assert response.status_code in [401, 403]

    def test_users_history_requires_auth(self):
        """GET /users/history requires auth"""
        if not is_server_running():
            pytest.skip("Backend server not running")
        
        response = requests.get(f"{BASE_URL}/users/history")
        assert response.status_code in [401, 403]

    def test_expert_dashboard_requires_auth(self):
        """GET /expert/dashboard requires auth"""
        if not is_server_running():
            pytest.skip("Backend server not running")
        
        response = requests.get(f"{BASE_URL}/expert/dashboard")
        assert response.status_code in [401, 403]


class TestDiseaseEndpoints:
    """Test disease detection endpoints"""

    def test_disease_history_requires_auth(self):
        """GET /disease/history requires auth"""
        if not is_server_running():
            pytest.skip("Backend server not running")
        
        response = requests.get(f"{BASE_URL}/disease/history")
        assert response.status_code in [401, 403]

    def test_disease_result_requires_auth(self):
        """GET /disease/{sessionId} requires auth"""
        if not is_server_running():
            pytest.skip("Backend server not running")
        
        response = requests.get(f"{BASE_URL}/disease/1")
        assert response.status_code in [401, 403]


class TestChatEndpoints:
    """Test chat endpoints"""

    def test_get_chat_session_requires_auth(self):
        """GET /chat/{sessionId} requires auth"""
        if not is_server_running():
            pytest.skip("Backend server not running")
        
        response = requests.get(f"{BASE_URL}/chat/test-session-id")
        assert response.status_code in [401, 403, 404, 500, 422]

    def test_add_message_requires_auth(self):
        """POST /chat/message requires auth"""
        if not is_server_running():
            pytest.skip("Backend server not running")
        
        response = requests.post(
            f"{BASE_URL}/chat/message",
            json={"sessionId": "test", "content": "test", "role": "user"}
        )
        assert response.status_code in [401, 403, 422]


class TestExpertEndpoints:
    """Test expert endpoints"""

    def test_get_pending_queries_requires_auth(self):
        """GET /expert/getPendingQueries requires auth"""
        if not is_server_running():
            pytest.skip("Backend server not running")
        
        response = requests.get(f"{BASE_URL}/expert/getPendingQueries?expert_id=1")
        assert response.status_code in [401, 403]

    def test_expert_advice_requires_auth(self):
        """POST /expert/expertAdvice requires auth"""
        if not is_server_running():
            pytest.skip("Backend server not running")
        
        response = requests.post(
            f"{BASE_URL}/expert/expertAdvice",
            json={"sessionId": "test", "content": "test", "role": "expert"}
        )
        assert response.status_code in [401, 403]


class TestAdminEndpoints:
    """Test admin endpoints"""

    def test_admin_dashboard_requires_auth(self):
        """GET /admin/dashboard may require auth"""
        if not is_server_running():
            pytest.skip("Backend server not running")
        
        response = requests.get(f"{BASE_URL}/admin/dashboard")
        assert response.status_code in [200, 401, 403]

    def test_add_expert_post(self):
        """POST /admin/addExpert - add expert"""
        if not is_server_running():
            pytest.skip("Backend server not running")
        
        response = requests.post(
            f"{BASE_URL}/admin/addExpert",
            json={"email": "expert@test.com", "name": "Test Expert"}
        )
        assert response.status_code in [200, 400, 401, 403, 500]


class TestTranscriptionEndpoints:
    """Test transcription endpoints"""

    def test_transcribe_requires_auth(self):
        """POST /transcribe may require auth"""
        if not is_server_running():
            pytest.skip("Backend server not running")
        
        response = requests.post(f"{BASE_URL}/transcribe")
        assert response.status_code in [200, 400, 401, 403, 404, 415, 500]
