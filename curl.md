curl -X POST https://api.example.com/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Lakshya","email":"lakshya@example.com"}'
curl -X PATCH https://api.example.com/users/42 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newemail@example.com"
  }'
curl -X PATCH https://api.example.com/users/42 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}'

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5OTRhNzM0ZDBjNTJkY2U5OGNiYjFiMCIsImlhdCI6MTc3MTM0OTgxMywiZXhwIjoxNzczOTQxODEzfQ.PdZ16_QFN4KPrbHho0jMbQjIiS8HsFcygI9Vt8Y76s0

curl -X POST http://localhost:3000/api/auth/login \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5OTRhNzM0ZDBjNTJkY2U5OGNiYjFiMCIsImlhdCI6MTc3MTM0OTgxMywiZXhwIjoxNzczOTQxODEzfQ.PdZ16_QFN4KPrbHho0jMbQjIiS8HsFcygI9Vt8Y76s0" \
  -H "Content-Type: application/json" \
  -d '{"email":"try@gmail.com","password":"000000"}'
