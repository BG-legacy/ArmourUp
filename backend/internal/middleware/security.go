// Package middleware provides HTTP middleware functions for the ArmourUp API.
package middleware

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/ulule/limiter/v3"
	"github.com/ulule/limiter/v3/drivers/store/memory"
)

// CORSMiddleware implements Cross-Origin Resource Sharing (CORS) headers.
// It allows requests from specified origins (localhost for development) and sets appropriate CORS headers.
// The middleware handles preflight requests and sets the following headers:
// - Access-Control-Allow-Origin
// - Access-Control-Allow-Credentials
// - Access-Control-Allow-Headers
// - Access-Control-Allow-Methods
// - Access-Control-Max-Age
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		
		// Check if origin is allowed
		isAllowed := false
		
		// Allow local development
		if origin == "http://localhost:3000" || origin == "http://127.0.0.1:3000" {
			isAllowed = true
		}
		
		// Allow production domains
		if origin == "https://armourup.onrender.com" || 
		   origin == "https://armour-up.vercel.app" {
			isAllowed = true
		}
		
		// Allow all Vercel preview deployments (*.vercel.app)
		if strings.HasSuffix(origin, ".vercel.app") {
			isAllowed = true
		}
		
		// Set CORS headers
		if isAllowed {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		} else {
			// Default to localhost for development
			c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		}
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Max-Age", "86400") // 24 hours

		// Handle preflight requests
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

// RequestLogger is a middleware that logs details about each HTTP request.
// It logs the following information:
// - Timestamp
// - HTTP status code
// - Request latency
// - Client IP address
// - HTTP method
// - Request path
// - Query parameters
// - Error messages (if any)
func RequestLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		raw := c.Request.URL.RawQuery

		// Process request
		c.Next()

		// Log request details
		latency := time.Since(start)
		clientIP := c.ClientIP()
		method := c.Request.Method
		statusCode := c.Writer.Status()
		errorMessage := c.Errors.ByType(gin.ErrorTypePrivate).String()

		if raw != "" {
			path = path + "?" + raw
		}

		gin.DefaultWriter.Write([]byte(
			fmt.Sprintf("[GIN] %s | %d | %s | %s | %s %s %s\n",
				time.Now().Format("2006/01/02 - 15:04:05"),
				statusCode,
				latency.String(),
				clientIP,
				method,
				path,
				errorMessage,
			),
		))
	}
}

// InputValidator is a middleware that validates incoming request bodies.
// It performs the following checks:
// - Skips validation for GET and DELETE requests
// - Validates body presence only when Content-Type indicates JSON
// Returns a 400 Bad Request if validation fails.
func InputValidator() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Skip validation for GET and DELETE requests
		if c.Request.Method == "GET" || c.Request.Method == "DELETE" {
			c.Next()
			return
		}

		// Only validate body if Content-Type is application/json
		contentType := c.GetHeader("Content-Type")
		if contentType == "application/json" && c.Request.ContentLength == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Request body cannot be empty"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// RateLimiter is a middleware that implements rate limiting for API endpoints.
// It uses an in-memory store to track request counts per IP address.
// The limit parameter should be in the format "X-Y" where:
// - X is the number of requests allowed
// - Y is the time period (e.g., "10-M" for 10 requests per minute)
// Returns 429 Too Many Requests if the rate limit is exceeded.
func RateLimiter(limit string) gin.HandlerFunc {
	rate, err := limiter.NewRateFromFormatted(limit)
	if err != nil {
		panic(err)
	}

	store := memory.NewStore()
	instance := limiter.New(store, rate)

	return func(c *gin.Context) {
		context := c.Request.Context()
		limiterCtx, err := instance.Get(context, c.ClientIP())
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
			c.Abort()
			return
		}

		if limiterCtx.Reached {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "Too many requests. Please try again later.",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
