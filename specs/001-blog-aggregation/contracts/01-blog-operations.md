# API Contract: Blog Operations

**API Version**: 1.0  
**Implementation**: Mock Service (localStorage-backed)  
**Base Path**: `/api`

---

## Endpoints

### 1. GET `/api/blogs`

**Description**: Retrieve blog submissions filtered by status

**Query Parameters**:
| Param | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `status` | string | No | `approved` | One of: `pending`, `approved`, `rejected`, or omit for all |

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "sub-001",
      "referenceId": "REF-1704516000000",
      "title": "Blog Title",
      "url": "https://example.com/blog",
      "description": "Blog description",
      "author": "Author Name",
      "submittedAt": "2026-01-04T10:00:00Z",
      "status": "approved",
      "approvedAt": "2026-01-04T14:00:00Z"
    }
  ],
  "total": 1
}
```

**Response** (400 Bad Request):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_STATUS",
    "message": "Status must be one of: pending, approved, rejected"
  }
}
```

**Implementation Notes**:
- Default filter: `status='approved'` (for public blog list)
- Admin dashboard may request `status='pending'` to see pending submissions
- Sorting: Descending by `submittedAt` (newest first)

---

### 2. POST `/api/blogs/submit`

**Description**: Submit a new blog by a visitor (no authentication required)

**Request Body**:
```json
{
  "title": "My Blog Title",
  "url": "https://example.com/my-blog",
  "description": "A brief description of the blog",
  "authorName": "John Doe"
}
```

**Request Validation**:
| Field | Type | Validation | Error Code |
|-------|------|-----------|-----------|
| `title` | string | Required, 1-200 chars | `INVALID_TITLE` |
| `url` | string | Required, valid HTTP(S) URL | `INVALID_URL` |
| `description` | string | Optional, 0-500 chars | `INVALID_DESCRIPTION` |
| `authorName` | string | Required, 1-100 chars | `INVALID_AUTHOR_NAME` |

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "sub-123",
    "referenceId": "REF-1704516000001",
    "status": "pending"
  },
  "message": "Blog submitted successfully. Reference ID: REF-1704516000001. Use this to check status."
}
```

**Response** (400 Bad Request):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_URL",
    "message": "URL must start with http:// or https://"
  }
}
```

**Implementation Notes**:
- `referenceId` is auto-generated and human-readable (e.g., `REF-1704516000001`)
- Visitor receives `referenceId` for status tracking (no account needed)
- Status defaults to `pending`
- `submittedAt` auto-set to current UTC time

---

### 3. GET `/api/blogs/:referenceId/status`

**Description**: Check the status of a submitted blog (no authentication required)

**Path Parameters**:
| Param | Type | Required | Notes |
|-------|------|----------|-------|
| `referenceId` | string | Yes | The reference ID from submission response (e.g., `REF-1704516000001`) |

**Response** (200 OK - Pending):
```json
{
  "success": true,
  "data": {
    "referenceId": "REF-1704516000001",
    "title": "My Blog Title",
    "status": "pending",
    "submittedAt": "2026-01-05T10:00:00Z",
    "message": "Your blog is under review"
  }
}
```

**Response** (200 OK - Approved):
```json
{
  "success": true,
  "data": {
    "referenceId": "REF-1704516000001",
    "title": "My Blog Title",
    "status": "approved",
    "submittedAt": "2026-01-05T10:00:00Z",
    "approvedAt": "2026-01-05T14:00:00Z",
    "message": "Your blog has been approved and is now live!"
  }
}
```

**Response** (200 OK - Rejected):
```json
{
  "success": true,
  "data": {
    "referenceId": "REF-1704516000001",
    "title": "My Blog Title",
    "status": "rejected",
    "submittedAt": "2026-01-05T10:00:00Z",
    "rejectedAt": "2026-01-05T12:00:00Z",
    "rejectionReason": "Blog content appears to be duplicate of existing submission",
    "message": "Your blog submission was rejected. Reason: Blog content appears to be duplicate of existing submission"
  }
}
```

**Response** (404 Not Found):
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Submission with reference ID 'REF-INVALID' not found"
  }
}
```

**Implementation Notes**:
- Reference ID is case-insensitive
- Returns current status; visitor does not need to log in
- Rejection reason is included if status='rejected'

