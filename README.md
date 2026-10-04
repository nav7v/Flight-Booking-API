# Flight Booking App

Backend: Node.js + Express + MongoDB
Frontend: Vanilla HTML/CSS/JS (single-page)

Run server:

```bash
npm install
npm run dev
```

Create your local environment file before starting the server (PowerShell):

```powershell
Copy-Item .env.example .env
```

Edit `.env` and set `MONGO_URI` to your MongoDB connection string. The `.env`
file is ignored by Git; never commit it. `.env.example` contains only a local
development URI and is safe to commit.

The server serves the frontend at http://localhost:3000 (or the port set by
`PORT` in `.env`).

Client is in `client/` (static files). To change API base, edit `client/app.js`.
