# API Reference

Base URL: `http://localhost:3000/api/v1`  
Set via `VITE_API_BASE_URL` in `.env`

## Authentication

All endpoints **except OTP** require a Bearer token:

```
Authorization: Bearer <access_token>
```

Token is obtained from `POST /otp/verify` after login and attached automatically by `src/services/api.js` on every protected request.

OTP endpoints use `src/services/publicApi.js` (no token).

---

## Auth

| Method | Endpoint | Body |
|--------|----------|------|
| POST | `/otp/send` | `{ "phone_number": "9876543210" }` |
| POST | `/otp/verify` | `{ "phone_number": "9876543210", "otp": "123456" }` |

**Verify response (key fields):**

```json
{
  "data": {
    "qid": "QT207583",
    "access_token": "<jwt>",
    "expires_in": 86400
  }
}
```

---

## Role Bundles

| Method | Endpoint | Body |
|--------|----------|------|
| GET | `/role-bundles` | — |
| POST | `/role-bundles` | `{ "name": "HR ADMIN" }` |
| PATCH | `/role-bundles/:bundle_id` | `{ "name": "MANAGER" }` |
| DELETE | `/role-bundles/:bundle_id` | — |

**Auth:** Bearer token required (`requireStaffTypeUser` on HRLMS)

**Used in:** Create Permission, Role Bundle Management

---

## Permissions

| Method | Endpoint | Body |
|--------|----------|------|
| GET | `/permissions` | Query: `bundle_id` (optional) |
| POST | `/permissions` | `{ "rbac", "bundle_id", "type", "tag", "name" }` |

**RBAC key format:** `{NAME}_{BUNDLE}_{TYPE}_{TAG}` (uppercase, spaces → `_`)

**Used in:** Create Permission, Role Permissions, Permission Selector

---

## User Roles

| Method | Endpoint | Body |
|--------|----------|------|
| GET | `/user-roles` | Query: `role_name` (optional) |
| POST | `/user-roles` | `{ "role_name": "MANAGER" }` |
| GET | `/user-roles/:user_role_id` | — |
| PATCH | `/user-roles/:user_role_id` | `{ "role_name", "permissions": [1,2,3] }` |
| DELETE | `/user-roles/:user_role_id` | — |

**Used in:** Role Management, Role Permissions

---

## User Management

| Method | Endpoint | Body / Query |
|--------|----------|--------------|
| GET | `/user/management/filters` | — |
| GET | `/user/management/staff` | `page`, `limit` (max 500), `search`, `role`, `has_role`, `department_id`, `entity_id`, `category_id`, `designation`, `type`, … |
| POST | `/user/management/roles/assign` | `{ "qids": ["QT..."], "role_name": "MANAGER" }` |

**Used in:** User Management

---

## Screen → API map

| Screen | APIs |
|--------|------|
| Login | `/otp/send`, `/otp/verify` |
| Create Permission | `GET /role-bundles`, `POST /permissions` |
| Role Bundle Management | CRUD `/role-bundles` |
| Role Management | CRUD `/user-roles` |
| Role Permissions | `GET /user-roles/:id`, `GET /permissions`, `PATCH /user-roles/:id` |
| User Management | `GET /filters`, `GET /staff`, `POST /roles/assign` |

---

## Service files

```
src/services/
  api.js                  # protected axios client (Bearer token required)
  publicApi.js            # public axios client (OTP only)
  authService.js          # OTP
  roleBundlesService.js
  permissionsService.js
  userRolesService.js
  userManagementService.js
```
