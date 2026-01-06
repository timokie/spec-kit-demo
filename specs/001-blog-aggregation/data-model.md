# Data Model: Blog Aggregation Website

**Phase**: Phase 1 (Design)  
**Date**: 2026-01-06  
**Based on**: spec.md + research.md

---

## 1. Core Entities

### 1.1 Blog Submission (Pending/Approved/Rejected)

**Purpose**: Represents a blog entry submitted by a visitor, with its full lifecycle (pending → approved/rejected).

**Attributes**:

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-----------|-------|
| `id` | UUID (string) | Yes | Unique, immutable | Generated on creation |
| `referenceId` | string | Yes | Unique, user-friendly | Format: `REF-{timestamp}`, displayed to visitor for status tracking |
| `title` | string | Yes | Non-empty, max 200 chars | Blog post title |
| `url` | string | Yes | Valid HTTP(S) URL | Must start with `http://` or `https://` |
| `description` | string | No | Max 500 chars | Submission description/excerpt |
| `authorName` | string | Yes | Non-empty, max 100 chars | Visitor's name (email not required) |
| `submittedAt` | ISO 8601 timestamp | Yes | Immutable | UTC datetime of submission |
| `status` | enum | Yes | One of: `pending`, `approved`, `rejected` | Lifecycle state |
| `approvedBy` | string (Admin ID) | No | References Admin.id | Which admin approved (if applicable) |
| `approvedAt` | ISO 8601 timestamp | No | Immutable | UTC datetime of approval/rejection |
| `rejectionReason` | string | No | Max 300 chars | Why admin rejected (optional, only if status=rejected) |

**Example**:
```json
{
  "id": "sub-550e8400-e29b-41d4-a716-446655440000",
  "referenceId": "REF-1704516000000",
  "title": "Building Scalable React Applications",
  "url": "https://example-blog.com/scalable-react",
  "description": "A comprehensive guide to scaling React apps with patterns and best practices",
  "authorName": "Alice Johnson",
  "submittedAt": "2026-01-05T14:30:00Z",
  "status": "pending",
  "approvedBy": null,
  "approvedAt": null,
  "rejectionReason": null
}
```

**Validation Rules**:
- `title`: Required, 1-200 characters
- `url`: Required, must match regex `^https?://[^\s]+$` (basic URL validation)
- `authorName`: Required, 1-100 characters
- `description`: Optional, 0-500 characters
- `referenceId`: Auto-generated from `Date.now()`; unique constraint
- `submittedAt`: Auto-generated to current UTC time
- Status transitions: `pending` → `approved` OR `pending` → `rejected` (final states)

**State Transitions**:
```
              ┌─────────────┐
              │   pending   │
              └──────┬──────┘
                     │
         ┌───────────┼───────────┐
         │                       │
    (approve)              (reject)
         │                       │
         ▼                       ▼
    ┌─────────┐          ┌──────────┐
    │approved │          │rejected  │
    └─────────┘          └──────────┘
```

---

### 1.2 Approved Blog (Derived View)

**Purpose**: Represents a blog in the public-facing feed. Derived from BlogSubmission with status='approved'.

**Attributes**:

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-----------|-------|
| `id` | UUID (string) | Yes | Unique, immutable | Same as source BlogSubmission.id |
| `title` | string | Yes | Non-empty, max 200 chars | From BlogSubmission.title |
| `url` | string | Yes | Valid HTTP(S) URL | From BlogSubmission.url |
| `author` | string | Yes | Non-empty, max 100 chars | From BlogSubmission.authorName |
| `description` | string | No | Max 500 chars | From BlogSubmission.description |
| `submittedAt` | ISO 8601 timestamp | Yes | Immutable | From BlogSubmission.submittedAt |
| `approvedAt` | ISO 8601 timestamp | Yes | Immutable | From BlogSubmission.approvedAt |
| `approvedBy` | string (Admin ID) | Yes | References Admin.id | Which admin approved |

**Example**:
```json
{
  "id": "sub-550e8400-e29b-41d4-a716-446655440000",
  "title": "Building Scalable React Applications",
  "url": "https://example-blog.com/scalable-react",
  "author": "Alice Johnson",
  "description": "A comprehensive guide to scaling React apps with patterns and best practices",
  "submittedAt": "2026-01-05T14:30:00Z",
  "approvedAt": "2026-01-05T16:00:00Z",
  "approvedBy": "admin-001"
}
```

**Special Notes**:
- This is NOT a separate entity; it's a derived view from BlogSubmission where `status='approved'`.
- Public-facing API returns only approved blogs (others are hidden).
- Sorting: Default by `submittedAt` descending (newest first).

---

### 1.3 Administrator

**Purpose**: Represents a user who can log in and review/approve/reject blog submissions.

