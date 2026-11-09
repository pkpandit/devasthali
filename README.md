# Devasthaly applications

This repository contains two independent Next.js applications:

- [`frontend/`](./frontend/README.md): public school website, served at
  http://localhost:3000.
- [`backend/`](./backend/README.md): local-only admin shell, served at
  http://localhost:3001/admin.

Run each app from its own directory with `npm ci` followed by `npm run dev`.
The backend is a preview shell only: it has no authentication or database
connection and is not suitable for production deployment.

The existing Prisma schema remains at `prisma/schema.prisma` until a separate
database-ownership and integration stage is approved. No database operations
are run by either application in this stage.
