# SeniorConnect Security & Breach Prevention Architecture

## 1. Authentication Security

- **Password Hashing**: Passwords hashed with bcrypt (cost factor 12). Plaintext passwords are never logged or stored.
- **Cryptographic OTPs**: Passwords and OTP verification codes are generated using cryptographically secure random number generators (`crypto.randomInt`).
- **OTP Hashing**: OTPs are hashed using bcrypt before persisting in the `OtpChallenge` table.
- **Anti-Brute Force Protection**:
  - Maximum 5 attempts allowed per OTP challenge.
  - Expiration window enforced at 10 minutes.
  - Cooldown period of 60 seconds enforced via Redis cache.
  - Generic authentication responses prevent account enumeration.

## 2. Authorization & Access Control

- **Role-Based Access Control (RBAC)**: Managed through `@Roles()` decorator and `RolesGuard` (`STUDENT`, `SENIOR`, `ADMIN`).
- **Object-Level Permissions**:
  - Messages can only be read and posted by verified participants of the conversation.
  - Notes can only be modified or deleted by the author or platform administrator.
  - Voice calls can only be initiated between users who have accepted connection requests.
  - Private profiles are restricted based on student visibility settings.

## 3. Data Protection & Hygiene

- **SQL Injection Prevention**: Full parameterized query enforcement through Prisma ORM. No raw concatenated SQL queries.
- **XSS & Injection Protection**:
  - Global `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true`.
  - HTTP security headers provided by `helmet`.
  - React/Next.js automatic HTML output escaping.
- **CORS Configuration**: Restrictive origins configured via environment variables.

## 4. Real-Time Communication Security

- **WebSocket Authentication**: Every Socket.IO connection validates JWT tokens during handshake. Unauthenticated sockets are disconnected immediately.
- **WebRTC Signaling**: Signals (offers, answers, ICE candidates) are only relayed after server-side connection status verification. Peer audio streams flow directly peer-to-peer via SRTP/DTLS.

## 5. Audit Logging & Monitoring

- **Audit Events**: Security events (logins, OTP verifications, report filings, administrative actions) are recorded in the `AuditEvent` table.
- **Sanitized Logging**: Loggers strictly omit passwords, OTPs, session keys, and bearer tokens.
