# Mock Data Architecture - Blog Aggregation SPA

**Purpose**: Design patterns for a React SPA using local JSON files and service layer instead of backend APIs.

---

## 1. Recommended Folder Structure

```
src/
├── mocks/
│   ├── data/                          # Mock JSON data files
│   │   ├── blogs.json                 # Approved blogs
│   │   ├── submissions.json           # Blog submissions (pending, approved, rejected)
│   │   ├── admins.json                # Admin users
│   │   └── seed.ts                    # Data seeding/initialization
│   │
│   ├── services/
│   │   ├── mockApi.ts                 # Main mock service (intercepts fetch)
│   │   ├── mockStorage.ts             # LocalStorage helper for auth/session
│   │   └── mockDataManager.ts         # In-memory state management
│   │
│   └── constants.ts                   # API endpoint constants & mock config
│
├── services/
│   └── api.ts                         # Real API service (uses mockApi in dev)
│
├── hooks/
│   ├── useAuth.ts                     # Auth hook (manages login state)
│   └── useBlogService.ts              # Blog service hook
│
└── App.tsx
```

**Key Design Principle**: Mock API service is transparent—components don't know they're using mocks. Switch between mock and real API by changing the service layer.

---

## 2. Mock Service Layer (Intercept Fetch Calls)

### Pattern: Centralized Mock API Service

**File: `src/mocks/services/mockApi.ts`**

```typescript
// Core pattern: Intercept fetch and return mock data based on endpoint
export class MockApiService {
  private static instance: MockApiService;
  private data: MockDatabase;
  private delay: number = 300; // Simulate network latency

  private constructor(initialData: MockDatabase) {
    this.data = JSON.parse(JSON.stringify(initialData)); // Deep copy
  }

  static initialize(initialData: MockDatabase): void {
    MockApiService.instance = new MockApiService(initialData);
  }

  static getInstance(): MockApiService {
    if (!MockApiService.instance) {
      throw new Error('MockApiService not initialized');
    }
    return MockApiService.instance;
  }

  // Intercept fetch calls
  async fetch(url: string, options?: RequestInit): Promise<Response> {
    await this.simulateDelay();

    const method = options?.method || 'GET';
    const body = options?.body ? JSON.parse(options.body) : null;

    try {
      let responseData: any;

      // Route to appropriate handler
      if (url.includes('/api/blogs') && method === 'GET') {
        responseData = this.handleGetBlogs();
      } else if (url.includes('/api/submissions') && method === 'POST') {
        responseData = this.handleSubmitBlog(body);
      } else if (url.includes('/api/submissions/') && method === 'GET') {
        const id = url.split('/').pop();
        responseData = this.handleGetSubmissionStatus(id);
      } else if (url.includes('/api/admin/submissions') && method === 'GET') {
        responseData = this.handleGetSubmissionsForReview();
      } else if (url.includes('/api/admin/submissions/') && method === 'PATCH') {
        const id = url.split('/').pop();
        responseData = this.handleReviewSubmission(id, body);
      } else if (url.includes('/api/auth/login') && method === 'POST') {
        responseData = this.handleAdminLogin(body);
      } else if (url.includes('/api/auth/logout') && method === 'POST') {
        responseData = this.handleAdminLogout();
      } else {
        throw new Error(`Unknown endpoint: ${method} ${url}`);
      }

      return new Response(JSON.stringify(responseData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: (error as Error).message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  private handleGetBlogs() {
    return {
      blogs: this.data.blogs.filter((b) => b.status === 'approved'),
    };
  }

  private handleSubmitBlog(submission: Partial<BlogSubmission>) {
    const newSubmission: BlogSubmission = {
      id: this.generateId(),
      title: submission.title || '',
      url: submission.url || '',
      description: submission.description || '',
      status: 'pending',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.submissions.push(newSubmission);
    return { submission: newSubmission };
  }

  private handleGetSubmissionStatus(id: string) {
    const submission = this.data.submissions.find((s) => s.id === id);
    if (!submission) {
      throw new Error('Submission not found');
    }
    return { submission };
  }

  private handleGetSubmissionsForReview() {
    return {
      submissions: this.data.submissions.filter((s) => s.status === 'pending'),
    };
  }

  private handleReviewSubmission(
    id: string,
    review: { status: 'approved' | 'rejected'; notes?: string }
  ) {
    const submission = this.data.submissions.find((s) => s.id === id);
    if (!submission) {
      throw new Error('Submission not found');
    }

    submission.status = review.status;
    submission.notes = review.notes;
    submission.updatedAt = new Date().toISOString();

    if (review.status === 'approved') {
      this.data.blogs.push({
        id: this.generateId(),
        title: submission.title,
        url: submission.url,
        description: submission.description,
        submittedAt: submission.submittedAt,
      });
    }

    return { submission };
  }

  private handleAdminLogin(credentials: {
    email: string;
    password: string;
  }) {
    const admin = this.data.admins.find((a) => a.email === credentials.email);
    if (!admin || admin.password !== credentials.password) {
      throw new Error('Invalid credentials');
    }
    const token = this.generateToken();
    return { admin: { id: admin.id, email: admin.email, name: admin.name }, token };
  }

  private handleAdminLogout() {
    return { success: true };
  }

  private simulateDelay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.delay));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private generateToken(): string {
    return 'mock-token-' + this.generateId();
  }
}

// Type definitions
interface MockDatabase {
  blogs: ApprovedBlog[];
  submissions: BlogSubmission[];
  admins: AdminUser[];
}

interface ApprovedBlog {
  id: string;
  title: string;
  url: string;
  description: string;
  submittedAt: string;
}

interface BlogSubmission {
  id: string;
  title: string;
  url: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  submittedAt: string;
  updatedAt: string;
}

interface AdminUser {
  id: string;
  email: string;
  password: string; // In real app, never store plaintext!
  name: string;
}
```

