package test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"armourup/internal/config"
	"armourup/internal/server"
	"armourup/test/testutils"

	"armourup/internal/domain/openai"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestOpenAIEndpoints(t *testing.T) {
	// Setup test configuration
	SetupTestConfig(t)
	defer TeardownTestConfig(t)

	// Set OpenAI API key for testing
	os.Setenv("OPENAI_API_KEY", "test-key")

	// Load configuration
	err := config.LoadConfig()
	assert.NoError(t, err)

	// Initialize test database
	db := testutils.SetupTestDB(t)
	defer testutils.TeardownTestDB(t, db)

	// Create router
	router := gin.Default()

	// Initialize server and set up routes
	server.SetupRoutes(router, db)

	// First create a test user and get token
	registerData := map[string]string{
		"username": "testuser",
		"email":    "test@example.com",
		"password": "password123",
	}
	jsonData, _ := json.Marshal(registerData)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/register", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w, req)

	var registerResponse map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &registerResponse)
	assert.NoError(t, err)
	token := registerResponse["access_token"].(string)

	t.Run("Get OpenAI Encouragement", func(t *testing.T) {
		requestBody := map[string]interface{}{
			"input": "I'm feeling down today",
		}
		jsonData, _ := json.Marshal(requestBody)

		req := httptest.NewRequest("POST", "/api/ai/encourage", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+token)

		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.NotEmpty(t, response["message"])
	})

	t.Run("Rate Limiting", func(t *testing.T) {
		requestBody := map[string]interface{}{
			"input": "Test prompt",
		}
		jsonData, _ := json.Marshal(requestBody)

		// Make multiple requests in quick succession
		for i := 0; i < 10; i++ {
			req := httptest.NewRequest("POST", "/api/ai/encourage", bytes.NewBuffer(jsonData))
			req.Header.Set("Content-Type", "application/json")
			req.Header.Set("Authorization", "Bearer "+token)

			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			if i < 5 {
				assert.Equal(t, http.StatusOK, w.Code)
			} else {
				assert.Equal(t, http.StatusTooManyRequests, w.Code)
			}
		}
	})

	t.Run("Unauthorized Access", func(t *testing.T) {
		requestBody := map[string]interface{}{
			"input": "Test prompt",
		}
		jsonData, _ := json.Marshal(requestBody)

		req := httptest.NewRequest("POST", "/api/ai/encourage", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})

	t.Run("Invalid Request", func(t *testing.T) {
		// Missing input
		requestBody := map[string]interface{}{}
		jsonData, _ := json.Marshal(requestBody)

		req := httptest.NewRequest("POST", "/api/ai/encourage", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+token)

		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusBadRequest, w.Code)
	})

	t.Run("OpenAI Endpoint", func(t *testing.T) {
		requestBody := map[string]interface{}{
			"input": "Test prompt",
		}
		jsonData, _ := json.Marshal(requestBody)

		req := httptest.NewRequest("POST", "/api/ai/encourage", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+token)

		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.NotEmpty(t, response["message"])
	})
}

func setupRouter() *gin.Engine {
	router := gin.Default()
	service, err := openai.NewService()
	if err != nil {
		panic(err)
	}
	openaiController := openai.NewController(service)
	router.POST("/api/ai/encourage", openaiController.GetEncouragement)
	return router
}
