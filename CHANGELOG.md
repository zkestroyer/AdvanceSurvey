# Changelog

All notable changes to this project will be documented in this file.

## [v1.0.8] - 2026-06-26

### Changed
- **Mobile Dashboard**: Simplified dashboard by replacing abstract "KPI" metrics with simple terms ("Shops Completed Today", "Total Assigned").
- **Mobile Sync**: Replaced the small top-right sync icon with a massive, highly visible "SYNC ALL DATA TO SERVER" button to ensure field staff synchronize offline data.
- **Mobile Survey**: Simplified Survey Execution buttons from corporate terms ("Location Verification", "Proof of Visit") to plain English ("VERIFY MY LOCATION", "TAKE SHOP PHOTO").
- **Mobile UI**: Added a large green "Success" pop-up dialog box when submitting a survey to provide definitive visual confirmation to non-technical users.

## [v1.0.7] - 2026-06-25

### Changed
- **Mobile Default URL**: Hardcoded the default fallback API URL to `https://demo.bloomix.io/atsolar/api/v1` in `auth_service.dart`, `sync_engine.dart`, and `background_sync_service.dart` so the client does not need to manually configure the Settings gear upon fresh installation.

## [v1.0.6] - 2026-06-25

### Added
- **Mobile Settings**: Added a new Settings screen (accessible via the Profile and Login pages) to dynamically configure the Backend API URL (IP address) to prevent hardcoded IPs from blocking sync.
- **Backend Constraints**: Added robust `console.error` logging across all `master.routes.ts` and `survey.routes.ts` API endpoints to prevent silent failures.
- **Web Analytics**: Added dynamic array-length pagination calculation in `AnalyticsReports.tsx`.

### Changed
- **Mobile UI**: Converted the "Start" button in the `DashboardScreen` assigned shops list to use a `compact` mode to prevent visual stretching.
- **Sync Logic**: Restructured `SyncEngine.syncAll()` to enforce pushing offline/pending surveys to the backend *before* fetching history.
- **Backend Config**: Raised Express body-parser (`express.json()` and `urlencoded`) payload size limits to 50MB to gracefully handle large base64 camera image uploads.

### Fixed
- **Mobile UI**: Fixed invisible white-on-light-gray text in the `ProfileScreen` by converting it to `Colors.slate[800]`.
- **Backend Routing**: Cleared stale `.js` files from the backend compiler cache that were previously hiding the new `/submit` and `/my-history` routes and causing silent 404s.
- **Backend Check-ins**: Fixed a schema parameter mismatch (`latitude`/`longitude` vs `lat`/`lng`) that was crashing the `/checkin` endpoint.
- **Web Dashboard**: Fixed silent crashes when fetching analytics by implementing a robust `try/catch` and visual error toaster in `AnalyticsReports.tsx`.
