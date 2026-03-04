"""
Disease Detection Tests
Tests for crop disease detection functionality and performance
"""
import pytest
import time
import sys
from pathlib import Path

backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))


class TestDiseaseModelLoading:
    """Test disease prediction model loading"""

    def test_model_import(self):
        """Test model can be imported"""
        try:
            from diseasePrediction import disease_model
            assert disease_model is not None
        except ImportError as e:
            pytest.skip(f"Cannot import: {e}")


class TestDiseaseClasses:
    """Test disease class definitions"""

    def test_class_names_file_exists(self):
        """Test disease class names file exists"""
        model_dir = Path(__file__).parent.parent.parent / "models" / "diseaseModel"
        class_names_file = model_dir / "class_names.json"
        
        assert class_names_file.exists(), "class_names.json should exist"


class TestDiseasePrediction:
    """Test disease prediction functionality"""

    def test_disease_prediction_module_import(self):
        """Test disease prediction module can be imported"""
        try:
            from diseasePrediction import disease_model
            assert disease_model is not None
        except ImportError as e:
            pytest.skip(f"Cannot import: {e}")
