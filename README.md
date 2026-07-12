# AssetFlow – Enterprise Asset & Resource Management System

> Built for the **Odoo Hackathon 2026**

A centralized, real-time ERP platform designed to seamlessly manage departments, employees, physical assets, hardware allocations, resource booking, audits, and maintenance workflows. 

## 🌟 Key Features

- **Asset Registration & Allocation**: End-to-end lifecycle management of all hardware and software resources.
- **Resource Booking**: Self-service portals for employees to request assets and book temporary hardware.
- **Maintenance & Auditing**: Scheduled compliance audits and automated maintenance ticketing.
- **Data Aggregation & Reporting Engine**: Dynamic dashboards with rich analytics on asset utilization and depreciation.
- **Global Notification Architecture**: Real-time alerts for approvals, transfers, and maintenance updates.

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15+, React 19, TypeScript, Tailwind CSS, Shadcn UI |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | PostgreSQL (Supabase) |
| **Auth** | JWT + bcrypt Secure Authentication |

## 🚀 Getting Started

### 1. Database Setup

We use Supabase for our PostgreSQL database. You can execute our schema and seed files to initialize your tables:
```bash
# Run schema and seed against your PostgreSQL database
psql -U postgres -d assetflow -f database/schema.sql
psql -U postgres -d assetflow -f database/seed.sql
```
Alternatively, the backend uses a script to auto-initialize the database on startup!

### 2. Backend Server

```bash
cd backend
npm install
# Ensure you configure your Supabase connection string in .env
cp .env.example .env   
npm run dev
```
*The API runs at: `http://localhost:5000/api`*

### 3. Frontend Server

```bash
cd frontend
npm install
npm run dev
```
*The Client runs at: `http://localhost:3000`*

## 👥 The Team

- **Krish (Member 1)** – Team Lead, System Architecture, DB Design, Reporting Engine, Notifications
- **Member 2** – UI Developer
- **Anand Pandey (Member 3)** – Asset Management & API Integrations
- **Nipun Kulshrestha (Member 4)** – Operations, Audits, & Maintenance Flows

## 🌿 Git Workflow

- `main` – Production branch containing all integration code.
- Features are pushed sequentially by team members throughout the hackathon!
