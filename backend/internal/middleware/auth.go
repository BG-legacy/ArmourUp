// Package middleware provides HTTP middleware functions for the ArmourUp API.
package middleware

import (
	"net/http"
	"os"
	"strings"
	"time"

	"armourup/internal/domain/auth"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/spf13/viper"
)

// getJWTSecret retrieves the JWT secret key from configuration.
// It checks viper first, then falls back to direct environment variable lookup,
// and finally to a default value if neither is set.
func getJWTSecret() []byte {
	// Try viper first (supports config file and env vars)
	secret := viper.GetString("jwt.secret")
	if secret != "" && secret != "your-secret-key" {
		return []byte(secret)
	}

	// Fallback to direct environment variable lookup
	if secret = os.Getenv("ARMOURUP_JWT_SECRET"); secret != "" {
		return []byte(secret)
	}

	// Final fallback (should not happen in production)
	return []byte("your-secret-key")
}

// AuthMiddleware is a Gin middleware that validates JWT tokens in the Authorization header.
// It performs the following checks:
// 1. Verifies the presence of the Authorization header
// 2. Validates the "Bearer" token format
// 3. Parses and verifies the JWT token
// 4. Sets user information in the request context
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get the Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is required"})
			c.Abort()
			return
		}

		// Check if the header is in the format "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization header format"})
			c.Abort()
			return
		}

		// Parse and validate the token
		tokenString := parts[1]
		claims := &auth.Claims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return getJWTSecret(), nil
		})

		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		if !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		// Set the user ID in the context (using snake_case for consistency)
		c.Set("user_id", claims.UserID)
		c.Set("user_email", claims.Email)
		c.Set("user_role", claims.Role)

		c.Next()
	}
}

// GenerateToken creates a new JWT token pair (access token and refresh token) for a user.
// The access token expires in 24 hours, while the refresh token expires in 7 days.
// Returns a TokenResponse containing both tokens and their metadata.
func GenerateToken(userID uint, email, role string) (*auth.TokenResponse, error) {
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &auth.Claims{
		UserID: userID,
		Email:  email,
		Role:   role,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(getJWTSecret())
	if err != nil {
		return nil, err
	}

	// Generate refresh token
	refreshToken := jwt.New(jwt.SigningMethodHS256)
	rtClaims := refreshToken.Claims.(jwt.MapClaims)
	rtClaims["user_id"] = userID
	rtClaims["exp"] = time.Now().Add(7 * 24 * time.Hour).Unix()
	refreshTokenString, err := refreshToken.SignedString(getJWTSecret())
	if err != nil {
		return nil, err
	}

	return &auth.TokenResponse{
		AccessToken:  tokenString,
		RefreshToken: refreshTokenString,
		TokenType:    "Bearer",
		ExpiresIn:    expirationTime.Unix(),
	}, nil
}
