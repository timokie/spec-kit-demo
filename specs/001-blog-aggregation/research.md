# Research: Blog Aggregation Website (TypeScript + React + Tailwind)

**Phase**: Phase 0 (Research & Design Decisions)  
**Date**: 2026-01-06  
**Input**: Feature Specification + User Technical Requirements

## Executive Summary

This research consolidates best practices and architectural decisions for implementing a blog aggregation website using TypeScript, React, and Tailwind CSS with local JSON mock data. All unknowns from the initial specification have been resolved through targeted research into industry standards and community best practices.

---

## 1. React & TypeScript Architecture

### Decision: Functional Components + Context API + useReducer

**Chosen Pattern**: Modern React with TypeScript strict mode, functional components, and centralized state management via Context API combined with useReducer.

**Rationale**: 
- **Functional components** are the current React standard; easier to test and compose than class components.
- **Context API** avoids prop-drilling for auth state and UI state without adding Redux complexity (overkill for this project).
- **useReducer** provides predictable state transitions for admin actions (approve/reject blogs).
- **TypeScript strict mode** catches type errors at compile time, critical for a frontend-only project where tests are the primary safety net.

**Alternatives Considered**:
1. **Redux**: Rejected—Over-engineered for a small SPA. No need for time-travel debugging or middleware.
2. **Zustand/Jotai**: Rejected—Simpler than Redux but Context+useReducer is sufficient and requires no new dependencies.
3. **Class Components**: Rejected—Harder to test, less composable; functional components are the React community standard.

**Key Implementation Details**:
- **State structure**: { user: Admin | null, filter: {status, sortBy}, notifications: Notification[] }
- **Actions**: SET_USER, SET_FILTER, ADD_NOTIFICATION, REMOVE_NOTIFICATION
- **Custom hooks**: useAppState() to access context, useFetchBlogs(status) for data fetching, useForm() for form validation
- **Session storage**: Admin login persists via localStorage (no server authentication needed)

---

## 2. Project Structure

### Decision: Feature-First Organization with Separation of Concerns

**Chosen Structure**:
```
src/
├── components/
│   ├── common/           # Reusable: Button, Card, Modal, Input
│   ├── forms/            # BlogForm, LoginForm
│   ├── layout/           # Header, Navigation, Footer
│   └── features/         # BlogList, AdminPanel, StatusChecker, SubmissionForm
├── pages/                # Page-level route views
├── hooks/                # Custom hooks: useForm, useFetchBlogs, useAuth
├── services/             # API client, auth service, mock data
├── store/                # Context definition + reducer
├── types/                # TypeScript interfaces (Blog, Admin, Submission)
├── utils/                # Validators, formatters, helpers
├── styles/               # Global Tailwind setup
├── mocks/                # Local JSON mock data
└── App.tsx
```

**Rationale**: 
- Separation by feature + type allows teams to locate related code easily.
- Common components are reusable across features.
- Pages map directly to routes, making navigation clear.
- Mocks directory is isolated, making it easy to swap for real API later.

**Alternatives Considered**:
1. **By file type** (components/, services/, utils/): Rejected—Harder to find all code related to a feature.
2. **Domain-driven** (domain-models/blog, domain-models/admin): Rejected—Adds complexity for this project size.

---

## 3. Routing Strategy

### Decision: React Router v6 with Lazy Loading

**Chosen Pattern**:
- Nested routes under a Layout component for consistent header/navigation.
- Lazy loading using `React.lazy()` to split bundle by route.
- Protected routes for admin paths (checked at component level, not route level).

**Route Structure**:
- `/` — BlogList (homepage)
- `/submit` — BlogSubmissionForm
- `/check-status/:referenceId` — StatusChecker
- `/admin` — AdminPanel (redirects to login if not authenticated)
- `/admin/login` — AdminLoginForm

**Rationale**: 
- Nested routes keep layout consistent across views.
- Lazy loading reduces initial bundle size (critical for static hosting).
- Route protection at component level keeps logic in React (not middleware).

---

## 4. Form Handling & Validation

### Decision: Custom useForm Hook + Client-Side Validation

**Chosen Pattern**: Reusable `useForm` hook that handles state, errors, submission, and validation.

**Validation Rules** (from specification):
- **Blog Title**: Required, non-empty
- **Blog URL**: Required, must match `https?://` pattern (URL validation)
- **Author Name**: Required, non-empty
- **Description**: Optional but recommended
- **Admin Login**: Username + password both required

**Rationale**: 
- Custom hook avoids form library dependencies (simpler, less overhead).
- Client-side validation provides immediate user feedback.
- Hook is testable and reusable across forms (BlogForm, LoginForm, StatusChecker).

