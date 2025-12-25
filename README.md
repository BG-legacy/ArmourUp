# ArmourUp

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

ArmourUp is a full-stack web application built with a Go backend and Next.js frontend, designed to provide a robust, scalable solution.

## 🚀 Features

### Core Features
- **Modern Tech Stack**: Go backend with Gin framework, Next.js frontend with TypeScript and Tailwind CSS
- **Containerized Deployment**: Docker and Docker Compose configuration for easy deployment
- **Database Integration**: PostgreSQL database with automated migrations
- **Structured Logging**: zap logger for structured, production-ready logging
- **API Validation**: Request validation middleware
- **CORS Support**: Configurable cross-origin resource sharing
- **Authentication & Authorization**: Secure JWT-based authentication system

### Spiritual Growth Features
- **Daily Encouragement**: Get personalized Bible verses and encouragement for spiritual struggles
- **Prayer Wall**: Share anonymous prayer requests and pray for others in the community
- **Prayer Chains**: Create and join prayer groups where members commit to pray for each other
- **Gratitude Journal**: Record daily blessings and practice thanksgiving with categorized entries
- **Mood Tracker**: Track emotional and spiritual well-being with daily check-ins and trend analysis
- **Prayer History**: Review past prayers, encouragements, and see answered prayers

## 🧰 Tech Stack

### Backend
- **Go**: Main programming language
- **Gin**: HTTP web framework
- **Zap**: Structured logging
- **Viper**: Configuration management
- **PostgreSQL**: Relational database

### Frontend
- **Next.js 15**: React framework
- **React 19**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS 4**: Utility-first CSS framework
- **Framer Motion**: Animation library

## 📋 Prerequisites

- Go 1.20 or higher
- Node.js 18.0 or higher
- npm or yarn
- Docker and Docker Compose (for containerized deployment)
- PostgreSQL (if running locally without Docker)

## 🔧 Installation

### Clone the Repository

```bash
git clone https://github.com/yourusername/armourup.git
cd armourup
```

### Backend Setup

```bash
cd backend

# Install dependencies
go mod download

# Run locally
go run main.go

# Or using Docker Compose
docker-compose up -d
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
# or
yarn install

# Run development server
npm run dev
# or
yarn dev
```

## 🚢 Deployment

### Using Docker Compose

Navigate to the backend directory and run:

```bash
docker-compose up -d
```

### Manual Deployment

#### Backend

```bash
cd backend
go build -o armourup-server
./armourup-server
```

#### Frontend

```bash
cd frontend
npm run build
npm run start
```

## 🧪 Testing

### Backend

```bash
cd backend
go test ./...
```

### Frontend

```bash
cd frontend
npm run test
```

## 📖 API Documentation

API documentation is available at `/api/docs` when the backend server is running.

## 🛠️ Configuration

### Backend

Configuration is managed through environment variables or config files in the `config` directory.

Key configuration options include:

- `ARMOURUP_DATABASE_HOST`: PostgreSQL host
- `ARMOURUP_DATABASE_PORT`: PostgreSQL port
- `ARMOURUP_DATABASE_USER`: Database username
- `ARMOURUP_DATABASE_PASSWORD`: Database password
- `ARMOURUP_DATABASE_DBNAME`: Database name

### Frontend

Frontend configuration is managed through `.env` files:

- `.env.local`: Local development
- `.env.production`: Production deployment

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request