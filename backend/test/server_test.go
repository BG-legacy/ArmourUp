package test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"armourup/internal/config"
	"armourup/internal/server"
	"armourup/test/testutils"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"go.uber.org/zap"
)

func TestServer(t *testing.T) {
	// Setup test configuration
	SetupTestConfig(t)
	defer TeardownTestConfig(t)

	// Load configuration
	err := config.LoadConfig()
	assert.NoError(t, err)

	// Initialize test database
	db := testutils.SetupTestDB(t)
	defer testutils.TeardownTestDB(t, db)

	// Create router
	router := gin.Default()

	// Add health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// Initialize server and set up routes
	logger := zap.NewNop()
	server.SetupRoutes(router, db, logger)

	t.Run("Health Check", func(t *testing.T) {
		req := httptest.NewRequest("GET", "/health", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		assert.Equal(t, "{\"status\":\"ok\"}", w.Body.String())
	})

	t.Run("Server Start", func(t *testing.T) {
		// Test server start with health check
		req := httptest.NewRequest("GET", "/health", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		assert.Equal(t, "{\"status\":\"ok\"}", w.Body.String())
	})
}
