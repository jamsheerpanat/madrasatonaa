- Timeline is the core UX concept.
- Everything important emits an event.
- **TimelineEmitter**: Central service to emit events. Validates scope requirements.
- **TimelineFeedService**: Central query service. Enforces role-based filtering strictly.

## Database Schema (v0.5.0)
- `branch_id`, `section_id`, `student_id` (Nullable FKs)
- `actor_user_id` (Nullable FK)
- `event_type` (String)
- `title_en`, `title_ar`, `body_en`, `body_ar`
- `visibility_scope` (Enum: BRANCH, SECTION, STUDENT, STAFF_ONLY, PARENTS_ONLY, STUDENTS_ONLY, CUSTOM)
- `audience_roles_json` (JSON)
- `payload_json` (JSON)

## Common Event Types (Planned)
  - SubmissionReceived
  - ExamScheduled
  - MarksUpdated
  - TermResultsPublished
  - AnnouncementPublished
  - MemoAcknowledged
  - TicketCreated
  - TicketReplied
- Timeline visibility depends on role + student/section linkage.
