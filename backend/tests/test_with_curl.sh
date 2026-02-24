#!/bin/bash

# Comprehensive Curl Testing Script for Mishra Industries API
# This script tests all API endpoints with curl
# Run from backend/: bash tests/test_with_curl.sh

BASE_URL="http://localhost:5000"
TIMESTAMP=$(date +%s)
EMAIL="curl-test-${TIMESTAMP}@example.com"
PASSWORD="TestPass@123"
PHONE="9999${TIMESTAMP: -6}"
TOKEN=""
PRODUCT_ID=""
QUERY_ID=""
ORDER_ID=""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
PASS=0
FAIL=0

# Helper functions
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local headers=$5
    
    echo -e "\n${BLUE}Testing: ${name}${NC}"
    echo "Method: $method | URL: $BASE_URL$endpoint"
    
    local cmd="curl -X $method"
    cmd="$cmd -H 'Content-Type: application/json'"
    
    if [ ! -z "$headers" ]; then
        cmd="$cmd $headers"
    fi
    
    if [ ! -z "$data" ]; then
        cmd="$cmd -d '$data'"
        echo "Data: $data"
    fi
    
    cmd="$cmd -w '\n%{http_code}' $BASE_URL$endpoint"
    
    response=$(eval $cmd 2>/dev/null)
    
    # Extract status code from last line
    http_code=$(echo "$response" | tail -1)
    body=$(echo "$response" | head -n -1)
    
    echo "Status: $http_code"
    echo "Response: $body"
    
    # Check if response is 2xx or 3xx
    if [[ $http_code =~ ^[23][0-9][0-9]$ ]]; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((PASS++))
        
        # Extract token from login response
        if [[ "$name" == *"Login"* ]]; then
            TOKEN=$(echo "$body" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
            if [ ! -z "$TOKEN" ]; then
                echo -e "Token extracted: ${TOKEN:0:20}..."
            fi
        fi
        
        # Extract product ID from add product response
        if [[ "$name" == *"Add Product"* ]]; then
            PRODUCT_ID=$(echo "$body" | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
            if [ ! -z "$PRODUCT_ID" ]; then
                echo -e "Product ID extracted: $PRODUCT_ID"
            fi
        fi
        
        return 0
    else
        echo -e "${RED}✗ FAIL (HTTP $http_code)${NC}"
        ((FAIL++))
        return 1
    fi
}

echo -e "${YELLOW}================================================${NC}"
echo -e "${YELLOW}🧪 MISHRA INDUSTRIES API TESTING WITH CURL${NC}"
echo -e "${YELLOW}================================================${NC}"

echo -e "\n${BLUE}Server: $BASE_URL${NC}"
echo -e "${BLUE}Email: $EMAIL${NC}"
echo -e "${BLUE}Password: $PASSWORD${NC}"
echo -e "${BLUE}Phone: $PHONE${NC}"

# ==================== 1. HEALTH CHECK ====================
echo -e "\n${YELLOW}[1/8] HEALTH & CONFIG CHECK${NC}"
echo "─────────────────────────────────────────────────"

# Try to connect to server
echo "Checking if server is running..."
if ! curl -s "$BASE_URL" > /dev/null 2>&1; then
    echo -e "${RED}❌ Server is not running on $BASE_URL${NC}"
    echo -e "${YELLOW}Start the server with: npm run dev${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Server is running${NC}"
((PASS++))

# ==================== 2. AUTH ENDPOINTS ====================
echo -e "\n${YELLOW}[2/8] AUTHENTICATION ENDPOINTS${NC}"
echo "─────────────────────────────────────────────────"

# Register User
test_endpoint "Register User" "POST" "/api/auth/register" \
    "{\"fullName\":\"Test User\",\"email\":\"$EMAIL\",\"phone\":\"$PHONE\",\"password\":\"$PASSWORD\",\"accountType\":\"customer\"}"

sleep 1

# Login User
test_endpoint "User Login" "POST" "/api/auth/login" \
    "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"accountType\":\"customer\"}"

sleep 1

# Get Profile (requires auth)
if [ ! -z "$TOKEN" ]; then
    test_endpoint "Get User Profile" "GET" "/api/auth/profile" "" \
        "-H 'Authorization: Bearer $TOKEN'"
else
    echo -e "${RED}⚠ Skipping Get Profile: No token available${NC}"
    ((FAIL++))
fi

sleep 1

# ==================== 3. PRODUCT ENDPOINTS ====================
echo -e "\n${YELLOW}[3/8] PRODUCT ENDPOINTS${NC}"
echo "─────────────────────────────────────────────────"

# Add Product
test_endpoint "Add Product" "POST" "/api/products/add" \
    "{\"name\":\"Curl Test Product\",\"description\":\"Test product from curl\",\"category\":\"Electronics\",\"company\":\"Test Company\",\"price\":5999,\"discount\":10,\"stock\":25,\"image\":\"/images/logo.jpeg\"}"

sleep 1

# Get All Products
test_endpoint "Get All Products" "GET" "/api/products/all"

sleep 1

# Get Product by ID (if we extracted one)
if [ ! -z "$PRODUCT_ID" ]; then
    test_endpoint "Get Product by ID" "GET" "/api/products/get/$PRODUCT_ID"
else
    echo -e "${YELLOW}⚠ Skipping Get Product by ID: No product ID available${NC}"
fi

sleep 1

# Get Products by Category
test_endpoint "Get Products by Category" "GET" "/api/products/category/Electronics"

sleep 1

# ==================== 4. QUERY ENDPOINTS ====================
echo -e "\n${YELLOW}[4/8] QUERY ENDPOINTS${NC}"
echo "─────────────────────────────────────────────────"

# Submit Query
test_endpoint "Submit Query" "POST" "/api/queries/add" \
    "{\"name\":\"Test Visitor\",\"email\":\"curl-test-query@example.com\",\"message\":\"This is a test query from curl\"}"

sleep 1

# Get All Queries
test_endpoint "Get All Queries" "GET" "/api/queries/all"

sleep 1

# ==================== 5. ORDER ENDPOINTS ====================
echo -e "\n${YELLOW}[5/8] ORDER ENDPOINTS${NC}"
echo "─────────────────────────────────────────────────"

if [ ! -z "$TOKEN" ]; then
    # Create Order
    test_endpoint "Create Order" "POST" "/api/orders/add" \
        "{\"customerName\":\"Test Customer\",\"phone\":\"$PHONE\",\"address\":\"123 Test Street, Test City\",\"items\":[{\"productId\":\"$PRODUCT_ID\",\"quantity\":2,\"price\":5999}],\"totalAmount\":11998,\"gstAmount\":2159.64,\"paymentMethod\":\"Online\",\"status\":\"Pending\"}" \
        "-H 'Authorization: Bearer $TOKEN'"
    
    sleep 1
    
    # Get User Orders
    test_endpoint "Get User Orders" "GET" "/api/orders/my-orders" "" \
        "-H 'Authorization: Bearer $TOKEN'"
else
    echo -e "${RED}⚠ Skipping Order operations: No token available${NC}"
    FAIL+=2
fi

sleep 1

# ==================== 6. ADMIN ENDPOINTS ====================
echo -e "\n${YELLOW}[6/8] ADMIN ENDPOINTS${NC}"
echo "─────────────────────────────────────────────────"

# Admin Login (will likely fail but tests the endpoint)
test_endpoint "Admin Login" "POST" "/api/admin/login" \
    "{\"email\":\"admin@mishra.com\",\"password\":\"Admin@123\"}"

sleep 1

# ==================== 7. DATABASE VALIDATION ====================
echo -e "\n${YELLOW}[7/8] DATABASE VALIDATION${NC}"
echo "─────────────────────────────────────────────────"

# Check if we can fetch all users (should contain our test user)
test_endpoint "Get All Users" "GET" "/api/auth/all-users"

sleep 1

# ==================== 8. ERROR HANDLING ====================
echo -e "\n${YELLOW}[8/8] ERROR HANDLING TESTS${NC}"
echo "─────────────────────────────────────────────────"

# Test invalid endpoint
echo -e "\n${BLUE}Testing: Invalid Endpoint${NC}"
http_code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/invalid/endpoint")
if [ "$http_code" == "404" ]; then
    echo -e "${GREEN}✓ PASS (404 as expected)${NC}"
    ((PASS++))
else
    echo -e "${RED}✗ FAIL (Expected 404, got $http_code)${NC}"
    ((FAIL++))
fi

# Test missing required fields
echo -e "\n${BLUE}Testing: Missing Required Fields in Register${NC}"
http_code=$(curl -s -X POST \
    -H 'Content-Type: application/json' \
    -d '{"email":"test@example.com"}' \
    -o /dev/null -w "%{http_code}" \
    "$BASE_URL/api/auth/register")
if [ "$http_code" != "200" ]; then
    echo -e "${GREEN}✓ PASS (Validation error as expected)${NC}"
    ((PASS++))
else
    echo -e "${RED}✗ FAIL (Should have failed validation)${NC}"
    ((FAIL++))
fi

# ==================== TEST SUMMARY ====================
echo -e "\n${YELLOW}================================================${NC}"
echo -e "${YELLOW}📊 TEST SUMMARY${NC}"
echo -e "${YELLOW}================================================${NC}"

TOTAL=$((PASS + FAIL))
SUCCESS_RATE=$((PASS * 100 / TOTAL))

echo -e "Total Tests: ${BLUE}$TOTAL${NC}"
echo -e "✓ Passed: ${GREEN}$PASS${NC}"
echo -e "✗ Failed: ${RED}$FAIL${NC}"
echo -e "Success Rate: ${BLUE}${SUCCESS_RATE}%${NC}"

if [ $FAIL -eq 0 ]; then
    echo -e "\n${GREEN}✓ All tests passed! Database and API are working correctly.${NC}"
    exit 0
else
    echo -e "\n${RED}✗ Some tests failed. Check the output above for details.${NC}"
    exit 1
fi
