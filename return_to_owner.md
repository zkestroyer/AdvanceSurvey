# Project Changes Log

This file logs all new features, major bug fixes, database schema alterations, and architectural decisions made by Antigravity.

## Initial Setup
- Extracted project archive and updated environment configuration files.
- Configured frontend API base URL and mobile app API base URL to connect to local server port 4000.
- Successfully connected to local MySQL database and imported initial data dump.
- Synchronized Prisma database schema.
- Started local web application development server.

## Bug Fixes
- **Mobile Sync Engine:** Fixed a critical bug in `sync_engine.dart` and `background_sync_service.dart` where the synchronization URLs were hardcoded to an old staging server (`demo.bloomix.io`). Replaced with dynamic local IPs for proper database syncing.
- **Mobile Login Error Handling:** Fixed a bug in `auth_service.dart` where connection errors to the backend server (like timeouts or unreachable host) were failing silently and returning `null`, which `login_screen.dart` obscured with a generic "Login failed. Check credentials." message. Updated the code to throw specific connection exceptions, which are now correctly caught and displayed to the user via the `SnackBar`.
- **Remote Server Deployment:** Deployed the latest backend code to the remote server (`demo.bloomix.io`), installed dependencies, synchronized the Prisma database schema (which was missing tables and causing API crashes), and restarted the PM2 `atsolar_api` process. The demo server is now fully operational.
- **Enforced Server URL & App Build (v8):** Bumped the Flutter app's internal version to `1.0.8+8` and programmatically enforced `https://demo.bloomix.io/atsolar/api/v1` as the default API URL. Compiled a release APK split by ABI to ensure the file size remains under 25 MB. The final optimized APK (20.4 MB) was renamed to `advancetelecom_app_v8.apk` and moved to the root directory.
- **Survey Submission & History Fix (Critical):** Discovered that PM2 on the demo server runs compiled JavaScript (`.js`), not TypeScript directly. The compiled `survey.routes.js` was stale (dated June 24) and was missing the `/submit` and `/my-history` endpoints that the mobile app relies on. This caused all survey submissions to silently fail (404) and history to always return empty. Fixed by recompiling TypeScript on the server (`npx tsc`) and restarting PM2. Verified end-to-end: login → survey submit → history fetch all working. **Important for future deployments:** Always run `npx tsc` on the server after uploading new TypeScript files, before restarting PM2.

## Features
- **Dashboard & Advanced Reports Revamp:** Replaced the mock dashboard and analytics reports with real-time data integration. Implemented 12 new summary counters and dynamic charts (Surveys by Territory, Surveys by Area, Top 10 TSOs) on the Dashboard. Added a comprehensive 9-report suite (Shop Addition, TSO Performance, BDM Performance, etc.) in the Analytics section with robust cross-filtering and drill-down functionality. All endpoints were added in a revamped `analytics.routes.ts` API file.
- **Mobile Admin Dashboard:** Extended the Dashboard and Reports to the Flutter app specifically for Admins ("Heads"). Added conditional routing on login, created a new `AnalyticsService` to fetch live data from the backend, revamped the `ExecDashboardScreen` with `fl_chart` visualizations, and added a dynamic `AnalyticsReportsScreen` with bottom-sheet filtering and horizontally scrollable data tables.

## Web Portal FCRs (FCR 1-7 Implementation)
- **Architectural Constraint Adherence:** Implemented all 7 Functional Change Requests purely via Backend (Node.js/Prisma) and Frontend (React/Vite) updates. The Mobile Flutter App was strictly kept unmodified to ensure backward compatibility and prevent synchronization issues.
- **Dynamic "Other" Field (FCR #2):** Ensured the Prisma Schema and API allowed dynamically capturing "Other" products.
- **Repeatable Sections (FCR #3):** Updated `schema.prisma` to include an `isRepeatable` flag and `repeatIndex`. Modified the `SurveyBuilder.tsx` interface to allow administrators to toggle this setting and view a "REPEATABLE" badge on the canvas.
- **Edit Completed Surveys (FCR #4):** Implemented an `/admin-edit` backend endpoint in `survey.routes.ts` allowing users with Admin/Management roles to amend survey data after submission.
- **Management Portal & Comparison Reports (FCR #5 & #6):** Built `ManagementDashboard.tsx` for executives, accessible via a newly created "Executive Dashboard" sidebar link. Added `/management/dashboard` and `/management/comparison` to `analytics.routes.ts` which support Week-on-Week and Month-on-Month grouping for deep trend analysis.
- **Role Management UI Restructuring (FCR #7):** Rebuilt the permissions list in `RoleManagement.tsx` to use a tabbed interface (Mobile App, Web Admin, Management Portal) replacing the previous flat list format.
- **Brand-to-Product Mapping (FCR #1):** Developed a new "Product Mappings" tab in `MasterData.tsx` to enable users to create and manage mappings between generic Brands and specific Models directly from the UI.
- **Remote Server Deployment:** Backed up the existing production database and application code on `demo.bloomix.io` using `backup.js`, uploaded the modified web portal assets (`dist`) and backend APIs via SFTP using `deploy.js`, successfully applied Prisma schema updates, and gracefully restarted PM2.

## Executive Mobile App FSD Integration
- **Executive Mobile App FSD Integration**:
  - **Backend API Additions**: Added `UserNotification` model to Prisma schema for executive notification tracking. Created `backend/src/routes/executive.routes.ts` mounted at `/api/v1/executive` with 14 new endpoints for dashboard, reports, comparison engine, and notifications.
  - **Flutter App Overhaul**: Overhauled the Flutter app's executive experience (admin role) from a single screen to a 5-tab `ExecutiveShell`. Added 10 new Flutter screens including `ExecDashboardV2`, `SurveyReportsScreen`, `ComparisonReportsScreen`, `PriceMonitoringScreen`, and `NotificationsScreen`.
  - **Comparison Engine Finalization**: Re-architected the `/comparison` backend endpoint to support dynamic filtering of specific entities (e.g., selecting particular Brands or Territories). Updated the `ComparisonReportsScreen` in the Flutter app to fetch these entities, allow multi-selection, and push the filters to the API, completely removing hardcoded mock data.
  - **Dashboard UI Polish**: Refined the `ExecDashboardV2` Flutter UI by applying a Glassmorphism theme, introducing date filter chips, wrapping all statistics in clickable `InkWell` widgets for future drill-down capabilities, and displaying a "Shops by Territory" pie chart using `fl_chart`.
  - **Zero Breakage Strategy**: Integration was purely additive and does not break the existing TSO survey flow. Built and deployed APK `v1.0.26`.
