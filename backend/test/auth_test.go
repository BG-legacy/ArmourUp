package test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"armourup/internal/config"
	"armourup/internal/database"
	"armourup/internal/server"
)

func TestAuthEndpoints(t *testing.T) {
	// Setup test configuration
	SetupTestConfig(t)
	defer TeardownTestConfig(t)

	// Load configuration
	err := config.LoadConfig()
	assert.NoError(t, err)

	// Initialize test database
	db, err := database.InitDB()
	if err != nil {
		t.Skip("Skipping test due to database connection error:", err)
		return
	}

	// Get the underlying *sql.DB
	sqlDB, err := db.DB()
	if err != nil {
		t.Skip("Skipping test due to database error:", err)
		return
	}
	defer sqlDB.Close()

	// Create router
	router := gin.Default()

	// Initialize server
	server.NewServer(router, db)

	// Test registration
	t.Run("Registration", func(t *testing.T) {
		// Test valid registration
		registerData := map[string]string{
			"email":    "test@example.com",
			"password": "password123",
		}
		jsonData, _ := json.Marshal(registerData)

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/api/register", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusCreated, w.Code)
		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.NotEmpty(t, response["access_token"])
		assert.NotEmpty(t, response["refresh_token"])

		// Test duplicate registration
		w = httptest.NewRecorder()
		req, _ = http.NewRequest("POST", "/api/register", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusInternalServerError, w.Code)
	})

	// Test login
	t.Run("Login", func(t *testing.T) {
		// Test valid login
		loginData := map[string]string{
			"email":    "test@example.com",
			"password": "password123",
		}
		jsonData, _ := json.Marshal(loginData)

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/api/login", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.NotEmpty(t, response["access_token"])
		assert.NotEmpty(t, response["refresh_token"])

		// Test invalid login
		invalidLoginData := map[string]string{
			"email":    "test@example.com",
			"password": "wrongpassword",
		}
		jsonData, _ = json.Marshal(invalidLoginData)

		w = httptest.NewRecorder()
		req, _ = http.NewRequest("POST", "/api/login", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})

	// Test token refresh
	t.Run("Token Refresh", func(t *testing.T) {
		// First login to get tokens
		loginData := map[string]string{
			"email":    "test@example.com",
			"password": "password123",
		}
		jsonData, _ := json.Marshal(loginData)

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/api/login", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		router.ServeHTTP(w, req)

		var loginResponse map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &loginResponse)
		assert.NoError(t, err)

		// Test valid refresh
		refreshData := map[string]string{
			"refresh_token": loginResponse["refresh_token"].(string),
		}
		jsonData, _ = json.Marshal(refreshData)

		w = httptest.NewRecorder()
		req, _ = http.NewRequest("POST", "/api/refresh", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var response map[string]interface{}
		err = json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.NotEmpty(t, response["access_token"])
		assert.NotEmpty(t, response["refresh_token"])

		// Test invalid refresh token
		invalidRefreshData := map[string]string{
			"refresh_token": "invalid.token.here",
		}
		jsonData, _ = json.Marshal(invalidRefreshData)

		w = httptest.NewRecorder()
		req, _ = http.NewRequest("POST", "/api/refresh", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})

	// Test protected routes
	t.Run("Protected Routes", func(t *testing.T) {
		// First login to get token
		loginData := map[string]string{
			"email":    "test@example.com",
			"password": "password123",
		}
		jsonData, _ := json.Marshal(loginData)

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/api/login", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		router.ServeHTTP(w, req)

		var loginResponse map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &loginResponse)
		assert.NoError(t, err)

		// Test access to protected route with valid token
		w = httptest.NewRecorder()
		req, _ = http.NewRequest("GET", "/api/journal", nil)
		req.Header.Set("Authorization", "Bearer "+loginResponse["access_token"].(string))
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		// Test access to protected route with invalid token
		w = httptest.NewRecorder()
		req, _ = http.NewRequest("GET", "/api/journal", nil)
		req.Header.Set("Authorization", "Bearer invalid.token.here")
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)

		// Test access to protected route without token
		w = httptest.NewRecorder()
		req, _ = http.NewRequest("GET", "/api/journal", nil)
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})
} 