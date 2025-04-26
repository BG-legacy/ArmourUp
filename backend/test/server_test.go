package test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"armourup/internal/config"
	"armourup/internal/database"
	"armourup/internal/server"
)

func TestServer(t *testing.T) {
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
	srv := server.NewServer(router, db)

	// Test server health endpoint
	t.Run("Health Check", func(t *testing.T) {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/health", nil)
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		assert.Contains(t, w.Body.String(), "ok")
	})

	// Test server start
	t.Run("Server Start", func(t *testing.T) {
		// Start server in a goroutine
		go func() {
			err := srv.Start(":8081")
			if err != nil {
				t.Logf("Server start error: %v", err)
			}
		}()

		// Test if server is running
		resp, err := http.Get("http://localhost:8081/health")
		if err != nil {
			t.Skip("Skipping test due to server connection error:", err)
			return
		}
		assert.Equal(t, http.StatusOK, resp.StatusCode)
	})
} 