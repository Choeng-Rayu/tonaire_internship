# Taonaire Internship – API Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication

All endpoints except **Auth** routes require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

---

## Health Check

| Method | Endpoint       | Auth | Description          |
| ------ | -------------- | ---- | -------------------- |
| GET    | `/api/health`  | No   | Returns server status |

---

## Auth Endpoints

| Method | Endpoint                    | Auth | Description                 |
| ------ | --------------------------- | ---- | --------------------------- |
| POST   | `/api/auth/signup`          | No   | Register a new user         |
| POST   | `/api/auth/login`           | No   | Login and receive JWT       |
| POST   | `/api/auth/forgot-password` | No   | Request OTP via email       |
| POST   | `/api/auth/reset-password`  | No   | Reset password with OTP     |

### POST `/api/auth/signup`

**Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "user": { "id": 1, "name": "John Doe", "email": "john@example.com" },
    "token": "<jwt_token>"
  }
}
```

### POST `/api/auth/login`

**Body:**

```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": { "id": 1, "name": "John Doe", "email": "john@example.com" },
    "token": "<jwt_token>"
  }
}
```

### POST `/api/auth/forgot-password`

**Body:**

```json
{
  "email": "john@example.com"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "OTP sent to email."
}
```

### POST `/api/auth/reset-password`

**Body:**

```json
{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "NewPassword456"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Password reset successfully."
}
```

---

## Category Endpoints

All category routes require authentication.

| Method | Endpoint                | Auth | Description               |
| ------ | ----------------------- | ---- | ------------------------- |
| GET    | `/api/categories`       | Yes  | List categories (search)  |
| GET    | `/api/categories/:id`   | Yes  | Get single category       |
| POST   | `/api/categories`       | Yes  | Create category           |
| PUT    | `/api/categories/:id`   | Yes  | Update category           |
| DELETE | `/api/categories/:id`   | Yes  | Delete category           |

### GET `/api/categories`

**Query Parameters:**

| Param    | Type   | Description                    |
| -------- | ------ | ------------------------------ |
| `search` | string | Search name/description (Khmer supported) |

### POST / PUT `/api/categories`

**Body:**

```json
{
  "name": "Electronics / អេឡិចត្រូនិក",
  "description": "Electronic devices and accessories"
}
```

---

## Product Endpoints

All product routes require authentication.

| Method | Endpoint              | Auth | Description              |
| ------ | --------------------- | ---- | ------------------------ |
| GET    | `/api/products`       | Yes  | List products (paginated) |
| GET    | `/api/products/:id`   | Yes  | Get single product       |
| POST   | `/api/products`       | Yes  | Create product           |
| PUT    | `/api/products/:id`   | Yes  | Update product           |
| DELETE | `/api/products/:id`   | Yes  | Delete product           |

### GET `/api/products`

**Query Parameters:**

| Param        | Type   | Default | Description                       |
| ------------ | ------ | ------- | --------------------------------- |
| `page`       | number | 1       | Page number                       |
| `limit`      | number | 20      | Items per page                    |
| `search`     | string |         | Search name/description (Khmer)   |
| `categoryId` | number |         | Filter by category                |
| `sortBy`     | string | `name`  | Sort field: `name` or `price`     |
| `sortOrder`  | string | `asc`   | Sort direction: `asc` or `desc`   |

**Response (200):**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Product Name",
        "description": "...",
        "price": 29.99,
        "imageUrl": "image-1234.jpg",
        "categoryId": 2,
        "categoryName": "Electronics",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "page": 1,
    "limit": 20,
    "totalItems": 50,
    "totalPages": 3
  }
}
```

### POST `/api/products`

**Content-Type:** `multipart/form-data`

| Field         | Type   | Required | Description           |
| ------------- | ------ | -------- | --------------------- |
| `name`        | string | Yes      | Product name          |
| `description` | string | No       | Product description   |
| `price`       | number | Yes      | Price (≥ 0)           |
| `categoryId`  | number | Yes      | Foreign key to category |
| `image`       | file   | No       | JPEG/PNG/GIF/WebP, ≤ 5 MB |

### PUT `/api/products/:id`

Same fields as POST. A new image replaces the existing one (old file is deleted).

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["optional array of validation errors"]
}
```

Common HTTP status codes:

| Code | Meaning              |
| ---- | -------------------- |
| 400  | Validation error     |
| 401  | Unauthorized         |
| 404  | Not found            |
| 409  | Conflict (duplicate) |
| 500  | Internal server error |
