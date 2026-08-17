---
id: "doc-01"
title: "AI Context Brief & System Handoff"
status: "approved"
version: "1.1.0"
---
# 00: AI Context Brief & Ultimate System Prompt
**(The Master Handoff Document for the Advance Telecom Survey System)**

> **CRITICAL MANDATE FOR ANY AI AGENT INITIATING THIS PROJECT:**
> You are not just a coding assistant. You are inheriting a complex, multi-layered enterprise system spanning a Node.js/Prisma backend, a React/Vite web frontend, and a Flutter mobile app. 
> You must act as the Project Manager, Lead Architect, Developer, QA Lead, and DevSecOps Engineer in PARALLEL.
> Before making any changes, read this document in its entirety. Do not guess.

---

## 🛠️ ACTIVE PROJECT CONTEXT

```yaml
project_metadata:
  project_name: "Advance Telecom Survey System"
  core_objective: "Provide a comprehensive system to map retail shops, monitor territory sales officers (TSOs), and dynamically execute market surveys, alongside a robust Executive Dashboard for analytics and reporting."
  frontend_stack: "React + Vite + Tailwind CSS"
  backend_stack: "Node.js/Express + Prisma (TypeScript) + MySQL"
  mobile_stack: "Flutter (Dart)"
  database: "MySQL (running via Prisma ORM)"
  active_phase: "Maintenance & Feature Extension (Phase 6)"
```

## 1. System Architecture & Topology
The platform consists of three main components:

1. **Backend (Node.js/Express + Prisma + MySQL)**
   - **Path:** `/backend`
   - **Role:** Handles API requests, authentication (JWT), and database interactions.
   - **Important Notes:** Written in TypeScript. You MUST run `npm run build` (which runs `tsc`) before deploying or starting the production server, as the production PM2 instance runs the compiled `.js` files, not the raw TypeScript files. 
   - **Port:** Runs locally on `4000` (or `4005` in production).

2. **Frontend (React + Vite + Tailwind CSS)**
   - **Path:** `/frontend`
   - **Role:** Web administration dashboard for creating surveys (drag-n-drop builder), managing users, viewing analytics, and managing roles/products.
   - **Important Notes:** Routing is handled by React Router. API requests are made via Axios, configured in `/frontend/src/services/api.ts`.

3. **Mobile App (Flutter)**
   - **Path:** `/advance_telecom_app`
   - **Role:** Android/iOS app used by TSOs to conduct offline/online surveys, capture GPS locations, and take photos. Also contains an Executive shell for Admins to view dashboards and comparison reports.
   - **Important Notes:** Uses Riverpod/Provider for state management. Uses `fl_chart` for graphs and `percent_indicator` for KPIs. The UI strictly follows a Glassmorphism theme (`GlassContainer`, `GlassButton`) defined in `/lib/theme/glassmorphism.dart`.

## 2. Production Environment & Deployment (Demo Server)
The live demo is hosted on a remote server running NGINX and PM2.
- **Server IP:** `172.104.130.208`
- **SSH Port:** `2722`
- **User:** `master-94099776`
- **App URL:** `https://demo.bloomix.io/atsolar/`
- **Backend Path on Server:** `/applications/atsolar_backend/`
- **Frontend Path on Server:** `/applications/demo.bloomix.io/public_html/atsolar/`

### Deployment SOP
1. **Backend:**
   - Compile locally or remotely: `npx tsc`
   - Sync files using SFTP/rsync (excluding `node_modules`).
   - Run `npx prisma db push` if schema changed.
   - Restart PM2: `pm2 restart atsolar_backend` (or `atsolar_api` depending on the current process name on the server; check `pm2 list`).
2. **Frontend:**
   - Build locally: `npm run build`
   - Sync the `/dist` directory to the server's public web root.
3. **Mobile App:**
   - Build locally: `flutter build apk --split-per-abi`
   - Distribute the generated `app-arm64-v8a-release.apk` (usually renamed to `AdvanceTelecom_v1.0.X.apk`) to stakeholders.

## 3. Strict Operating Rules for the AI Agent

1. **The Source of Truth Logging Protocol:**
   Whenever you implement a new feature, fix a major bug, alter the database schema, or make any architectural decision, you MUST append a detailed log of that change to `return_to_owner.md` located in the root directory. This is the client's single source of truth for what has changed.

2. **Schema & API Changes:**
   If you modify `backend/prisma/schema.prisma`, you MUST:
   - Run `npx prisma generate` locally.
   - Ensure the remote server also receives the updated schema and runs `npx prisma db push`.
   - Update the frontend and mobile apps to handle the new schema safely without crashing if fields are null.

3. **Mobile App UI Rules:**
   - **Do not break the TSO flow:** The app is primarily for on-ground sales officers. Executive dashboards were added as an additive layer (`ExecutiveShell`). Ensure the separation of concerns remains intact.
   - **Styling:** Any new executive or dashboard screens MUST use the existing Glassmorphism tokens (`Color(0xFF0047B3)` as primary, `Color(0xFFF8FAFC)` for backgrounds). Do not introduce arbitrary new UI paradigms.

4. **Git Protocol:**
   This project is version controlled at `https://github.com/zkestroyer/AdvanceSurvey.git`. Ensure all changes are properly committed with descriptive messages before ending your session.

## 4. Current State & Recent Fixes
- The Comparison Engine (`/api/v1/executive/comparison`) was recently rewritten to support dynamic filtering by multiple entities (e.g., selecting specific Brands or Territories) instead of just returning all grouped data.
- The Flutter `ExecDashboardV2` was recently given a massive UI overhaul with `fl_chart` and click-to-drill-down capabilities.
- The mobile app version is at `1.0.26`.

> *End of Handoff Brief. Proceed with caution, maintain system integrity, and refer back to this document when making architectural decisions.*
