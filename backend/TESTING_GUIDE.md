# 🧪 MISHRA INDUSTRIES API - COMPREHENSIVE TESTING GUIDE

## Overview

This guide covers all testing tools created for validating the backend API, database connections, and configuration.

---

## 📋 Test Files Created

### 1. **test_config.js** - Configuration & Database Validation

Tests environment variables, file structure, database connectivity, and all imports.

```bash
node tests/test_config.js
```

**What it tests:**

- ✓ All required environment variables (.env)
- ✓ File structure and required files
- ✓ MongoDB Atlas connection
- ✓ All database models registration
- ✓ Collections and indexes
- ✓ Query performance
- ✓ Middleware imports
- ✓ Routes imports
- ✓ Utils imports

**Expected Output:**

```
✓ Passed: 45+
✗ Failed: 0
✓ Configuration is valid! Ready for deployment.
```

---

### 2. **test_api_comprehensive.js** - Full API Integration Test

Tests all API endpoints with actual database operations.

```bash
node tests/test_api_comprehensive.js
```

**What it tests:**

1. **Database Connection**: Connected state, ready status
2. **Auth Endpoints**: Register, Login, Get Profile
3. **Product Endpoints**: Add, Get All, Get by ID
4. **Order Endpoints**: Create Order, Get User Orders
5. **Query Endpoints**: Submit Query, Get All Queries
6. **Admin Endpoints**: Admin Login
7. **Database Operations**: Count documents in each collection

**Expected Output:**

```
✓ PASS | Database Connection
✓ PASS | User Registration
✓ PASS | User Login
✓ PASS | Add Product
✓ PASS | Get All Products
✓ PASS | Create Order
...
Success Rate: 95%+
```

---

### 3. **test_with_curl.sh** - CURL-based API Testing

Tests all endpoints using cURL commands (shell script).

**On Windows (using Git Bash or WSL):**

```bash
bash tests/test_with_curl.sh
```

**What it tests:**

1. Health check (server running)
2. Auth endpoints (Register, Login, Get Profile)
3. Product endpoints (Add, Get All, Get by Category)
4. Query endpoints (Submit, Get All)
5. Order endpoints (Create, Get User Orders)
6. Admin endpoints (Login)
7. Database validation (Get All Users)
8. Error handling (Invalid endpoints, missing fields)

**Expected Output:**

```
Testing: Register User
Status: 201
✓ PASS

Testing: User Login
Status: 200
Token extracted: eyJhbGciOiJIUzI1NiI...
✓ PASS

...

📊 TEST SUMMARY
✓ Passed: 18
✗ Failed: 0
Success Rate: 100%
```

---

## 🚀 Quick Start - Run All Tests

### Step 1: Start the Backend Server

```bash
npm run dev
# Server should be running on http://localhost:5000
```

### Step 2: Run Configuration Test (validates setup)

```bash
node tests/test_config.js
```

**Time:** ~5-10 seconds
**Expectation:** All tests pass

### Step 3: Run Comprehensive API Test (validates all endpoints)

```bash
node tests/test_api_comprehensive.js
```

**Time:** ~30-60 seconds
**Expectation:** 95%+ success rate

### Step 4: Run CURL Tests (validates HTTP communication)

```bash
bash tests/test_with_curl.sh
```

**Time:** ~20-30 seconds
**Expectation:** 100% success rate

---

## 📊 Test Results Interpretation

### All Tests Pass ✓

```
✓ Passed: 60
✗ Failed: 0
Success Rate: 100%
```

**Meaning:** Complete setup is working correctly. Database is connected everywhere.

### Some Tests Fail ✗

```
✗ Database Connection failed
✗ User Registration - could not save to DB
```

**Fixes:**

1. Check MongoDB Atlas connection:
   ```bash
   node tests/diagnose_db.js
   ```
2. Verify MONGO_URI in .env
3. Check IP whitelist in MongoDB Atlas
4. Ensure network connectivity

---

## 🔧 Database Connection Verification

### Check Database Connectivity

```bash
node tests/diagnose_db.js
```

This tests:

- Network connectivity (DNS resolution)
- MongoDB Atlas authentication
- Database query performance
- Collection accessibility

### Manual Database Check

```bash
# Connect to MongoDB (requires mongosh CLI)
mongosh "mongodb+srv://Sachin:Sachin123@mil.m8kyiyi.mongodb.net/mishra_industries"

# List all collections
show collections

# Count documents
db.users.countDocuments()
db.products.countDocuments()
db.orders.countDocuments()
db.queries.countDocuments()
```

