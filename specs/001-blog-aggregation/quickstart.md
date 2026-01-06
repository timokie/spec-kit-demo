# Quickstart Guide: Blog Aggregation Website Development

**Project**: Blog Aggregation Website  
**Tech Stack**: React 18+ | TypeScript | Tailwind CSS | Vite  
**Purpose**: Get development environment running in < 5 minutes

---

## Prerequisites

- **Node.js**: v18.0.0 or higher (check with `node --version`)
- **npm**: v9.0.0 or higher (check with `npm --version`)
- **Git**: For version control
- **Code Editor**: VS Code recommended with extensions:
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - TypeScript Vue Plugin (Volar) if using Vue
  - ESLint (optional, for linting)

---

## Project Setup (Vite)

### Step 1: Initialize Project

```bash
# Create new Vite React TypeScript project
npm create vite@latest blog-aggregation -- --template react-ts

# Navigate to project
cd blog-aggregation

# Install dependencies
npm install
```

### Step 2: Install Tailwind CSS

```bash
# Install Tailwind and dependencies
npm install -D tailwindcss postcss autoprefixer

# Initialize Tailwind config
npx tailwindcss init -p
```

This creates `tailwind.config.ts` and `postcss.config.js`.

### Step 3: Configure Tailwind Template Paths

Edit `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',    // Blue
        success: '#10B981',    // Green
        danger: '#EF4444',     // Red
        warning: '#F59E0B',    // Amber
      },
    },
  },
  plugins: [],
} satisfies Config
```

### Step 4: Add Tailwind Directives

Edit `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn-primary {
    @apply px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
  }
  
  .btn-secondary {
    @apply px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors;
  }

  .card {
    @apply bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6;
  }

  .input-field {
    @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none;
  }

  .form-group {
    @apply mb-4;
  }

  .form-label {
    @apply block text-sm font-medium text-gray-700 mb-2;
  }
}
```

---

## Project Structure

Create the following directory structure:

