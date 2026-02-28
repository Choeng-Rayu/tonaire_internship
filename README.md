# Tonaire Internship Project

Full-stack application for **Category & Product Management** built with a **Node.js / TypeScript** backend and a **Flutter** cross-platform frontend.

## Features

1. **Authentication** – Sign Up, Login, Forgot Password (email OTP), JWT-based session
2. **Category CRUD** – Create, Read, Update, Delete with debounced search (Khmer-aware)
3. **Product List** – Category dropdown filter, pagination (20/page), sort by name/price, debounced search
4. **Image Handling** – Upload product images (stored locally on the server), served via static route
5. **Cross-Platform** – iOS, Android, Web, Windows, macOS, Linux

## Tech Stack

| Layer     | Technology                                   |
| --------- | -------------------------------------------- |
| Backend   | Node.js, Express, TypeScript                 |
| Database  | SQL Server 2022 (Docker)                     |
| Auth      | JWT, bcryptjs, Nodemailer (Gmail SMTP)       |
| Frontend  | Flutter (Dart), Provider, cached_network_image |

## Project Structure

```
├── backend/          # Express REST API
├── frontend/         # Flutter app
├── sql/              # Database schema & seed data
├── docs/             # API documentation
└── docker-compose.yml
```

## Prerequisites

- **Docker & Docker Compose** (for SQL Server)
- **Node.js ≥ 18**
- **Flutter SDK ≥ 3.10**

## Quick Start

### 1. Start the database

```bash
docker compose up -d
```

Wait ~30 seconds for SQL Server to initialise, then run the schema:

```bash
docker exec -i taonaire-sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P 'YourStrong!Passw0rd' -C -i /dev/stdin < sql/schema.sql

docker exec -i taonaire-sqlserver /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P 'YourStrong!Passw0rd' -C -d taonaire_db -i /dev/stdin < sql/seed.sql
```

### 2. Start the backend

```bash
cd backend
cp .env.example .env   # then edit values if needed
npm install
npm run dev
```

The API starts at `http://localhost:3000`.

### 3. Start the Flutter app

```bash
cd frontend
flutter pub get
flutter run
```

For web: `flutter run -d chrome`

## Seed Users

| Name      | Email                | Password      |
| --------- | -------------------- | ------------- |
| Admin     | admin@taonaire.com   | Password123   |
| John Doe  | john@taonaire.com    | Password123   |
| Jane Doe  | jane@taonaire.com    | Password123   |

## API Documentation

See [docs/README.md](docs/README.md) for the full endpoint reference.

## Environment Variables

Both `backend/.env` and `frontend/.env` contain configuration. See `.env.example` files for required keys.

## License

Internal – Taonaire Internship Project.
