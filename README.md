# Hospital Management System

A full-stack hospital management system built with:
- Express.js + MongoDB backend
- React + Vite frontend
- Tailwind CSS for styling

## Project structure

- `backend/` - API server, MongoDB models, and routes
- `frontend/` - React application with Tailwind styling

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in `backend/` from `.env.example`:

```bash
cd backend
copy .env.example .env
```

3. Start MongoDB locally or provide a hosted MongoDB connection string in `backend/.env`.

4. Set `JWT_SECRET` in `backend/.env` to a strong secret key.

5. Run the app in development mode:

```bash
npm run dev
```

## Role-Based Login

- Use the login form in the frontend to authenticate.
- Register a new account by selecting one of these roles:
  - Admin
  - Doctor
  - Receptionist
  - Lab Technician
  - Ward Manager
  - Pharmacist
  - Billing Specialist
  - Nurse

- Role permissions are enforced by the backend and the UI will show the dashboard sections available for each role.

## Demo User Accounts

The backend seeds demo users automatically when the database is empty.

Default demo accounts:
- admin@example.com / Admin123! (Admin)
- doctor@example.com / Doctor123! (Doctor)
- reception@example.com / Reception123! (Receptionist)
- lab@example.com / Lab123! (Lab Technician)
- ward@example.com / Ward123! (Ward Manager)
- pharmacy@example.com / Pharmacy123! (Pharmacist)
- billing@example.com / Billing123! (Billing Specialist)
- nurse@example.com / Nurse123! (Nurse)

If you want to reseed the demo accounts manually, run:

```bash
cd backend
npm run seed
```

This starts the backend on `http://localhost:5000` and the frontend on `http://localhost:5173`.

## Backend API

- `GET /api/patients`
- `POST /api/patients`
- `DELETE /api/patients/:id`
- `GET /api/doctors`
- `POST /api/doctors`
- `DELETE /api/doctors/:id`
- `GET /api/appointments`
- `POST /api/appointments`
- `DELETE /api/appointments/:id`

## Notes

- Use `npm install` from the root to install both backend and frontend dependencies via workspaces.
- For production, build the frontend with `npm --workspace frontend run build` and serve the static assets from a web server.
