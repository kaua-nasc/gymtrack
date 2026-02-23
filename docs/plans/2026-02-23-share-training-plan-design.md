# Design Doc: Training Plan Sharing System

**Date:** 2026-02-23  
**Status:** Approved  
**Author:** Gemini CLI Agent

## 1. Problem Statement
Users need a way to share their training plans with others via email and in-app links. The system must respect existing visibility rules (PUBLIC, PROTECTED, PRIVATE) and prevent unauthorized resharing.

## 2. Goals
- Allow training plan creators to share plans via email or user ID.
- Track invitations using a new `PlanInvite` entity.
- Enforce visibility rules:
    - PRIVATE plans cannot be shared.
    - PROTECTED plans require the recipient to request access even after being invited.
- Prevent resharing: Only the plan creator can share a plan.

## 3. Proposed Changes

### 3.1 Data Model
New entity: `PlanInvite`

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `plan_id` | UUID | FK to `TrainingPlan` |
| `sender_id` | UUID | FK to `User` (The owner) |
| `recipient_id` | UUID | FK to `User` (Optional if shared via email to non-registered user) |
| `recipient_email`| String | Email address of the recipient |
| `status` | Enum | `PENDING`, `ACCEPTED`, `EXPIRED` |
| `created_at` | Date | Timestamp |
| `updated_at` | Date | Timestamp |

### 3.2 API Interface
`POST /training-plans/:id/share`

**Request Body:**
```json
{
  "email": "friend@example.com",
  "userId": "uuid-optional"
}
```

**Logic Flow:**
1. **Ownership Check:** Verify `request.user.id` is the owner of the plan.
2. **Visibility Check:** 
   - If `PRIVATE`: Reject with `403 Forbidden` ("Private plans cannot be shared").
3. **Record Creation:** Create a `PlanInvite` record.
4. **Notification:** Send an email via `EmailService` containing a link to the plan.

### 3.3 Permissions & Flow
- **Reshare Block:** The sharing endpoint will strictly verify ownership. Non-owners cannot generate invites.
- **PROTECTED Plans:** The shared link leads to the plan page. If the user is an invitee but not yet a `PlanParticipant`, they see an invitation message and a "Request Access" button.

## 4. Alternatives Considered
- **Notification-only:** Simpler but lacks traceability and the ability to show "User X invited you" in the UI.
- **Tokenized Access:** Easier for the user but violates the requirement that PROTECTED plans still require manual approval.

## 5. Security & Privacy
- **Direct Evidence:** Ownership check prevents IDOR on sharing.
- **Privacy:** Recipient email is stored solely for invitation tracking.
- **Access Control:** Invitation does not grant automatic access to PROTECTED content; it only directs the user to the correct resource.
