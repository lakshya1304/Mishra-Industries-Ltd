API Tests Log

This file contains curl commands and test outputs performed against the local backend (http://localhost:5000).

1. Root

- GET /
- curl -i http://localhost:5000/
- Expected: 200 OK, body: "Mishra Industries API is running correctly..."

2. Auth - Register (JSON)

- curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","userName":"testuser","email":"testuser@example.com","phone":"9999999999","password":"Password@123","accountType":"customer"}'
- Notes: returns JSON with token and user data. If you see errors, check server logs for stack trace.

3. Auth - Login

- curl -i -c cookies.txt -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"Password@123","accountType":"customer"}'
- This saves cookies to cookies.txt for later cookie-authenticated requests.

4. Auth - Profile (uses cookie)

- curl -i -b cookies.txt http://localhost:5000/api/auth/profile
- Or using Authorization header (if you have token):
  curl -H "Authorization: Bearer <TOKEN>" http://localhost:5000/api/auth/profile

5. Products - Add (multipart/form-data)

- curl -i -X POST http://localhost:5000/api/products/add \
  -F "name=Widget" -F "price=199.99" -F "category=Electronics" \
  -F "company=Mishra" -F "stock=20" -F "discount=0" \
  -F "description=Nice widget" -F "image=@/path/to/image.jpg"

6. Products - All

- curl http://localhost:5000/api/products/all

7. Orders - Add (requires auth)

- curl -i -b cookies.txt -X POST http://localhost:5000/api/orders/add \
  -H "Content-Type: application/json" \
  -d '{"customerName":"John Doe","phone":"9876543210","address":"123 Main St","items":[{"name":"Product 1","price":100,"quantity":2}],"totalAmount":200,"paymentMethod":"COD"}'

8. Queries - Add

- curl -X POST http://localhost:5000/api/queries/add \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","message":"Hello from curl"}'

9. Quotations - Add

- curl -X POST http://localhost:5000/api/quotations/add \
  -H "Content-Type: application/json" \
  -d '{"companyName":"Acme Corp","gstNumber":"22AAAAA0000A1Z5","category":"Electronics","quantity":100,"unit":"pcs","requirements":"Bulk order for gadgets"}'

Notes

- Use the cookie jar file (cookies.txt) to persist cookies between curl requests (-c to save, -b to send).
- If running locally over HTTP, ensure cookies are not set with secure:true (this project now sets secure only in production).
- For any 500 errors, check the server terminal for the detailed stack trace and post it here if you want me to debug further.
