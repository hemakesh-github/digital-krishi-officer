#!/bin/bash
# Test Runner Script for Farmer Assist

set -e

echo "========================================="
echo "Farmer Assist - Test Runner"
echo "========================================="

# Backend Tests
echo ""
echo "Running Backend Tests..."
echo "-----------------------------------"

cd "$(dirname "$0")/backend"

# Install test dependencies if needed
if ! python -c "import pytest" 2>/dev/null; then
    echo "Installing test dependencies..."
    pip install -r requirements-test.txt
fi

# Run backend tests
echo "Running pytest..."
python -m pytest tests/ -v --tb=short --cov=. --cov-report=term-missing --cov-report=html

echo ""
echo "Backend tests completed!"
echo ""

# Frontend Tests
echo "========================================="
echo "Running Frontend Tests..."
echo "-----------------------------------"

cd "$(dirname "$0")/frontend"

# Install test dependencies if needed
if ! npm list --depth=0 2>/dev/null | grep -q "vitest"; then
    echo "Installing test dependencies..."
    npm install
fi

# Run frontend tests
echo "Running vitest..."
npm test -- --run

echo ""
echo "Frontend tests completed!"
echo ""

# Generate combined report
echo "========================================="
echo "Test Summary"
echo "========================================="
echo "Tests completed! Check the reports:"
echo "  - Backend coverage: backend/htmlcov/index.html"
echo "  - Frontend coverage: frontend/coverage/index.html"
echo ""
