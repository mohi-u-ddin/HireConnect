# HIREFLOW — Backend Design Document

Version: 1.0  
Date: 2026-08-28

A comprehensive technical blueprint for the HireFlow backend: entities, services, APIs, security, validation, and deployment/testing guidance.

---

## Table of Contents

- [1. Project Overview](#1-project-overview)  
- [2. Technology Stack](#2-technology-stack)  
- [3. Backend Architecture](#3-backend-architecture)  
- [4. Package Structure](#4-package-structure)  
- [5. Entity Design](#5-entity-design)  
  - [5.1 User](#51-user)  
  - [5.2 Company](#52-company)  
  - [5.3 Job](#53-job)  
  - [5.4 JobApplication](#54-jobapplication)  
- [6. Enum Design](#6-enum-design)  
- [7. Entity Relationships](#7-entity-relationships)  
- [8. Repository Design](#8-repository-design)  
  - [8.1 UserRepository](#81-userrepository)  
  - [8.2 CompanyRepository](#82-companyrepository)  
  - [8.3 JobRepository](#83-jobrepository)  
  - [8.4 JobApplicationRepository](#84-jobapplicationrepository)  
- [9. DTO Design](#9-dto-design)  
- [10. Service Design](#10-service-design)  
- [11. Controller / REST API Specification](#11-controller--rest-api-specification)  
- [12. REST API Summary Table](#12-rest-api-summary-table)  
- [13. Security Design](#13-security-design)  
  - [13.1 JWT Design](#131-jwt-design)  
  - [13.2 Role-Based Access Control (RBAC)](#132-role-based-access-control-rbac)  
- [14. Ownership & Authorization Rules](#14-ownership--authorization-rules)  
- [15. Validation Rules](#15-validation-rules)  
- [16. Business Rules](#16-business-rules)  
- [17. Exception Handling & Error Responses](#17-exception-handling--error-responses)  
- [18. HTTP Status Codes](#18-http-status-codes)  
- [19. Pagination & Filtering](#19-pagination--filtering)  
- [20. Database Constraints](#20-database-constraints)  
- [21. Data Flow (Common Flows)](#21-data-flow-common-flows)  
- [22. Frontend Integration Plan](#22-frontend-integration-plan)  
- [23. Postman Testing Plan](#23-postman-testing-plan)  
- [24. Development Phases](#24-development-phases)  
- [25. Final Architecture Diagram](#25-final-architecture-diagram)  
- [26. Final Backend Implementation Checklist](#26-final-backend-implementation-checklist)

---

## 1. Project Overview

HireFlow is a job recruitment platform connecting job seekers and employers. Primary roles:
- JOB_SEEKER: search & apply
- EMPLOYER: create companies, post jobs, manage applications
- ADMIN: platform management

This document is the backend technical blueprint for implementing the HireFlow API and services.

---

## 2. Technology Stack

- Language: Java  
- Framework: Spring Boot  
- Web Layer: Spring MVC / Spring REST  
- Data Access: Spring Data JPA, Hibernate  
- Database: PostgreSQL  
- Security: Spring Security, JWT, BCrypt password hashing  
- Validation: Jakarta Bean Validation (Hibernate Validator)

---

## 3. Backend Architecture

Multi-tier architecture:
1. Controller Layer — HTTP endpoints, maps DTOs to services.
2. Service Layer — business logic, authorization, transactional boundaries.
3. Repository Layer — Spring Data JPA interfaces.
4. Database Layer — PostgreSQL.

Key rule: Controllers return DTOs only. JPA entities remain internal to service/repository layers.

---

## 4. Package Structure

Recommend the following logical packages:

- config — Security, CORS, application configuration  
- controller — REST controllers and route mappings  
- dto — Request and Response DTOs  
- entity — JPA entities and mappings  
- enums — Domain enums (Role, JobStatus, etc.)  
- exception — Custom exceptions & global handler  
- repository — Spring Data JPA repositories  
- security — JWT utils, filters, UserDetails impls  
- service — Interfaces and implementations for business logic

---

## 5. Entity Design

All timestamps use LocalDateTime (TIMESTAMP in DB). Primary keys are Long (BIGINT).

### 5.1 User

| Field | Java Type | DB Type | Required | Unique | Notes |
| --- | --- | ---:| ---:| ---:| --- |
| id | Long | BIGINT | Yes | Yes | PK |
| name | String | VARCHAR(100) | Yes | No | Full name |
| email | String | VARCHAR(255) | Yes | Yes | Login email |
| password | String | VARCHAR(255) | Yes | No | BCrypt hashed; never returned in DTOs |
| role | Role | VARCHAR(20) | Yes | No | Authorization |
| phone | String | VARCHAR(20) | No | No | Contact |
| location | String | VARCHAR(100) | No | No | City/State/Country |
| profileImage | String | VARCHAR(255) | No | No | URL |
| headline | String | VARCHAR(150) | No | No | Short headline |
| about | String | TEXT | No | No | Bio |
| resumeUrl | String | VARCHAR(255) | No | No | Default resume |
| enabled | Boolean | BOOLEAN | Yes | No | Default true |
| createdAt | LocalDateTime | TIMESTAMP | Yes | No | Creation time |
| updatedAt | LocalDateTime | TIMESTAMP | Yes | No | Last update time |

---

### 5.2 Company

| Field | Java Type | DB Type | Required | Unique | Notes |
| --- | --- | ---:| ---:| ---:| --- |
| id | Long | BIGINT | Yes | Yes | PK |
| name | String | VARCHAR(150) | Yes | Yes | Company name |
| description | String | TEXT | Yes | No | Company overview |
| website | String | VARCHAR(255) | No | No | URL |
| logoUrl | String | VARCHAR(255) | No | No | Logo URL |
| industry | String | VARCHAR(100) | Yes | No | e.g., Technology |
| companySize | String | VARCHAR(50) | No | No | e.g., "1-10" |
| location | String | VARCHAR(150) | Yes | No | HQ |
| foundedYear | Integer | INTEGER | No | No | Year |
| employer | User | BIGINT (FK) | Yes | Yes | OneToOne: employer → company |

Note: Unique constraint on employer_id enforces 1:1.

---

### 5.3 Job

| Field | Java Type | DB Type | Required | Unique | Notes |
| --- | --- | ---:| ---:| ---:| --- |
| id | Long | BIGINT | Yes | Yes | PK |
| title | String | VARCHAR(150) | Yes | No | Job title |
| description | String | TEXT | Yes | No | Full description |
| responsibilities | String | TEXT | Yes | No | Duties |
| requirements | String | TEXT | Yes | No | Qualifications |
| salaryMin | BigDecimal | DECIMAL(10,2) | No | No | Minimum salary |
| salaryMax | BigDecimal | DECIMAL(10,2) | No | No | Maximum salary |
| currency | String | VARCHAR(3) | No | No | ISO code |
| location | String | VARCHAR(150) | Yes | No | Location / remote |
| category | String | VARCHAR(100) | Yes | No | Function |
| employmentType | EmploymentType | VARCHAR(30) | Yes | No | FULL_TIME, etc. |
| experienceLevel | ExperienceLevel | VARCHAR(30) | Yes | No | ENTRY_LEVEL, etc. |
| workArrangement | WorkArrangement | VARCHAR(30) | Yes | No | REMOTE, HYBRID, ON_SITE |
| status | JobStatus | VARCHAR(20) | Yes | No | DRAFT, ACTIVE, CLOSED |
| applicationDeadline | LocalDate | DATE | No | No | Last apply date |
| createdAt | LocalDateTime | TIMESTAMP | Yes | No | Creation |
| updatedAt | LocalDateTime | TIMESTAMP | Yes | No | Last update |
| company | Company | BIGINT (FK) | Yes | No | Company owning job |
| createdBy | User | BIGINT (FK) | Yes | No | Employer who posted |

Indexes recommended on status, location, category.

---

### 5.4 JobApplication

| Field | Java Type | DB Type | Required | Unique | Notes |
| --- | --- | ---:| ---:| ---:| --- |
| id | Long | BIGINT | Yes | Yes | PK |
| job | Job | BIGINT (FK) | Yes | — | FK to job |
| applicant | User | BIGINT (FK) | Yes | — | FK to user |
| resumeUrl | String | VARCHAR(255) | Yes | No | Resume used in the application |
| coverLetter | String | TEXT | No | No | Optional |
| portfolioUrl | String | VARCHAR(255) | No | No | External portfolio |
| linkedInUrl | String | VARCHAR(255) | No | No | LinkedIn profile |
| status | ApplicationStatus | VARCHAR(30) | Yes | No | APPLIED / SHORTLISTED / ... |
| appliedAt | LocalDateTime | TIMESTAMP | Yes | No | Submission time |
| updatedAt | LocalDateTime | TIMESTAMP | Yes | No | Last status update |

Composite UNIQUE: (job_id, applicant_id) — prevents duplicate applications.

---

## 6. Enum Design

- Role: JOB_SEEKER, EMPLOYER, ADMIN  
- JobStatus: DRAFT, ACTIVE, CLOSED  
- EmploymentType: FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, FREELANCE  
- ExperienceLevel: ENTRY_LEVEL, MID_LEVEL, SENIOR_LEVEL, LEAD  
- WorkArrangement: REMOTE, HYBRID, ON_SITE  
- ApplicationStatus: APPLIED, SHORTLISTED, INTERVIEW, ACCEPTED, REJECTED

Use enums in Java and persist as VARCHAR in DB for readability.

---

## 7. Entity Relationships

- User (EMPLOYER) 1 — 0..1 Company (One employer can own at most one company)  
- User (EMPLOYER) 1 — * Job (Employer creates many jobs)  
- Company 1 — * Job (Company has many job postings)  
- User (JOB_SEEKER) 1 — * JobApplication (Seeker can submit many applications)  
- Job 1 — * JobApplication (Job may receive many applications)

ER Diagram (ASCII):

```text
      User (EMPLOYER)
       |           \
     1 |            \ 1
       |             \
  0..1 |              \ *
    Company            Job
       |                |
     1 |                | 1
       |                |
     * |                | *
      Job         JobApplication
                        |
                        | *
                        |
                        | 1
                      User (JOB_SEEKER)