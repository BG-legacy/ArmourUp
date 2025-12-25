package test

import (
	"armourup/internal/config"
	"armourup/internal/domain/prayer"
	"armourup/internal/server"
	"armourup/test/testutils"
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"go.uber.org/zap"
)

func TestPrayerTracking(t *testing.T) {
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

	// Helper function to create a test user
	createUser := func(email, username string) (string, uint) {
		registerData := map[string]string{
			"username": username,
			"email":    email,
			"password": "password123",
		}
		jsonData, _ := json.Marshal(registerData)

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/api/register", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")
		router.ServeHTTP(w, req)

		var response map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &response)
		token := response["access_token"].(string)
		userID := uint(response["user"].(map[string]interface{})["id"].(float64))
		return token, userID
	}

	// Create test users
	user1Token, user1ID := createUser("user1@example.com", "user1")
	user2Token, user2ID := createUser("user2@example.com", "user2")

	t.Run("Create Prayer Request", func(t *testing.T) {
		body := map[string]interface{}{
			"request":      "Please pray for my family's health",
			"is_anonymous": false,
		}
		bodyBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest("POST", "/api/prayer", bytes.NewBuffer(bodyBytes))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+user1Token)

		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusCreated, resp.Code)

		var result map[string]interface{}
		json.Unmarshal(resp.Body.Bytes(), &result)
		assert.Equal(t, "Please pray for my family's health", result["request"])
		assert.Equal(t, "pending", result["status"])
		assert.Equal(t, float64(0), result["prayer_count"])
	})

	t.Run("User1 Prays for Prayer Request", func(t *testing.T) {
		// First create a prayer request as user2
		body := map[string]interface{}{
			"request":      "Need prayers for my job interview",
			"is_anonymous": true,
		}
		bodyBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest("POST", "/api/prayer", bytes.NewBuffer(bodyBytes))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+user2Token)

		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusCreated, resp.Code)

		var prayerRequest map[string]interface{}
		json.Unmarshal(resp.Body.Bytes(), &prayerRequest)
		prayerID := int(prayerRequest["id"].(float64))

		// Now user1 prays for it
		req, _ = http.NewRequest("POST", fmt.Sprintf("/api/prayer/%d/pray", prayerID), nil)
		req.Header.Set("Authorization", "Bearer "+user1Token)

		resp = httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusOK, resp.Code)

		var result map[string]interface{}
		json.Unmarshal(resp.Body.Bytes(), &result)
		assert.Equal(t, float64(1), result["prayer_count"])
	})

	t.Run("Cannot Pray Twice for Same Request", func(t *testing.T) {
		// Create a prayer request
		body := map[string]interface{}{
			"request":      "Pray for my health",
			"is_anonymous": false,
		}
		bodyBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest("POST", "/api/prayer", bytes.NewBuffer(bodyBytes))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+user2Token)

		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		var prayerRequest map[string]interface{}
		json.Unmarshal(resp.Body.Bytes(), &prayerRequest)
		prayerID := int(prayerRequest["id"].(float64))

		// User1 prays first time
		req, _ = http.NewRequest("POST", fmt.Sprintf("/api/prayer/%d/pray", prayerID), nil)
		req.Header.Set("Authorization", "Bearer "+user1Token)

		resp = httptest.NewRecorder()
		router.ServeHTTP(resp, req)
		assert.Equal(t, http.StatusOK, resp.Code)

		// User1 tries to pray again
		req, _ = http.NewRequest("POST", fmt.Sprintf("/api/prayer/%d/pray", prayerID), nil)
		req.Header.Set("Authorization", "Bearer "+user1Token)

		resp = httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusConflict, resp.Code)

		var errResult map[string]interface{}
		json.Unmarshal(resp.Body.Bytes(), &errResult)
		assert.Equal(t, "you have already prayed for this request", errResult["error"])
	})

	t.Run("Get My Prayers", func(t *testing.T) {
		// Create a prayer request as user2
		body := map[string]interface{}{
			"request":      "Pray for my journey",
			"is_anonymous": false,
		}
		bodyBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest("POST", "/api/prayer", bytes.NewBuffer(bodyBytes))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+user2Token)

		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		var prayerRequest map[string]interface{}
		json.Unmarshal(resp.Body.Bytes(), &prayerRequest)
		prayerID := int(prayerRequest["id"].(float64))

		// User1 prays for it
		req, _ = http.NewRequest("POST", fmt.Sprintf("/api/prayer/%d/pray", prayerID), nil)
		req.Header.Set("Authorization", "Bearer "+user1Token)

		resp = httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		// User1 gets their prayers
		req, _ = http.NewRequest("GET", "/api/prayer/my-prayers", nil)
		req.Header.Set("Authorization", "Bearer "+user1Token)

		resp = httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusOK, resp.Code)

		var prayers []map[string]interface{}
		json.Unmarshal(resp.Body.Bytes(), &prayers)
		assert.GreaterOrEqual(t, len(prayers), 1)

		// Check that the prayer is in the list
		found := false
		for _, p := range prayers {
			if int(p["prayer_request_id"].(float64)) == prayerID {
				found = true
				assert.Equal(t, float64(user1ID), p["user_id"])
				break
			}
		}
		assert.True(t, found, "Prayer should be in user's prayer list")
	})

	t.Run("Mark Prayer as Answered", func(t *testing.T) {
		// Create a prayer request as user1
		body := map[string]interface{}{
			"request":      "Please pray for my test results",
			"is_anonymous": false,
		}
		bodyBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest("POST", "/api/prayer", bytes.NewBuffer(bodyBytes))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+user1Token)

		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		var prayerRequest map[string]interface{}
		json.Unmarshal(resp.Body.Bytes(), &prayerRequest)
		prayerID := int(prayerRequest["id"].(float64))

		// Mark as answered
		answerBody := map[string]interface{}{
			"testimony": "God answered! My test results came back negative. Praise the Lord!",
		}
		answerBytes, _ := json.Marshal(answerBody)

		req, _ = http.NewRequest("POST", fmt.Sprintf("/api/prayer/%d/answer", prayerID), bytes.NewBuffer(answerBytes))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+user1Token)

		resp = httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusOK, resp.Code)

		var result map[string]interface{}
		json.Unmarshal(resp.Body.Bytes(), &result)
		assert.Equal(t, "answered", result["status"])
		assert.Equal(t, "God answered! My test results came back negative. Praise the Lord!", result["answer_testimony"])
		assert.NotNil(t, result["answered_at"])
	})

	t.Run("Cannot Mark Someone Else's Prayer as Answered", func(t *testing.T) {
		// Create a prayer request as user1
		body := map[string]interface{}{
			"request":      "Please pray for my decision",
			"is_anonymous": false,
		}
		bodyBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest("POST", "/api/prayer", bytes.NewBuffer(bodyBytes))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+user1Token)

		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		var prayerRequest map[string]interface{}
		json.Unmarshal(resp.Body.Bytes(), &prayerRequest)
		prayerID := int(prayerRequest["id"].(float64))

		// User2 tries to mark it as answered
		answerBody := map[string]interface{}{
			"testimony": "Trying to mark someone else's prayer",
		}
		answerBytes, _ := json.Marshal(answerBody)

		req, _ = http.NewRequest("POST", fmt.Sprintf("/api/prayer/%d/answer", prayerID), bytes.NewBuffer(answerBytes))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+user2Token)

		resp = httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusForbidden, resp.Code)

		var errResult map[string]interface{}
		json.Unmarshal(resp.Body.Bytes(), &errResult)
		assert.Equal(t, "you can only mark your own prayer requests as answered", errResult["error"])
	})

	t.Run("Get Answered Prayers", func(t *testing.T) {
		// Create a prayer request
		body := map[string]interface{}{
			"request":      "Pray for financial breakthrough",
			"is_anonymous": false,
		}
		bodyBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest("POST", "/api/prayer", bytes.NewBuffer(bodyBytes))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+user1Token)

		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		var prayerRequest map[string]interface{}
		json.Unmarshal(resp.Body.Bytes(), &prayerRequest)
		prayerID := int(prayerRequest["id"].(float64))

		// Mark as answered
		answerBody := map[string]interface{}{
			"testimony": "God provided exactly what I needed!",
		}
		answerBytes, _ := json.Marshal(answerBody)

		req, _ = http.NewRequest("POST", fmt.Sprintf("/api/prayer/%d/answer", prayerID), bytes.NewBuffer(answerBytes))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+user1Token)

		resp = httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		// Get all answered prayers
		req, _ = http.NewRequest("GET", "/api/prayer/answered", nil)
		req.Header.Set("Authorization", "Bearer "+user1Token)

		resp = httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		assert.Equal(t, http.StatusOK, resp.Code)

		var answers []map[string]interface{}
		json.Unmarshal(resp.Body.Bytes(), &answers)
		assert.GreaterOrEqual(t, len(answers), 1)

		// Check that the answered prayer is in the list
		found := false
		for _, a := range answers {
			if int(a["id"].(float64)) == prayerID {
				found = true
				assert.Equal(t, "answered", a["status"])
				assert.Equal(t, "God provided exactly what I needed!", a["answer_testimony"])
				break
			}
		}
		assert.True(t, found, "Answered prayer should be in the list")
	})

	t.Run("Verify Prayer Logs in Database", func(t *testing.T) {
		// Create a prayer request
		body := map[string]interface{}{
			"request":      "Final test prayer",
			"is_anonymous": false,
		}
		bodyBytes, _ := json.Marshal(body)

		req, _ := http.NewRequest("POST", "/api/prayer", bytes.NewBuffer(bodyBytes))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+user1Token)

		resp := httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		var prayerRequest map[string]interface{}
		json.Unmarshal(resp.Body.Bytes(), &prayerRequest)
		prayerID := uint(prayerRequest["id"].(float64))

		// User2 prays for it
		req, _ = http.NewRequest("POST", fmt.Sprintf("/api/prayer/%d/pray", prayerID), nil)
		req.Header.Set("Authorization", "Bearer "+user2Token)

		resp = httptest.NewRecorder()
		router.ServeHTTP(resp, req)

		// Verify the prayer log exists in the database
		var log prayer.PrayerLog
		result := db.Where("prayer_request_id = ? AND user_id = ?", prayerID, user2ID).First(&log)
		assert.NoError(t, result.Error)
		assert.Equal(t, prayerID, log.PrayerRequestID)
		assert.Equal(t, uint(user2ID), log.UserID)
	})
}

