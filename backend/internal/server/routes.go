// Package server implements the HTTP server and routing logic for the ArmourUp API.
package server

import (
	"armourup/internal/domain/auth"
	"armourup/internal/domain/encouragement"
	"armourup/internal/domain/journal"
	"armourup/internal/domain/openai"
	"armourup/internal/domain/prayer"
	"armourup/internal/domain/prayerchain"
	"armourup/internal/domain/user"
	"armourup/internal/middleware"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// setupHealthRoute configures the health check endpoint.
// This endpoint is used to verify if the API is responsive and operational.
func setupHealthRoute(router *gin.RouterGroup) {
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
		})
	})
}

// setupAuthRoutes configures all authentication-related routes.
// Includes login, registration, token refresh, and protected user routes.
func setupAuthRoutes(router *gin.RouterGroup, db *gorm.DB, logger *zap.Logger) {
	userRepo := user.NewRepository(db)
	userSvc := user.NewService(userRepo)
	authController := auth.NewController(db, userSvc, logger)
	router.POST("/login", authController.Login)
	router.POST("/register", authController.Register)
	router.POST("/refresh", authController.RefreshToken)

	// Add protected user routes
	userGroup := router.Group("/users")
	userGroup.Use(middleware.AuthMiddleware())
	{
		userGroup.GET("/me", authController.GetCurrentUser)
	}
}

// setupEncouragementRoutes configures routes for managing encouragements.
// Includes CRUD operations and a special endpoint for logging struggles.
// All routes are protected and require authentication.
func setupEncouragementRoutes(router *gin.RouterGroup, db *gorm.DB) {
	encRepo := encouragement.NewRepository(db)
	encService := encouragement.NewService(encRepo)
	encController := encouragement.NewController(encService)

	encGroup := router.Group("/encourage")
	encGroup.Use(middleware.AuthMiddleware())
	{
		encGroup.POST("", encController.CreateEncouragement)
		encGroup.GET("", encController.GetEncouragements)
		encGroup.GET("/:id", encController.GetEncouragement)
		encGroup.PUT("/:id", encController.UpdateEncouragement)
		encGroup.DELETE("/:id", encController.DeleteEncouragement)
		encGroup.POST("/log-struggle", encController.LogStruggle)
	}
}

// setupJournalRoutes configures routes for managing journal entries.
// Includes CRUD operations for journal entries.
// All routes are protected and require authentication.
func setupJournalRoutes(router *gin.RouterGroup, db *gorm.DB) {
	journalRepo := journal.NewRepository(db)
	journalService := journal.NewService(journalRepo)
	journalController := journal.NewController(journalService)

	journalGroup := router.Group("/journal")
	journalGroup.Use(middleware.AuthMiddleware())
	{
		journalGroup.POST("", journalController.CreateEntry)
		journalGroup.GET("", journalController.GetEntries)
		journalGroup.GET("/:id", journalController.GetEntry)
		journalGroup.PUT("/:id", journalController.UpdateEntry)
		journalGroup.DELETE("/:id", journalController.DeleteEntry)
	}
}

// setupOpenAIRoutes configures routes for OpenAI integration.
// Includes an endpoint for getting AI-generated encouragements.
// Routes are protected and include rate limiting (10 requests per minute).
func setupOpenAIRoutes(router *gin.RouterGroup) {
	openaiService, err := openai.NewService()
	if err != nil {
		log.Printf("Warning: OpenAI integration disabled: %v", err)
		return
	}
	openaiController := openai.NewController(openaiService)

	aiGroup := router.Group("/ai")
	aiGroup.Use(middleware.AuthMiddleware())
	aiGroup.Use(middleware.RateLimiter("10-M")) // 10 requests per minute
	{
		aiGroup.POST("/encourage", openaiController.GetEncouragement)
	}
}

// setupPrayerRoutes configures routes for managing prayer requests.
// Includes CRUD operations, tracking prayers, and marking prayers as answered.
// All routes are protected and require authentication.
func setupPrayerRoutes(router *gin.RouterGroup, db *gorm.DB) {
	prayerRepo := prayer.NewRepository(db)
	prayerService := prayer.NewService(prayerRepo)
	prayerController := prayer.NewController(prayerService)

	prayerGroup := router.Group("/prayer")
	prayerGroup.Use(middleware.AuthMiddleware())
	{
		prayerGroup.POST("", prayerController.CreatePrayerRequest)
		prayerGroup.GET("", prayerController.GetAllPrayerRequests)
		// Specific routes MUST come before /:id to avoid conflicts
		prayerGroup.GET("/my-requests", prayerController.GetUserPrayerRequests)
		prayerGroup.GET("/my-prayers", prayerController.GetMyPrayers)
		prayerGroup.GET("/answered", prayerController.GetAnsweredPrayers)
		prayerGroup.POST("/:id/pray", prayerController.PrayForRequest)
		prayerGroup.POST("/:id/answer", prayerController.MarkAsAnswered)
		// General /:id routes must come last
		prayerGroup.GET("/:id", prayerController.GetPrayerRequest)
		prayerGroup.PUT("/:id", prayerController.UpdatePrayerRequest)
		prayerGroup.DELETE("/:id", prayerController.DeletePrayerRequest)
	}
}

// setupPrayerChainRoutes configures routes for managing prayer chains.
// Includes CRUD operations, joining/leaving chains, and committing to pray for members.
// All routes are protected and require authentication.
func setupPrayerChainRoutes(router *gin.RouterGroup, db *gorm.DB) {
	userRepo := user.NewRepository(db)
	prayerChainRepo := prayerchain.NewRepository(db)
	prayerChainService := prayerchain.NewService(prayerChainRepo, userRepo)
	prayerChainController := prayerchain.NewController(prayerChainService)

	chainGroup := router.Group("/prayer-chains")
	chainGroup.Use(middleware.AuthMiddleware())
	{
		chainGroup.POST("", prayerChainController.CreatePrayerChain)
		chainGroup.GET("", prayerChainController.GetAllPrayerChains)
		chainGroup.GET("/my-chains", prayerChainController.GetUserPrayerChains)
		chainGroup.POST("/commit", prayerChainController.CommitToPray)
		// More specific routes must come before general :id routes
		chainGroup.DELETE("/:id/commit/:userId", prayerChainController.RemoveCommitment)
		chainGroup.POST("/:id/join", prayerChainController.JoinChain)
		chainGroup.POST("/:id/leave", prayerChainController.LeaveChain)
		chainGroup.GET("/:id", prayerChainController.GetPrayerChain)
		chainGroup.PUT("/:id", prayerChainController.UpdatePrayerChain)
		chainGroup.DELETE("/:id", prayerChainController.DeletePrayerChain)
	}
}

// SetupRoutes initializes all API routes and their handlers.
// This is the main routing configuration function that sets up all route groups:
// - Health check endpoint
// - Authentication routes
// - Encouragement routes
// - Journal routes
// - Prayer wall routes
// - Prayer chain routes
// - OpenAI integration routes (if configured)
func SetupRoutes(router *gin.Engine, db *gorm.DB, logger *zap.Logger) {
	api := router.Group("/api")
	{
		setupHealthRoute(api)
		setupAuthRoutes(api, db, logger)
		setupEncouragementRoutes(api, db)
		setupJournalRoutes(api, db)
		setupPrayerRoutes(api, db)
		setupPrayerChainRoutes(api, db)
		setupOpenAIRoutes(api)
	}
}