---

## 3. API Service Wrapper (Using Mock Service)

**File: `src/services/api.ts`**

Pattern: Single wrapper that delegates to MockApiService in development.

```typescript
// Development: Use MockApiService
// Production: Use real fetch or axios

export const apiClient = {
  async fetch(url: string, options?: RequestInit): Promise<Response> {
    if (import.meta.env.MODE === 'development') {
      // Use mock API in development
      return MockApiService.getInstance().fetch(url, options);
    }
    // Use real fetch in production
    return fetch(url, options);
  },

  async post<T>(url: string, data: any): Promise<T> {
    const response = await this.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Request failed');
    return response.json();
  },

  async get<T>(url: string): Promise<T> {
    const response = await this.fetch(url);
    if (!response.ok) throw new Error('Request failed');
    return response.json();
  },

  async patch<T>(url: string, data: any): Promise<T> {
    const response = await this.fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Request failed');
    return response.json();
  },
};
```

---

## 4. In-Memory State & Data Initialization

**File: `src/mocks/services/mockDataManager.ts`**

Pattern: Initialize mock data on app load, maintain in-memory state.

```typescript
export class MockDataManager {
  private static instance: MockDataManager;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): MockDataManager {
    if (!MockDataManager.instance) {
      MockDataManager.instance = new MockDataManager();
    }
    return MockDataManager.instance;
  }

  // Initialize on app startup
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load seed data from JSON files
      const seedData = await this.loadSeedData();
      
      // Initialize MockApiService with data
      MockApiService.initialize(seedData);
      
      // Restore any persisted auth state
      const authToken = MockStorageService.getAuthToken();
      if (authToken) {
        console.log('Restored admin session');
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize mock data:', error);
      throw error;
    }
  }

  private async loadSeedData(): Promise<MockDatabase> {
    // In real app, import JSON files or fetch from static files
    return seedData; // Pre-defined seed data (see section 5)
  }

  // Expose methods for testing/debugging
  async reset(): Promise<void> {
    this.isInitialized = false;
    await this.initialize();
  }
}
```

