v0.15.0
- Notification Engine added (Templates, Events, Deliveries)
- Email channel enabled
- SMS Hook added (with Quiet Hours skipping)
- Integrated Ticket Reply notifications
- Tests for notification dispatch and quiet hours logic

v0.13.0
- Implemented secure file storage with S3-compatible backend
- Added init-upload/finalize/download-url APIs
- Integrated file attachments into Ticket creation (Web & API)
- Implemented File Access Policy (RBAC + Scope)

v0.12.0
- Ticket system implemented for parent requests
- Timeline events integrated for tickets
- Notification stub added
- Rhythm dashboard shows open ticket counts

v0.11.0
- Terms + term publication schedule implemented
- Exams scheduling implemented
- Marks entry implemented with audit logging
- Parents can view results only after publish schedule
- Timeline events integrated; Rhythm shows upcoming exams

v0.10.0
- Assignments module implemented (create, submit, review)
- Parent submission supported
- Timeline events for assignment/submission/grading
- Rhythm dashboard shows assignment due counts

v0.9.0
- Announcements & Memos: Module with targeting scope (Branch/Section/Student) and scheduling.
- Memo Acknowledgements: Compliance tracking for parents.
- Timeline Integration: Events emitted on Publish and Ack.
- Principal Dashboard: Added metrics for Memos published today.

v0.8.0
- Attendance Module: Daily attendance tracking (DB, Service, API)
- Web UI: Teacher Marking Interface (Quick toggle, submit flows)
- Web UI: Parent View & Justification submission
- Timeline Integration: 'AttendanceSubmitted' and 'AttendanceJustified' events
- Principal Dashboard: Real-time attendance completion & coverage metrics

v0.7.0
- Timetable Module: Database Support, Services, API Endpoints, Tests
- Timetable Web UI: View (Teacher/Parent) + Manage (Principal)
- Timeline Event for Timetable updates added
- Principal Dashboard updated with real timetable coverage metrics

v0.6.0
- Added authenticated web app shell (/app)
- Implemented Timeline UI with pagination and role-aware filters
- Added Principal Rhythm Dashboard (placeholder metrics)

v0.5.0
- Timeline events table added
- TimelineEmitter service introduced
- Role-aware timeline feed implemented
- /api/v1/timeline endpoint added

v0.4.0
- RBAC enforcement added via permission middleware
- Branch scoping middleware introduced
- Standard API error format implemented
- /api/v1/me endpoint added

v0.3.0
- Added JWT auth with refresh tokens and device sessions
- Added parent OTP dev flow (SMS provider later)
- Secured admin endpoints behind auth
- Updated parent children endpoint to use authenticated parent

v0.2.0
- Users, roles, permissions tables created
- Student/guardian/enrollment foundations created
- Admin setup endpoints added (no auth yet)

v0.1.0
- Core academic structure created
- Branch, grade, section, subject models added
- Academic year support introduced

v0.0.2
- Initialized Next.js web application
- Initialized Laravel API
- Established API health endpoint
- Verified web-to-API communication

v0.0.1
- Project scaffold created
- Monorepo structure defined
- Core product documentation added