**Attributes**:

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-----------|-------|
| `id` | UUID (string) | Yes | Unique, immutable | Generated on creation |
| `username` | string | Yes | Unique, 4-50 chars | For login; alphanumeric + underscore |
| `password` | string | Yes | Hashed, min 6 chars | Stored hashed (bcrypt recommended if backend existed; here just hash in mock) |
| `email` | string | Yes | Valid email format | For audit logging (optional for MVP) |
| `createdAt` | ISO 8601 timestamp | Yes | Immutable | UTC datetime of account creation |
| `role` | enum | Yes | One of: `admin`, `moderator` | `admin` has all permissions; `moderator` can review but not delete |
| `isActive` | boolean | Yes | Default: true | Can be deactivated without deletion |

**Example**:
```json
{
  "id": "admin-001",
  "username": "reviewer_alice",
  "password": "$2b$10$...", // Hashed password (in real app; here simplified)
  "email": "alice@example.com",
  "createdAt": "2026-01-01T00:00:00Z",
  "role": "admin",
  "isActive": true
}
```

**Validation Rules**:
- `username`: Required, 4-50 alphanumeric + underscore, unique
- `password`: Required at login; min 6 characters (in mock, stored as-is for simplicity; in production, use bcrypt)
- `email`: Required, must match email regex
- `role`: One of `admin` or `moderator`

**Session Management**:
- Login creates a session token (JWT in real app; here stored in localStorage as `adminToken={username}`)
- Session persists until logout or browser clear
- Protected routes check for valid session before rendering admin content

---

### 1.4 Visitor (No Persistent Entity)

**Purpose**: Represents an anonymous user with no account. Actions are stateless.

**Session Data** (stored in localStorage as `submissionHistory`):
```json
{
  "referenceId": "REF-1704516000000",
  "title": "My Blog",
  "submittedAt": "2026-01-05T14:30:00Z"
}
```

**Actions**:
1. Submit a blog (no login required)
2. View all approved blogs (no login required)
3. Check submission status via referenceId (no login required)

**No validation or constraints** — each visitor is independent, identified only by their referenceId.

---

## 2. Data Relationships

```
┌──────────────────────┐
│  BlogSubmission      │
├──────────────────────┤
│ id (PK)              │
│ referenceId (unique) │
│ title                │
│ url                  │
│ description          │
│ authorName           │
│ submittedAt          │
│ status               │
│ approvedBy (FK) ─────┼──────────────────────┐
│ approvedAt           │                      │
│ rejectionReason      │                      │
└──────────────────────┘                      │
         │                                    │
         │ (status='approved')                │
         │                                    │
         ▼                                    │
┌──────────────────────┐                      │
│  ApprovedBlog (view) │                      │
│  (derived from above)│                      │
└──────────────────────┘                      │
                                              │
                                              │
                                    ┌─────────▼──────────┐
                                    │  Administrator     │
                                    ├────────────────────┤
                                    │ id (PK)            │
                                    │ username (unique)  │
                                    │ password (hashed)  │
                                    │ email              │
                                    │ createdAt          │
                                    │ role               │
                                    │ isActive           │
                                    └────────────────────┘
```

**Relationships**:
- **BlogSubmission → Administrator** (many-to-one): When status='approved' or 'rejected', approvedBy references an Admin
- **ApprovedBlog ← BlogSubmission** (one-to-one derived): View filter on status='approved'
- **Visitor ← BlogSubmission** (one-to-many): A visitor submits multiple blogs (identified by referenceId pattern in submission history)

---

## 3. Data Storage (Mock Implementation)

### Directory Structure:

```
src/mocks/
├── blogs.json          # All blog submissions (pending + approved + rejected)
├── admins.json         # Administrator credentials
└── README.md           # How to modify mock data
```

### 3.1 blogs.json

```json
{
  "submissions": [
    {
      "id": "sub-001",
      "referenceId": "REF-1704516000000",
      "title": "Blog 1",
      "url": "https://example.com/blog1",
      "description": "Description 1",
      "authorName": "Author 1",
      "submittedAt": "2026-01-04T10:00:00Z",
      "status": "approved",
      "approvedBy": "admin-001",
      "approvedAt": "2026-01-04T14:00:00Z",
      "rejectionReason": null
    },
    {
      "id": "sub-002",
      "referenceId": "REF-1704516000001",
      "title": "Blog 2",
      "url": "https://example.com/blog2",
      "description": "Description 2",
      "authorName": "Author 2",
      "submittedAt": "2026-01-05T11:00:00Z",
      "status": "pending",
      "approvedBy": null,
      "approvedAt": null,
      "rejectionReason": null
    },
    {
      "id": "sub-003",
      "referenceId": "REF-1704516000002",
      "title": "Blog 3",
      "url": "https://example.com/blog3",
      "description": "Description 3",
      "authorName": "Author 3",
      "submittedAt": "2026-01-05T09:00:00Z",
      "status": "rejected",
      "approvedBy": "admin-002",
      "approvedAt": "2026-01-05T12:00:00Z",
      "rejectionReason": "Duplicate content with existing blog"
    }
  ]
}
```

### 3.2 admins.json