**File: `src/App.tsx`** - App initialization pattern:

```typescript
function App() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    MockDataManager.getInstance()
      .initialize()
      .then(() => setIsReady(true))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div>Error: {error}</div>;
  if (!isReady) return <div>Loading...</div>;

  return <Router>{/* Routes */}</Router>;
}
```

---

## 5. Data Seeding - Sample Mock Data

**File: `src/mocks/data/seed.ts`**

Pattern: Pre-defined sample data for demo/testing.

```typescript
export const seedData = {
  blogs: [
    {
      id: 'blog-001',
      title: 'React Performance Optimization',
      url: 'https://example.com/react-perf',
      description: 'Deep dive into React rendering optimization techniques',
      submittedAt: '2026-01-01T10:00:00Z',
    },
    {
      id: 'blog-002',
      title: 'TypeScript Best Practices',
      url: 'https://example.com/ts-best',
      description: 'Essential patterns for writing maintainable TypeScript',
      submittedAt: '2026-01-02T14:30:00Z',
    },
  ],

  submissions: [
    {
      id: 'sub-001',
      title: 'Web Accessibility Guide',
      url: 'https://example.com/a11y',
      description: 'Building accessible web applications',
      status: 'pending',
      submittedAt: '2026-01-05T09:00:00Z',
      updatedAt: '2026-01-05T09:00:00Z',
    },
    {
      id: 'sub-002',
      title: 'CSS Grid Advanced',
      url: 'https://example.com/css-grid',
      description: 'Advanced CSS Grid layouts',
      status: 'approved',
      submittedAt: '2026-01-03T11:00:00Z',
      updatedAt: '2026-01-04T15:00:00Z',
    },
  ],

  admins: [
    {
      id: 'admin-001',
      email: 'admin@example.com',
      password: 'demo123', // Demo only!
      name: 'Demo Admin',
    },
  ],
};
```

---

## 6. Session Storage & Auth Persistence

**File: `src/mocks/services/mockStorage.ts`**

Pattern: Persist auth state to localStorage.

```typescript
const AUTH_TOKEN_KEY = 'mock_auth_token';
const ADMIN_KEY = 'mock_admin_user';

export class MockStorageService {
  // Persist admin login
  static saveAuthToken(token: string, admin: AdminUser): void {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
  }

  // Retrieve persisted token
  static getAuthToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  static getAdmin(): AdminUser | null {
    const data = localStorage.getItem(ADMIN_KEY);
    return data ? JSON.parse(data) : null;
  }

  // Clear on logout
  static clearAuth(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
  }
}
```

---

## 7. Component Integration Patterns

### Pattern A: Custom Hook for Blog Service

**File: `src/hooks/useBlogService.ts`**

```typescript
export function useBlogService() {
  const [blogs, setBlogs] = useState<ApprovedBlog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<{ blogs: ApprovedBlog[] }>(
        '/api/blogs'
      );
      setBlogs(data.blogs);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const submitBlog = useCallback(
    async (submission: Omit<BlogSubmission, 'id' | 'status' | 'submittedAt'>) => {
      try {
        const data = await apiClient.post<{ submission: BlogSubmission }>(
          '/api/submissions',
          submission
        );
        return data.submission;
      } catch (err) {
        throw new Error((err as Error).message);
      }
    },
    []
  );

  return { blogs, loading, error, fetchBlogs, submitBlog };
}
```

### Pattern B: Admin Review Component

**File: `src/components/AdminReview.tsx`** (Usage pattern)

