---
id: "doc-09"
title: "API Contract and Endpoints"
status: "draft"
version: "1.0.0"
---
# Phase 3B: API Contract & Payload Specifications (OpenAPI Standard)

> **CRITICAL RULE:** This contract dictates exactly how the frontend and backend communicate. It is written in strict **OpenAPI 3.0 YAML format** so that PDGS systems can auto-generate mock servers, Postman collections, and frontend TypeScript interfaces.
> ANY new endpoint must be added to this YAML block.

---

## The OpenAPI Contract

```yaml
openapi: 3.0.0
info:
  title: Project GENESIS API
  version: 1.0.0
  description: "Master API contract for the application."
servers:
  - url: /api/v1
    description: "Base API Path"
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
  schemas:
    StandardResponse:
      type: object
      properties:
        success:
          type: boolean
        message:
          type: string
        data:
          type: object
          nullable: true
        errors:
          type: array
          items:
            type: string
          nullable: true
security:
  - bearerAuth: []

paths:
  /auth/login:
    post:
      summary: "User Login"
      description: "Authenticates user and returns JWT."
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - email
                - password
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
      responses:
        '200':
          description: "Login successful"
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/StandardResponse'
                  - type: object
                    properties:
                      data:
                        type: object
                        properties:
                          token:
                            type: string
                          user_id:
                            type: string
                          role:
                            type: string
        '401':
          description: "Invalid email or password"
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/StandardResponse'
```

---
**Status Metadata Sign-off:**
*Do not use checkboxes. Use PDGS YAML metadata tags at the top of the file to approve this contract.*