```json
{
  "admins": [
    {
      "id": "admin-001",
      "username": "admin",
      "password": "admin123", // In real app, this would be hashed
      "email": "admin@example.com",
      "createdAt": "2026-01-01T00:00:00Z",
      "role": "admin",
      "isActive": true
    },
    {
      "id": "admin-002",
      "username": "moderator",
      "password": "mod123",
      "email": "moderator@example.com",
      "createdAt": "2026-01-01T00:00:00Z",
      "role": "moderator",
      "isActive": true
    }
  ]
}
```

---

## 4. API Contract (From React Components to Mock Service)

### 4.1 Blog Operations

**Endpoint**: `GET /api/blogs?status=approved|pending|rejected`
- Returns: `{ blogs: BlogSubmission[] }`
- Filters applied in MockApiService

**Endpoint**: `POST /api/blogs/submit`
- Input: `{ title, url, description, authorName }`
- Returns: `{ id: string; referenceId: string; status: 'pending' }`

**Endpoint**: `GET /api/blogs/:referenceId/status`
- Returns: `{ referenceId, status, rejectionReason }`

### 4.2 Admin Operations

**Endpoint**: `POST /api/auth/login`
- Input: `{ username, password }`
- Returns: `{ success: boolean; admin?: { id, username, role }; error?: string }`

**Endpoint**: `POST /api/auth/logout`
- Clears session from localStorage

**Endpoint**: `GET /api/admin/submissions?status=pending`
- Requires: Admin auth
- Returns: `{ submissions: BlogSubmission[] }`

**Endpoint**: `PATCH /api/admin/submissions/:submissionId/approve`
- Requires: Admin auth
- Input: `{ approverUserId: string }`
- Returns: `{ success: boolean; blog: ApprovedBlog }`

**Endpoint**: `PATCH /api/admin/submissions/:submissionId/reject`
- Requires: Admin auth
- Input: `{ approverUserId: string; rejectionReason: string }`
- Returns: `{ success: boolean; submission: BlogSubmission }`

---

## 5. Business Rules & Validation

### Submission Validation:
1. **Title**: 1-200 characters, required
2. **URL**: Must be valid HTTP/HTTPS URL (basic regex validation)
3. **Author**: 1-100 characters, required
4. **Status**: Can only transition from pending to approved/rejected (no reversals)

### Admin Rules:
1. **Login**: Match username + password against mock data
2. **Permissions**: Admin role can approve/reject; Moderator role can also
3. **Session**: Persists in localStorage under key `adminSession`

### Data Consistency:
1. Each BlogSubmission has a unique `id` and `referenceId`
2. Approved blogs are never in pending/rejected state
3. Only one admin can approve/reject a submission (no double-approval)
4. Rejection reason is only set when status='rejected'

---

## 6. Implementation Notes

### TypeScript Interfaces:

```typescript
// types/index.ts
export interface BlogSubmission {
  id: string;
  referenceId: string;
  title: string;
  url: string;
  description?: string;
  authorName: string;
  submittedAt: string; // ISO 8601
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface ApprovedBlog extends Omit<BlogSubmission, 'status' | 'approvedBy' | 'rejectionReason'> {
  author: string; // Renamed from authorName for public API
}

export interface Administrator {
  id: string;
  username: string;
  password: string; // Hashed in real app
  email: string;
  createdAt: string;
  role: 'admin' | 'moderator';
  isActive: boolean;
}

export interface AdminSession {
  adminId: string;
  username: string;
  role: 'admin' | 'moderator';
  loginTime: string;
}
```

### Mock Service Implementation Pattern:

```typescript
// services/mockApiService.ts
class MockApiService {
  private blogs: BlogSubmission[] = [];
  private admins: Administrator[] = [];

  async initialize() {
    // Load from src/mocks/*.json
    this.blogs = await import('@/mocks/blogs.json').then(m => m.submissions);
    this.admins = await import('@/mocks/admins.json').then(m => m.admins);
  }

  async fetchBlogs(status?: string): Promise<BlogSubmission[]> {
    await this.delay(200);
    return status ? this.blogs.filter(b => b.status === status) : this.blogs;
  }

  async submitBlog(data: { title, url, description, authorName }): Promise<{ id, referenceId }> {
    const submission: BlogSubmission = {
      id: `sub-${UUID()}`,
      referenceId: `REF-${Date.now()}`,
      ...data,
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };
    this.blogs.push(submission);
    localStorage.setItem('submissionHistory', JSON.stringify([...this.getSubmissionHistory(), {
      referenceId: submission.referenceId,
      title: submission.title,
      submittedAt: submission.submittedAt,
    }]));
    return { id: submission.id, referenceId: submission.referenceId };
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

---

## Conclusion

This data model supports all 5 user stories from the specification:
- ✅ P1: Visitor submits blog (BlogSubmission)
- ✅ P1: Visitor views approved blogs (ApprovedBlog derived view)
- ✅ P2: Visitor checks status (BlogSubmission.status query by referenceId)
- ✅ P2: Admin logs in (Administrator entity + session)
- ✅ P3: Admin reviews/approves/rejects (BlogSubmission state transitions)

All entities are fully typed, validated, and persistent via localStorage.