```typescript
function AdminReview() {
  const [submissions, setSubmissions] = useState<BlogSubmission[]>([]);
  const { isAdmin } = useAuth(); // Uses localStorage for auth state

  useEffect(() => {
    const loadSubmissions = async () => {
      const data = await apiClient.get<{ submissions: BlogSubmission[] }>(
        '/api/admin/submissions'
      );
      setSubmissions(data.submissions);
    };
    loadSubmissions();
  }, []);

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    const result = await apiClient.patch<{ submission: BlogSubmission }>(
      `/api/admin/submissions/${id}`,
      { status, notes: 'Demo review' }
    );
    // Update UI
    setSubmissions((prev) =>
      prev.map((sub) => (sub.id === id ? result.submission : sub))
    );
  };

  if (!isAdmin) return <div>Unauthorized</div>;

  return (
    <div>
      {submissions.map((sub) => (
        <div key={sub.id}>
          <h3>{sub.title}</h3>
          <button onClick={() => handleReview(sub.id, 'approved')}>
            Approve
          </button>
          <button onClick={() => handleReview(sub.id, 'rejected')}>
            Reject
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Pattern C: Auth Hook

**File: `src/hooks/useAuth.ts`**

```typescript
export function useAuth() {
  const [admin, setAdmin] = useState<AdminUser | null>(
    MockStorageService.getAdmin()
  );
  const [isAdmin, setIsAdmin] = useState(!!MockStorageService.getAuthToken());

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiClient.post<{
      admin: AdminUser;
      token: string;
    }>('/api/auth/login', { email, password });

    // Persist to localStorage
    MockStorageService.saveAuthToken(data.token, data.admin);
    setAdmin(data.admin);
    setIsAdmin(true);
  }, []);

  const logout = useCallback(() => {
    MockStorageService.clearAuth();
    setAdmin(null);
    setIsAdmin(false);
  }, []);

  return { admin, isAdmin, login, logout };
}
```

---

## 8. JSON File Structure (for Reference)

### `src/mocks/data/blogs.json`

```json
{
  "blogs": [
    {
      "id": "blog-001",
      "title": "Blog Title",
      "url": "https://example.com/blog",
      "description": "Blog description",
      "submittedAt": "2026-01-01T10:00:00Z"
    }
  ]
}
```

### `src/mocks/data/submissions.json`

```json
{
  "submissions": [
    {
      "id": "sub-001",
      "title": "Submission Title",
      "url": "https://example.com/submission",
      "description": "Description",
      "status": "pending",
      "notes": null,
      "submittedAt": "2026-01-05T09:00:00Z",
      "updatedAt": "2026-01-05T09:00:00Z"
    }
  ]
}
```

### `src/mocks/data/admins.json`

```json
{
  "admins": [
    {
      "id": "admin-001",
      "email": "admin@example.com",
      "password": "demo123",
      "name": "Demo Admin"
    }
  ]
}
```

---

## 9. Key Design Principles

| Principle | Implementation |
|-----------|-----------------|
| **Transparency** | MockApiService intercepts at fetch layer—components unchanged when switching to real API |
| **Isolation** | All mock logic in `src/mocks/`—zero mocks in component code |
| **Persistence** | Auth state via localStorage—survives page refresh |
| **Testability** | Easy to reset data with `MockDataManager.reset()` |
| **Scalability** | Add new endpoints to `mockApi.ts` without affecting existing code |
| **Separation** | `apiClient` wrapper allows switching between mock/real in one place |

---

## 10. Migration Path to Real API

When ready to use real backend:

1. **Update `src/services/api.ts`**: Change `fetch()` to call real API endpoint
2. **Mock service disappears**: No component changes needed
3. **Auth token**: Same `localStorage` pattern works with real JWT tokens
4. **Data format**: Ensure backend returns same shape as mock data

```typescript
// Before (mocks)
const response = await MockApiService.getInstance().fetch(url, options);

// After (real API)
const response = await fetch(url, options);
```

---

## Summary

This architecture provides:
- ✅ **Zero mock code in components** (transparent layer)
- ✅ **In-memory + localStorage persistence** (offline capable)
- ✅ **Easy data seeding** (realistic demo data)
- ✅ **Scalable endpoint routing** (add endpoints without refactor)
- ✅ **One-line switch to real API** (no component changes)
