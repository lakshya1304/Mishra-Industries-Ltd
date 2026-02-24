# 🧪 Test Suite Documentation

## Quick Reference

### Run All Tests

```bash
npm run test:all
```

### Individual Tests

```bash
npm run test:config   # Configuration and database validation
npm run test:api      # API endpoints and integration test
npm run test:curl     # CURL-based endpoint tests
npm run test:db       # Database connectivity diagnostic
```

---

## Test Files Overview

| File                        | Command               | Purpose                          | Time   |
| --------------------------- | --------------------- | -------------------------------- | ------ |
| `test_config.js`            | `npm run test:config` | Validates setup, files, env vars | 5-10s  |
| `test_api_comprehensive.js` | `npm run test:api`    | Tests all API endpoints          | 30-60s |
| `test_with_curl.sh`         | `npm run test:curl`   | HTTP endpoint tests              | 20-30s |
| `diagnose_db.js`            | `npm run test:db`     | Database connection issues       | 5-10s  |

---

## What Gets Tested

### Configuration Test (test_config.js)

✓ Environment variables (.env)
✓ File structure
✓ Database connection to MongoDB Atlas
✓ All 5 models (User, Product, Order, Query, Admin)
✓ Collections and indexes
✓ Query performance
✓ All middleware imports
✓ All route imports
✓ All utility imports

### API Test (test_api_comprehensive.js)

✓ Database connection with Mongoose
✓ User Registration → Database
✓ User Login → JWT Token
✓ Get User Profile → Auth Protected
✓ Add Product → Database
✓ Get All Products → Database Query
✓ Get By ID → Database Query
✓ Create Order → Database with User Reference
✓ Get User Orders → Filtered Query
✓ Submit Query → Database
✓ Get All Queries → Database
✓ Admin Login
✓ Document counts in each collection

### CURL Test (test_with_curl.sh)

✓ Server health check
✓ Register endpoint
✓ Login endpoint with token extraction
✓ Profile endpoint (needs token)
✓ Product CRUD operations
✓ Query submission
✓ Order creation
✓ Admin operations
✓ Error handling (404, validation)
✓ All responses validate database operations

---

## Database Coverage

All endpoints now connect to MongoDB Atlas:

```
┌─────────────────────────────────────────────┐
│         MongoDB Atlas Database              │
│     (mishra_industries_mil cluster)         │
└─────────────────────────────────────────────┘
         ↗        ↗        ↗        ↗
    Auth         Products  Orders   Queries
    Routes       Routes    Routes   Routes
      │            │         │       │
      ↓            ↓         ↓       ↓
   Users Coll   Products  Orders   Queries
                  Coll      Coll     Coll
```

### Collections Being Used:

- **users** - User registration, login, profiles
- **products** - Product catalog, inventory
- **orders** - Customer orders, order history
- **queries** - Customer inquiries, support
- **admins** - Admin accounts (if separate)

---

## Expected Results

### Success ✓

```
✓ Passed: 60+
✗ Failed: 0
Success Rate: 100%
```

→ System is production-ready

### Warnings ⚠ (OK)

```
✓ Passed: 55
⚠ Warnings: 5
✗ Failed: 0
```

→ Minor issues, still functional

### Failures ✗ (Fix Required)

```
✓ Passed: 40
✗ Failed: 10
```

→ Check database connection, .env file, network

---

## Running Tests Step by Step

### 1. Start Server

```bash
npm run dev
# Wait for: "Server running on port 5000"
```

### 2. In New Terminal - Validate Config

```bash
npm run test:config
```

Expected: All files and vars present

### 3. Test Database Connection

```bash
npm run test:db
```

Expected: Connected to mil.m8kyiyi.mongodb.net

### 4. Run Full API Tests

```bash
npm run test:api
```

Expected: 95%+ tests pass

### 5. Test via CURL (Windows: Use Git Bash/WSL)

```bash
npm run test:curl
```

Expected: 100% tests pass

---

## Common Issues & Fixes

### ❌ "Cannot connect to MongoDB"

```bash
# Check MongoDB URI
cat .env | grep MONGO_URI

# Test connection directly
npm run test:db

# Verify IP whitelist in MongoDB Atlas console
```

### ❌ "Port 5000 already in use"

```bash
# Find process using port 5000
lsof -i :5000  # Linux/Mac

# Kill the process
kill -9 <PID>

# Then start server again
npm run dev
```

### ❌ "Token undefined" in tests

```bash
# JWT_SECRET might be incorrect
echo $JWT_SECRET

# Verify in .env:
JWT_SECRET=mishra_industries_super_secret_123
```

### ❌ "Test timeout"

```bash
# Database might be slow
# Increase timeout in test file or
# Check network connectivity to MongoDB Atlas
ping mil.m8kyiyi.mongodb.net
```

---

## Test Results Explanation

### test_config.js Output

```
✓ PORT = 5000
✓ MONGO_URI = mongodb+srv://***@***.mongodb.net/mishra_industries
✓ Database connected to: mil.m8kyiyi.mongodb.net/mishra_industries
✓ User model (245 documents)
✓ Product model (89 documents)
✓ Order model (34 documents)
✓ Query model (12 documents)
```

### test_api_comprehensive.js Output

```
✓ PASS | User Registration | Email: test@example.com
✓ PASS | User Login | Status: 200
✓ PASS | Token Generation | Token length: 234
✓ PASS | Add Product | Status: 201
✓ PASS | Get All Products | Status: 200, Count: 89
✓ PASS | Create Order | Status: 201
✓ PASS | Get User Orders | Status: 200
```

### test_with_curl.sh Output

```
Testing: Register User
Status: 201
✓ PASS

Testing: User Login
Status: 200
Token extracted: eyJhbGciOiJ...
✓ PASS

...

Success Rate: 100%
```

---

## Using Test Results

### For Development

- Run `npm run test:all` after each major change
- Use `npm run test:db` if database operations fail
- Use `npm run test:curl` for manual validation

### For Debugging

- Each test shows exact endpoint, method, data
- Error messages point to specific issues
- Check MongoDB Atlas console for data persistence

### For Deployment

- Run all tests before pushing to production
- Ensure 95%+ success rate
- Verify no database connection warnings
- Check file upload endpoints work

---

## Next Steps

1. ✓ Run `npm run test:config` - Verify setup
2. ✓ Run `npm run test:api` - Test all endpoints
3. ✓ Run `npm run test:curl` - Validate HTTP
4. ✓ Monitor test results
5. ✓ Fix any failures
6. ✓ Commit working code to repository

---

## Database Connection Diagram

```
Frontend
   ↓
Express App (index.js)
   ↓
Routes (authRoutes, productRoutes, etc)
   ↓
Controllers (fetch/save operations)
   ↓
Models (Mongoose schemas)
   ↓
MongoDB Mongoose Driver
   ↓
MongoDB Atlas Connection Pool
   ↓
MongoDB Atlas Cluster (mil)
```

Each test verifies this complete chain works end-to-end.

---

**Status:** ✅ All tests created and ready to run
**Database Coverage:** 100% of endpoints connected
**Last Updated:** February 2026
