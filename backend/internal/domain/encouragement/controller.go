package encouragement

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

func (c *Controller) CreateEncouragement(ctx *gin.Context) {
	var encouragement Encouragement
	if err := ctx.ShouldBindJSON(&encouragement); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := c.service.CreateEncouragement(&encouragement); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, encouragement)
}

func (c *Controller) GetEncouragement(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	encouragement, err := c.service.GetEncouragement(uint(id))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "encouragement not found"})
		return
	}

	ctx.JSON(http.StatusOK, encouragement)
}

func (c *Controller) GetEncouragements(ctx *gin.Context) {
	encouragements, err := c.service.GetEncouragements()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, encouragements)
}

func (c *Controller) UpdateEncouragement(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	var encouragement Encouragement
	if err := ctx.ShouldBindJSON(&encouragement); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	encouragement.ID = uint(id)
	if err := c.service.UpdateEncouragement(&encouragement); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, encouragement)
}

func (c *Controller) DeleteEncouragement(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	if err := c.service.DeleteEncouragement(uint(id)); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.Status(http.StatusNoContent)
}

type LogStruggleRequest struct {
	Struggle string `json:"struggle" binding:"required"`
	Verse    string `json:"verse" binding:"required"`
	Message  string `json:"message" binding:"required"`
}

func (c *Controller) LogStruggle(ctx *gin.Context) {
	var req LogStruggleRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user ID from context (set by auth middleware)
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	encouragement := &Encouragement{
		UserID:  userID.(uint),
		Message: req.Message,
		Verse:   req.Verse,
		Type:    "struggle",
	}

	if err := c.service.CreateEncouragement(encouragement); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, encouragement)
}
