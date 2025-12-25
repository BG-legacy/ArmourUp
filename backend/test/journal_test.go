package test

import (
	"bytes"
	"encoding/json"
	"fmt"
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

func TestJournalEndpoints(t *testing.T) {
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

	// Initialize server and set up routes
	logger := zap.NewNop()
	server.SetupRoutes(router, db, logger)

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

	// Test create journal entry
	t.Run("Create Journal Entry", func(t *testing.T) {
		journalData := map[string]string{
			"title":   "Test Entry",
			"content": "This is a test journal entry",
		}
		jsonData, _ := json.Marshal(journalData)

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/api/journal", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+token)
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusCreated, w.Code)
		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.NotEmpty(t, response["id"])
		assert.Equal(t, journalData["title"], response["title"])
		assert.Equal(t, journalData["content"], response["content"])
	})

	// Test get journal entries
	t.Run("Get Journal Entries", func(t *testing.T) {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/api/journal", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var response []map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Greater(t, len(response), 0)
	})

	// Test get single journal entry
	t.Run("Get Single Journal Entry", func(t *testing.T) {
		// First create a journal entry
		journalData := map[string]string{
			"title":   "Single Entry Test",
			"content": "This is a test for getting a single entry",
		}
		jsonData, _ := json.Marshal(journalData)

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/api/journal", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+token)
		router.ServeHTTP(w, req)

		var createResponse map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &createResponse)
		assert.NoError(t, err)
		entryID := fmt.Sprintf("%.0f", createResponse["id"].(float64))

		// Now get it
		w = httptest.NewRecorder()
		req, _ = http.NewRequest("GET", "/api/journal/"+entryID, nil)
		req.Header.Set("Authorization", "Bearer "+token)
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var response map[string]interface{}
		err = json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, entryID, fmt.Sprintf("%.0f", response["id"].(float64)))
		assert.Equal(t, journalData["title"], response["title"])
		assert.Equal(t, journalData["content"], response["content"])
	})

	// Test update journal entry
	t.Run("Update Journal Entry", func(t *testing.T) {
		// First create a journal entry
		journalData := map[string]string{
			"title":   "Original Title",
			"content": "Original content",
		}
		jsonData, _ := json.Marshal(journalData)

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/api/journal", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+token)
		router.ServeHTTP(w, req)

		var createResponse map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &createResponse)
		assert.NoError(t, err)
		entryID := fmt.Sprintf("%.0f", createResponse["id"].(float64))

		// Now update it
		updateData := map[string]string{
			"title":   "Updated Title",
			"content": "Updated content",
		}
		jsonData, _ = json.Marshal(updateData)

		w = httptest.NewRecorder()
		req, _ = http.NewRequest("PUT", "/api/journal/"+entryID, bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+token)
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var response map[string]interface{}
		err = json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, updateData["title"], response["title"])
		assert.Equal(t, updateData["content"], response["content"])
	})

	// Test delete journal entry
	t.Run("Delete Journal Entry", func(t *testing.T) {
		// First create a journal entry
		journalData := map[string]string{
			"title":   "To be deleted",
			"content": "This entry will be deleted",
		}
		jsonData, _ := json.Marshal(journalData)

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/api/journal", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+token)
		router.ServeHTTP(w, req)

		var createResponse map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &createResponse)
		assert.NoError(t, err)
		entryID := fmt.Sprintf("%.0f", createResponse["id"].(float64))

		// Now delete it
		w = httptest.NewRecorder()
		req, _ = http.NewRequest("DELETE", "/api/journal/"+entryID, nil)
		req.Header.Set("Authorization", "Bearer "+token)
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusNoContent, w.Code)

		// Verify it's deleted
		w = httptest.NewRecorder()
		req, _ = http.NewRequest("GET", "/api/journal/"+entryID, nil)
		req.Header.Set("Authorization", "Bearer "+token)
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusNotFound, w.Code)
	})
}
