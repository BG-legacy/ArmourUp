package prayer

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Controller struct {
	service *Service
}

func NewController(service *Service) *Controller {
	return &Controller{service: service}
}

// CreatePrayerRequest handles POST /api/prayer
func (c *Controller) CreatePrayerRequest(ctx *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var dto CreatePrayerRequestDTO
	if err := ctx.ShouldBindJSON(&dto); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	prayerRequest, err := c.service.CreatePrayerRequest(userID.(uint), &dto)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, prayerRequest)
}

// GetPrayerRequest handles GET /api/prayer/:id
func (c *Controller) GetPrayerRequest(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	prayerRequest, err := c.service.GetPrayerRequest(uint(id))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "prayer request not found"})
		return
	}

	ctx.JSON(http.StatusOK, prayerRequest)
}

// GetAllPrayerRequests handles GET /api/prayer
func (c *Controller) GetAllPrayerRequests(ctx *gin.Context) {
	prayerRequests, err := c.service.GetAllPrayerRequests()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, prayerRequests)
}

// GetUserPrayerRequests handles GET /api/prayer/my-requests
func (c *Controller) GetUserPrayerRequests(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	prayerRequests, err := c.service.GetUserPrayerRequests(userID.(uint))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, prayerRequests)
}

// UpdatePrayerRequest handles PUT /api/prayer/:id
func (c *Controller) UpdatePrayerRequest(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// Check if the prayer request belongs to the user
	prayerRequest, err := c.service.GetPrayerRequest(uint(id))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "prayer request not found"})
		return
	}

	if prayerRequest.UserID != userID.(uint) {
		ctx.JSON(http.StatusForbidden, gin.H{"error": "you can only update your own prayer requests"})
		return
	}

	var dto CreatePrayerRequestDTO
	if err := ctx.ShouldBindJSON(&dto); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	prayerRequest.Request = dto.Request
	prayerRequest.IsAnonymous = dto.IsAnonymous

	if err := c.service.UpdatePrayerRequest(prayerRequest); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, prayerRequest)
}

// DeletePrayerRequest handles DELETE /api/prayer/:id
func (c *Controller) DeletePrayerRequest(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// Check if the prayer request belongs to the user
	prayerRequest, err := c.service.GetPrayerRequest(uint(id))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "prayer request not found"})
		return
	}

	if prayerRequest.UserID != userID.(uint) {
		ctx.JSON(http.StatusForbidden, gin.H{"error": "you can only delete your own prayer requests"})
		return
	}

	if err := c.service.DeletePrayerRequest(uint(id)); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.Status(http.StatusNoContent)
}

// PrayForRequest handles POST /api/prayer/:id/pray
func (c *Controller) PrayForRequest(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	if err := c.service.PrayForRequest(uint(id), userID.(uint)); err != nil {
		if err.Error() == "you have already prayed for this request" {
			ctx.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return updated prayer request
	prayerRequest, err := c.service.GetPrayerRequest(uint(id))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, prayerRequest)
}

// GetMyPrayers handles GET /api/prayer/my-prayers
func (c *Controller) GetMyPrayers(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	prayers, err := c.service.GetMyPrayers(userID.(uint))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, prayers)
}

// MarkAsAnswered handles POST /api/prayer/:id/answer
func (c *Controller) MarkAsAnswered(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var dto MarkAnsweredDTO
	if err := ctx.ShouldBindJSON(&dto); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := c.service.MarkAsAnswered(uint(id), userID.(uint), &dto); err != nil {
		if err.Error() == "you can only mark your own prayer requests as answered" {
			ctx.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		if err.Error() == "this prayer request is already marked as answered" {
			ctx.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return updated prayer request
	prayerRequest, err := c.service.GetPrayerRequest(uint(id))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, prayerRequest)
}

// GetAnsweredPrayers handles GET /api/prayer/answered
func (c *Controller) GetAnsweredPrayers(ctx *gin.Context) {
	prayers, err := c.service.GetAnsweredPrayers()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, prayers)
}

