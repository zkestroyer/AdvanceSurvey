---
id: "doc-05"
title: "Master Engineering Guidelines"
status: "draft"
version: "1.0.0"
---
# Master Engineering & Coding Guidelines

This document serves as the single source of truth for coding standards and engineering principles used across the ecosystem.

---

## 1. Backend Architecture
- **Framework:** [e.g., Node.js / Express.js]
- **Database:** [e.g., SQLite3, PostgreSQL]
- **API Routing:** RESTful standards (or GraphQL).
- **Code Style:** [e.g., ES6 Syntax, async/await preferred, camelCase variables.]

## 2. Web Frontend Architecture
- **Framework:** [e.g., React 18 with Vite]
- **Styling:** [e.g., Vanilla CSS with CSS Variables / TailwindCSS]
- **Component Pattern:** [e.g., Functional components with Hooks]
- **State Management:** [e.g., Redux, Context API, Local State]

## 3. Mobile App Architecture
- **Framework:** [e.g., Flutter / React Native]
- **State Management:** [e.g., Provider, BLoC]
- **UI Toolkit:** [e.g., Material 3]
- **Data Persistence:** [e.g., sqflite for offline capabilities]

## 4. Source Control & Branching Strategy
- **Version Control:** Git.
- **Branching Strategy:** [e.g., Git Flow. `feature/` branches merging into `develop`, then `main`.]
- **Commits:** Use descriptive commit messages following Conventional Commits.

## 5. Code Review Standards
- **Pull Requests:** PRs must be reviewed by the Lead Developer.
- **Checklist:** [e.g., No hardcoded colors, 80% test coverage, parameterized queries.]

## 6. Deployment Procedures & CI/CD
- **Deployment Strategy:** [e.g., Blue/Green, Rolling updates.]
- **CI/CD:** [e.g., GitHub Actions, Jenkins, Bash deployment scripts.]
- **Process Manager:** [e.g., PM2, Docker containers.]

## 7. Security Best Practices
- **Injection Prevention:** Strict usage of parameterized prepared statements or ORM validation.
- **Network Security:** Nginx reverse proxy forces HTTPS. CORS policies explicitly defined.
- **Data Exposure:** Passwords hashed with `bcrypt`. JWT tokens stored in HttpOnly cookies where applicable.

## 8. Performance Metrics and Optimization
- **Web App:** Target Google Lighthouse score > 90. Lazy load routes.
- **Backend:** Target API response times < 200ms. Database indexes created on heavily queried foreign keys.
- **Mobile:** Image assets compressed. Main UI thread must not be blocked by heavy computations.

## 9. Error Handling and Logging Practices
- **Backend:** Wrap all API route logic in `try-catch` blocks. Standardized JSON error payloads.
- **Frontend:** Implement Error Boundaries. Global Axios interceptors to handle 401s.
- **Logging:** [e.g., Winston/Morgan for API logs, Sentry for frontend crash reporting.]

## 10. API Documentation Standards
- **Standard:** All endpoints MUST be documented in `09_API_Contract_and_Endpoints.md`.
- **Format:** Must include Endpoint Route, Method, Request Payload, Success Response JSON, and Error Response JSON. Backend code must strictly adhere to the contract.

## 11. Enterprise Database Design Standards
- **Soft Deletes & Archiving:** Hard deletions (`DELETE FROM`) are strictly forbidden for business entities. Always use a `deleted_at` timestamp. Historical/inactive data must be systematically moved to `_archive` tables via cron jobs or triggers to prevent primary table bloat.
- **Mandatory Audit Logs:** Every database design MUST include dedicated logging tables (e.g., `system_logs`, `api_logs`, `audit_trail`). You must track "who changed what, and when" for sensitive actions.
- **UUIDs over Auto-Increment:** Use `UUIDv4` or `ULID` as primary keys for distributed systems and to prevent ID-guessing (IDOR) vulnerabilities.
- **Strict Indexing:** Foreign keys and frequently queried columns MUST be explicitly indexed in the schema.
