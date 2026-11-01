# SeniorConnect — Student & Senior Collaboration Platform

A modern web application connecting college students with seniors and graduates for mentorship, academic assistance, career guidance, skill development, and community engagement.

## 🚀 Features

- **Connect to Senior** — Discover and connect with experienced seniors for mentorship
- **Help with Notes** — Upload, share, and discover study materials
- **Skill-Based Matchmaking** — Get matched based on skills and learning goals
- **Senior Experience Library** — Access career guidance, interview tips, and resources
- **Local Opportunity Hub** — Find internships, workshops, events, and competitions
- **Clubsphere** — Join and create clubs, societies, and student communities
- **Real-time Chat** — One-to-one messaging with typing indicators and read receipts
- **Voice Calls** — WebRTC-based voice communication
- **OTP Authentication** — Secure email-based OTP verification

## 🛠 Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Backend | NestJS, TypeScript |
| Database | PostgreSQL, Prisma ORM |
| Cache | Redis |
| Real-time | Socket.IO, WebRTC |
| Auth | JWT, bcrypt, OTP |
| Storage | S3-compatible (MinIO) |
| Deployment | Docker Compose |

## 📁 Project Structure

```
seniorconnect/
├── frontend/          # Next.js 14 App Router
├── backend/           # NestJS API Server
├── database/          # Schema docs & seed scripts
├── docs/              # Architecture & API documentation
└── docker-compose.yml # Full-stack local development
```

## 🏁 Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose (for PostgreSQL, Redis, MinIO)
- pnpm or npm

### 1. Clone and setup environment

```bash
cd seniorconnect
cp .env.example .env
# Edit .env with your configuration
```

### 2. Start infrastructure services

```bash
docker compose up -d postgres redis minio
```

### 3. Setup backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed    # Optional: load sample data
npm run start:dev
```

### 4. Setup frontend

```bash
cd frontend
npm install
npm run dev
```

### 5. Access the application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **API Docs (Swagger)**: http://localhost:4000/api/docs
- **MinIO Console**: http://localhost:9001

## 🔐 Environment Variables

See [.env.example](.env.example) for all required configuration.

Key variables:
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `SMTP_*` | Email server configuration |
| `REDIS_HOST` | Redis server host |
| `STORAGE_*` | S3-compatible storage config |

## 📊 Database

The database schema includes 20+ tables for users, profiles, connections, notes, matchmaking, experience resources, opportunities, clubs, messaging, voice calls, notifications, reports, and audit events.

### Migrations

```bash
cd backend
npx prisma migrate dev --name <migration_name>
```

### Seed Data

```bash
npx prisma db seed
```

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# E2E tests
npm run test:e2e
```

## 🐳 Docker Deployment

```bash
# Build and start all services
docker compose up --build

# Or start in background
docker compose up -d --build
```

## 📖 Documentation

- [Architecture](docs/architecture.md)
- [API Reference](docs/api.md)
- [Security](docs/security.md)

## 📝 License

This project is for educational purposes.
