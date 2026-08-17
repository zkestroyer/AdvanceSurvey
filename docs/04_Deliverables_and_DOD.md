---
id: "doc-04"
title: "Deliverables and DOD"
status: "draft"
version: "1.0.0"
---
# Deliverables & Definition of Done (DoD)

This document explicitly defines what deliverables the client will receive at the end of the project and sets the strict criteria for what the development team considers "Done". No engineering work shall commence until this document is mutually locked and signed off.

## 1. Concrete Deliverables
List the exact assets that will be handed over to the client. Do not use ambiguous terms.
- [ ] Source Code Repository (GitHub/GitLab) with full access.
- [ ] Android APK and AAB files (Ready for Play Store).
- [ ] iOS IPA / TestFlight build.
- [ ] Deployed Production Web Application.
- [ ] Admin Portal Access with Super Admin credentials.
- [ ] Master Documentation Folder (including User Manual, Architecture, ERD).

## 2. The Definition of Done (DoD)
A feature or project is ONLY considered "Done" when all the following criteria are met:

### Technical DoD
- [ ] **Code Complete:** All features outlined in the FSD (Template 02) are fully developed.
- [ ] **Zero Critical Bugs:** No P0 or P1 bugs exist in the Issue Log (Template 18).
- [ ] **Security Scanned:** VAPT Checklist (Template 14) is completed with no high vulnerabilities.
- [ ] **Performance Verified:** Load tests passed as per Template 16.
- [ ] **CI/CD Integrated:** Automated deployment pipelines are successfully running.

### Business & QA DoD
- [ ] **QA Sign-off:** The QA team has passed all test cases (Templates 07 & 20).
- [ ] **Client Clarifications Resolved:** No pending queries exist in Template 19.
- [ ] **UAT Passed:** The client has tested the staging environment and signed the UAT Signoff (Template 08).
- [ ] **User Manual Ready:** Template 10 is updated with current screenshots and test credentials.

## 3. Exclusions (Out of Scope)
Explicitly list what is NOT being delivered (to prevent assumptions).
- (e.g., "Apple App Store publication is the client's responsibility; we only provide the IPA.")
- (e.g., "Data migration from the old legacy system is not included.")

## 4. Sign-off
- **Project Manager:** ________
- **Client Approver:** ________
- **Date Locked:** ________
