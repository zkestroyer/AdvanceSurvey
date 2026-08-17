# Advance Telecom Survey System - Handover Documentation

Welcome to the **Advance Telecom Survey System**. This document outlines the technical architecture, setup process, and deployment flow so you can continue building and maintaining the project smoothly.

## 1. System Architecture
The platform is a comprehensive system designed to map retail shops, monitor territory sales officers (TSOs), and dynamically execute market surveys. It consists of three main components:

1. **Backend (Node.js/Express + Prisma + MySQL)**
   - **Path:** `/backend`
   - **Role:** Handles API requests, authentication (JWT), and database interactions.
   - **Port:** Runs locally on `4000` (or `4005` in production).

2. **Frontend (React + Vite + Tailwind CSS)**
   - **Path:** `/frontend`
   - **Role:** Web administration dashboard for creating surveys (drag-n-drop builder), managing users, and viewing analytics.
   - **Key Features:** Uses a unified UI system, dynamic rendering for surveys, and Axios for API requests.

3. **Mobile App (Flutter)**
   - **Path:** `/advance_telecom_app`
   - **Role:** Android/iOS app used by TSOs to conduct offline/online surveys, capture GPS locations, and take photos.

---

## 2. Local Environment Setup

### 2.1 Database Setup
1. Open your local MySQL server (via MAMP, XAMPP, or native).
2. Create a new database named `atsolar_db`.
3. Import the provided `db_dump.sql` file into `atsolar_db` to restore the latest data.
   ```bash
   mysql -u root -p atsolar_db < db_dump.sql
   ```

### 2.2 Backend Setup
1. Navigate to `/backend`.
2. Run `npm install`.
3. Create a `.env` file (or update the existing one) with:
   ```env
   DATABASE_URL="mysql://root:root@localhost:3306/atsolar_db"
   JWT_SECRET="advance_telecom_super_secret_key_2023"
   PORT=4000
   ```
4. Run migrations/schema sync: `npx prisma db push`.
5. Start the server: `npm run dev`.

### 2.3 Frontend Setup
1. Navigate to `/frontend`.
2. Run `npm install`.
3. In `/frontend/src/services/api.ts`, change the `baseURL` to point to your local backend if developing locally:
   ```typescript
   // Local:
   baseURL: 'http://localhost:4000/api/v1'
   
   // Production:
   // baseURL: 'https://demo.bloomix.io/atsolar/api/v1'
   ```
4. Start the frontend: `npm run dev`.

### 2.4 Mobile App (Flutter)
1. Navigate to `/advance_telecom_app`.
2. Run `flutter pub get`.
3. Update the API `baseUrl` in `/lib/services/auth_service.dart` (and other services if applicable) to point to your local machine's IP address (e.g., `http://192.168.1.X:4000/api/v1`) or keep it pointing to production.
4. Run on a device/emulator: `flutter run`.

---

## 3. Demo Server Deployment Guide (`demo.bloomix.io`)

The live demo is hosted on a remote server running NGINX and PM2. 
- **Server IP:** `172.104.130.208`
- **SSH Port:** `2722`
- **User:** `master-94099776`
- **App URL:** `https://demo.bloomix.io/atsolar/`

### 3.1 Deploying the Backend
If you make changes to the Node.js backend:
1. Sync files to the server:
   ```bash
   rsync -avz --exclude 'node_modules' -e "ssh -p 2722" backend/ master-94099776@172.104.130.208:/applications/atsolar_backend/
   ```
2. Restart the PM2 process on the server:
   ```bash
   ssh -p 2722 master-94099776@172.104.130.208 "cd /applications/atsolar_backend && npm install && npx prisma db push && pm2 restart atsolar_api"
   ```

### 3.2 Deploying the Frontend
If you make changes to the React web app:
1. Build the production files:
   ```bash
   cd frontend
   npm run build
   ```
2. Sync the `dist` folder directly to the public web root:
   ```bash
   rsync -avz -e "ssh -p 2722" dist/ master-94099776@172.104.130.208:/applications/demo.bloomix.io/public_html/atsolar/
   ```
*Note: The `.htaccess` file in the web root automatically handles React Routing and proxies `/api/` traffic to the backend running on port 4005.*

---

## 4. Antigravity AI Prompt

When you hand this project over to your Antigravity (AI assistant), please provide it with the zip file and the following strict instruction prompt.

```text
Hello Antigravity, I am taking over the "Advance Telecom Survey System" project. 
Please extract the provided ZIP file and review the "Project_System_Details.md" file to understand the architecture.

CRITICAL INSTRUCTIONS FOR YOU:
1. Setup the project locally for me according to the instructions.
2. We need to maintain a file named `return_to_owner.md` in the root directory. Whenever you implement a new feature, fix a major bug, alter the database schema, or make any architectural decision, you MUST append a detailed log of that change to `return_to_owner.md`. This is critical so that when I hand this project back to the original owner, they can read this single file to understand exactly what was changed and why.
3. Keep your code clean, modular, and always ensure the mobile app API URLs sync with the backend correctly.
```

Good luck and happy coding!
