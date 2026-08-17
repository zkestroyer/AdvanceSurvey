# Advance Telecom Solar - Deployment & Hosting Guidelines

This document provides a comprehensive guide for deploying, hosting, and maintaining the backend API, web portal, and mobile application for the ATSolar project.

## Server Infrastructure

The application is hosted on a Linux VPS.
- **Host / IP Address**: `172.104.130.208` (demo.bloomix.io)
- **SSH Username**: `master-94099776`
- **SSH Port**: `2722`
- **Database**: MySQL (`atsolar_db`)

> [!IMPORTANT]
> The database name must strictly remain **`atsolar_db`** across all configuration files and Prisma schemas. Do not change this to prevent sync failures.

---

## 1. Backend (API) Deployment

The backend is built with Node.js, Express, and Prisma ORM, and written in TypeScript. It is managed by `pm2`.

**Location on Server:** `/applications/atsolar_backend`

### Step-by-Step Backend Update Process
Whenever you make changes to the backend code (e.g., adding routes, updating logic), you must compile the TypeScript code before restarting the server.

1. **Upload Changes:** Transfer your updated `.ts` files to the server using SFTP or Git.
2. **Compile TypeScript:**
   ```bash
   cd /applications/atsolar_backend
   npx tsc
   ```
   > [!WARNING]
   > Skipping the `npx tsc` step is the most common cause of "missing endpoints" or 404 errors, as `pm2` runs the compiled `.js` files, not the raw `.ts` files.
3. **Apply Database Changes (If schema changed):**
   ```bash
   npx prisma db push --accept-data-loss
   ```
4. **Restart PM2:**
   ```bash
   pm2 restart atsolar_api
   ```

---

## 2. Web Portal (Frontend) Deployment

The frontend is a React application built with Vite.

**Location on Server:** `/applications/atsolar_frontend` (This directory serves the production `dist` files).

### Step-by-Step Frontend Update Process
1. **Build Locally:** On your development machine, navigate to the frontend directory and build the production bundle:
   ```bash
   cd frontend
   npm install
   npm run build
   ```
2. **Upload Build:** Copy the contents of the newly generated `dist` folder to the server.
3. **Deploy:** Replace the files inside `/applications/atsolar_frontend` on the server with the new files. No PM2 restart is required for the frontend as it is served statically by NGINX.

---

## 3. Mobile App (APK) Build & Deployment

The mobile app is built using Flutter and relies heavily on offline-first capabilities.

### API Configuration
Before building, ensure the API URL is correctly set to point to the production server.
- **Endpoint:** `https://demo.bloomix.io/atsolar/api/v1`

### APK Size Constraints
> [!IMPORTANT]
> The final APK size must **not exceed 25 MB** as requested by management. 

To ensure the APK remains under 25 MB:
1. Run `flutter clean` before building.
2. Use the `--split-per-abi` flag to generate smaller, architecture-specific APKs.
3. Build command:
   ```bash
   flutter build apk --release --split-per-abi
   ```
4. The generated APKs will be located in `build/app/outputs/flutter-apk/`. Distribute the `app-armeabi-v7a-release.apk` or `app-arm64-v8a-release.apk` to users.

---

## 4. Troubleshooting & Maintenance

### Checking Server Logs
If the mobile app is failing to sync surveys, check the backend logs using PM2:
```bash
pm2 logs atsolar_api
```

### Database Verification
If you need to verify database integrity or check the active survey schema:
```bash
mysql -u master-94099776 -p atsolar_db
```
(Password: `cJjuiLp3NFMXiJh0xqeOe`)

### Default Survey Templates
The default survey forms (including Solar Panels, Inverters, Lithium Batteries, and ESS data from the master Excel sheet) have been pre-seeded into the database under Template ID 9 (`Market Visit Survey (Updated)`). 
- If changes are needed, use the **Survey Builder** in the web portal to safely edit or delete the survey. 
- The backend fully supports cascading deletions, ensuring no orphaned responses are left behind when a survey is deleted.
