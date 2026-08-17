---
id: "doc-22"
title: "Deployment SOP"
status: "draft"
version: "1.0.0"
---
# Standard Operating Procedure: Deployment

This document outlines the standard deployment procedures for the software ecosystem.

---

## 1. Environment Details
- **Production Server IP / Domain:** [e.g. bloomix.io]
- **Application Path:** [e.g. /var/www/html/app]
- **Runtime Environment:** [e.g. Node.js v18, PHP 8]
- **Database:** [e.g. MySQL, PostgreSQL, SQLite]

## 2. Version Control Practices
- All deployments MUST originate from the `main` branch.
- Feature branches (`feature/xxx`) are tested locally before being merged.
- A Git tag (e.g., `v1.2.0`) is created for every production release.

## 3. Pre-Deployment Checklist
- [ ] All features merged to `main` branch.
- [ ] Environment variables (`.env`) checked and validated.
- [ ] Automated tests passed.
- [ ] Assets built/minified.

## 4. Backend Deployment 
[Describe exact steps, scripts, or CI/CD pipelines used to deploy the backend code. e.g. Git pull, PM2 restart, Docker compose up.]

## 5. Frontend Deployment 
[Describe exact steps to deploy the web interface. e.g. Build process, syncing dist folder to Nginx root.]

## 6. Mobile App Deployment 
[Describe how APK/IPA builds are generated and distributed via Play Store, App Store, or direct APK.]

## 7. Rollback Procedures
- **Backend Rollback:** [How to revert a backend crash. e.g. Revert git commit and restart PM2.]
- **Frontend Rollback:** [How to revert a UI crash.]
- **Database Rollback:** Refer to `26_Disaster_Recovery_Incident_Plan.md`.

## 8. Post-Deployment Validation Steps
- [ ] Run smoke tests / E2E tests.
- [ ] Log in manually to verify auth.
- [ ] Verify core workflows are operational.

## 9. Security Considerations
- **Credentials:** No deployment scripts containing passwords or keys should be committed to public repos.
- **Environment Variables:** `.env` files must not be tracked in version control.

## 10. Contact Information for Deployment Team
- **Lead DevOps:** [Name/Contact]
- **Product Owner:** [Name/Contact]