**Alternatives Considered**:
1. **React Hook Form**: Rejected—Added complexity for MVP; custom hook is sufficient.
2. **Formik**: Rejected—Similar to Hook Form; overkill for this project.

---

## 5. Local JSON Mock Data Architecture

### Decision: MockApiService + localStorage for Session State

**Chosen Pattern**:
1. **Mock data files** in `src/mocks/` directory (blogs.json, admins.json, submissions.json).
2. **MockApiService** class intercepts fetch requests and routes to handler methods.
3. **useAppState() + useEffect()** initializes mock data on app load.
4. **localStorage** persists admin login state and submission history across browser sessions.
5. **Realistic delays** (100-500ms) simulate network latency for better UX testing.

**Data Structure** (JSON format):
```json
// src/mocks/blogs.json
{
  "blogs": [
    {
      "id": "uuid-001",
      "referenceId": "REF-001",
      "title": "Building React Apps",
      "url": "https://blog.example.com/react",
      "description": "A guide to React best practices",
      "author": "John Doe",
      "submittedAt": "2026-01-05T10:00:00Z",
      "status": "published",
      "rejectionReason": null
    }
  ]
}
```

**Service Implementation** (pattern):
```typescript
class MockApiService {
  async fetchBlogs(status?: string): Promise<Blog[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Filter from mock data
    return mockBlogsData.filter(b => !status || b.status === status);
  }
  
  async submitBlog(data: BlogSubmission): Promise<{id: string; referenceId: string}> {
    // Generate reference ID
    const referenceId = `REF-${Date.now()}`;
    const id = `sub-${UUID()}`;
    
    // Store in localStorage for persistence
    const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
    submissions.push({...data, id, referenceId, status: 'pending', submittedAt: new Date().toISOString()});
    localStorage.setItem('submissions', JSON.stringify(submissions));
    
    return {id, referenceId};
  }
  
  async approveSubmission(submissionId: string): Promise<Blog> {
    // Move from submission queue to approved blogs
    // Update localStorage
  }
}
```

**Rationale**: 
- Completely frontend-based; no backend required, aligns with constitution Principle II.
- localStorage makes data persistent across page refreshes (essential for testing).
- Realistic delays help developers test loading states.
- Easy to swap for real API later (just replace MockApiService implementation).

**Alternatives Considered**:
1. **Redux with mock middleware**: Rejected—Adds Redux complexity.
2. **REST API stub (json-server)**: Rejected—Adds external dependency; localStorage is simpler.
3. **GraphQL mock server**: Rejected—Over-engineered for this project.

---

## 6. State Management: Auth & UI State

### Decision: Context API for Auth + Notifications + Filters

**Chosen Pattern**:
```typescript
type AppState = {
  user: Admin | null;                    // Current logged-in admin
  filter: { status: string; sortBy: string }; // Admin dashboard filters
  notifications: Notification[];         // Toast notifications
};
```

**User Flow** (auth):
1. Admin navigates to `/admin`
2. If not authenticated, redirect to `/admin/login`
3. On login, MockApiService validates credentials against mock admins
4. Set user state in context, persist to localStorage
5. On logout, clear user state and localStorage

**Rationale**: 
- Auth state is global; many components need to check if user is admin.
- Filters are local to admin page; could be local state, but context is more flexible for future features.
- Notifications are global; context simplifies toast/alert system.

---

## 7. Tailwind CSS Theme & Configuration

### Decision: Standard Tailwind Configuration + Custom Color Theme

**Chosen Color Palette**:
- **Primary (Blue)**: #3B82F6 — CTA buttons, links, active states
- **Success (Green)**: #10B981 — Approved blogs, success messages
- **Danger (Red)**: #EF4444 — Reject button, error states
- **Warning (Amber)**: #F59E0B — Pending status, info alerts
- **Neutral (Gray)**: #6B7280 (text), #F3F4F6 (bg) — Backgrounds, borders, text

**Responsive Strategy**:
- Mobile-first design (base styles apply to mobile)
- Breakpoints: `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`
- Blog list: 1 col (mobile) → 2 cols (tablet) → 3 cols (desktop)
- Admin panel: Stack vertically (mobile) → sidebar + main (desktop)

**Component Patterns** (from Tailwind):
- Forms: `focus:ring-2 focus:ring-blue-500 focus:outline-none` for inputs
- Cards: `bg-white rounded-lg shadow-md hover:shadow-lg` for list items
- Buttons: `bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700` for CTAs
- Typography: `text-gray-900` (headings), `text-gray-600` (body), `text-sm text-gray-500` (captions)

