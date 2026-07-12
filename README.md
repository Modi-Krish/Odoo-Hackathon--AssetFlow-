# AssetFlow Enterprise Monorepo

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Express-4.x-black?style=for-the-badge&logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-blue?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
</div>

<br />

AssetFlow is an enterprise-grade Asset & Resource Management System. It allows companies to track hardware, assign assets to employees, book shared resources (like meeting rooms), and manage maintenance requests seamlessly.

## 🌟 Key Features

- **RBAC Authentication:** Full Role-Based Access Control (`admin`, `asset_manager`, `department_head`, `employee`).
- **Asset Directory:** Track laptops, servers, and accessories.
- **Resource Booking:** Conflict-free reservations for meeting rooms and shared devices.
- **Maintenance Ticketing:** End-to-end IT service request management.
- **Enterprise Reporting:** Advanced visualizations and audit trails.

## 🏗 Architecture & Tech Stack

This project is a Monorepo composed of two independent applications:

- **Frontend (`/frontend`)**: Next.js (App Router), React, TailwindCSS, Lucide Icons, Axios.
- **Backend (`/backend`)**: Node.js, Express.js, PostgreSQL (pg driver), Zod Validation, JWT Auth.
- **Database (`/database`)**: Raw SQL schemas with secure RLS policies (designed for Supabase compatibility).

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)

### 1. Clone the repository
```bash
git clone https://github.com/your-org/assetflow.git
cd assetflow
```

### 2. Install Dependencies
This project uses npm workspaces to manage both frontend and backend dependencies simultaneously.
```bash
npm install
```

### 3. Environment Setup
Copy the example environment file and fill in your local Postgres database URL and a strong JWT secret.
```bash
cp .env.example .env
```
Ensure your `DATABASE_URL` is set correctly in `.env`.

### 4. Database Setup
Initialize the database using the provided schema.
```bash
cd backend
npm run db:init
npm run db:seed
```

### 5. Run the Application
From the root directory, start both the frontend and backend in development mode:
```bash
npm run dev
```
- Frontend will be available at `http://localhost:3000`
- Backend will be available at `http://localhost:5000`

## 🔒 Security

We take security seriously. Please read our [SECURITY.md](SECURITY.md) for vulnerability reporting guidelines and best practices.

- No hardcoded secrets. All sensitive keys are managed via `.env`.
- Database utilizes Row Level Security (RLS).
- API is protected with strict CORS, Rate Limiting, and Helmet headers.

## 🤝 Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to submit pull requests, and remember to follow our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
