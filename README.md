
# Multi-Tenant CRM SaaS

A full-stack SaaS CRM application built with a secure and production-ready architecture.

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- CSRF Protection
- Rate Limiting
- Helmet Security
- Request Logging
- Health Check Endpoint

### Frontend
- React
- Vite
- Axios

---

## Project Structure

```

project-root
│
├── backend
│   ├── controllers
│   ├── middlewares
│   ├── models
│   ├── routes
│   ├── utils
│   ├── **tests**
│   ├── app.js
│   ├── server.js
│   └── .env.example
│
├── frontend
│   ├── src
│   ├── public
│   └── .env.example
│
└── README.md

```

---

## Backend Setup

1. Go to backend folder

```

cd backend

```

2. Copy environment variables

```

cp .env.example .env

```

3. Install dependencies

```

npm install

```

4. Run backend server

```

npm run dev

```

Backend runs at:

```

[http://localhost:5001](http://localhost:5001)

```

Health check endpoint:

```

[http://localhost:5001/health](http://localhost:5001/health)

```

---

## Frontend Setup

1. Go to frontend folder

```

cd frontend

```

2. Copy environment variables

```

cp .env.example .env

```

3. Install dependencies

```

npm install

```

4. Start frontend

```

npm run dev

```

Frontend runs at:

```

[http://localhost:5173](http://localhost:5173)

```

---

## Environment Variables

Backend requires these variables:

```

PORT
MONGO_URI
JWT_SECRET
JWT_REFRESH_SECRET
FRONTEND_URL

```

Check `.env.example` for full configuration.

---

## Deployment

Typical deployment setup:

Frontend → Vercel  
Backend → Render / Railway / AWS  
Database → MongoDB Atlas

---

## Health Check Endpoint

```

GET /health

````

Example response:

```json
{
  "status": "OK",
  "database": "connected",
  "uptime": 1000,
  "environment": "production"
}
````

---

## Security Features

* Helmet HTTP security headers
* Rate limiting
* CSRF protection
* MongoDB query sanitization
* Secure authentication with JWT

---

## License

MIT

```

---

### After Creating the File

Run:

```

git add README.md
git commit -m "Add project README"
git push

```

---
