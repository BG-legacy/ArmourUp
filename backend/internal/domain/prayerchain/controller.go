package prayerchain

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

// CreatePrayerChain handles POST /api/prayer-chains
func (c *Controller) CreatePrayerChain(ctx *gin.Context) {
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var dto CreatePrayerChainDTO
	if err := ctx.ShouldBindJSON(&dto); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	chain, err := c.service.CreatePrayerChain(userID.(uint), &dto)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, chain)
}

// GetPrayerChain handles GET /api/prayer-chains/:id
func (c *Controller) GetPrayerChain(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	chain, err := c.service.GetChainWithDetails(uint(id))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "prayer chain not found"})
		return
	}

	ctx.JSON(http.StatusOK, chain)
}

// GetAllPrayerChains handles GET /api/prayer-chains
func (c *Controller) GetAllPrayerChains(ctx *gin.Context) {
	chains, err := c.service.GetAllPrayerChains()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, chains)
}

// GetUserPrayerChains handles GET /api/prayer-chains/my-chains
func (c *Controller) GetUserPrayerChains(ctx *gin.Context) {
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	chains, err := c.service.GetUserPrayerChains(userID.(uint))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, chains)
}

// UpdatePrayerChain handles PUT /api/prayer-chains/:id
func (c *Controller) UpdatePrayerChain(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	chain, err := c.service.GetPrayerChain(uint(id))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "prayer chain not found"})
		return
	}

	if chain.CreatedByUserID != userID.(uint) {
		ctx.JSON(http.StatusForbidden, gin.H{"error": "only the creator can update the prayer chain"})
		return
	}

	var dto CreatePrayerChainDTO
	if err := ctx.ShouldBindJSON(&dto); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	chain.Name = dto.Name
	chain.Description = dto.Description

	if err := c.service.UpdatePrayerChain(chain); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, chain)
}

// DeletePrayerChain handles DELETE /api/prayer-chains/:id
func (c *Controller) DeletePrayerChain(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	chain, err := c.service.GetPrayerChain(uint(id))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "prayer chain not found"})
		return
	}

	if chain.CreatedByUserID != userID.(uint) {
		ctx.JSON(http.StatusForbidden, gin.H{"error": "only the creator can delete the prayer chain"})
		return
	}

	if err := c.service.DeletePrayerChain(uint(id)); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.Status(http.StatusNoContent)
}

// JoinChain handles POST /api/prayer-chains/:id/join
func (c *Controller) JoinChain(ctx *gin.Context) {
	idStr := ctx.Param("id")
	chainID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	if err := c.service.JoinChain(userID.(uint), uint(chainID)); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "successfully joined prayer chain"})
}

// LeaveChain handles POST /api/prayer-chains/:id/leave
func (c *Controller) LeaveChain(ctx *gin.Context) {
	idStr := ctx.Param("id")
	chainID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid ID"})
		return
	}

	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	if err := c.service.LeaveChain(userID.(uint), uint(chainID)); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "successfully left prayer chain"})
}

// CommitToPray handles POST /api/prayer-chains/commit
func (c *Controller) CommitToPray(ctx *gin.Context) {
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var dto CommitToPrayDTO
	if err := ctx.ShouldBindJSON(&dto); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := c.service.CommitToPray(userID.(uint), &dto); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "successfully committed to pray"})
}

// RemoveCommitment handles DELETE /api/prayer-chains/:id/commit/:userId
func (c *Controller) RemoveCommitment(ctx *gin.Context) {
	chainIDStr := ctx.Param("id")
	chainID, err := strconv.ParseUint(chainIDStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid chain ID"})
		return
	}

	prayForUserIDStr := ctx.Param("userId")
	prayForUserID, err := strconv.ParseUint(prayForUserIDStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	if err := c.service.RemoveCommitment(userID.(uint), uint(chainID), uint(prayForUserID)); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "commitment removed"})
}

