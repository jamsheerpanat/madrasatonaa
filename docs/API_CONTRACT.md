- API style: REST
- Base path: /api/v1
- Base URL: http://localhost:8000
- CORS: Allowed for http://localhost:3000 (Web App)
- Auth: JWT (access + refresh)
- Access Token: 15 minutes
- Refresh Token: 30 days (hashed in DB)
- Device Session: Required (device_id)

## Authentication Rules
- **Access Tokens**: Issued via Sanctum (Bearer). Short-lived (15 mins).
- **Refresh Tokens**: Opaque string, stored hashed. Used to rotate tokens.
- **OTP**: Parents use phone-based OTP. V1 is dev-only (returns code in response).

## Endpoints

### Auth
- `POST /auth/staff/login` (email, password, device_id)
- `POST /auth/parent/request-otp` (phone)
- `POST /auth/parent/verify-otp` (phone, otp, device_id)
- `POST /auth/refresh` (refresh_token, device_id)
- `POST /auth/logout` (device_id)

### User Context
- `GET /me`
  - Returns: User profile, roles (w/ branch scope), permissions, permissions list

### Timeline
- `GET /timeline?cursor={c}&limit={n}&branch_id={id}&child_student_id={id}&event_type={type}`
  - Auth: Required
  - Returns: Paginated list of events visible to user.
  - Parents: Must provide `child_student_id` to filter strictly (or see all linked). Cannot see others.

- Parents: Must provide `child_student_id` to filter strictly (or see all linked). Cannot see others.

### Principal
- `GET /principal/rhythm`
  - Auth: Required + `principal.dashboard.view` permission
  - Returns: Day overview, attendance completion status (placeholder), etc.

### Timetable (Permissions: timetable.view, timetable.manage)
- `GET /timetable/section/{sectionId}`: Get section schedule.
- `PUT /timetable/section/{sectionId}`: Update section schedule (manage only).
- `GET /timetable/teacher/me`: Get authenticated teacher's schedule.
- `GET /timetable/parent/child/{studentId}`: Get child's schedule (parent only).
- `GET/PUT /timetable/branch/{branchId}/template`: Manage period structure.

### Attendance
- `GET /attendance/section/{sectionId}/day`: Get full attendance sheet (Staff/Admin).
- `POST /attendance/section/{sectionId}/day`: Initialize sheet.
- `PUT /attendance/day/{id}/mark`: Update marks (Draft only).
- `POST /attendance/day/{id}/submit`: Submit sheet (Draft only).
- `GET /attendance/parent/child/{studentId}/month`: Get monthly record (Parent).
- `POST /attendance/parent/justify`: Submit justification.
- `POST /attendance/justifications/{id}/review`: Review justification (Principal).

### System
- `GET /health`

### Assignments (v0.10.0)
- `POST /assignments`: Create assignment.
- `GET /assignments/mine`: List teacher created assignments.
- `GET /assignments/section/{id}`: List assignments for section (Parent requires `child_student_id`).
- `GET /assignments/{id}`: Get details.
- `POST /assignments/{id}/submit`: Submit work.
- `GET /assignments/{id}/submissions`: List submissions (Staff).
- `POST /submissions/{id}/grade`: Grade submission.

### Exams & Results (v0.11.0)
- `GET /terms/current`: List terms and status.
- `POST /exams`: Schedule exam.
- `GET /exams/section/{id}?term_id=X`: List exams.
- `PUT /exams/{id}/marks`: Bulk enter marks.
- `PUT /exams/{id}/marks`: Bulk enter marks.
- `GET /exams/{id}`: Get exam details (parents restricted by publish status).

### Requests (v0.12.0)
- `GET /tickets/categories`: List active categories.
- `GET /tickets`: List tickets (Parent: own, Staff: branch).
- `POST /tickets`: Create ticket.
- `GET /tickets/{id}`: View ticket & messages.
- `POST /tickets/{id}/reply`: Add message.
- `POST /tickets/{id}/reply`: Add message.
- `POST /tickets/{id}/status`: Resolve/Close (Staff only).

### Files (v0.13.0)
- `POST /files/init-upload`: Get signed upload URL.
- `POST /files/finalize`: Mark upload as complete.
- `GET /files/{id}/download-url`: Get signed download URL (Access Policy enforced).

## Client-Side Implementation Notes
- **Token Storage**: V1 MVP uses `localStorage` for `access_token` and `refresh_token`.
- **RBAC**: UI elements should be hidden based on permissions returned from `/me`. API enforces actual security.
- **Timeline**: Use cursor pagination for infinite scroll.

## Standard Error Response
```json
{
  "error": {
    "code": "FORBIDDEN", // UNAUTHORIZED, VALIDATION_ERROR, NOT_FOUND, SERVER_ERROR
    "message": "Human readable message",
    "details": null // or validation object { field: [errors] }
  }
}
```
  - Returns: `{ status: "ok", service: "madrasatonaa-api", version: "0.0.1" }`
  - Auth: Public

- `GET /structure`
  - Returns: Full academic hierarchy (School, Branches, Grades, Sections, Subjects)
  - Auth: Public (for now)

### Admin (Dev/Setup)
- `GET /admin/users`
- `POST /admin/users`
- `POST /admin/students`
- `POST /admin/guardians/link`

### Parent
- `GET /parent/children?parent_user_id={id}`
  - Returns: List of children + enrollments

- All endpoints must:
  - Enforce role-based access
  - Be branch-aware
  - Emit timeline events where applicable
- API must be reusable by future mobile apps
- No breaking changes without versioning
