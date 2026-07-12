# AssetFlow – Enterprise Asset & Resource Management System

> Odoo Hackathon v1.0

A centralized ERP platform for managing departments, employees, assets, allocations, maintenance, resource booking, reports, and notifications.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15+, React 19, TypeScript, Tailwind CSS, Shadcn UI |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL (Supabase) |
| Auth | JWT + bcrypt |

## Getting Started

### Backend

```bash
cd backend
npm install
cp .env.example .env   # Fill in your values
npm run dev
```

### Database

```bash
# Run schema against your PostgreSQL
psql -U postgres -d assetflow -f database/schema.sql
psql -U postgres -d assetflow -f database/seed.sql
```

## API Base URL

```
http://localhost:5000/api
```

## Team

- **Krish** – Team Lead (Backend, DB, Auth, APIs, Deployment)
- **Member 2** – UI Developer
- **Member 3** – Asset Management
- **Member 4** – Operations

## Git Workflow

- `main` – Production
- `backend` – Backend development
- `frontend` – Frontend development
- `asset-module` – Asset management features
- `operations-module` – Operations features
