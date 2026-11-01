# SeniorConnect Architecture

## System Overview

SeniorConnect follows a modular monolith architecture with clear separation between frontend, backend, and infrastructure layers.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           Next.js 14 (App Router)                         │   │
│  │  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐  │   │
│  │  │  Pages  │ │Components│ │  Stores  │ │  Services   │  │   │
│  │  │(Routes) │ │ (UI Lib) │ │(Zustand) │ │(API Client) │  │   │
│  │  └─────────┘ └──────────┘ └──────────┘ └─────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────┬───────────────┬──────────────────────────┘
                       │ REST/HTTP     │ WebSocket
┌──────────────────────▼───────────────▼──────────────────────────┐
│                       API Gateway                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              NestJS Application                           │   │
│  │                                                           │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────────────┐    │   │
│  │  │   Guards    │ │ Middleware │ │   Interceptors     │    │   │
│  │  │  (Auth,     │ │ (CORS,    │ │  (Transform,       │    │   │
│  │  │   Roles)    │ │  Helmet)  │ │   Logging)         │    │   │
│  │  └────────────┘ └────────────┘ └────────────────────┘    │   │
│  │                                                           │   │
│  │  ┌──────────────────── Modules ──────────────────────┐   │   │
│  │  │ Auth │ Users │ Connections │ Notes │ Matchmaking   │   │   │
│  │  │ ExperienceLib │ Opportunities │ Clubs │ Messaging  │   │   │
│  │  │ Voice │ Notifications │ Moderation │ Admin        │   │   │
│  │  └───────────────────────────────────────────────────┘   │   │
│  │                                                           │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────────────┐    │   │
│  │  │  Prisma    │ │   Redis    │ │    Email/SMS       │    │   │
│  │  │  Service   │ │  Service   │ │    Service         │    │   │
│  │  └──────┬─────┘ └──────┬─────┘ └────────────────────┘    │   │
│  └─────────┼──────────────┼──────────────────────────────────┘  │
└────────────┼──────────────┼─────────────────────────────────────┘
             │              │
┌────────────▼──────┐ ┌─────▼──────┐ ┌──────────────┐
│   PostgreSQL      │ │   Redis    │ │  MinIO (S3)  │
│   (Primary DB)    │ │  (Cache)   │ │  (Files)     │
└───────────────────┘ └────────────┘ └──────────────┘
```

## Module Architecture

Each backend module follows the same pattern:

```
module/
├── module.module.ts      # NestJS module definition
├── module.controller.ts  # HTTP endpoints
├── module.service.ts     # Business logic
├── module.gateway.ts     # WebSocket handlers (if real-time)
├── dto/                  # Request/Response DTOs with validation
├── guards/               # Module-specific guards
└── interfaces/           # TypeScript interfaces
```

## Data Flow

### Authentication Flow
1. User submits credentials → AuthController
2. LocalStrategy validates → AuthService.login()
3. Password verified with bcrypt → Generate JWT tokens
4. Refresh token stored in Sessions table (hashed)
5. Access token (15min) + Refresh token (7d) returned
6. OTP sent via email for verification

### Real-time Messaging Flow
1. Client connects to Socket.IO with JWT
2. Gateway validates token, joins user to rooms
3. Client sends message → Gateway validates membership
4. Message saved to DB → Broadcast to conversation room
5. Notifications sent to offline participants

### WebRTC Voice Call Flow
1. Caller initiates via signaling (Socket.IO)
2. Server validates connection between users
3. Signaling: offer → answer → ICE candidates
4. Direct peer-to-peer audio via WebRTC
5. TURN server fallback for restrictive networks

## Security Layers

1. **Network**: HTTPS, CORS, Helmet headers, CSP
2. **Authentication**: JWT, bcrypt passwords, OTP verification
3. **Authorization**: Role guards, resource ownership checks
4. **Input**: class-validator DTOs, parameterized queries
5. **Rate Limiting**: Redis-backed throttling per endpoint
6. **Audit**: All security events logged to AuditEvents table

## Scalability Considerations

- Stateless API servers → horizontal scaling behind load balancer
- PostgreSQL connection pooling via Prisma
- Redis for shared state across instances
- Socket.IO Redis adapter for multi-instance WebSocket
- Object storage (S3/MinIO) for files
- Background queues for email, notifications
- Cursor-based pagination for large datasets