```
blog-aggregation/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Toast.tsx
│   │   ├── forms/
│   │   │   ├── BlogSubmissionForm.tsx
│   │   │   └── LoginForm.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Layout.tsx
│   │   └── features/
│   │       ├── BlogList.tsx
│   │       ├── BlogCard.tsx
│   │       ├── AdminPanel.tsx
│   │       ├── StatusChecker.tsx
│   │       └── SubmissionForm.tsx
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── SubmitPage.tsx
│   │   ├── StatusPage.tsx
│   │   ├── AdminPage.tsx
│   │   └── LoginPage.tsx
│   ├── hooks/
│   │   ├── useForm.ts
│   │   ├── useFetchBlogs.ts
│   │   ├── useAuth.ts
│   │   └── useAppState.ts
│   ├── services/
│   │   ├── mockApiService.ts
│   │   └── apiClient.ts
│   ├── store/
│   │   └── AppContext.tsx
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── validators.ts
│   │   ├── formatters.ts
│   │   └── constants.ts
│   ├── mocks/
│   │   ├── blogs.json
│   │   ├── admins.json
│   │   └── README.md
│   ├── styles/
│   │   └── globals.css
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── vite-env.d.ts
├── public/
│   └── favicon.ico
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

### Create src/types/index.ts:

```typescript
export interface BlogSubmission {
  id: string;
  referenceId: string;
  title: string;
  url: string;
  description?: string;
  authorName: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface Administrator {
  id: string;
  username: string;
  password: string;
  email: string;
  role: 'admin' | 'moderator';
  createdAt: string;
  isActive: boolean;
}

export interface AdminSession {
  adminId: string;
  username: string;
  role: 'admin' | 'moderator';
  loginTime: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  timestamp: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}
```

---

## Setup Mock Data

### src/mocks/admins.json:

```json
{
  "admins": [
    {
      "id": "admin-001",
      "username": "admin",
      "password": "admin123",
      "email": "admin@example.com",
      "role": "admin",
      "createdAt": "2026-01-01T00:00:00Z",
      "isActive": true
    },
    {
      "id": "admin-002",
      "username": "moderator",
      "password": "mod123",
      "email": "moderator@example.com",
      "role": "moderator",
      "createdAt": "2026-01-01T00:00:00Z",
      "isActive": true
    }
  ]
}
```

### src/mocks/blogs.json:

```json
{
  "submissions": [
    {
      "id": "sub-001",
      "referenceId": "REF-1704516000000",
      "title": "Building Scalable React Applications",
      "url": "https://example-blog.com/react",
      "description": "Learn patterns for scaling React apps",
      "authorName": "Alice Johnson",
      "submittedAt": "2026-01-04T10:00:00Z",
      "status": "approved",
      "approvedBy": "admin-001",
      "approvedAt": "2026-01-04T14:00:00Z",
      "rejectionReason": null
    },
    {
      "id": "sub-002",
      "referenceId": "REF-1704516000001",
      "title": "TypeScript Best Practices",
      "url": "https://example-blog.com/typescript",
      "description": "Master TypeScript with these tips",
      "authorName": "Bob Smith",
      "submittedAt": "2026-01-05T09:00:00Z",
      "status": "pending",
      "approvedBy": null,
      "approvedAt": null,
      "rejectionReason": null
    }
  ]
}
```

---

## Setup Routes (React Router v6)

### src/App.tsx:

```typescript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from '@/components/layout/Layout';
import Loading from '@/components/common/Loading';

const HomePage = lazy(() => import('@/pages/HomePage'));
const SubmitPage = lazy(() => import('@/pages/SubmitPage'));
const StatusPage = lazy(() => import('@/pages/StatusPage'));
const AdminPage = lazy(() => import('@/pages/AdminPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Suspense fallback={<Loading />}><HomePage /></Suspense>} />
          <Route path="submit" element={<Suspense fallback={<Loading />}><SubmitPage /></Suspense>} />
          <Route path="status/:referenceId" element={<Suspense fallback={<Loading />}><StatusPage /></Suspense>} />
          <Route path="admin/login" element={<Suspense fallback={<Loading />}><LoginPage /></Suspense>} />
          <Route path="admin" element={<Suspense fallback={<Loading />}><AdminPage /></Suspense>} />
          <Route path="*" element={<div className="text-center py-20">Page not found</div>} />
        </Route>
      </Routes>
    </Router>
  );
}
```

---

## Install Core Dependencies

```bash
npm install react-router-dom
npm install -D typescript @types/react @types/react-dom
npm install uuid
npm install -D @types/uuid
```

---

## Development Commands

```bash
# Start development server (HMR enabled)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests (if Jest configured)
npm test

# Lint TypeScript
npx tsc --noEmit
```

---

## Testing Setup (Jest + React Testing Library)

```bash
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D @types/jest
```

Create `jest.config.cjs`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};
```

---

## Environment Variables (.env)

Create `.env` for mock API configuration:

```
VITE_API_BASE=http://localhost:5173/api
VITE_USE_MOCK=true
VITE_MOCK_DELAY=200
```

---

## First Run Checklist

- [ ] Clone repository and install dependencies (`npm install`)
- [ ] Configure Tailwind CSS (config + CSS directives)
- [ ] Create project structure directories
- [ ] Add type definitions (`src/types/index.ts`)
- [ ] Create mock data files (`src/mocks/*.json`)
- [ ] Setup React Router in `App.tsx`
- [ ] Create basic Layout component
- [ ] Run `npm run dev` and verify no errors in console
- [ ] Navigate to `http://localhost:5173`

---

## Common Tasks

### Adding a New Page

1. Create component in `src/pages/MyPage.tsx`
2. Add route to `src/App.tsx`
3. Import in router with `lazy()`
4. Test at `http://localhost:5173/my-page`

### Adding a New Component

1. Create in `src/components/{category}/MyComponent.tsx`
2. Export from component file
3. Import in page or parent component
4. Use with TypeScript props interface

### Styling with Tailwind

- Use utility classes directly in JSX: `className="px-4 py-2 bg-blue-600 text-white rounded"`
- Create component classes in `src/index.css` using `@layer components`
- Never write custom CSS unless absolutely necessary

### Mock Data Updates

1. Edit JSON files in `src/mocks/`
2. MockApiService automatically reads updated data on next request
3. No restart required (Vite HMR handles it)

---

## Troubleshooting

**Issue**: TypeScript errors in React components
- Solution: Ensure `src/types/index.ts` exports all interfaces, import types in components

**Issue**: Tailwind CSS not styling
- Solution: Check `tailwind.config.ts` includes `"./src/**/*.{js,ts,jsx,tsx}"` in `content` array

**Issue**: Vite not hot-reloading
- Solution: Make sure `npm run dev` is running; check for syntax errors

**Issue**: Mock data not persisting
- Solution: Check localStorage is enabled in browser; use browser DevTools > Application > Local Storage

---

## Next Steps

1. Start development server: `npm run dev`
2. Review [data-model.md](../data-model.md) for entity schemas
3. Review [contracts/](../contracts/) for API endpoint specifications
4. Implement components according to [spec.md](../spec.md) user stories
5. Create tests for each component (TDD recommended)
6. Deploy to static host (Vercel, Netlify, GitHub Pages)

---

## Additional Resources

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Router v6 Docs](https://reactrouter.com/en/main)
- [Vite Docs](https://vitejs.dev)

