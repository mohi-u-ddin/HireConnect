# HireConnect - Job Recruitment Platform

HireConnect is a modern, full-stack recruitment and applicant tracking platform connecting job seekers, employers, and administrators. Built with a robust Spring Boot backend, a modern React + TypeScript frontend, and PostgreSQL for persistent storage.

---

##  Features

- **Authentication & Security**:
  - Stateless JWT-based authentication (HMAC-SHA256).
  - Role-Based Access Control (RBAC): `JOB_SEEKER`, `EMPLOYER`, and `ADMIN`.
  - Secure BCrypt password hashing and CORS configuration.

- **Job Seekers**:
  - Browse and search jobs with dynamic multi-criteria filters (keyword, location, category, employment type, salary range).
  - Submit applications with resume URLs and cover letters.
  - Track submitted applications and application statuses (`APPLIED`, `SHORTLISTED`, `INTERVIEW`, `ACCEPTED`, `REJECTED`).
  - Manage user profile details.

- **Employers**:
  - Create and manage company profile.
  - Post, update, and manage job listings.
  - Review candidate applications and move applicants through the recruitment pipeline.

- **Administrators**:
  - Oversee users and platform statistics.
  - Activate or deactivate accounts.

---

##  Technology Stack

### Backend
- **Language**: Java 21
- **Framework**: Spring Boot 4.x
- **Security**: Spring Security & JJWT
- **Persistence**: Spring Data JPA / Hibernate
- **Database**: PostgreSQL (Production) / H2 (Testing)
- **Validation**: Jakarta Bean Validation

### Frontend
- **Framework**: React 19 with TypeScript
- **Tooling**: Vite, PostCSS, Tailwind CSS
- **Routing**: React Router
- **Icons**: Lucide React

---

##  Project Structure

```text
HireConnect/
├── HireConnect_Backend/         # Spring Boot backend application
│   ├── src/main/java/           # Application source code
│   │   └── com/mohiuddin/HireConnect/
│   │       ├── Config/          # Security, CORS & Web configurations
│   │       ├── Controller/      # REST API Controllers
│   │       ├── Exceptions/      # Global exception handling
│   │       ├── Model/           # Entities, DTOs & Enums
│   │       ├── Repository/      # Spring Data JPA repositories
│   │       ├── Security/        # JWT filter & authentication services
│   │       └── Service/         # Business logic layer
│   ├── src/main/resources/      # Application properties
│   └── pom.xml                  # Maven dependencies
├── HireConnect_Frontend/        # React + TypeScript frontend
│   ├── src/                     # React components, pages, hooks, services
│   ├── package.json             # Frontend dependencies & scripts
│   └── vite.config.ts           # Vite configuration
└── README.md                    # Project documentation
```

---

##  Getting Started

### Prerequisites
- **JDK 21** or later
- **Node.js 18+** & npm
- **PostgreSQL 14+**

---

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd HireConnect_Backend
   ```

2. Configure environment variables:
   Copy `.env.example` to `.env` or set system environment variables:
   ```bash
   cp .env.example .env
   ```
   Configure your database credentials and secret key:
   ```env
   DB_URL=jdbc:postgresql://localhost:5432/hireconnect
   DB_USERNAME=postgres
   DB_PASSWORD=your_database_password
   JWT_SECRET=your_jwt_secret_key_minimum_32_bytes_long
   JWT_EXPIRATION=86400000
   CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

3. Build and run the backend:
   ```bash
   ./mvnw clean spring-boot:run
   ```
   The backend API will run on `http://localhost:8080`.

---

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd HireConnect_Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (optional):
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`.

---

##  REST API Endpoints Overview

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new Job Seeker or Employer |
| `POST` | `/api/auth/login` | Public | Authenticate and obtain JWT token |
| `PUT` | `/api/auth/change-password` | Authenticated | Change user password |
| `GET` | `/api/users/me` | Authenticated | Get current user profile |
| `PUT` | `/api/users/me` | Authenticated | Update user profile |
| `GET` | `/api/jobs` | Public | Search and filter active jobs |
| `GET` | `/api/jobs/{id}` | Public | Get job details |
| `POST` | `/api/jobs` | Employer | Post a new job |
| `PUT` | `/api/jobs/{id}` | Employer | Update job posting |
| `PATCH` | `/api/jobs/{id}/status` | Employer | Update job status |
| `DELETE` | `/api/jobs/{id}` | Employer / Admin | Delete job |
| `POST` | `/api/companies` | Employer | Create company profile |
| `GET` | `/api/companies/{id}` | Public | Get company details |
| `POST` | `/api/applications` | Job Seeker | Submit job application |
| `GET` | `/api/applications/my` | Job Seeker | Get applicant's applications |
| `GET` | `/api/jobs/{jobId}/applications` | Employer | View applicants for job |
| `PATCH` | `/api/applications/{id}/status` | Employer | Update application status |
| `GET` | `/api/admin/users` | Admin | Get paginated users directory |
| `PATCH` | `/api/admin/users/{id}/status` | Admin | Enable/disable user account |
| `GET` | `/api/admin/stats` | Admin | View platform statistics |

---

##  Security Best Practices
- Sensitive configurations (passwords, tokens, database credentials) are externalized via environment variables and excluded from source control.
- Passwords are encrypted using BCrypt.
- All secured routes require a valid JWT Bearer token in the `Authorization` header.
