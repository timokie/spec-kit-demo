# API Contract: Authentication & Admin Operations

**API Version**: 1.0  
**Implementation**: Mock Service (localStorage-backed)  
**Base Path**: `/api`

---

## Endpoints

### 1. POST `/api/auth/login`

**Description**: Authenticate an administrator (username + password)

**Request Body**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Request Validation**:
| Field | Type | Validation | Error Code |
|-------|------|-----------|-----------|
| `username` | string | Required, 4-50 chars | `INVALID_USERNAME` |
| `password` | string | Required, 6+ chars | `INVALID_PASSWORD` |

**Response** (200 OK - Login Successful):
```json
{
  "success": true,
  "data": {
    "adminId": "admin-001",
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin",
    "loginTime": "2026-01-06T15:30:00Z"
  },
  "message": "Login successful"
}
```

**Response** (401 Unauthorized - Invalid Credentials):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Username or password is incorrect"
  }
}
```

**Response** (403 Forbidden - Account Inactive):
```json
{
  "success": false,
  "error": {
    "code": "ACCOUNT_INACTIVE",
    "message": "This admin account has been deactivated"
  }
}
```

**Implementation Notes**:
- On success, a session token is stored in `localStorage['adminSession']`
- Session persists across browser refresh
- Admin role: Full permissions (approve, reject, manage admins)
- Moderator role: Can approve/reject but not manage other admins

**Mock Credentials** (from src/mocks/admins.json):
```
username: "admin"    password: "admin123"    role: "admin"
username: "moderator" password: "mod123"     role: "moderator"
```

---

### 2. POST `/api/auth/logout`

**Description**: Clear admin session and log out

**Request Body**:
```json
{}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Implementation Notes**:
- Removes `adminSession` from localStorage
- No session token required (idempotent—always succeeds)

---

### 3. GET `/api/admin/submissions?status=pending`

**Description**: Retrieve pending blog submissions for admin review (authentication required)

**Authentication**: Required (checks for valid `adminSession` in localStorage)

**Query Parameters**:
| Param | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `status` | string | No | `pending` | One of: `pending`, `approved`, `rejected` |
| `sortBy` | string | No | `recent` | One of: `recent` (newest first), `oldest` |
| `limit` | number | No | `100` | Max results per request |

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "sub-002",
      "referenceId": "REF-1704516000001",
      "title": "Building Scalable React Apps",
      "url": "https://blog.example.com/react-scaling",
      "description": "A guide to scaling React applications",
      "authorName": "Alice Johnson",
      "submittedAt": "2026-01-05T10:00:00Z",
      "status": "pending",
      "approvedBy": null,
      "approvedAt": null
    },
    {
      "id": "sub-003",
      "referenceId": "REF-1704516000002",
      "title": "TypeScript Best Practices",
      "url": "https://blog.example.com/typescript",
      "description": "Tips and tricks for TypeScript",
      "authorName": "Bob Smith",
      "submittedAt": "2026-01-05T09:00:00Z",
      "status": "pending",
      "approvedBy": null,
      "approvedAt": null
    }
  ],
  "total": 2
}
```

**Response** (401 Unauthorized):
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Admin authentication required. Please log in."
  }
}
```

**Implementation Notes**:
- Only admins can access this endpoint
- Returns only submissions matching the specified status
- Default sort: Newest first (by `submittedAt`)
- Pagination handled via `limit` parameter

---

### 4. PATCH `/api/admin/submissions/:submissionId/approve`

**Description**: Approve a pending blog submission (authentication required)

**Path Parameters**:
| Param | Type | Required | Notes |
|-------|------|----------|-------|
| `submissionId` | string | Yes | The submission ID (e.g., `sub-002`) |

**Authentication**: Required (checks for valid `adminSession`)

**Request Body**:
```json
{}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "sub-002",
    "referenceId": "REF-1704516000001",
    "title": "Building Scalable React Apps",
    "url": "https://blog.example.com/react-scaling",
    "author": "Alice Johnson",
    "description": "A guide to scaling React applications",
    "submittedAt": "2026-01-05T10:00:00Z",
    "approvedAt": "2026-01-05T15:30:00Z",
    "status": "approved"
  },
  "message": "Blog approved successfully and is now live!"
}
```

**Response** (404 Not Found):
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Submission with ID 'sub-999' not found"
  }
}
```

**Response** (409 Conflict - Already Approved):
```json
{
  "success": false,
  "error": {
    "code": "ALREADY_APPROVED",
    "message": "This blog submission has already been approved"
  }
}
```

**Response** (401 Unauthorized):
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Admin authentication required"
  }
}
```

**Implementation Notes**:
- Submission status changes from `pending` to `approved`
- `approvedAt` is set to current UTC time
- `approvedBy` is set to current admin's ID
- Approved blog becomes immediately visible in public blog list
- Once approved, cannot be un-approved (final state)

---

### 5. PATCH `/api/admin/submissions/:submissionId/reject`

**Description**: Reject a pending blog submission with optional reason (authentication required)

**Path Parameters**:
| Param | Type | Required | Notes |
|-------|------|----------|-------|
| `submissionId` | string | Yes | The submission ID (e.g., `sub-003`) |

**Authentication**: Required (checks for valid `adminSession`)

**Request Body**:
```json
{
  "reason": "Blog content appears to be spam or promotional"
}
```

**Request Validation**:
| Field | Type | Validation | Error Code |
|-------|------|-----------|-----------|
| `reason` | string | Optional, 0-300 chars | `INVALID_REASON` |

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "sub-003",
    "referenceId": "REF-1704516000002",
    "title": "TypeScript Best Practices",
    "url": "https://blog.example.com/typescript",
    "author": "Bob Smith",
    "submittedAt": "2026-01-05T09:00:00Z",
    "rejectedAt": "2026-01-05T15:32:00Z",
    "status": "rejected",
    "rejectionReason": "Blog content appears to be spam or promotional"
  },
  "message": "Blog rejected. Visitor can check status using their reference ID."
}
```

**Response** (404 Not Found):
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Submission with ID 'sub-999' not found"
  }
}
```

**Response** (409 Conflict - Already Rejected):
```json
{
  "success": false,
  "error": {
    "code": "ALREADY_REJECTED",
    "message": "This blog submission has already been rejected"
  }
}
```

**Implementation Notes**:
- Submission status changes from `pending` to `rejected`
- `approvedAt` is set to current UTC time (reusing field name, or could use `rejectedAt`)
- `rejectionReason` is stored (optional but recommended)
- Rejected blog remains hidden from public view
- Visitor can see rejection reason when checking status
- Once rejected, cannot be re-approved (final state)

---

## Authentication & Session Management

### Session Storage

**localStorage key**: `adminSession`

**Format**:
```json
{
  "adminId": "admin-001",
  "username": "admin",
  "role": "admin",
  "loginTime": "2026-01-06T15:30:00Z",
  "expiresAt": "2026-01-07T15:30:00Z"
}
```

**Behavior**:
- Session is set by `/auth/login` endpoint
- Session is cleared by `/auth/logout` endpoint
- Session persists across page refresh (stored in localStorage)
- Expired sessions should be cleared automatically (optional for MVP)

### Authorization Checks

**For Admin Endpoints** (`/admin/*`):
1. Check if `adminSession` exists in localStorage
2. Parse session object
3. If missing or invalid, return 401 Unauthorized
4. If session role is `moderator`, can approve/reject but not delete/manage admins
5. If session role is `admin`, full permissions

