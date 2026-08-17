---
id: "doc-06"
title: "Security VAPT Checklist"
status: "draft"
version: "1.0.0"
---
# Security & Vulnerability Assessment (VAPT) Checklist

This document details the security configurations and OWASP compliance guidelines implemented in the system.

---

## 1. Web & API Security (Backend)
- [ ] **SQL Injection Prevention:** All queries must use parameterized prepared statements or a secure ORM.
- [ ] **CORS Configuration:** Middleware must restrict unauthorized cross-origin requests.
- [ ] **Route Protection:** Frontend and Backend must authenticate all private routes using JWT or session cookies.
- [ ] **Sensitive Data Exposure:** Passwords must be hashed using `bcrypt` or `Argon2`.
- [ ] **Audit Logging:** Implement non-repudiable logs for critical write operations (e.g., financial transactions, role changes).

## 2. Infrastructure & Network Security
- [ ] **Environment Variables:** No hardcoded credentials in source code. Use `.env` or Secret Managers.
- [ ] **HTTPS Enforcement:** Reverse proxy (e.g. Nginx, AWS ALB) must force TLS 1.2+.
- [ ] **Directory Traversal:** Web server must disable directory indexing.
- [ ] **DDoS Protection:** Enable Cloudflare, AWS Shield, or equivalent protection at the DNS/Network layer.
- [ ] **Regular Security Patching:** Define a monthly schedule for updating OS and runtime dependencies.

## 3. Mobile App Security
- [ ] **Local Storage Encryption:** Encrypt sensitive local data (e.g., using `flutter_secure_storage`).
- [ ] **API Endpoints:** App must communicate exclusively over HTTPS.
- [ ] **Obfuscation / Anti-Tampering:** Build release artifacts with code obfuscation flags.

## 4. Organizational & Procedural Security
- [ ] **Access Control Policies:** Strict implementation of Role-Based Access Control (RBAC).
- [ ] **Incident Response Plan:** Define steps to identify, contain, and eradicate a data breach (Refer to Disaster Recovery SOP).
- [ ] **Security Awareness Training:** Client is responsible for training users against phishing and credential sharing.
- [ ] **Third-party VAPT:** Schedule external penetration test post-launch.
