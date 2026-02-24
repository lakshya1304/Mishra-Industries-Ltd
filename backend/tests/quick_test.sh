#!/bin/bash

# 🧪 Quick Test Runner - Mishra Industries Backend
# Usage: bash tests/quick_test.sh

echo "╔══════════════════════════════════════════════════╗"
echo "║      MISHRA INDUSTRIES - QUICK TEST RUNNER       ║"
echo "╚══════════════════════════════════════════════════╝"

# Check if server is running
echo ""
echo "🔍 Checking if server is running on http://localhost:5000..."
if curl -s http://localhost:5000 > /dev/null 2>&1; then
    echo "✓ Server is running"
else
    echo "✗ Server is NOT running!"
    echo "Start the server with: npm run dev"
    echo ""
    echo "Then run this script again:"
    echo "  bash tests/quick_test.sh"
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════"
echo "Running Test Suite..."
echo "═══════════════════════════════════════════════════"

# Track overall status
OVERALL_STATUS=0

# Test 1: Configuration
echo ""
echo "📋 [1/4] Configuration Test..."
echo "─────────────────────────────────────────────────"
if node tests/test_config.js; then
    echo "✓ Configuration test passed"
else
    echo "✗ Configuration test failed"
    OVERALL_STATUS=1
fi

echo ""
echo "Press Enter to continue to API tests..."
read

# Test 2: API
echo ""
echo "🌐 [2/4] API Comprehensive Test..."
echo "─────────────────────────────────────────────────"
if node tests/test_api_comprehensive.js; then
    echo "✓ API test passed"
else
    echo "✗ API test failed"
    OVERALL_STATUS=1
fi

echo ""
echo "Press Enter to continue to CURL tests..."
read

# Test 3: CURL
echo ""
echo "📡 [3/4] CURL HTTP Tests..."
echo "─────────────────────────────────────────────────"
if bash tests/test_with_curl.sh; then
    echo "✓ CURL tests passed"
else
    echo "✗ CURL tests failed"
    OVERALL_STATUS=1
fi

# Test 4: Summary
echo ""
echo "═══════════════════════════════════════════════════"
echo "✓ TEST SUITE COMPLETE"
echo "═══════════════════════════════════════════════════"
echo ""

if [ $OVERALL_STATUS -eq 0 ]; then
    echo "✓✓✓ ALL TESTS PASSED! System is ready ✓✓✓"
    echo ""
    echo "Next steps:"
    echo "  1. Verify database has sample data:"
    echo "     npm run test:db"
    echo ""
    echo "  2. Test individual endpoints:"
    echo "     bash tests/test_with_curl.sh"
    echo ""
    echo "  3. Deploy to production"
    exit 0
else
    echo "✗✗✗ SOME TESTS FAILED ✗✗✗"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check MongoDB Atlas connection:"
    echo "     npm run test:db"
    echo ""
    echo "  2. View detailed results:"
    echo "     npm run test:config"
    echo ""
    echo "  3. Check error messages above"
    exit 1
fi
