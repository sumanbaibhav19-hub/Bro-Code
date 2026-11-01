# SeniorConnect API Documentation

## Base URL
`/api/v1`

## Authentication & Authorization
All secured endpoints require a JWT Bearer token in the `Authorization` header:
`Authorization: Bearer <access_token>`

---

## 1. Authentication (`/api/v1/auth`)

### `POST /auth/register`
Register a new student or senior user.
```json
{
  "fullName": "Aarav Patel",
  "email": "aarav.patel@stanford.edu",
  "password": "Password123!",
  "college": "Stanford University",
  "department": "Computer Science",
  "course": "B.S. in Computer Science",
  "graduationYear": 2026,
  "role": "STUDENT"
}
```

### `POST /auth/login`
Authenticate with email and password. Returns access token (15m) and refresh token (7d).
```json
{
  "email": "aarav.patel@stanford.edu",
  "password": "Password123!"
}
```

### `POST /auth/send-otp`
Generate and deliver a secure, single-use 6-digit OTP code to email.
```json
{
  "email": "aarav.patel@stanford.edu",
  "purpose": "email_verification"
}
```

### `POST /auth/verify-otp`
Verify OTP code with brute-force defense (max 5 attempts, 10m expiry).
```json
{
  "email": "aarav.patel@stanford.edu",
  "otp": "839210",
  "purpose": "email_verification"
}
```

### `POST /auth/refresh`
Rotate refresh token and retrieve a fresh access token.

### `POST /auth/logout`
Invalidate current session.

---

## 2. Users & Profiles (`/api/v1/users`)

- `GET /users/me`: Fetch authenticated user profile, skills, and interests
- `PATCH /users/me`: Update profile details (bio, location, linkedin, github)
- `PATCH /users/me/skills`: Update skills to learn and teach
- `PATCH /users/me/interests`: Update academic and career interests
- `GET /users`: Search users with filters (`role`, `department`, `college`, `skill`, `page`, `limit`)
- `GET /users/:id`: Public profile details

---

## 3. Connections (`/api/v1/connections`)

- `POST /connections/request`: Send mentorship connection request (`{ receiverId, message }`)
- `PATCH /connections/:id/accept`: Accept connection request
- `PATCH /connections/:id/reject`: Decline request
- `DELETE /connections/:id`: Unfriend / remove connection
- `GET /connections`: List active accepted connections
- `GET /connections/requests`: List incoming and outgoing pending requests

---

## 4. Help with Notes (`/api/v1/notes`)

- `POST /notes`: Upload study notes with file attachments
- `GET /notes`: Search notes with filters (`subject`, `department`, `semester`, `search`, `page`, `limit`)
- `GET /notes/:id`: Note detail with metadata and files
- `GET /notes/:id/download/:fileId`: Increment download counter and generate secure download URL
- `DELETE /notes/:id`: Delete own note
- `POST /notes/:id/report`: Report inappropriate material

---

## 5. Skill Matchmaking (`/api/v1/matchmaking`)

- `GET /matchmaking/recommendations`: Retrieve top 20 compatible senior mentors with percentage scores and criteria breakdown
- `POST /matchmaking/generate`: Trigger real-time compatibility matrix re-calculation

---

## 6. Senior Experience Library (`/api/v1/experience-library`)

- `POST /experience-library`: Senior or Admin publishes an experience article
- `GET /experience-library`: Search articles with category tabs (`interview`, `career`, `project`, `placement`)
- `GET /experience-library/:id`: Full article content and view increment
- `POST /experience-library/:id/rate`: Rate article from 1 to 5 stars

---

## 7. Opportunity Hub (`/api/v1/opportunities`)

- `POST /opportunities`: Post an internship, workshop, event, or competition
- `GET /opportunities`: List verified opportunities with filters (`type`, `location`, `isRemote`, `search`)
- `GET /opportunities/:id`: Opportunity specifications and application URL

---

## 8. Clubsphere (`/api/v1/clubs`)

- `POST /clubs`: Create a new campus student club or society
- `GET /clubs`: Browse community clubs by category and search
- `GET /clubs/:id`: Club details and roster
- `POST /clubs/:id/join`: Join club membership
- `DELETE /clubs/:id/leave`: Leave club

---

## 9. Real-Time Messaging (`/api/v1/conversations`) & WebSocket

- `GET /conversations`: List user conversation threads with unread indicators
- `POST /conversations`: Get or create 1:1 conversation with target user
- `GET /conversations/:id/messages`: Paginated message history

### WebSocket Gateway
- `joinConversation`: Join room `conv_{id}`
- `sendMessage`: Save and broadcast message to participants
- `typing`: Broadcast typing status

---

## 10. Voice Communication (`/api/v1/voice`) & WebRTC

- `GET /voice/calls`: User call logs and duration history
- `GET /voice/ice-servers`: Dynamic STUN/TURN configuration

### WebRTC Signaling Gateway (`/voice`)
- `registerVoice`: Register user socket ID
- `callUser`: Initiate WebRTC offer to target connection
- `answerCall`: Send WebRTC answer
- `iceCandidate`: Relay candidate to peer
- `endCall`: Terminate call and log duration
- `rejectCall`: Decline incoming call
