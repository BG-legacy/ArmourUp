// Package server implements the HTTP server and routing logic for the ArmourUp API.
package server

import (
	"armourup/internal/domain/user"
	"armourup/internal/middleware"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// Server represents the HTTP server instance with its dependencies.
// It holds the router and database connection.
type Server struct {
	router *gin.Engine
	db     *gorm.DB
	logger *zap.Logger
}

// NewServer creates and returns a new Server instance with the provided router and database connection.
func NewServer(router *gin.Engine, db *gorm.DB, logger *zap.Logger) *Server {
	return &Server{
		router: router,
		db:     db,
		logger: logger,
	}
}

// Start initializes the server routes and begins listening on the specified address.
// Returns an error if the server fails to start.
func (s *Server) Start(addr string) error {
	SetupRoutes(s.router, s.db, s.logger)
	return s.router.Run(addr)
}

// setupRoutes configures all API routes and their handlers.
// It sets up the following route groups:
// - Health check endpoint
// - Authentication routes
// - Protected routes for encouragements and journals
// - User management routes
func (s *Server) setupRoutes() {
	// Health check route
	s.router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	api := s.router.Group("/api")

	// Auth routes
	setupAuthRoutes(api, s.db, s.logger)

	// Protected routes
	setupEncouragementRoutes(api, s.db)
	setupJournalRoutes(api, s.db)
	setupPrayerRoutes(api, s.db)

	// User routes
	userRepo := user.NewRepository(s.db)
	userService := user.NewService(userRepo)
	userController := user.NewController(userService)

	userGroup := api.Group("/users")
	userGroup.Use(middleware.AuthMiddleware())
	{
		userGroup.GET("/me", userController.GetCurrentUser)
		userGroup.POST("", userController.CreateUser)
		userGroup.GET("/:id", userController.GetUser)
		userGroup.PUT("/:id", userController.UpdateUser)
		userGroup.DELETE("/:id", userController.DeleteUser)
	}
}
