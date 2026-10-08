# Flight Booking API

A full-stack flight booking backend built with Node.js, Express, and MongoDB. The application supports user registration/login, flight search and management, booking operations, and a lightweight client front end served from the same server.

## Features

- User registration and login with JWT-based authentication
- Cookie-based session handling
- Flight listing with filters and pagination
- Flight creation, update, and deletion for admin users
- Booking creation, cancellation request flow, and admin cancellation
- Upload support for profile pictures and flight images
- Swagger API documentation
- Socket.IO support for real-time updates
- MongoDB persistence with Mongoose
- Static frontend served from the `client` directory

## Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT for authentication
- Socket.IO
- Swagger UI + YAML docs
- Multer for file uploads
- CORS, cookie-parser, morgan
- Mocha + Supertest for testing

## Project Structure

```bash
.
├── client/
├── config/
├── controllers/
├── docs/
│   └── openapi.yaml
├── middleware/
├── models/
├── routes/
├── test/
├── utils/
├── .env.example
├── .gitignore
├── package.json
├── README.md
├── server.js
└── objectives.txt
```

## Prerequisites

Before running the project, ensure the following are installed:

- Node.js v18 or later
- MongoDB running locally or a valid MongoDB connection URI
- npm

## Installation

1. Clone the repository:

```bash
git clone https://github.com/nav7v/Flight-Booking-API.git
cd Flight-Booking-API
```

2. Install dependencies:

```bash
npm install
```

3. Create your environment file:

```bash
cp .env.example .env
```

4. Update `.env` with your MongoDB settings:

```env
MONGO_URI=mongodb://localhost:27017/flight-booking-app
PORT=3000
```

## Running the Application

Start the development server:

```bash
npm run dev
```

Or run in production mode:

```bash
npm start
```

The server will start on:

```text
http://localhost:3000
```

The frontend is served from the `client` directory, and the API documentation is available at:

```text
http://localhost:3000/api/docs
```

## Environment Variables

| Variable | Description |
| --- | --- |
| `MONGO_URI` | MongoDB connection string |
| `PORT` | Port for the Express server |

## API Overview

### Authentication

- `POST /api/auth/register` — register a new user
- `POST /api/auth/login` — log in a user
- `POST /api/auth/logout` — log out a user

### Flights

- `GET /api/flights` — get flights with optional filters
- `GET /api/flights/:id` — get a single flight
- `POST /api/flights` — create a flight (admin only)
- `PUT /api/flights/:id` — update a flight (admin only)
- `DELETE /api/flights/:id` — delete a flight (admin only)

### Bookings

- `POST /api/bookings` — create a booking
- `GET /api/bookings/:id` — get booking details
- `PUT /api/bookings/:id/request-cancel` — request cancellation
- `PUT /api/bookings/:id/cancel` — cancel booking (admin only)

### Users

- `GET /api/users` and user-related routes are included in the app structure and are used for account management flows.

## Testing

Run the test suite with:

```bash
npm test
```

## Notes

- `.env` is ignored by Git and should never be committed.
- The app serves a static frontend from `client/` while exposing the API endpoints for backend functionality.
- Swagger documentation is generated from `docs/openapi.yaml` and available at `/api/docs`.
- If you are using a cloud MongoDB service, replace the local `MONGO_URI` with your remote connection string.

## License

This project is licensed under the ISC license.
