Define roles and scope at high level:

- Principal: Full academic + visibility
- Vice Principal: Academic oversight
- HOD: Subject-level oversight
- Teacher: Attendance, assignments, exams
- Substitute: Limited teaching access
- Counselor: Student notes & support
- Accountant: (Fees module reserved for V2)
- Reception: Student/parent front-desk ops
- Student: View timetable, assignments, exams
- Parent: View child timeline, submit requests, acknowledge memos
- Admin (Office): System configuration, imports, backups

## Branch Scope & Permissions
- **System Roles**: OfficeAdmin (Global access)
- **Branch Roles**: Principal, Teacher, HOD (Scoped to specific `branch_id`)
- **Combined**: A user can be a Teacher in Branch A and a Parent in Branch B (handled via `user_roles` pivot table).

## Permission Keys
- `structure.view`, `structure.manage`
- `students.view`, `students.create`, `students.update`, `students.archive`
- `admin.users.manage`, `admin.roles.manage`, `admin.permissions.manage`
- `attendance.view`, `attendance.record`, `attendance.submit` (Teacher)
- `assignments.view`, `assignments.create`, `assignments.review`
- `exams.view`, `exams.schedule`, `exams.marks.update`

----------------------------------
docs/API_CONTRACT.md
