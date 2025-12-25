# ArmourUp - Frontend & Backend Communication Setup

This guide ensures that the frontend (Next.js) and backend (Go) are properly configured to communicate with each other.

## Quick Start

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Set up environment variables:**
   Create a `.env` file in the `backend` directory (or use environment variables):
   ```bash
   ARMOURUP_SERVER_PORT=8080
   ARMOURUP_DATABASE_HOST=localhost
   ARMOURUP_DATABASE_PORT=5432
   ARMOURUP_DATABASE_USER=postgres
   ARMOURUP_DATABASE_PASSWORD=postgres
   ARMOURUP_DATABASE_DBNAME=armourup
   ARMOURUP_JWT_SECRET=your-secret-key-change-in-production
   OPENAI_API_KEY=your-openai-api-key-here
   RUN_MIGRATIONS=true
   ```

3. **Start the backend server:**
   ```bash
   go run main.go
   ```
   
   The backend will run on `http://localhost:8080` by default.

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the `frontend` directory:
   ```bash
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
   ```
   
   **For production**, set this to your deployed backend URL:
   ```bash
   NEXT_PUBLIC_BACKEND_URL=https://armourup.onrender.com
   ```

3. **Install dependencies (if not already done):**
   ```bash
   npm install
   ```

4. **Start the frontend development server:**
   ```bash
   npm run dev
   ```
   
   The frontend will run on `http://localhost:3000` by default.

## Communication Flow

### Architecture

```
Frontend (Next.js)          Backend (Go)
┌─────────────────┐         ┌─────────────────┐
│  Components      │         │                 │
│  (React)         │         │                 │
└────────┬────────┘         │                 │
         │                   │                 │
         │ fetch('/api/...') │                 │
         ▼                   │                 │
┌─────────────────┐         │                 │
│  Next.js API    │─────────►│  Go API         │
│  Routes         │  HTTP    │  Endpoints      │
│  (/api/*)       │  Request │  (/api/*)       │
└─────────────────┘         └─────────────────┘
```

### How It Works

1. **Frontend components** make requests to Next.js API routes (e.g., `/api/login`)
2. **Next.js API routes** act as a proxy, forwarding requests to the Go backend
3. **Go backend** processes the request and returns a response
4. **Next.js API routes** forward the response back to the frontend components

### API Endpoints Mapping

| Frontend Route | Backend Route | Purpose |
|--------------|---------------|---------|
| `/api/login` | `POST /api/login` | User authentication |
| `/api/register` | `POST /api/register` | User registration |
| `/api/users/me` | `GET /api/users/me` | Get current user |
| `/api/encourage` | `GET /api/encourage` | Get encouragements |
| `/api/encourage/log-struggle` | `POST /api/encourage/log-struggle` | Log a struggle |
| `/api/ai/encourage` | `POST /api/ai/encourage` | Get AI encouragement |
| `/api/journal` | `GET /api/journal` | Get journal entries |
| `/api/journal/[id]` | `GET /api/journal/:id` | Get specific journal entry |

## CORS Configuration

The backend CORS middleware is configured to allow requests from:
- `http://localhost:3000` (local development)
- `http://127.0.0.1:3000` (local development alternative)
- `https://armourup.onrender.com` (production backend)
- `https://armour-up.vercel.app` (production frontend)

If you need to add additional origins, edit `backend/internal/middleware/security.go`:

```go
allowedOrigins := []string{
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://your-production-url.com",
}
```

## Environment Variables

### Frontend Environment Variables

- `NEXT_PUBLIC_BACKEND_URL`: The URL of the backend API (default: `http://localhost:8080`)
- `BACKEND_URL`: Alternative environment variable (used as fallback)

### Backend Environment Variables

- `ARMOURUP_SERVER_PORT`: Port for the backend server (default: `8080`)
- `ARMOURUP_DATABASE_HOST`: Database host (default: `localhost`)
- `ARMOURUP_DATABASE_PORT`: Database port (default: `5432`)
- `ARMOURUP_DATABASE_USER`: Database username
- `ARMOURUP_DATABASE_PASSWORD`: Database password
- `ARMOURUP_DATABASE_DBNAME`: Database name
- `ARMOURUP_JWT_SECRET`: Secret key for JWT tokens
- `OPENAI_API_KEY`: OpenAI API key (optional)
- `RUN_MIGRATIONS`: Set to `"true"` to run migrations on startup

## Troubleshooting

### Frontend can't connect to backend

1. **Check if backend is running:**
   ```bash
   curl http://localhost:8080/api/health
   ```
   Should return: `{"status":"ok"}`

2. **Check environment variables:**
   - Verify `NEXT_PUBLIC_BACKEND_URL` is set correctly in `.env.local`
   - Restart the Next.js dev server after changing environment variables

3. **Check CORS:**
   - Verify your frontend origin is in the allowed origins list
   - Check browser console for CORS errors

### Authentication issues

1. **Check JWT secret:**
   - Ensure `ARMOURUP_JWT_SECRET` is set in backend
   - Use the same secret in all environments

2. **Check token storage:**
   - Tokens are stored in `localStorage` as `accessToken` and `refreshToken`
   - Check browser DevTools > Application > Local Storage

### API route errors

1. **Check backend logs:**
   - Backend logs are written to `server.log` and stdout
   - Look for error messages in the logs

2. **Check network tab:**
   - Open browser DevTools > Network tab
   - Check if requests are being made
   - Verify request/response status codes

## Testing the Connection

1. **Test backend health:**
   ```bash
   curl http://localhost:8080/api/health
   ```

2. **Test frontend API route:**
   ```bash
   curl http://localhost:3000/api/login -X POST -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"test123"}'
   ```

3. **Test full flow:**
   - Start both backend and frontend
   - Open `http://localhost:3000` in your browser
   - Try to register/login
   - Check browser console and network tab for any errors

## Production Deployment

### Backend (Render.com example)

1. Set environment variables in Render dashboard
2. Set `RUN_MIGRATIONS=true` for initial deployment
3. Backend URL will be something like `https://armourup.onrender.com`

### Frontend (Vercel example)

1. Set `NEXT_PUBLIC_BACKEND_URL` environment variable in Vercel dashboard
2. Set it to your deployed backend URL
3. Redeploy the frontend

## Notes

- The frontend uses Next.js API routes as a proxy layer
- All API routes use `process.env.BACKEND_URL` or fallback to `http://localhost:8080`
- CORS is handled by the backend middleware
- Authentication tokens are stored in browser localStorage
- The backend uses JWT tokens for authentication






