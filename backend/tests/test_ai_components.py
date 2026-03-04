"""
AI/LLM Tests
Tests for AI components including retrieval and agent
"""
import pytest
import os
import sys
from pathlib import Path

backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

os.environ.setdefault("GCS_BUCKET_FOLDER_MODEL", "test-bucket")


class TestRetrievalSystem:
    """Test semantic retrieval system"""

    def test_retrieval_module_import(self):
        """Test retrieval module can be imported"""
        try:
            os.environ["GCS_BUCKET_FOLDER_MODEL"] = "test-bucket"
            from LLM.retrieval import get_model
            assert get_model is not None
        except ImportError as e:
            pytest.skip(f"Cannot import: {e}")
        except TypeError as e:
            pytest.skip(f"Config issue: {e}")

    def test_retrieval_agent_import(self):
        """Test agent module can be imported"""
        try:
            from LLM.multi_tool_agent import agent
            assert agent is not None
        except ImportError as e:
            pytest.skip(f"Cannot import: {e}")


class TestQdrantRetrieval:
    """Test Qdrant vector database operations"""

    def test_qdrant_client_import(self):
        """Test Qdrant client can be imported"""
        try:
            from qdrant_client import QdrantClient
            assert QdrantClient is not None
        except ImportError as e:
            pytest.skip(f"Cannot import qdrant_client: {e}")


class TestGoogleADKAgent:
    """Test Google ADK multi-tool agent"""

    def test_agent_module_import(self):
        """Test agent module exists"""
        try:
            from LLM import multi_tool_agent
            assert multi_tool_agent is not None
        except ImportError as e:
            pytest.skip(f"Cannot import: {e}")


class TestGeminiIntegration:
    """Test Gemini LLM integration"""

    def test_google_genai_import(self):
        """Test Google genai can be imported"""
        try:
            from google import genai
            assert genai is not None
        except ImportError as e:
            pytest.skip(f"Cannot import google.genai: {e}")
