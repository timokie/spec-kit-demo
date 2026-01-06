---
description: "Task list for Blog Aggregation feature implementation"
---

# Tasks: Blog Aggregation Website

**Input**: Design documents from `/specs/001-blog-aggregation/`

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Initialize Vite React + TypeScript project and commit to `frontend/` or repo root
- [ ] T002 Install and configure Tailwind CSS (tailwind.config.ts, index.css)
- [ ] T003 Configure React Router v6 and create base `App.tsx` with `Layout` and routes
- [ ] T004 Add TypeScript `src/types/index.ts` with `BlogSubmission`, `Administrator`, `ApiResponse` types
- [ ] T005 Add mock data files: `src/mocks/blogs.json`, `src/mocks/admins.json`
- [ ] T006 Implement `services/mockApiService.ts` stub (initialize from `src/mocks/*.json`) and `services/apiClient.ts` wrapper
- [ ] T007 Create `store/AppContext.tsx` (Context + useReducer) and `hooks/useAppState.ts`

---

## Phase 2: Public Features (Priority P1)

### User Story: Visitor submits blog (US1)
- [ ] T010 Create `pages/SubmitPage.tsx` and `components/forms/BlogSubmissionForm.tsx` using `useForm` hook
- [ ] T011 Implement client-side validators (`utils/validators.ts`) for URL, title, author
- [ ] T012 Wire submission to `mockApiService.submitBlog` and display reference ID on success
- [ ] T013 Add unit tests for `BlogSubmissionForm` (validation + submit flow)

### User Story: Visitor views approved blogs (US2)
- [ ] T020 Create `pages/HomePage.tsx` and `components/features/BlogList.tsx`, `components/common/BlogCard.tsx`
- [ ] T021 Implement `hooks/useFetchBlogs.ts` to fetch `GET /api/blogs?status=approved` via `apiClient`
- [ ] T022 Ensure list is sorted by `submittedAt` descending and responsive layout (Tailwind)
- [ ] T023 Add unit/integration tests for `BlogList` and `BlogCard`

### User Story: Visitor checks submission status (US3)
- [ ] T030 Create `pages/StatusPage.tsx` and input for `referenceId` to call `GET /api/blogs/:referenceId/status`
- [ ] T031 Display status (Pending/Approved/Rejected) and rejection reason if present
- [ ] T032 Add tests for `StatusPage` behavior

---

## Phase 3: Admin Features (Priority P2/P3)

### User Story: Admin login (US4)
- [ ] T040 Create `pages/LoginPage.tsx` and `components/forms/LoginForm.tsx`
- [ ] T041 Implement `hooks/useAuth.ts` to call `POST /api/auth/login` and persist `adminSession` in localStorage
- [ ] T042 Protect admin routes: redirect to `/admin/login` if no session
- [ ] T043 Add tests for login flow (success and invalid credentials)

### User Story: Admin review & approve/reject (US5)
- [ ] T050 Create `pages/AdminPage.tsx` and `components/features/AdminPanel.tsx` showing pending submissions
- [ ] T051 Implement `mockApiService` endpoints: `GET /api/admin/submissions?status=pending`, `PATCH /api/admin/submissions/:id/approve`, `PATCH /api/admin/submissions/:id/reject`
- [ ] T052 Wire approve/reject UI actions to call API and update local state; show confirmation toasts
- [ ] T053 Add tests for admin approve/reject flows and data consistency

---

## Phase 4: Polish, Testing & Accessibility

- [ ] T060 Add loading states and skeletons for lists and pages
- [ ] T061 Add Toast notifications and error handling UI
- [ ] T062 Ensure responsive layout and Tailwind utility consistency
- [ ] T063 Add Jest + React Testing Library integration tests for main user journeys
- [ ] T064 Accessibility checks (buttons keyboard-focus, form labels, semantic HTML)

---

## Phase 5: Build & Deploy

- [ ] T070 Configure `npm run build` (Vite) and test `npm run preview`
- [ ] T071 Create simple deploy config for Vercel/Netlify/GitHub Pages
- [ ] T072 Final verification in production preview and update `quickstart.md` with deploy notes

---

## Notes
- Mark tasks as completed in this `tasks.md` file when done (replace `[ ]` with `[X]`).
- Tests should be written alongside implementation (TDD encouraged).
- Keep mockApiService implementation centralized so it can be swapped for a real API later.
