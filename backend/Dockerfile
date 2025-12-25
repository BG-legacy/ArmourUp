# ArmourUp Backend Dockerfile
# This is a multi-stage build that creates a minimal production image
# for the ArmourUp backend service.

# Build stage
FROM golang:1.21-alpine AS builder

# Install build dependencies
# git is required for fetching dependencies
RUN apk add --no-cache git

# Set working directory for the build stage
WORKDIR /app

# Copy dependency files
# This is done first to leverage Docker's layer caching
COPY go.mod go.sum ./

# Download dependencies
# This step is cached unless go.mod or go.sum changes
RUN go mod download

# Copy the entire source code
COPY . .

# Build the application
# CGO_ENABLED=0 creates a statically linked binary
# GOOS=linux ensures the binary is built for Linux
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Final stage
FROM alpine:latest

# Install runtime dependencies
# ca-certificates: Required for HTTPS connections
# tzdata: Required for timezone support
RUN apk add --no-cache ca-certificates tzdata

# Set working directory for the final stage
WORKDIR /app

# Copy the compiled binary from the builder stage
COPY --from=builder /app/main .

# Copy configuration files
COPY --from=builder /app/config ./config

# Copy database migrations
COPY --from=builder /app/migrations ./migrations

# Expose the port the application runs on
EXPOSE 8080

# Set environment variables
# These can be overridden at runtime using docker-compose or docker run
ENV ENV=production \
    GIN_MODE=release \
    ARMOURUP_DATABASE_HOST=postgres \
    ARMOURUP_DATABASE_PORT=5432 \
    ARMOURUP_DATABASE_USER=armourup \
    ARMOURUP_DATABASE_PASSWORD=armourup_password \
    ARMOURUP_DATABASE_DBNAME=armourup

# Run the application
# The binary is executed when the container starts
CMD ["./main"] 