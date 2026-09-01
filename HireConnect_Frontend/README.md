# HireConnect — Modern Job Portal Frontend

A production-quality frontend for a job recruitment platform, built with React, TypeScript, Vite, and Tailwind CSS. Designed to be connected to a Spring Boot + PostgreSQL + JWT backend later without redesigning the UI.

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS 3
- React Router v7
- Lucide React (icons)

## Getting Started

```bash
npm install
npm run dev
```

Open the printed local URL (usually `http://localhost:5173`).

Build for production:

```bash
npm run build
npm run preview
```

## Demo Credentials

| Role       | Email                  | Password    |
|------------|-------------------------|-------------|
| Job Seeker | seeker@hireconnect.com   | password123 |
| Employer   | employer@hireconnect.com | password123 |
| Admin      | admin@hireconnect.com    | password123 |

These are also available as one-click autofill buttons on the login page.

## Project Structure

```
src/
├── components/
│   ├── ui/            Reusable primitives (Button, Input, Modal, DataTable, etc.)
│   ├── layout/         Navbar, Sidebar, DashboardLayout, ProtectedRoute, etc.
│   └── jobs/            JobCard, CompanyCard, FilterPanel, JobForm, ApplicationModal
├── pages/
│   ├── public/          Landing, Jobs search, Job details, Companies, About
│   ├── auth/             Login, Register, Unauthorized
│   ├── seeker/            Job seeker dashboard, saved jobs, applications, profile
│   ├── employer/          Employer dashboard, my jobs, create/edit job, applications, company
│   ├── admin/              Admin dashboard, users, companies, jobs, applications
│   └── shared/              Settings, 404
├── context/               AuthContext, ThemeContext, ToastContext
├── data/mock/               users, jobs, companies, applications, dashboard stats
├── services/                 authService, jobService, companyService, applicationService,
│                              userService, apiClient
├── types/                     Centralized TypeScript models/enums
└── utils/                      format.ts, validation.ts
```

## Mock Service Architecture

Components never touch mock data directly. The flow is:

```
Component → Service (e.g. jobService.getJobs()) → mock data array (in-memory)
```

Every service method is `async` and awaits a simulated network delay, so loading
states, skeletons, and error boundaries behave exactly as they will once real
HTTP calls are wired in.

## Connecting the Real Spring Boot Backend Later

1. Set `VITE_API_BASE_URL` in a `.env` file, e.g.:
   ```
   VITE_API_BASE_URL=http://localhost:8080/api
   ```
2. `src/services/apiClient.ts` already contains a typed `apiClient.get/post/put/patch/delete`
   wrapper around `fetch` that reads this base URL and attaches
   `Authorization: Bearer <token>` automatically.
3. Inside each service file (`jobService.ts`, `authService.ts`, etc.), replace the
   body of each method with a call to `apiClient`, e.g.:
   ```ts
   // Before (mock)
   async getJobs(filters) { ... return { items, total, ... }; }

   // After (real backend)
   async getJobs(filters) {
     const query = new URLSearchParams(filters as any).toString();
     return apiClient.get<PaginatedResult<Job>>(`/jobs?${query}`);
   }
   ```
4. No component code needs to change — every page calls the service layer only.
5. Replace the mock JWT placeholder in `authService.ts` (`issueMockToken`) with the
   real token returned by `POST /api/auth/login`.

### Planned REST Endpoints

```
POST   /api/auth/register
POST   /api/auth/login

GET    /api/users/me
PUT    /api/users/me
DELETE /api/users/me

GET    /api/jobs
GET    /api/jobs/{id}
POST   /api/jobs
PUT    /api/jobs/{id}
DELETE /api/jobs/{id}

GET    /api/companies
GET    /api/companies/{id}
POST   /api/companies
PUT    /api/companies/{id}
DELETE /api/companies/{id}

POST   /api/jobs/{jobId}/applications
GET    /api/applications/my
GET    /api/jobs/{jobId}/applications
PATCH  /api/applications/{id}/status

GET    /api/admin/users
DELETE /api/admin/users/{id}
GET    /api/admin/companies
DELETE /api/admin/companies/{id}
GET    /api/admin/jobs
DELETE /api/admin/jobs/{id}
GET    /api/admin/applications
```

## All Routes

**Public**
```
/               /jobs           /jobs/:id
/companies      /companies/:id  /about
/login          /register       /unauthorized
```

**Job Seeker** (`JOB_SEEKER` role required)
```
/seeker/dashboard   /seeker/saved-jobs   /seeker/applications
/seeker/profile     /seeker/settings
```

**Employer** (`EMPLOYER` role required)
```
/employer/dashboard   /employer/jobs        /employer/jobs/create
/employer/jobs/:id/edit   /employer/applications   /employer/company
/employer/settings
```

**Admin** (`ADMIN` role required)
```
/admin/dashboard   /admin/users   /admin/companies
/admin/jobs        /admin/applications   /admin/reports   /admin/settings
```

## Features Implemented

- Role-based auth (mock, localStorage-persisted) with protected routes and an
  Unauthorized page
- Full job search with keyword/location, filters (type, experience, work
  arrangement, category), sorting, and pagination
- Job details with save/apply flow, multi-field application modal
- Job seeker dashboard, saved jobs, applications tracker, profile with resume
  upload, skills, experience, education
- Employer dashboard, job CRUD (create/edit/delete/draft/publish), applicant
  review with status pipeline (Applied → Shortlisted → Interview →
  Accepted/Rejected), company profile
- Admin dashboard with mock charts, user management (block/unblock/delete),
  company moderation, job moderation, application oversight
- Dark mode (persisted), responsive layouts (mobile sidebars, stacked cards,
  scrollable tables), toast notifications, skeleton loaders, empty/error
  states, confirm dialogs throughout

## Known Limitations (mock-frontend stage)

- All data resets on full page reload beyond what's persisted in
  `localStorage` (current user session only) — everything else lives in
  in-memory arrays per service module.
- File uploads (resume, logos) only track the file name, not real file bytes.
- No real JWT — `authService` issues a placeholder base64 token for shape
  compatibility only.
- Charts on the admin dashboard are lightweight custom bar/donut visuals, not
  a charting library, to keep the bundle small.
