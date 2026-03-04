"""
Load Tests
Performance and load testing for the API
"""
import pytest
import time
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


class TestEndpointLoad:
    """Load testing for API endpoints"""

    def test_health_check_sequential(self):
        """Test sequential health check requests"""
        if not is_server_running():
            pytest.skip("Backend server not running")
        
        latencies = []
        for _ in range(10):
            start = time.time()
            response = requests.get(f"{BASE_URL}/health")
            latency = (time.time() - start) * 1000
            latencies.append(latency)
        
        avg_latency = sum(latencies) / len(latencies)
        print(f"\nAverage health check latency: {avg_latency:.2f}ms")
        
        assert avg_latency < 5000, "Health check should be reasonably fast"


class TestPerformanceBenchmarks:
    """Performance benchmarks"""

    def test_response_time_benchmark(self):
        """Benchmark response times for all endpoints"""
        if not is_server_running():
            pytest.skip("Backend server not running")
        
        endpoints = [
            "/",
            "/health",
            "/location/getDistrict?state=AP",
        ]
        
        results = []
        
        for path in endpoints:
            start_time = time.time()
            response = requests.get(f"{BASE_URL}{path}")
            latency = (time.time() - start_time) * 1000
            
            results.append({
                "endpoint": path,
                "latency_ms": round(latency, 2),
                "status_code": response.status_code,
            })
            
            print(f"GET {path}: {latency:.2f}ms")
        
        for result in results:
            assert result["latency_ms"] < 10000, f"Endpoint {result['endpoint']} exceeded 10s"
