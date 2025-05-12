package test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"armourup/internal/config"
	"armourup/internal/server"
	"armourup/test/testutils"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestEncouragementEndpoints(t *testing.T) {
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
	server.SetupRoutes(router, db)

	// First create a test user
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

	// Test create encouragement
	t.Run("Create Encouragement", func(t *testing.T) {
		encouragementData := map[string]string{
			"message":  "You're doing great!",
			"type":     "motivational",
			"category": "general",
		}
		jsonData, _ := json.Marshal(encouragementData)

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/api/encourage", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+token)
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusCreated, w.Code)
		var response map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.NotEmpty(t, response["id"])
		assert.Equal(t, encouragementData["message"], response["message"])
		assert.Equal(t, encouragementData["type"], response["type"])
		assert.Equal(t, encouragementData["category"], response["category"])
	})

	// Test get encouragements
	t.Run("Get Encouragements", func(t *testing.T) {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/api/encourage", nil)
		req.Header.Set("Authorization", "Bearer "+token)
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var response []map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Greater(t, len(response), 0)
	})

	// Test get single encouragement
	t.Run("Get_Single_Encouragement", func(t *testing.T) {
		// Create an encouragement first
		createReq := httptest.NewRequest("POST", "/api/encourage", strings.NewReader(`{
			"message": "Test encouragement",
			"type": "test",
			"category": "test"
		}`))
		createReq.Header.Set("Content-Type", "application/json")
		createReq.Header.Set("Authorization", "Bearer "+token)
		createRec := httptest.NewRecorder()
		router.ServeHTTP(createRec, createReq)
		assert.Equal(t, http.StatusCreated, createRec.Code)

		var createResponse map[string]interface{}
		err := json.Unmarshal(createRec.Body.Bytes(), &createResponse)
		assert.NoError(t, err)

		// Get the encouragement
		encouragementID := fmt.Sprintf("%.0f", createResponse["id"].(float64))
		getReq := httptest.NewRequest("GET", "/api/encourage/"+encouragementID, nil)
		getReq.Header.Set("Authorization", "Bearer "+token)
		getRec := httptest.NewRecorder()
		router.ServeHTTP(getRec, getReq)
		assert.Equal(t, http.StatusOK, getRec.Code)

		var getResponse map[string]interface{}
		err = json.Unmarshal(getRec.Body.Bytes(), &getResponse)
		assert.NoError(t, err)
		assert.Equal(t, "Test encouragement", getResponse["message"])
		assert.Equal(t, "test", getResponse["type"])
		assert.Equal(t, "test", getResponse["category"])
		assert.Equal(t, encouragementID, fmt.Sprintf("%.0f", getResponse["id"].(float64)))
	})

	// Test update encouragement
	t.Run("Update_Encouragement", func(t *testing.T) {
		// Create an encouragement first
		createReq := httptest.NewRequest("POST", "/api/encourage", strings.NewReader(`{
			"message": "Original message",
			"type": "original",
			"category": "test"
		}`))
		createReq.Header.Set("Content-Type", "application/json")
		createReq.Header.Set("Authorization", "Bearer "+token)
		createRec := httptest.NewRecorder()
		router.ServeHTTP(createRec, createReq)
		assert.Equal(t, http.StatusCreated, createRec.Code)

		var createResponse map[string]interface{}
		err := json.Unmarshal(createRec.Body.Bytes(), &createResponse)
		assert.NoError(t, err)

		// Update the encouragement
		encouragementID := fmt.Sprintf("%.0f", createResponse["id"].(float64))
		updateReq := httptest.NewRequest("PUT", "/api/encourage/"+encouragementID, strings.NewReader(`{
			"message": "Updated message",
			"type": "updated",
			"category": "test"
		}`))
		updateReq.Header.Set("Content-Type", "application/json")
		updateReq.Header.Set("Authorization", "Bearer "+token)
		updateRec := httptest.NewRecorder()
		router.ServeHTTP(updateRec, updateReq)
		assert.Equal(t, http.StatusOK, updateRec.Code)

		var updateResponse map[string]interface{}
		err = json.Unmarshal(updateRec.Body.Bytes(), &updateResponse)
		assert.NoError(t, err)
		assert.Equal(t, "Updated message", updateResponse["message"])
		assert.Equal(t, "updated", updateResponse["type"])
		assert.Equal(t, "test", updateResponse["category"])
		assert.Equal(t, encouragementID, fmt.Sprintf("%.0f", updateResponse["id"].(float64)))
	})

	// Test delete encouragement
	t.Run("Delete Encouragement", func(t *testing.T) {
		// First create an encouragement
		encouragementData := map[string]string{
			"message":  "To be deleted",
			"type":     "temporary",
			"category": "test",
		}
		jsonData, _ := json.Marshal(encouragementData)

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/api/encourage", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+token)
		router.ServeHTTP(w, req)

		var createResponse map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &createResponse)
		assert.NoError(t, err)
		encouragementID := fmt.Sprintf("%.0f", createResponse["id"].(float64))

		// Now delete it
		w = httptest.NewRecorder()
		req, _ = http.NewRequest("DELETE", "/api/encourage/"+encouragementID, nil)
		req.Header.Set("Authorization", "Bearer "+token)
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusNoContent, w.Code)

		// Verify it's deleted
		w = httptest.NewRecorder()
		req, _ = http.NewRequest("GET", "/api/encourage/"+encouragementID, nil)
		req.Header.Set("Authorization", "Bearer "+token)
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusNotFound, w.Code)
	})
}
