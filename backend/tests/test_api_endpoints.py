"""
API Endpoint Tests
Tests all API endpoints for functionality and performance
"""
import pytest
import time
import requests
from datetime import datetime
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


class TestAPIHealth:
    """Test basic API health and availability"""

    def test_root_endpoint(self):
        """Test root endpoint returns 200"""
        if not is_server_running():
            pytest.skip("Backend server not running - start with: uvicorn main:app --reload")
        
        response = requests.get(f"{BASE_URL}/")
        assert response.status_code == 200
        assert "message" in response.json()

    def test_health_check(self):
        """Test health check endpoint"""
        if not is_server_running():
            pytest.skip("Backend server not running")
        
        response = requests.get(f"{BASE_URL}/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"


class TestLocationEndpoints:
    """Test location API endpoints"""

    def test_get_districts(self):
        """Test get districts by state"""
        if not is_server_running():
            pytest.skip("Backend server not running")
        
        response = requests.get(f"{BASE_URL}/location/getDistrict?state=AP")
        assert response.status_code in [200, 404]

    def test_get_cities(self):
        """Test get cities by district"""
        if not is_server_running():
            pytest.skip("Backend server not running")
        
        response = requests.get(f"{BASE_URL}/location/getCity?district=Guntur")
        assert response.status_code in [200, 404]


class TestProtectedEndpoints:
    """Test protected endpoints requiring authentication"""

    def test_disease_detection_unauthorized(self):
        """Test disease detection without authentication"""
        if not is_server_running():
            pytest.skip("Backend server not running")
        
        response = requests.post(f"{BASE_URL}/disease/detect")
        assert response.status_code in [401, 403]

    def test_crop_advice_unauthorized(self):
        """Test crop advice without authentication"""
        if not is_server_running():
            pytest.skip("Backend server not running")
        
        crop_data = {
            "crop": "sugarcane",
            "location": "Guntur",
            "query": "What is the best fertilizer?",
            "user_language": "en"
        }
        response = requests.post(f"{BASE_URL}/crop_advice/new_chat", json=crop_data)
        assert response.status_code in [401, 403]

    def test_users_notifications_unauthorized(self):
        """Test notifications without authentication"""
        if not is_server_running():
            pytest.skip("Backend server not running")
        
        response = requests.get(f"{BASE_URL}/users/notifications")
        assert response.status_code in [401, 403]
