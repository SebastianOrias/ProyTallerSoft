# ProyTallerSoft — Microservices Project

A full-stack microservices application with a React + Vite frontend, Firebase authentication, and Node.js backend services orchestrated through an API Gateway.

---

## Project Structure

```
ProyTallerSoft/
├── frontend/                   # React + Vite frontend (Firebase Auth)
│   ├── src/
│   │   ├── firebase/
│   │   │   └── config.js       # Firebase initialization
│   │   ├── services/
│   │   │   └── apiService.js   # HTTP client for the API Gateway
│   │   └── App.jsx             # Root application component
│   ├── .env.example            # Frontend environment variable template
│   └── package.json
├── services/
│   ├── api-gateway/            # Express API Gateway (port 3000)
│   │   ├── src/
│   │   │   └── index.js        # Gateway entry point & proxy routes
│   │   ├── .env.example
│   │   └── package.json
│   └── sample-service/         # Express microservice (port 3001)
│       ├── src/
│       │   └── index.js        # Sample service entry point
│       ├── .env.example
│       └── package.json
├── docker-compose.yml          # Multi-service Docker orchestration
└── README.md
```

---

## Environment Variable Setup

Each service uses a `.env` file. Copy the provided examples before running:

```bash
# Frontend
cp frontend/.env.example frontend/.env

# API Gateway
cp services/api-gateway/.env.example services/api-gateway/.env

# Sample Service
cp services/sample-service/.env.example services/sample-service/.env
```

---

## Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Enable **Authentication** → Sign-in method → **Email/Password**.
3. Enable **Firestore Database** (start in test mode for development).
4. Go to **Project Settings** → **General** → **Your apps** → add a Web app.
5. Copy the config values into `frontend/.env`:

```env
VITE_FIREBASE_API_KEY=<apiKey>
VITE_FIREBASE_AUTH_DOMAIN=<authDomain>
VITE_FIREBASE_PROJECT_ID=<projectId>
VITE_FIREBASE_STORAGE_BUCKET=<storageBucket>
VITE_FIREBASE_MESSAGING_SENDER_ID=<messagingSenderId>
VITE_FIREBASE_APP_ID=<appId>
```

---

## Running Services Locally

### Frontend

```bash
cd frontend
npm install          # first time only
npm run dev          # starts on http://localhost:5173
```

### API Gateway

```bash
cd services/api-gateway
npm run dev          # starts on http://localhost:3000 (with nodemon)
# or
npm start            # starts without hot-reload
```

### Sample Service

```bash
cd services/sample-service
npm run dev          # starts on http://localhost:3001 (with nodemon)
# or
npm start            # starts without hot-reload
```

### Available Endpoints

| Service        | Endpoint                       | Description                       |
|----------------|--------------------------------|-----------------------------------|
| API Gateway    | `GET /health`                  | Gateway health check              |
| API Gateway    | `ANY /sample/*`                | Proxied to sample-service         |
| Sample Service | `GET /health`                  | Service health check              |
| Sample Service | `GET /api/data`                | Static sample data                |
| Sample Service | `GET /api/external`            | Fetches posts from JSONPlaceholder |

---

## Docker Compose Usage

Build and start all backend services:

```bash
docker-compose up --build
```

Stop all services:

```bash
docker-compose down
```

Run in detached mode:

```bash
docker-compose up -d --build
```

> **Note:** The frontend is not included in Docker Compose — run it locally with `npm run dev` pointing `VITE_API_GATEWAY_URL` at `http://localhost:3000`.

---

## Adding a New Microservice

Follow these steps to add a new service (e.g. `user-service`):

1. **Create the directory and init npm:**
   ```bash
   mkdir -p services/user-service/src
   cd services/user-service
   npm init -y
   npm install express dotenv
   npm install --save-dev nodemon
   ```

2. **Create `services/user-service/src/index.js`:**
   ```js
   require("dotenv").config();
   const express = require("express");
   const app = express();
   const PORT = process.env.PORT || 3002;

   app.use(express.json());

   app.get("/health", (_req, res) => {
     res.json({ status: "ok", service: "user-service", timestamp: new Date().toISOString() });
   });

   app.listen(PORT, () => console.log(`user-service running on port ${PORT}`));
   ```

3. **Add start/dev scripts** to `services/user-service/package.json`:
   ```json
   "scripts": {
     "start": "node src/index.js",
     "dev": "nodemon src/index.js"
   }
   ```

4. **Create `services/user-service/.env.example`:**
   ```
   PORT=3002
   ```

5. **Register the service in `docker-compose.yml`:**
   ```yaml
   user-service:
     build: ./services/user-service
     ports:
       - "3002:3002"
     environment:
       - PORT=3002
     networks:
       - backend
   ```

6. **Add a proxy route in `services/api-gateway/src/index.js`:**
   ```js
   const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:3002";

   app.use(
     "/users",
     createProxyMiddleware({
       target: USER_SERVICE_URL,
       changeOrigin: true,
       pathRewrite: { "^/users": "" },
     })
   );
   ```

7. **Add `USER_SERVICE_URL` to `services/api-gateway/.env`:**
   ```
   USER_SERVICE_URL=http://user-service:3002
   ```

The new service is now accessible via the gateway at `/users/*`.
