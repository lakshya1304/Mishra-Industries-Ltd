# API Endpoint Documentation

This file documents the main API endpoints, their request bodies, and example responses for your backend.

---

## Admin Routes

### POST /api/admin/login

**Request Body:**

```json
{
  "email": "admin@example.com",
  "password": "yourpassword"
}
```

**Response:**

```json
{
  "success": true,
  "token": "...jwt...",
  "admin": { "email": "admin@example.com", ... }
}
```

---

## Auth/User Routes

### POST /api/auth/register

**Request Body:**

```json
{
  "fullName": "John Doe",
  "userName": "johndoe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "Password@123",
  "accountType": "customer"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User successfully registered",
  "_id": "...",
  "token": "...jwt..."
}
```

### POST /api/auth/login

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "Password@123",
  "accountType": "customer"
}
```

**Response:**

```json
{
  "success": true,
  "token": "...jwt...",
  "user": { "email": "john@example.com", ... }
}
```

### GET /api/auth/profile

**Headers:**

- Authorization: Bearer <token>

**Response:**

```json
{
  "success": true,
  "user": { "email": "john@example.com", ... }
}
```

---

## Product Routes

### POST /api/products/add

**Form Data:**

- name: string
- price: number
- category: string
- company: string
- stock: number
- discount: number
- description: string
- image: file (optional)

**Response:**

```json
{
  "_id": "...",
  "name": "Product Name",
  ...
}
```

### GET /api/products/all

**Response:**

```json
[
  { "_id": "...", "name": "Product 1", ... },
  { "_id": "...", "name": "Product 2", ... }
]
```

---

## Order Routes

### POST /api/orders/add

**Headers:**

- Authorization: Bearer <token>

**Request Body:**

```json
{
  "customerName": "John Doe",
  "phone": "9876543210",
  "address": "123 Main St",
  "items": [
    { "name": "Product 1", "price": 100, "quantity": 2, "image": "..." }
  ],
  "totalAmount": 200,
  "paymentMethod": "COD"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Order saved to Atlas",
  "order": { "_id": "...", ... }
}
```

---

## Query Routes

### POST /api/queries/add

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "I have a question."
}
```

**Response:**

```json
{
  "_id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "message": "I have a question.",
  "createdAt": "..."
}
```

### GET /api/queries/all

**Response:**

```json
[
  { "_id": "...", "name": "John Doe", ... }
]
```

---

## Quotation Routes

### POST /api/quotations/add

**Request Body:**

```json
{
  "companyName": "Acme Corp",
  "gstNumber": "22AAAAA0000A1Z5",
  "category": "Electronics",
  "quantity": 100,
  "unit": "pcs",
  "requirements": "Bulk order for gadgets"
}
```

**Response:**

```json
{
  "_id": "...",
  "companyName": "Acme Corp",
  ...
}
```

### GET /api/quotations/all

**Response:**

```json
[
  { "_id": "...", "companyName": "Acme Corp", ... }
]
```

---

## Notes

- All endpoints return JSON.
- For protected routes, use the Authorization header with a valid JWT.
- Adjust request/response examples as your implementation evolves.
