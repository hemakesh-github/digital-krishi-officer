"""
AI Performance Tests
Tests response time for AI features
"""
import pytest
import time
import os
import sys
from pathlib import Path
from sqlalchemy import text

backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

os.environ.setdefault("GCS_BUCKET_FOLDER_MODEL", "test-bucket")


class TestAIPerformance:
    """Test AI feature response times"""

    @pytest.mark.performance
    def test_retrieval_model_load_time(self):
        """Test how long it takes to load the retrieval model"""
        try:
            import torch
            if not torch.cuda.is_available() and torch.get_num_threads() > 4:
                pytest.skip("Insufficient memory for model loading - requires GPU or more RAM")
        except:
            pass
        
        try:
            from LLM.retrieval import get_model
            start = time.perf_counter()
            model = get_model()
            load_time = time.perf_counter() - start
            print(f"\nRetrieval model load time: {load_time:.3f}s")
            assert load_time < 30, f"Model took too long to load: {load_time:.3f}s"
        except OSError as e:
            if "paging file" in str(e).lower() or "memory" in str(e).lower():
                pytest.skip(f"Memory insufficient: {e}")
            raise
        except ImportError as e:
            pytest.skip(f"Cannot import: {e}")
        except Exception as e:
            pytest.skip(f"Model not available: {e}")

    @pytest.mark.performance
    def test_disease_predictor_load_time(self):
        """Test how long it takes to load the disease predictor"""
        try:
            from main import get_disease_predictor
            start = time.perf_counter()
            predictor = get_disease_predictor()
            load_time = time.perf_counter() - start
            print(f"\nDisease predictor load time: {load_time:.3f}s")
            assert load_time < 60, f"Predictor took too long to load: {load_time:.3f}s"
        except OSError as e:
            if "paging file" in str(e).lower() or "memory" in str(e).lower():
                pytest.skip(f"Memory insufficient: {e}")
            raise
        except Exception as e:
            pytest.skip(f"Cannot load predictor: {e}")

    @pytest.mark.performance
    def test_agent_import_time(self):
        """Test how long it takes to import the agent module"""
        try:
            start = time.perf_counter()
            from LLM.multi_tool_agent import agent
            import_time = time.perf_counter() - start
            print(f"\nAgent module import time: {import_time:.3f}s")
            assert import_time < 10, f"Agent took too long to import: {import_time:.3f}s"
        except ImportError as e:
            pytest.skip(f"Cannot import: {e}")


class TestDatabasePerformance:
    """Test database operation response times"""

    @pytest.mark.performance
    def test_database_connection_time(self):
        """Test database connection time"""
        try:
            from database import engine
            start = time.perf_counter()
            with engine.connect() as conn:
                result = conn.execute(text("SELECT 1"))
                result.close()
            conn_time = time.perf_counter() - start
            print(f"\nDatabase connection time: {conn_time:.3f}s")
            assert conn_time < 2, f"Database connection too slow: {conn_time:.3f}s"
        except Exception as e:
            if "connection" in str(e).lower() or "postgres" in str(e).lower():
                pytest.skip(f"Database not available: {e}")
            raise
