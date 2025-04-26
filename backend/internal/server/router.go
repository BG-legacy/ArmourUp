package server

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"armourup/internal/domain/user"
	"armourup/internal/middleware"
	"net/http"
)

type Server struct {
	router *gin.Engine
	db     *gorm.DB
}

func NewServer(router *gin.Engine, db *gorm.DB) *Server {
	server := &Server{
		router: router,
		db:     db,
	}
	server.setupRoutes()
	return server
}

func (s *Server) setupRoutes() {
	// Health check route
	s.router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	api := s.router.Group("/api")

	// Auth routes
	setupAuthRoutes(api, s.db)

	// Protected routes
	setupEncouragementRoutes(api, s.db)
	setupJournalRoutes(api, s.db)

	// User routes
	userRepo := user.NewRepository(s.db)
	userService := user.NewService(userRepo)
	userController := user.NewController(userService)

	userGroup := api.Group("/users")
	userGroup.Use(middleware.AuthMiddleware())
	{
		userGroup.POST("", userController.CreateUser)
		userGroup.GET("/:id", userController.GetUser)
		userGroup.PUT("/:id", userController.UpdateUser)
		userGroup.DELETE("/:id", userController.DeleteUser)
	}
}

func (s *Server) Start(addr string) error {
	return s.router.Run(addr)
} 