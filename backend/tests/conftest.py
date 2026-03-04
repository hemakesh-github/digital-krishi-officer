import pytest
import os
import sys
from pathlib import Path

backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from dotenv import load_dotenv
load_dotenv(backend_dir / ".env")

os.environ.setdefault("DATABASE_URL", os.getenv("DATABASE_URL", "postgresql://test:test@localhost:5432/farmerassist_test"))
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-for-testing")
os.environ.setdefault("GEMINI_API_KEY", "test-gemini-key")
os.environ.setdefault("QDRANT_API_KEY", "test-qdrant-key")


@pytest.fixture(scope="session")
def test_user_email():
    return "testfarmer@example.com"


@pytest.fixture(scope="session")
def test_expert_email():
    return "testexpert@example.com"


@pytest.fixture(scope="session")
def test_admin_email():
    return "testadmin@example.com"


@pytest.fixture
def test_crop_data():
    return {
        "crop": "sugarcane",
        "location": "Guntur",
        "query": "What is the best fertilizer for sugarcane?",
        "user_language": "en"
    }


@pytest.fixture
def test_location_data():
    return {
        "lat": 16.3067,
        "lon": 80.4365
    }


@pytest.fixture
def test_image_path():
    test_dir = Path(__file__).parent
    sample_dir = test_dir / "sample_data"
    sample_dir.mkdir(exist_ok=True)
    return sample_dir / "test_crop_image.jpg"


@pytest.fixture
def auth_tokens():
    return {
        "access_token": "test-access-token",
        "refresh_token": "test-refresh-token",
        "token_type": "bearer"
    }
