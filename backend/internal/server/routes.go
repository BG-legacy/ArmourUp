package server

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"armourup/internal/domain/auth"
	"armourup/internal/domain/encouragement"
	"armourup/internal/domain/journal"
	"armourup/internal/domain/user"
	"armourup/internal/middleware"
)

func setupAuthRoutes(router *gin.RouterGroup, db *gorm.DB) {
	userRepo := user.NewRepository(db)
	userSvc := user.NewService(userRepo)
	authController := auth.NewController(db, userSvc)
	router.POST("/login", authController.Login)
	router.POST("/register", authController.Register)
	router.POST("/refresh", authController.RefreshToken)
}

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
	}
}

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