---

## 🌐 Individual Endpoint Tests with CURL

### Authentication

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test","email":"test@example.com","phone":"9999999999","password":"Pass@123","accountType":"customer"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Pass@123","accountType":"customer"}'

# Get Profile (requires token from login)
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Products

```bash
# Add Product
curl -X POST http://localhost:5000/api/products/add \
  -H "Content-Type: application/json" \
  -d '{"name":"Product","description":"Desc","category":"Electronics","company":"Company","price":1000,"discount":10,"stock":50,"image":"/images/logo.jpeg"}'

# Get All Products
curl -X GET http://localhost:5000/api/products/all

# Get by Category
curl -X GET http://localhost:5000/api/products/category/Electronics
```

### Queries

```bash
# Submit Query
curl -X POST http://localhost:5000/api/queries/add \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","message":"Help needed"}'

# Get All Queries
curl -X GET http://localhost:5000/api/queries/all
```

### Orders

```bash
# Create Order (requires token)
curl -X POST http://localhost:5000/api/orders/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"customerName":"Test","phone":"9999999999","address":"123 Street","items":[{"productId":"ID","quantity":1,"price":1000}],"totalAmount":1000,"gstAmount":180,"paymentMethod":"Online","status":"Pending"}'

# Get My Orders
curl -X GET http://localhost:5000/api/orders/my-orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📈 Database Connection Points

All the following areas now have proper database connections:

### ✓ Authentication

- Register: Saves user to `User` collection
- Login: Queries `User` collection for credentials
- Get Profile: Fetches user from `User` collection

### ✓ Products

- Add Product: Saves to `Product` collection
- Get All Products: Queries `Product` collection
- Get By Category: Filters `Product` collection
- Get By ID: Finds document in `Product` collection

### ✓ Orders

- Create Order: Saves to `Order` collection with user reference
- Get My Orders: Queries `Order` collection filtered by user ID
- Get All Orders (Admin): Queries all `Order` collection documents

### ✓ Queries

- Submit Query: Saves to `Query` collection
- Get All Queries: Queries all `Query` collection documents

### ✓ Admin

- Admin Login: Queries `User` collection with admin role check

---

## 🐛 Troubleshooting

### Problem: "Database connection failed"

**Solution:**

```bash
# Check MongoDB Atlas credentials and network
node tests/diagnose_db.js

# Verify .env has correct MONGO_URI
cat .env | grep MONGO_URI
```

### Problem: "Port 5000 already in use"

**Solution:**

```bash
# On Windows
netstat -ano | findstr :5000

# On Linux/Mac
lsof -i :5000

# Kill the process
taskkill /PID <PID> /F  # Windows
kill -9 <PID>           # Linux/Mac
```

### Problem: "Tests timeout or hang"

**Solution:**

```bash
# Increase timeout in test file from 5000ms to 10000ms
# Edit: backend/tests/test_api_comprehensive.js (line with timeout)

# Or check network connectivity to MongoDB Atlas
ping mil.m8kyiyi.mongodb.net
```

### Problem: "Authentication token invalid"

**Solution:**

```bash
# Ensure JWT_SECRET in .env matches across restarts
echo $JWT_SECRET

# Re-run login to get new token
# Use the token immediately (they expire after time)
```

---

## 📝 Test Reports

All test results are logged to console. To save results:

```bash
# Save test results to file
node tests/test_config.js > test_config_results.txt 2>&1
node tests/test_api_comprehensive.js > test_api_results.txt 2>&1
bash tests/test_with_curl.sh > test_curl_results.txt 2>&1
```

---

## ✅ Deployment Checklist

Before deploying to production:

- [ ] Run `node tests/test_config.js` - All tests pass
- [ ] Run `node tests/test_api_comprehensive.js` - 95%+ success rate
- [ ] Run `bash tests/test_with_curl.sh` - All 100%
- [ ] Check MongoDB Atlas connection limits
- [ ] Verify all environment variables are set
- [ ] Test with real payment gateway (Razorpay)
- [ ] Test email notifications
- [ ] Check CORS settings for frontend domain
- [ ] Verify JWT token expiration settings
- [ ] Test file uploads and storage

---

## 📞 Support

For issues with testing:

1. Check error messages in console output
2. Run `node tests/diagnose_db.js` for database issues
3. Check `.env` file for missing variables
4. Verify MongoDB Atlas network access
5. Review controller logic for database queries

---

**Last Updated:** February 2026
**Version:** 1.0
**Status:** ✓ All tests passing, database connected everywhere
