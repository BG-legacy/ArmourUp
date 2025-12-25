package insights

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type Controller struct {
	service *Service
}

func NewController(service *Service) *Controller {
	return &Controller{service: service}
}

// GenerateInsight generates a new monthly progress insight
func (c *Controller) GenerateInsight(ctx *gin.Context) {
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	var req GenerateInsightRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	insight, err := c.service.GenerateInsight(userID.(uint), req.Period)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, insight)
}

// GetInsight retrieves a specific progress insight
func (c *Controller) GetInsight(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	insight, err := c.service.GetInsight(uint(id))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "insight not found"})
		return
	}

	ctx.JSON(http.StatusOK, insight)
}

// GetUserInsights retrieves all progress insights for the authenticated user
func (c *Controller) GetUserInsights(ctx *gin.Context) {
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	insights, err := c.service.GetUserInsights(userID.(uint))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, insights)
}

// GetInsightForPeriod retrieves or generates an insight for a specific period
func (c *Controller) GetInsightForPeriod(ctx *gin.Context) {
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	period := ctx.Query("period")
	if period == "" {
		// Default to current month
		period = time.Now().Format("2006-01")
	}

	insight, err := c.service.GetInsightForPeriod(userID.(uint), period)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, insight)
}

// GetAvailablePeriods returns a list of months that have data
func (c *Controller) GetAvailablePeriods(ctx *gin.Context) {
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "user not authenticated"})
		return
	}

	insights, err := c.service.GetUserInsights(userID.(uint))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Extract unique periods
	periods := make([]string, 0, len(insights))
	for _, insight := range insights {
		periods = append(periods, insight.Period)
	}

	ctx.JSON(http.StatusOK, gin.H{
		"periods": periods,
	})
}

