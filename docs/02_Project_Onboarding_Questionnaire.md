---
id: "doc-02"
title: "Project Onboarding Questionnaire"
status: "draft"
version: "1.0.0"
---
# 01: Project Onboarding Questionnaire & Tech Gateway

> **CRITICAL RULE:** Development (even database design) will NOT begin until Part A is 100% completed by the Business/Sales Team and Part B is completed by the Tech Team (Maani & Antigravity).

---

## PART A: Business & Sales Questionnaire
*(To be filled by the Sales Team in consultation with the Client)*

### 1. General Overview & Metadata (Machine Readable)
```yaml
project_metadata:
  project_name: ""
  client_name: ""
  core_objective: ""
```

### 2. Target Audience & Platforms
- **Who will use this?** *(e.g., General Public, Internal Staff, B2B Vendors)*
- **Which platforms are required?**
  - [ ] Web Application (Desktop & Mobile Browser)
  - [ ] iOS App (Apple App Store)
  - [ ] Android App (Google Play Store)

### 3. User Roles & Features
- **List all User Roles:** *(e.g., Super Admin, Delivery Boy, Customer, Manager)*
- **What are the top 3 absolute "Must-Have" features?** 
  1. 
  2. 
  3. 

### 4. Project Scope & Limitations
- **In Scope:** *(e.g., Custom Web Dashboard, iOS app, Node API)*
- **Out of Scope (Limitations):** *(e.g., No public e-commerce store, no accounting integration)*

### 5. Design & Brand Assets
- **Do we have a Brand Book?** *(Logo, exact Color Codes, Fonts)* [ ] Yes [ ] No
- **Competitor References:** *(Provide 2 links to apps/websites the client likes)*

### 6. Third-Party Integrations & Accounts
*Does the system need to connect to outside services? If yes, the client must provide accounts/keys before development.*
- [ ] Payment Gateway (Stripe, PayPal, Local Banks)
- [ ] SMS OTP (Twilio, local provider)
- [ ] Maps/Location (Google Maps API)
- [ ] Push Notifications (Firebase)
- [ ] Apple Developer / Google Play Console Accounts (For Mobile)

### 7. Scalability & Expected Traffic
*Helps the engineering team decide server infrastructure and code architecture.*
- **Expected Daily Active Users (DAU) at Launch:** 
- **Traffic Growth Forecast (1-3 Years):** *(e.g., 10k users initially, expecting 500k in 3 years)*
- **Data Volume Expectations:** *(e.g., Heavy video uploads, large datasets, or simple text data?)*

### 8. Budget & Financial Considerations
- **Allocated Budget:** [Insert Budget Limit or Tier]
- **Hosting Constraints:** *(e.g., Must start on shared VPS, or AWS scaling enabled?)*

### 9. Timeline & Deliverables
- **Expected Launch Date:** 
- **Agile Agreement:** *(Has the client been informed that progress will be shown bi-weekly on a demo server?)* [ ] Yes [ ] No

---

## PART B: Technical Architecture Checklist
*(To be filled by Solution Architect before writing the first line of code)*

### 1. Technology Stack Selection
- **Frontend / Mobile:** *(e.g., Next.js, Flutter)*
- **Backend:** *(e.g., Node.js Express, PHP PDO)*
- **Database:** *(e.g., PostgreSQL, MySQL, MongoDB, SQLite)*
- **Admin Dashboard UI:** *(e.g., Tabler.io, Custom Glassmorphism)*

### 2. Infrastructure Setup
- **Demo Server Provisioned:** [ ] Yes
- **Live Server Provisioned:** [ ] Yes
- **Domains/Subdomains configured via Cloudflare/Nginx:** [ ] Yes

### 3. Architecture & Security Patterns
- **API Standard:** *(e.g., RESTful JSON)*
- **Authentication:** *(e.g., JWT in HttpOnly cookies, OAuth)*
- **State Management (Mobile):** *(e.g., BLoC, Provider)*

### 4. Testing and Quality Assurance (QA) Prerequisites
- **Web E2E Testing:** *(e.g., Playwright configured)*
- **Mobile Testing:** *(e.g., Emulator automated flows)*
- **UAT Protocol:** *(Client must sign off via 21_UAT_Signoff.md before final push)*

### 5. Risk Management
- **Identified Risks:** *(e.g., Real-time map location polling causing battery drain)*
- **Mitigation Strategy:** *(e.g., Optimize polling to 5-second intervals)*

### 6. Maintenance and Post-Launch Support Plans
- **SLA Defined:** *(Is `25_Maintenance_SLA.md` agreed upon?)*
- **Disaster Recovery:** *(Is `26_Disaster_Recovery_Incident_Plan.md` configured?)*

---
**Sign-off:**
Once Part A and Part B are checked off, the "Black Box" is opened, and Antigravity begins coding.