**Rationale**: 
- Tailwind utility-first approach matches React's component-driven philosophy.
- No custom CSS needed; utilities compose cleanly in JSX.
- Professional, approachable theme suitable for a blog platform.
- Mobile-first ensures responsive design works on all devices.

**Alternatives Considered**:
1. **CSS Modules**: Rejected—Tailwind is faster for rapid development.
2. **Styled Components**: Rejected—Adds runtime overhead; Tailwind is lighter.
3. **Chakra UI**: Rejected—Over-engineered for this project; Tailwind is sufficient.

---

## 8. Testing Strategy

### Decision: Jest + React Testing Library for Component Tests + Integration Tests

**Test Scope** (per constitution):
- Component render tests (does component render without crashing?)
- User interaction tests (form submission, button clicks)
- Mock data consistency (submission schema matches blog schema)
- Integration tests (full user journeys: submit blog → check status → view in list)

**Testing Pyramid** (for this project):
- **Unit tests**: 30% (component props, utility functions, validators)
- **Integration tests**: 60% (user workflows, form submission → data display)
- **E2E tests**: 10% (optional, can be added if needed)

**Example Test Structure**:
```typescript
describe('BlogSubmissionForm', () => {
  it('renders form with all fields', () => {
    render(<BlogSubmissionForm />);
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Blog URL')).toBeInTheDocument();
  });

  it('shows error for invalid URL', async () => {
    render(<BlogSubmissionForm />);
    fireEvent.change(screen.getByLabelText('Blog URL'), {target: {value: 'invalid-url'}});
    fireEvent.click(screen.getByText('Submit'));
    expect(await screen.findByText(/valid URL required/i)).toBeInTheDocument();
  });

  it('submits form and displays reference ID', async () => {
    render(<BlogSubmissionForm />);
    fireEvent.change(screen.getByLabelText('Title'), {target: {value: 'My Blog'}});
    fireEvent.change(screen.getByLabelText('Blog URL'), {target: {value: 'https://example.com'}});
    fireEvent.click(screen.getByText('Submit'));
    expect(await screen.findByText(/REF-/)).toBeInTheDocument();
  });
});
```

**Rationale**: 
- Jest is the React community standard, great for component testing.
- React Testing Library encourages testing behavior (user interactions) over implementation.
- No external backend needed; all tests use mock data.

---

## 9. Build & Deployment

### Decision: Vite for Build Tool + Static Hosting

**Chosen Approach**:
- **Build tool**: Vite (faster than Create React App, better DX)
- **Output**: Static HTML/JS/CSS files
- **Deployment targets**: GitHub Pages, Vercel, Netlify, or any static host
- **Environment**: No server-side rendering or backend server required

**Build Process**:
1. `npm run build` → outputs to `dist/` directory
2. `npm run preview` → test production build locally
3. Deploy `dist/` to static host

**Rationale**: 
- Vite builds are fast (sub-second HMR).
- Static hosting is free or cheap (GitHub Pages, Vercel, Netlify).
- No server complexity; pure frontend app.
- Aligns with constitution Principle I (Frontend-First).

---

## 10. Package Dependencies (Summary)

**Core** (required):
- `react` — UI framework
- `react-dom` — React rendering
- `react-router-dom` — Client-side routing
- `typescript` — Type safety
- `tailwindcss` — Styling

**Development**:
- `vite` — Build tool
- `@vitejs/plugin-react` — React support in Vite
- `jest` — Test runner
- `@testing-library/react` — Component testing utilities
- `@types/react`, `@types/react-dom` — TypeScript types for React

**Optional** (for convenience):
- `uuid` — Generate unique IDs for submissions/blogs
- `date-fns` — Date formatting (if needed for UI)

**What we DON'T include**:
- ❌ Redux / MobX / Zustand — Context API is sufficient
- ❌ Express / Next.js — No backend needed
- ❌ axios / Apollo — fetch API is built-in, no external API calls
- ❌ Material-UI / Ant Design — Tailwind CSS is sufficient

---

## Conclusions & Next Steps

All unknowns from the specification have been resolved:

| Unknown | Decision | Rationale |
|---------|----------|-----------|
| State management | Context + useReducer | Avoids prop-drilling without Redux complexity |
| Routing | React Router v6 | Modern standard with lazy loading |
| Forms | Custom useForm hook | Reusable, testable, no heavy dependencies |
| Mock data | localStorage + MockApiService | Persistent, offline-capable, easy to test |
| Styling | Tailwind CSS | Utility-first, fast development, no custom CSS |
| Testing | Jest + RTL | React community standard, behavior-focused |
| Build | Vite | Fast, modern, outputs static files |

**Ready for**: Phase 1 (Design Phase) — creating data-model.md, contracts/, and quickstart.md.

