package testutils

import (
	"armourup/internal/domain/auth"
	"armourup/internal/domain/user"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// CreateTestUser creates a test user in the database
func CreateTestUser(t *testing.T, db *gorm.DB, email, password string) *user.User {
	userRepo := user.NewRepository(db)
	userSvc := user.NewService(userRepo)

	u := &user.User{
		Username:     "testuser",
		Email:        email,
		PasswordHash: password, // In a real test, this should be hashed
	}

	if err := userSvc.CreateUser(u); err != nil {
		t.Fatalf("Failed to create test user: %v", err)
	}
	return u
}

// GenerateTestToken creates a JWT token for testing
func GenerateTestToken(t *testing.T, userID uint) string {
	claims := jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	secret := []byte("test-secret-key")
	tokenString, err := token.SignedString(secret)
	if err != nil {
		t.Fatalf("Failed to generate test token: %v", err)
	}

	return tokenString
}

// CreateTestAuthContext creates a test authentication context
func CreateTestAuthContext(t *testing.T, db *gorm.DB) (*auth.Controller, string) {
	userRepo := user.NewRepository(db)
	userSvc := user.NewService(userRepo)
	// Use a no-op logger for tests
	logger := zap.NewNop()
	authController := auth.NewController(db, userSvc, logger)

	// Create test user
	email := "test@example.com"
	password := "testpassword"
	u := CreateTestUser(t, db, email, password)

	// Generate token
	token := GenerateTestToken(t, u.ID)

	return authController, token
}
