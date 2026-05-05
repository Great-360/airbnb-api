# Airbnb API

REST API for an Airbnb-like platform built with Node.js, Express, TypeScript, Prisma, and PostgreSQL.

## Overview

This project provides backend services for:

- User authentication and profile management
- Property listings with search and statistics
- Bookings and booking lifecycle actions
- Reviews on listings
- Image uploads for user avatars and listing photos
- AI-powered features (natural language search, listing description generation, chat)

The API is versioned under `/api/v1` and documented with Swagger.

## Tech Stack

- Node.js + Express
- TypeScript
- Prisma ORM + PostgreSQL
- JWT authentication
- Multer + Cloudinary for uploads
- Redis (config available for caching/rate-related usage)
- Swagger (OpenAPI 3.0)

## Project Structure

- `src/index.ts`: app bootstrap, middleware, health check, Swagger setup
- `src/v1/index.ts`: v1 route registration and shared rate limiting
- `src/v1/routes`: all API route modules
- `src/v1/controllers`: request handlers and business logic
- `src/v1/config`: integrations (Prisma, Swagger, Cloudinary, email, AI, Redis)
- `prisma/schema.prisma`: database schema and enums

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in real values:

```bash
cp .env.example .env
```

### 3. Run database migrations and generate Prisma client

```bash
npm run db:migrate
npm run db:generate
```

### 4. (Optional) Seed data

```bash
npm run db:seed
```

### 5. Start the API

```bash
npm run dev
```

The server runs on `PORT` (defaults to `3000`).

## Environment Variables

Core variables used by the app:

- `PORT`: server port
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: JWT signing secret
- `BCRYPT_SALT_ROUNDS`: password hashing rounds
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_USER`
- `EMAIL_PASS`
- `EMAIL_FROM`
- `GROQ_API_KEY`
- `REDIS_URL` (optional, defaults to `redis://localhost:6379`)

## API Base URL

- Local: `http://localhost:3000/api/v1`

## API Documentation

Swagger UI and raw spec are available when the server is running:

- `http://localhost:3000/api-docs`
- `http://localhost:3000/api-docs.json`

## Authentication and Roles

Authentication uses Bearer JWT:

```http
Authorization: Bearer <token>
```

Supported roles:

- `GUEST`
- `HOST`
- `ADMIN`

Some endpoints require role-based access (for example: creating listings requires `HOST`; creating bookings requires `GUEST`).

## Rate Limiting

Applied globally to v1 routes:

- General limiter: `100` requests per `15` minutes
- Strict POST limiter: `20` POST requests per `15` minutes

## Main Endpoints

All routes below are prefixed with `/api/v1`.

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me` (auth required)
- `POST /auth/change-password` (auth required)
- `POST /auth/forgot-password`
- `POST /auth/reset-password/:token`

### Users

- `GET /users`
- `GET /users/stats`
- `GET /users/:id`
- `POST /users`
- `PUT /users/:id`
- `DELETE /users/:id`
- `GET /users/:id/bookings`

### Listings

- `GET /listings`
- `GET /listings/stats`
- `GET /listings/search`
- `GET /listings/:id`
- `POST /listings` (auth + host role)
- `PUT /listings/:id` (auth required)
- `DELETE /listings/:id` (auth required)
- `POST /listings/:id/photos` (auth required)
- `DELETE /listings/:id/photos/:photoId` (auth required)

### Bookings

- `GET /bookings`
- `GET /bookings/:id`
- `POST /bookings` (auth + guest role)
- `DELETE /bookings/:id` (auth required)

### Reviews

- `GET /reviews/listings/:id/reviews`
- `POST /reviews/listings/:id/reviews` (auth required)
- `DELETE /reviews/reviews/:id` (auth required)

### Uploads

- `POST /upload/:id/avatar` (auth required)
- `DELETE /upload/:id/avatar` (auth required)

### AI

- `POST /ai/search`
- `POST /ai/generate-description` (auth required)
- `POST /ai/chat`

## Health Check

- `GET /health`

Returns service status, uptime, and timestamp.

## Useful Scripts

- `npm run dev`: start in development mode with `nodemon` + `tsx`
- `npm run build`: compile TypeScript
- `npm run start`: run compiled output
- `npm run db:migrate`: create/apply Prisma migration (dev)
- `npm run db:reset`: reset DB and reapply migrations
- `npm run db:seed`: seed data
- `npm run db:studio`: open Prisma Studio
- `npm run migrate`: apply migrations in deploy environments
